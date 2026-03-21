'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import HexBoard from '../../components/HexBoard';
import Sidebar from '../../components/Sidebar';
import RotateOverlay from '../../components/RotateOverlay';
import {
  createGameState,
  assignPoint,
  selectHex,
  nextRound,
  resetGame,
} from '../../lib/gameState';
import {
  createGame,
  joinGame,
  broadcastState,
  broadcastTeamChange,
  sendAction,
  disconnect,
  getPlayers,
} from '../../lib/peerManager';
import './page.css';

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'host';
  const roomParam = searchParams.get('room') || '';
  const nameParam = searchParams.get('name') || '';

  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState(roomParam);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const gameStateRef = useRef(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialize game
  useEffect(() => {
    async function init() {
      try {
        if (role === 'host') {
          const initialState = createGameState();
          setGameState(initialState);

          const { roomCode: code } = await createGame(
            (conn, playerInfo) => {
              // Update players list from peer manager
              setPlayers([...getPlayers()]);
              if (gameStateRef.current && conn) {
                broadcastState(gameStateRef.current);
              }
            },
            (data, conn) => {
              if (data.type === 'HEX_CLICK') {
                const currentState = gameStateRef.current;
                if (currentState && currentState.phase === 'selecting') {
                  // Only allow the controlling team to select
                  const playerInfo = getPlayers().find(p => p.id === conn.peer);
                  if (playerInfo && playerInfo.team === currentState.controllingTeam) {
                    const newState = selectHex(currentState, data.payload.hexId);
                    setGameState(newState);
                    broadcastState(newState);
                  }
                }
              }
            },
            (err) => setError('حدث خطأ في الاتصال: ' + err.message)
          );

          setRoomCode(code);
          setConnected(true);
          setLoading(false);
        } else {
          setLoading(true);
          await joinGame(
            roomParam,
            nameParam,
            (state, yourTeam, playersList) => {
              setGameState(state);
              if (yourTeam) setMyTeam(yourTeam);
              if (playersList) setPlayers(playersList);
              setConnected(true);
              setLoading(false);
            },
            (team) => {
              setMyTeam(team);
            },
            (err) => {
              setError('لم يتم العثور على اللعبة. تأكد من كود الغرفة.');
              setLoading(false);
            }
          );
        }
      } catch (err) {
        setError('حدث خطأ: ' + err.message);
        setLoading(false);
      }
    }

    init();
    return () => disconnect();
  }, [role, roomParam, nameParam]);

  const handleAssignPoint = useCallback((team) => {
    if (role !== 'host' || !gameState) return;
    const newState = assignPoint(gameState, team, gameState.activeHexId);
    setGameState(newState);
    broadcastState(newState);
  }, [role, gameState]);

  const handleHexClick = useCallback((hexId) => {
    if (!gameState || gameState.phase !== 'selecting') return;
    if (role === 'host') {
      // Host can select on behalf of controlling team
      const newState = selectHex(gameState, hexId);
      setGameState(newState);
      broadcastState(newState);
    } else {
      // Player can only select if they're on the controlling team
      if (myTeam === gameState.controllingTeam) {
        sendAction({ type: 'HEX_CLICK', payload: { hexId } });
      }
    }
  }, [role, gameState, myTeam]);

  const handleNextRound = useCallback(() => {
    if (role !== 'host' || !gameState) return;
    const newState = nextRound(gameState);
    setGameState(newState);
    broadcastState(newState);
  }, [role, gameState]);

  const handleResetGame = useCallback(() => {
    if (role !== 'host') return;
    const newState = resetGame();
    setGameState(newState);
    broadcastState(newState);
  }, [role]);

  const handleSwitchTeam = useCallback((playerId, newTeam) => {
    if (role !== 'host') return;
    broadcastTeamChange(playerId, newTeam);
    setPlayers([...getPlayers()]);
    if (gameStateRef.current) {
      broadcastState(gameStateRef.current);
    }
  }, [role]);

  if (loading) {
    return (
      <div className="game-loading">
        <Image src="/assets/logo_transparent.png" alt="ينتظر" width={300} height={250} priority style={{ objectFit: 'contain', animation: 'logoPulse 2s infinite' }} />
        <p>{role === 'host' ? 'جاري إنشاء الغرفة...' : 'جاري الاتصال بالغرفة...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-loading">
        <p className="error-msg">{error}</p>
        <button className="back-btn" onClick={() => router.push('/')}>العودة للرئيسية</button>
      </div>
    );
  }

  if (!gameState) return null;

  const activeHex = gameState.hexagons.find(h => h.id === gameState.activeHexId);
  const canClickBoard = gameState.phase === 'selecting' && (role === 'host' || myTeam === gameState.controllingTeam);

  return (
    <div className="game-page">
      <RotateOverlay />

      <div className="game-layout">
        {/* Board area */}
        <div className="board-area">
          <div className="board-wrapper">
            <HexBoard
              hexagons={gameState.hexagons}
              activeHexId={gameState.activeHexId}
              onHexClick={handleHexClick}
              canClick={canClickBoard}
            />
          </div>
          {/* Room code + player count overlay */}
          {role === 'host' && roomCode && (
            <div className="board-info-bar">
              <span className="room-code-pill">كود الغرفة: <strong>{roomCode}</strong></span>
              <span className="player-count-pill">👥 {players.length} لاعب</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          currentRound={gameState.currentRound}
          scores={gameState.scores}
          activeHexLetter={activeHex ? activeHex.letter : ''}
          currentQuestion={gameState.currentQuestion}
          phase={gameState.phase}
          isHost={role === 'host'}
          controllingTeam={gameState.controllingTeam}
          onAssignPoint={handleAssignPoint}
          onNextRound={handleNextRound}
          onResetGame={handleResetGame}
          players={players}
          myTeam={myTeam}
          onSwitchTeam={handleSwitchTeam}
        />
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="game-loading">
        <Image src="/assets/logo_transparent.png" alt="ينتظر" width={300} height={250} priority style={{ objectFit: 'contain', animation: 'logoPulse 2s infinite' }} />
        <p>جاري التحميل...</p>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
