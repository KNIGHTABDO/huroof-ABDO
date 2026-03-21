'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import './page.css';

// The background is completely managed via CSS background-image now.

export default function LandingPage() {
  const router = useRouter();
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleCreateGame = () => {
    router.push('/game?role=host');
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError('يرجى إدخال اسمك');
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length < 4) {
      setError('يرجى إدخال كود الغرفة');
      return;
    }
    router.push(`/game?role=player&room=${roomCode.trim().toUpperCase()}&name=${encodeURIComponent(playerName.trim())}`);
  };

  return (
    <div className="landing-page">
      {/* Background image is applied globally in page.css */}
      <div className="landing-bg-pattern">
        <div className="landing-blob top-right"></div>
        <div className="landing-blob bottom-left"></div>
      </div>

      <div className="landing-content">
        {/* Render the shiny new 3D Logo from AI generation */}
        <div className="landing-logo">
          <Image src="/assets/logo_transparent.png" alt="حروف مع عبدو" width={450} height={220} priority style={{ objectFit: 'contain' }} />
        </div>

        {/* Action Buttons */}
        <div className="landing-actions">
          <button className="landing-btn create-btn" onClick={handleCreateGame}>
            <span className="btn-icon">🎮</span>
            <span className="btn-text">إنشاء لعبة</span>
            <span className="btn-desc">كن المضيف واطرح الأسئلة</span>
          </button>

          {!showJoin ? (
            <button className="landing-btn join-btn" onClick={() => setShowJoin(true)}>
              <span className="btn-icon">🤝</span>
              <span className="btn-text">انضم للعبة</span>
              <span className="btn-desc">ادخل كود الغرفة وانضم لفريقك</span>
            </button>
          ) : (
            <div className="join-form">
              <input
                type="text"
                className="name-input"
                placeholder="اسمك..."
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
                maxLength={20}
                autoFocus
              />
              <input
                type="text"
                className="room-input"
                placeholder="كود الغرفة..."
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value); setError(''); }}
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
              />
              {error && <p className="join-error">{error}</p>}
              <div className="join-form-actions">
                <button className="join-submit-btn" onClick={handleJoinGame}>
                  انضم الآن
                </button>
                <button className="join-cancel-btn" onClick={() => { setShowJoin(false); setRoomCode(''); setPlayerName(''); }}>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="landing-footer-container" style={{ textAlign: 'center', marginTop: '40px' }}>
          <p className="landing-footer" style={{ marginBottom: '10px' }}>🌙 لعبة المناسبات والجمعات مع الأهل والأصدقاء</p>
          <div className="landing-footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '0.9rem', opacity: 0.7 }}>
            <Link href="/privacy" style={{ color: '#fff', textDecoration: 'none' }}>سياسة الخصوصية</Link>
            <span style={{ color: '#fff' }}>•</span>
            <Link href="/terms" style={{ color: '#fff', textDecoration: 'none' }}>شروط الخدمة</Link>
            <span style={{ color: '#fff' }}>•</span>
            <Link href="/changelog" style={{ color: '#fff', textDecoration: 'none' }}>سجل التحديثات</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
