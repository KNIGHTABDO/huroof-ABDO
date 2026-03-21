/**
 * PeerJS Manager — WebRTC Peer-to-Peer for zero-database real-time multiplayer.
 * Host creates a game room, Players join via room code.
 * Now supports player names and team assignments.
 */

let peerInstance = null;
let connections = []; // Host tracks all player connections
let hostConnection = null; // Player tracks connection to host
let playerMap = new Map(); // peerId → { name, team, connId }

/**
 * Dynamically import PeerJS (client-side only).
 */
async function getPeer() {
  const { Peer } = await import('peerjs');
  return Peer;
}

/**
 * Generate a random 6-character room code.
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Get all players as array.
 */
export function getPlayers() {
  return Array.from(playerMap.values());
}

/**
 * Update a player's team.
 */
export function setPlayerTeam(playerId, team) {
  const player = playerMap.get(playerId);
  if (player) {
    player.team = team;
    playerMap.set(playerId, player);
  }
}

/**
 * HOST: Create a game room.
 */
export async function createGame(onPlayerJoin, onPlayerAction, onError) {
  const Peer = await getPeer();
  const roomCode = generateRoomCode();
  const peerId = `huroof-${roomCode}`;
  playerMap.clear();

  return new Promise((resolve, reject) => {
    peerInstance = new Peer(peerId, { debug: 1 });

    peerInstance.on('open', (id) => {
      console.log('Host peer opened with ID:', id);
      resolve({ roomCode, peer: peerInstance });
    });

    peerInstance.on('connection', (conn) => {
      console.log('Player connected:', conn.peer);
      connections.push(conn);

      conn.on('open', () => {
        // Wait for player to send their info
      });

      conn.on('data', (data) => {
        if (data.type === 'PLAYER_JOIN') {
          // Player sent their name — register them
          const playerId = conn.peer;
          // Auto-assign team: alternate between orange and green
          const orangeCount = Array.from(playerMap.values()).filter(p => p.team === 'orange').length;
          const greenCount = Array.from(playerMap.values()).filter(p => p.team === 'green').length;
          const team = orangeCount <= greenCount ? 'orange' : 'green';

          playerMap.set(playerId, {
            id: playerId,
            name: data.payload.name,
            team: team,
          });

          // Send the player their team assignment
          conn.send({ type: 'TEAM_ASSIGNED', payload: { team, playerId } });

          if (onPlayerJoin) onPlayerJoin(conn, { name: data.payload.name, team, id: playerId });
        } else {
          if (onPlayerAction) onPlayerAction(data, conn);
        }
      });

      conn.on('close', () => {
        playerMap.delete(conn.peer);
        connections = connections.filter(c => c !== conn);
        // Notify host about player leaving
        if (onPlayerJoin) onPlayerJoin(null, null, 'leave');
      });
    });

    peerInstance.on('error', (err) => {
      console.error('Peer error:', err);
      if (onError) onError(err);
      reject(err);
    });
  });
}

/**
 * HOST: Broadcast state to all connected players.
 * Also broadcasts the players list so each player knows their team.
 */
export function broadcastState(state) {
  const players = getPlayers();
  connections.forEach(conn => {
    if (conn.open) {
      const playerInfo = playerMap.get(conn.peer);
      conn.send({
        type: 'STATE_UPDATE',
        payload: state,
        players: players,
        yourTeam: playerInfo ? playerInfo.team : null,
      });
    }
  });
}

/**
 * HOST: Broadcast team change to affected player.
 */
export function broadcastTeamChange(playerId, newTeam) {
  setPlayerTeam(playerId, newTeam);
  const conn = connections.find(c => c.peer === playerId);
  if (conn && conn.open) {
    conn.send({ type: 'TEAM_ASSIGNED', payload: { team: newTeam, playerId } });
  }
}

/**
 * HOST: Get connected player count.
 */
export function getPlayerCount() {
  return connections.filter(c => c.open).length;
}

/**
 * PLAYER: Join a game room by code, sending player name.
 */
export async function joinGame(roomCode, playerName, onStateUpdate, onTeamAssigned, onError) {
  const Peer = await getPeer();
  const playerId = `huroof-player-${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    peerInstance = new Peer(playerId, { debug: 1 });

    peerInstance.on('open', () => {
      const hostPeerId = `huroof-${roomCode}`;
      hostConnection = peerInstance.connect(hostPeerId, { reliable: true });

      hostConnection.on('open', () => {
        console.log('Connected to host!');
        // Send our name to the host
        hostConnection.send({ type: 'PLAYER_JOIN', payload: { name: playerName } });
        resolve({ connection: hostConnection });
      });

      hostConnection.on('data', (data) => {
        if (data.type === 'STATE_UPDATE' && onStateUpdate) {
          onStateUpdate(data.payload, data.yourTeam, data.players);
        }
        if (data.type === 'TEAM_ASSIGNED' && onTeamAssigned) {
          onTeamAssigned(data.payload.team);
        }
      });

      hostConnection.on('close', () => {
        console.log('Disconnected from host');
        hostConnection = null;
      });

      hostConnection.on('error', (err) => {
        console.error('Connection error:', err);
        if (onError) onError(err);
        reject(err);
      });
    });

    peerInstance.on('error', (err) => {
      console.error('Peer error:', err);
      if (onError) onError(err);
      reject(err);
    });
  });
}

/**
 * PLAYER: Send an action to the host.
 */
export function sendAction(action) {
  if (hostConnection && hostConnection.open) {
    hostConnection.send(action);
  }
}

/**
 * Disconnect and cleanup.
 */
export function disconnect() {
  connections.forEach(c => c.close());
  connections = [];
  playerMap.clear();
  if (hostConnection) {
    hostConnection.close();
    hostConnection = null;
  }
  if (peerInstance) {
    peerInstance.destroy();
    peerInstance = null;
  }
}
