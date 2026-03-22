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

let heartbeatInterval = null; // Keep-alive interval for host
const isDev = process.env.NODE_ENV !== 'production';

function devLog(...args) {
  if (isDev) console.log(...args);
}

function devWarn(...args) {
  if (isDev) console.warn(...args);
}

function devError(...args) {
  if (isDev) console.error(...args);
}

/**
 * HOST: Create a game room.
 * Includes auto-reconnect to signaling server when disconnected (idle/background tabs).
 */
export async function createGame(onPlayerJoin, onPlayerAction, onError) {
  const Peer = await getPeer();
  const roomCode = generateRoomCode();
  const peerId = `huroof-${roomCode}`;
  playerMap.clear();

  function setupConnectionHandler(conn) {
    devLog('Player connected:', conn.peer);
    connections.push(conn);

    conn.on('open', () => {
      // Wait for player to send their info
    });

    conn.on('data', (data) => {
      if (data.type === 'PLAYER_JOIN') {
        // Player sent their name and optional role — register them
        const playerId = conn.peer;
        const role = data.payload.role || 'player';
        
        let team;
        if (role === 'spectator') {
          team = 'spectator';
          devLog(`Spectator ${data.payload.name} connected`);
        } else if (playerMap.has(playerId)) {
          // Rejoining player — give them their original team back!
          team = playerMap.get(playerId).team;
          devLog(`Player ${data.payload.name} reconnected to team ${team}`);
        } else {
          // New player — auto-assign team: alternate between orange and green
          const orangeCount = Array.from(playerMap.values()).filter(p => p.team === 'orange').length;
          const greenCount = Array.from(playerMap.values()).filter(p => p.team === 'green').length;
          team = orangeCount <= greenCount ? 'orange' : 'green';
        }

        playerMap.set(playerId, {
          id: playerId,
          name: data.payload.name,
          team: team,
          role: role,
        });

        // Send the player their team assignment (or spectator status)
        conn.send({ type: 'TEAM_ASSIGNED', payload: { team, playerId } });

        if (onPlayerJoin) onPlayerJoin(conn, { name: data.payload.name, team, id: playerId, role });
      } else {
        if (onPlayerAction) onPlayerAction(data, conn);
      }
    });

    conn.on('close', () => {
      // We DON'T delete from playerMap here so they keep their team if they auto-reconnect
      connections = connections.filter(c => c !== conn);
      // Notify host about player leaving
      if (onPlayerJoin) onPlayerJoin(null, null, 'leave');
    });
  }

  return new Promise((resolve, reject) => {
    peerInstance = new Peer(peerId, { debug: 1 });

    peerInstance.on('open', (id) => {
      devLog('Host peer opened with ID:', id);
      resolve({ roomCode, peer: peerInstance });
    });

    peerInstance.on('connection', setupConnectionHandler);

    // Auto-reconnect when disconnected from signaling server
    peerInstance.on('disconnected', () => {
      devWarn('Host disconnected from signaling server, attempting reconnect...');
      if (peerInstance && !peerInstance.destroyed) {
        try {
          peerInstance.reconnect();
        } catch (e) {
          devError('Reconnect failed:', e);
        }
      }
    });

    // Heartbeat: periodically check if still connected to signaling server
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (peerInstance && !peerInstance.destroyed && peerInstance.disconnected) {
        devWarn('Heartbeat: peer disconnected, reconnecting...');
        try {
          peerInstance.reconnect();
        } catch (e) {
          devError('Heartbeat reconnect failed:', e);
        }
      }
    }, 15000); // Check every 15 seconds

    peerInstance.on('error', (err) => {
      devError('Peer error:', err);
      // If it's a "peer-unavailable" type, don't crash — just log it
      if (err.type === 'peer-unavailable') return;
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
 * Includes retry logic for more resilient connections (e.g. from QR scans).
 */
export async function joinGame(roomCode, playerName, onStateUpdate, onTeamAssigned, onError, role = 'player') {
  const Peer = await getPeer();
  const maxRetries = 3;
  let attempt = 0;

  async function tryConnect() {
    attempt++;
    const playerId = `huroof-${role}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      // Destroy any existing instance from a previous attempt
      if (peerInstance) {
        peerInstance.destroy();
        peerInstance = null;
      }

      peerInstance = new Peer(playerId, { debug: 1 });

      const connectionTimeout = setTimeout(() => {
        devLog(`Join attempt ${attempt} timed out`);
        if (peerInstance) peerInstance.destroy();
        reject(new Error('انتهت مهلة الاتصال'));
      }, 10000); // 10s timeout per attempt

      peerInstance.on('open', () => {
        const hostPeerId = `huroof-${roomCode}`;
        hostConnection = peerInstance.connect(hostPeerId, { reliable: true });

        hostConnection.on('open', () => {
          clearTimeout(connectionTimeout);
          devLog('Connected to host!');
          // Send our name and role to the host
          hostConnection.send({ type: 'PLAYER_JOIN', payload: { name: playerName, role } });
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
          devWarn('Disconnected from host connection. Will auto-reconnect...');
          hostConnection = null;
        });

        hostConnection.on('error', (err) => {
          clearTimeout(connectionTimeout);
          devError('Connection error:', err);
          reject(err);
        });
      });

      peerInstance.on('disconnected', () => {
        devWarn('Player disconnected from signaling server. Reconnecting...');
        if (peerInstance && !peerInstance.destroyed) {
          try {
            peerInstance.reconnect();
          } catch (e) {
            devError('Player reconnect failed', e);
          }
        }
      });

      peerInstance.on('error', (err) => {
        clearTimeout(connectionTimeout);
        if (err.type === 'peer-unavailable') {
          // The host might be temporarily disconnected, do not crash
          devWarn('Host unavailable currently...');
          reject(err);
          return;
        }
        devError(`Peer error (attempt ${attempt}):`, err);
        reject(err);
      });
    });
  }

  // Setup reliable auto-reconnector loop for players that drop
  if (window.playerReconnectInterval) clearInterval(window.playerReconnectInterval);
  window.playerReconnectInterval = setInterval(() => {
    if (peerInstance && !peerInstance.destroyed && !hostConnection) {
      devLog('Player auto-reconnecting to host...');
      const hostPeerId = `huroof-${roomCode}`;
      try {
        hostConnection = peerInstance.connect(hostPeerId, { reliable: true });
        
        hostConnection.on('open', () => {
          devLog('Reconnected to host successfully!');
          hostConnection.send({ type: 'PLAYER_JOIN', payload: { name: playerName, role } });
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
          hostConnection = null;
        });

      } catch (e) {
        devError('Auto-reconnect attempt failed', e);
      }
    }
  }, 3000); // Check every 3 seconds

  // Retry loop
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await tryConnect();
    } catch (err) {
      devWarn(`Join attempt ${attempt} failed:`, err.message);
      if (i < maxRetries - 1) {
        // Wait before retrying (500ms, 1500ms)
        await new Promise(r => setTimeout(r, 500 + i * 1000));
      } else {
        // Final attempt failed
        if (onError) onError(new Error('لم يتم العثور على الغرفة. تأكد أن المضيف بدأ اللعبة وأن الكود صحيح.'));
      }
    }
  }
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
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (window.playerReconnectInterval) {
    clearInterval(window.playerReconnectInterval);
    window.playerReconnectInterval = null;
  }
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
