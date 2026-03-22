'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import HexBoard from '../../components/HexBoard';
import Sidebar from '../../components/Sidebar';
import RotateOverlay from '../../components/RotateOverlay';
import {
  createGameState,
  assignPoint,
  selectHex,
  nextRound,
  resetGame,
  registerBuzzer,
  clearBuzzer,
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
import { normalizePlayerName, normalizeRoomCode } from '../../lib/validation';
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

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
              const currentState = gameStateRef.current;
              if (!currentState) return;

              if (data.type === 'HEX_CLICK') {
                if (currentState.phase === 'selecting') {
                  const playerInfo = getPlayers().find(p => p.id === conn.peer);
                  if (playerInfo && playerInfo.team === currentState.controllingTeam) {
                    const newState = selectHex(currentState, data.payload.hexId);
                    setGameState(newState);
                    broadcastState(newState);
                  }
                }
              } else if (data.type === 'BUZZ') {
                const playerInfo = getPlayers().find(p => p.id === conn.peer) || { team: 'orange', name: 'لاعب سريع' };
                // alert(`Host received buzz from ${playerInfo.name}!`); // Uncomment for more debug if needed
                const newState = registerBuzzer(currentState, playerInfo.team, playerInfo.name);
                setGameState(newState);
                broadcastState(newState);
              }
            },
            (err) => setError('حدث خطأ في الاتصال: ' + err.message)
          );

          setRoomCode(code);
          setConnected(true);
          setLoading(false);
        } else {
          const validRoom = normalizeRoomCode(roomParam);
          const validName = normalizePlayerName(nameParam);

          if (!validRoom || !validName) {
            setError('بيانات الانضمام غير صالحة. تحقق من الاسم وكود الغرفة.');
            setLoading(false);
            return;
          }

          setLoading(true);
          await joinGame(
            validRoom,
            validName,
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
              setError('تعذر العثور على الغرفة. تحقق من الكود أو اطلب كوداً جديداً من المضيف.');
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

  const handleClearBuzzer = useCallback(() => {
    if (role !== 'host' || !gameState) return;
    const newState = clearBuzzer(gameState);
    setGameState(newState);
    broadcastState(newState);
  }, [role, gameState]);

  const handleBuzz = useCallback(() => {
    sendAction({ type: 'BUZZ' });
  }, []);

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

  const handleCopyRoomCode = useCallback(() => {
    if (!roomCode) return;
    
    if (navigator.clipboard && window.isSecureContext) {
      // Modern secure context (HTTPS or localhost)
      navigator.clipboard.writeText(roomCode).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to copy: ', err);
        }
      });
    } else {
      // Fallback for non-HTTPS local network (e.g. 192.168.x.x)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = roomCode;
        // Move element out of view completely
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        
        // Select and copy
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        
        textArea.remove();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Fallback copy failed: ', err);
        }
      }
    }
  }, [roomCode]);

  if (loading) {
    return (
      <div className="game-loading">
        <Image src="/assets/logo_transparent.png" alt="ينتظر" width={300} height={250} priority style={{ objectFit: 'contain', animation: 'logoPulse 2s infinite' }} />
        <p>{role === 'host' ? 'جاري تجهيز الغرفة...' : 'جاري الانضمام للغرفة، انتظر لحظة...'}</p>
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
            <>
              <div className="board-info-bar">
                <span 
                  className="room-code-pill" 
                  onClick={handleCopyRoomCode}
                  title="اضغط لنسخ الكود"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {!copySuccess ? (
                    <>كود الغرفة: <strong>{roomCode}</strong> <span style={{fontSize: '1em', marginRight: '6px', opacity: 0.8}}>📋</span></>
                  ) : (
                    <strong>تم النسخ! ✓</strong>
                  )}
                </span>
                <span 
                  className="qr-code-pill" 
                  onClick={() => setShowQR(true)}
                  title="عرض QR Code"
                >
                  📱 QR
                </span>
                <span className="player-count-pill">👥 {players.length} لاعب</span>
              </div>

              {/* QR Code Modal */}
              {showQR && (
                <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
                  <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="qr-modal-close" onClick={() => setShowQR(false)}>✕</button>
                    <h3 className="qr-modal-title">امسح الكود للانضمام</h3>
                    <div className="qr-code-wrapper">
                      <QRCodeSVG
                        value={typeof window !== 'undefined' ? `${window.location.origin}/?join=${roomCode}` : roomCode}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#2d1b4e"
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="qr-modal-code">كود الغرفة: <strong>{roomCode}</strong></p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          currentRound={gameState.currentRound}
          scores={gameState.scores}
          activeHexLetter={gameState.hexagons.find(h => h.id === gameState.activeHexId)?.letter}
          currentQuestion={gameState.currentQuestion}
          phase={gameState.phase}
          isHost={role === 'host'}
          controllingTeam={gameState.controllingTeam}
          buzzerInfo={gameState.buzzerInfo}
          onAssignPoint={handleAssignPoint}
          onNextRound={handleNextRound}
          onResetGame={handleResetGame}
          onSwitchTeam={handleSwitchTeam}
          onClearBuzzer={handleClearBuzzer}
          onBuzz={handleBuzz}
          players={players}
          myTeam={myTeam}
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
        <p>جاري تهيئة اللعبة...</p>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
