'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import './page.css';
import { normalizePlayerName, normalizeRoomCode, extractRoomCodeFromScan } from '../lib/validation';

// The background is completely managed via CSS background-image now.

import { Scanner } from '@yudiel/react-qr-scanner';

const ACTION_COOLDOWN_MS = 1200;

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinCode = searchParams.get('join') || '';
  const initialJoinCode = normalizeRoomCode(joinCode) || '';

  const [showJoin, setShowJoin] = useState(Boolean(initialJoinCode));
  const [showScanner, setShowScanner] = useState(false);
  const [roomCode, setRoomCode] = useState(initialJoinCode);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isActionLocked, setIsActionLocked] = useState(false);
  const actionLockTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (actionLockTimerRef.current) {
        clearTimeout(actionLockTimerRef.current);
      }
    };
  }, []);

  const lockAction = () => {
    setIsActionLocked(true);

    if (actionLockTimerRef.current) {
      clearTimeout(actionLockTimerRef.current);
    }

    actionLockTimerRef.current = setTimeout(() => {
      setIsActionLocked(false);
      actionLockTimerRef.current = null;
    }, ACTION_COOLDOWN_MS);
  };

  const shouldBlockRapidAction = () => {
    if (!isActionLocked) return false;
    setError('الرجاء الانتظار لحظة قصيرة قبل المحاولة مرة أخرى.');
    return true;
  };

  const handleCreateGame = () => {
    if (shouldBlockRapidAction()) return;
    lockAction();
    router.push('/game?role=host');
  };

  const handleSpectateGame = () => {
    if (shouldBlockRapidAction()) return;
    lockAction();
    setShowJoin('spectator');
  };

  const handleJoinGame = () => {
    if (shouldBlockRapidAction()) return;
    lockAction();

    const validName = normalizePlayerName(playerName || (showJoin === 'spectator' ? 'مشاهد' : ''));
    if (!validName && showJoin !== 'spectator') {
      setError('يرجى إدخال اسم صحيح (1-20 حرفاً)');
      return;
    }

    const validCode = normalizeRoomCode(roomCode);
    if (!validCode) {
      setError('كود الغرفة يجب أن يكون 6 أحرف/أرقام');
      return;
    }

    const role = showJoin === 'spectator' ? 'spectator' : 'player';
    const name = showJoin === 'spectator' ? (playerName || 'مشاهد') : validName;

    router.push(`/game?role=${role}&room=${validCode}&name=${encodeURIComponent(name)}`);
  };

  const handleScan = (result) => {
    const code = extractRoomCodeFromScan(result);
    if (!code) {
      setError('لم يتم التعرف على كود صالح، حاول مرة أخرى.');
      return;
    }
    setRoomCode(code);
    setShowScanner(false);
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
          <button className="landing-btn create-btn" onClick={handleCreateGame} disabled={isActionLocked}>
            <Image src="/assets/btn_icon_create.png" alt="" width={48} height={48} className="btn-icon-img" />
            <span className="btn-text">إنشاء لعبة</span>
            <span className="btn-desc">كن المضيف واطرح الأسئلة</span>
          </button>

          {!showJoin ? (
            <>
              <button className="landing-btn join-btn" onClick={() => {
                if (shouldBlockRapidAction()) return;
                lockAction();
                setShowJoin('player');
              }} disabled={isActionLocked}>
                <Image src="/assets/btn_icon_join.png" alt="" width={48} height={48} className="btn-icon-img" />
                <span className="btn-text">انضم للعبة</span>
                <span className="btn-desc">ادخل كود الغرفة وانضم لفريقك</span>
              </button>

              <button className="landing-btn spectate-btn" onClick={handleSpectateGame} disabled={isActionLocked}>
                <Image src="/assets/btn_icon_spectate.png" alt="" width={48} height={48} className="btn-icon-img" />
                <span className="btn-text">وضع المشاهد</span>
                <span className="btn-desc">شاهد اللعبة مباشرة بدون مشاركة</span>
              </button>
            </>
          ) : showScanner ? (
            <div className="join-form qr-scanner-view">
              <h3 style={{color: '#fff', fontSize: '1rem', marginBottom: '10px'}}>وجه الكاميرا لرمز الـ QR الخاص بالمضيف</h3>
              
              {typeof window !== 'undefined' && !window.isSecureContext ? (
                <div style={{background: '#ff475722', color: '#ff4757', padding: '15px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '10px', textAlign: 'center', border: '1px solid #ff4757'}}>
                  🚫 <b>الكاميرا غير متاحة</b><br/>
                  الوصول للكاميرا يتطلب اتصال آمن (HTTPS).<br/>سيتم تفعيل هذه الميزة تلقائياً عند تشغيل اللعبة عبر رابط الإنترنت الفعلي (Vercel).<br/>(للآن، استخدم كتابة الكود يدوياً)
                </div>
              ) : (
                <div style={{borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', background: '#000'}}>
                   <Scanner 
                     onScan={(result) => handleScan(result)} 
                     onError={(e) => {
                       if (process.env.NODE_ENV !== 'production') {
                         console.warn('Scanner Error', e);
                       }
                       if (e?.message?.includes("secure context")) {
                         setError("الكاميرا تتطلب اتصالاً آمناً (HTTPS). يرجى إدخال الكود يدوياً للآن.");
                         setShowScanner(false);
                       }
                     }}
                     components={{ tracker: true, audio: false }}
                   />
                </div>
              )}
              
              <button className="join-cancel-btn" onClick={() => setShowScanner(false)}>إلغاء المسح</button>
            </div>
          ) : (
            <div className="join-form">
              <input
                type="text"
                className="name-input"
                placeholder={showJoin === 'spectator' ? "اسمك (اختياري)..." : "اسمك هنا..."}
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
                maxLength={20}
                autoFocus
              />
              <div className="room-input-group">
                <input
                  type="text"
                  className="room-input"
                  placeholder="كود الغرفة..."
                  value={roomCode}
                  onChange={(e) => { setRoomCode(e.target.value); setError(''); }}
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                />
                <button className="scan-qr-btn" onClick={() => {
                  if (shouldBlockRapidAction()) return;
                  lockAction();
                  setShowScanner(true);
                }} title="مسح رمز QR" disabled={isActionLocked}>
                  📷 
                </button>
              </div>
              {error && <p className="join-error">{error}</p>}
              <div className="join-form-actions">
                <button className="join-submit-btn" onClick={handleJoinGame} disabled={isActionLocked}>
                  {showJoin === 'spectator' ? 'دخول كمشاهد' : 'الدخول للغرفة'}
                </button>
                <button className="join-cancel-btn" onClick={() => { setShowJoin(null); setRoomCode(''); setPlayerName(''); }}>
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
            <Link href="/install" style={{ color: '#fff', textDecoration: 'none' }}>التثبيت والتحميل</Link>
            <span style={{ color: '#fff' }}>•</span>
            <Link href="/privacy" style={{ color: '#fff', textDecoration: 'none' }}>سياسة الخصوصية</Link>
            <span style={{ color: '#fff' }}>•</span>
            <Link href="/terms" style={{ color: '#fff', textDecoration: 'none' }}>شروط الخدمة</Link>
            <span style={{ color: '#fff' }}>•</span>
            <Link href="/changelog" style={{ color: '#fff', textDecoration: 'none' }}>سجل التحديثات</Link>
          </div>
        </div>
      </div>

      {/* Chroma Key Filter for Premium Icons */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none', visibility: 'hidden' }}>
        <defs>
          <filter id="chroma-key-green">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              1.1 -2.2 1.1 1 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{width:'100vw',height:'100vh',background:'#1a0a2e'}} />}>
      <LandingContent />
    </Suspense>
  );
}
