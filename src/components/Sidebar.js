'use client';

import { useState } from 'react';
import Image from 'next/image';
import './Sidebar.css';

const ROUND_NAMES = ['', 'الجولة الأولى', 'الجولة الثانية', 'الجولة الثالثة', 'الجولة الرابعة', 'الجولة الخامسة'];

export default function Sidebar({
  currentRound,
  scores,
  activeHexLetter,
  currentQuestion,
  phase,
  isHost,
  controllingTeam,
  buzzerInfo,
  onAssignPoint,
  onNextRound,
  onResetGame,
  players = [],
  myTeam = null,
  isSpectator = false,
  onSwitchTeam,
  onClearBuzzer,
  onBuzz,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const roundName = ROUND_NAMES[currentRound] || `الجولة ${currentRound}`;

  const orangePlayers = players.filter(p => p.team === 'orange');
  const greenPlayers = players.filter(p => p.team === 'green');

  return (
    <aside className="sidebar">
      {/* Top section: title + options */}
      <div className="sidebar-top">
        <div className="sidebar-title-img">
          <Image src="/assets/logo_transparent.png" alt="حروف مع عبدو" width={180} height={60} style={{ objectFit: 'contain' }} />
        </div>
        {!isSpectator && (
          <button className="options-btn" onClick={() => setShowOptions(!showOptions)}>
            {showOptions ? 'إغلاق' : 'خيارات'}
          </button>
        )}
      </div>

      {/* Options Panel (host only) */}
      {showOptions && !isSpectator && (
        <div className="options-panel">
          {isHost ? (
            <>
              <h3 className="options-title">إدارة الفرق</h3>
              {players.length === 0 ? (
                <p className="options-empty">لا يوجد لاعبين بعد</p>
              ) : (
                <div className="teams-manager">
                  {/* Orange Team */}
                  <div className="team-section team-section-orange">
                    <h4>🟠 البرتقالي ({orangePlayers.length})</h4>
                    {orangePlayers.map(p => (
                      <div key={p.id} className="player-row">
                        <span className="player-name">{p.name}</span>
                        <button
                          className="switch-btn switch-to-green"
                          onClick={() => onSwitchTeam && onSwitchTeam(p.id, 'green')}
                        >
                          → أخضر
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Green Team */}
                  <div className="team-section team-section-green">
                    <h4>🟢 الأخضر ({greenPlayers.length})</h4>
                    {greenPlayers.map(p => (
                      <div key={p.id} className="player-row">
                        <span className="player-name">{p.name}</span>
                        <button
                          className="switch-btn switch-to-orange"
                          onClick={() => onSwitchTeam && onSwitchTeam(p.id, 'orange')}
                        >
                          → برتقالي
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button className="action-btn reset-btn-sm" onClick={onResetGame}>🔄 إعادة اللعبة</button>
            </>
          ) : (
            <p className="options-empty">الخيارات متاحة للمضيف فقط</p>
          )}
        </div>
      )}

      {/* Player's team indicator (for non-host players) */}
      {!isHost && !isSpectator && myTeam && (
        <div className={`my-team-badge team-badge-${myTeam}`}>
          {myTeam === 'orange' ? '🟠 أنت في الفريق البرتقالي' : '🟢 أنت في الفريق الأخضر'}
        </div>
      )}

      {/* Spectator indicator */}
      {isSpectator && (
        <div className="my-team-badge team-badge-spectator">
          👁️ أنت تشاهد اللعبة الآن
        </div>
      )}

      {/* Round Title */}
      <h1 className="round-title">{roundName}</h1>

      {/* Question / Status Area */}
      <div className="question-area">
        {phase === 'questioning' && currentQuestion && (
          <>
            {isHost ? (
              <>
                <p className="question-text">{currentQuestion.question}</p>
                <p className="question-answer">الإجابة: {currentQuestion.answer}</p>
                {buzzerInfo && (
                  <div className={`buzzer-alert buzzer-alert-${buzzerInfo.team}`}>
                    <div className="buzzer-alert-title">🔔 جرس للإجابة!</div>
                    <div className="buzzer-alert-text">الفريق {buzzerInfo.team === 'orange' ? 'البرتقالي 🟠' : 'الأخضر 🟢'} </div>
                    <div className="buzzer-alert-name">({buzzerInfo.playerName})</div>
                    <button className="clear-buzzer-btn" onClick={onClearBuzzer}>
                      إلغاء الجرس ❌
                    </button>
                  </div>
                )}
              </>
            ) : isSpectator ? (
              <div className="player-buzzer-area">
                <p className="question-text">{currentQuestion.question}</p>
                <p className="question-hidden-text" style={{marginTop: '15px', opacity: 0.8}}>⏳ بانتظار إجابة أحد الفرق...</p>
                {buzzerInfo && (
                  <div className={`buzzer-status buzzer-status-other`}>
                    <div className="buzzer-status-icon">🔔</div>
                    <div className="buzzer-status-text">
                      تم قرع الجرس!
                    </div>
                    <div className="buzzer-status-name">اللاعب: {buzzerInfo.playerName}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="player-buzzer-area">
                <p className="question-hidden-text">🎙️ المضيف يقرأ السؤال الآن...</p>
                {!buzzerInfo ? (
                  <button className="buzzer-btn" onClick={onBuzz} disabled={!myTeam}>
                    أنا أعرف! 🔔
                  </button>
                ) : (
                  <div className={`buzzer-status buzzer-status-${buzzerInfo.team === myTeam ? 'mine' : 'other'}`}>
                    <div className="buzzer-status-icon">{buzzerInfo.team === myTeam ? '✅' : '⏳'}</div>
                    <div className="buzzer-status-text">
                      {buzzerInfo.team === myTeam ? 'فريقك قرع الجرس!' : 'الفريق الآخر قرع الجرس!'}
                    </div>
                    <div className="buzzer-status-name">اللاعب: {buzzerInfo.playerName}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {phase === 'selecting' && (
          <p className="status-text">
            {controllingTeam === 'orange' ? '🟠 الفريق البرتقالي' : '🟢 الفريق الأخضر'} يختار الحرف التالي
          </p>
        )}
        {phase === 'roundOver' && (
          <p className="status-text">انتهت الجولة! 🎉</p>
        )}
        {phase === 'gameOver' && (
          <p className="status-text win-text">
            🏆 فاز {scores.orange >= 3 ? 'الفريق البرتقالي 🟠' : 'الفريق الأخضر 🟢'}!
          </p>
        )}
      </div>

      {/* Host Controls: assign points */}
      {isHost && phase === 'questioning' && (
        <div className="host-controls">
          <button className="assign-btn assign-orange" onClick={() => onAssignPoint && onAssignPoint('orange')}>
            نقطة للبرتقالي 🟠
          </button>
          <button className="assign-btn assign-green" onClick={() => onAssignPoint && onAssignPoint('green')}>
            نقطة للأخضر 🟢
          </button>
        </div>
      )}

      {/* Next round / new game */}
      {isHost && phase === 'roundOver' && (
        <button className="action-btn" onClick={onNextRound}>الجولة التالية</button>
      )}
      {isHost && phase === 'gameOver' && (
        <button className="action-btn" onClick={onResetGame}>لعبة جديدة</button>
      )}

      {/* Spacer to push scores to bottom */}
      <div className="sidebar-spacer" />

      {/* Score Display — bottom of sidebar */}
      <div className="scores-row">
        <button className="reset-icon-btn" onClick={onResetGame} title="إعادة">↻</button>
        <div className="score-hex score-orange">
          <span>{scores.orange}</span>
        </div>
        <div className="score-hex score-green">
          <span>{scores.green}</span>
        </div>
      </div>
    </aside>
  );
}
