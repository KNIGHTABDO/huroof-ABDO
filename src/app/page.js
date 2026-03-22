'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import './page.css';

// The background is completely managed via CSS background-image now.

import { Scanner } from '@yudiel/react-qr-scanner';

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinCode = searchParams.get('join') || '';

  const [showJoin, setShowJoin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  // Auto-open join form if ?join= param is present (from QR code)
  useEffect(() => {
    if (joinCode) {
      setRoomCode(joinCode.toUpperCase());
      setShowJoin(true);
    }
  }, [joinCode]);

  const handleCreateGame = () => {
    router.push('/game?role=host');
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError('يرجى إدخال اسمك أولاً للانضمام');
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length < 4) {
      setError('يرجى إدخال أو مسح كود الغرفة');
      return;
    }
    router.push(`/game?role=player&room=${roomCode.trim().toUpperCase()}&name=${encodeURIComponent(playerName.trim())}`);
  };

  const handleScan = (result) => {
    if (!result) return;
    const text = Array.isArray(result) ? result[0]?.rawValue : result;
    if (!text) return;
    
    // text looks like: http://192.168.11.../?join=ABCXYZ
    try {
      const parsedUrl = new URL(text);
      const code = parsedUrl.searchParams.get('join');
      if (code && code.length >= 4) {
        setRoomCode(code.toUpperCase());
        setShowScanner(false);
      } else if (text.length === 6) {
        // Fallback for direct 6 letter codes
        setRoomCode(text.toUpperCase());
        setShowScanner(false);
      }
    } catch {
      // If it's not a valid URL URL() throws error, maybe it's raw 6 char code?
      if (text.length >= 4 && text.length <= 6) {
        setRoomCode(text.toUpperCase());
        setShowScanner(false);
      } else {
        setError("لم يتم التعرف على الكود، يرجى المحاولة مرة أخرى.");
      }
    }
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
                       console.log("Scanner Error", e);
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
                placeholder="اسمك هنا..."
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
                <button className="scan-qr-btn" onClick={() => setShowScanner(true)} title="مسح رمز QR">
                  📷 
                </button>
              </div>
              {error && <p className="join-error">{error}</p>}
              <div className="join-form-actions">
                <button className="join-submit-btn" onClick={handleJoinGame}>
                  الدخول للغرفة
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

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{width:'100vw',height:'100vh',background:'#1a0a2e'}} />}>
      <LandingContent />
    </Suspense>
  );
}
