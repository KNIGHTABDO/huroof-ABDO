'use client';

import { useState, useEffect, useCallback } from 'react';
import './RotateOverlay.css';

function detectMobileOrTablet() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
}

function detectIsPWA() {
  if (typeof window === 'undefined') return false;
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
}

function detectIsFullscreen() {
  if (typeof document === 'undefined') return false;
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}

function detectInitialOverlayMode() {
  if (typeof window === 'undefined') return null;
  if (!detectMobileOrTablet()) return null;

  const pwa = detectIsPWA();
  const isPortrait = window.innerHeight > window.innerWidth;

  if (pwa) return isPortrait ? 'rotate' : null;
  if (isPortrait) return 'rotate';
  if (!detectIsFullscreen()) return 'fullscreen';
  return null;
}

export default function RotateOverlay() {
  const [overlayMode, setOverlayMode] = useState(detectInitialOverlayMode); // null | 'rotate' | 'fullscreen'
  const [isIOS] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  });
  const [isPWA, setIsPWA] = useState(detectIsPWA);

  const isMobileOrTablet = useCallback(() => {
    return detectMobileOrTablet();
  }, []);

  const checkIsFullscreen = useCallback(() => {
    return detectIsFullscreen();
  }, []);

  const checkIsPWA = useCallback(() => {
    return detectIsPWA();
  }, []);

  const checkState = useCallback(() => {
    if (!isMobileOrTablet()) {
      setOverlayMode(null);
      return;
    }

    const pwa = checkIsPWA();
    setIsPWA(pwa);

    // If running as installed PWA, never show fullscreen prompt
    if (pwa) {
      const isPortrait = window.innerHeight > window.innerWidth;
      setOverlayMode(isPortrait ? 'rotate' : null);
      return;
    }

    const isPortrait = window.innerHeight > window.innerWidth;

    if (isPortrait) {
      setOverlayMode('rotate');
    } else if (!checkIsFullscreen()) {
      setOverlayMode('fullscreen');
    } else {
      setOverlayMode(null);
    }
  }, [isMobileOrTablet, checkIsFullscreen, checkIsPWA]);

  useEffect(() => {
    const handleOrientationChange = () => setTimeout(checkState, 200);

    window.addEventListener('resize', checkState);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', checkState);
    document.addEventListener('webkitfullscreenchange', checkState);

    return () => {
      window.removeEventListener('resize', checkState);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', checkState);
      document.removeEventListener('webkitfullscreenchange', checkState);
    };
  }, [checkState]);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (request) {
      request.call(el).then(() => {
        checkState();
      }).catch(() => {
        // Fullscreen API failed — probably iOS, show the Add to Home Screen instructions
        setOverlayMode(null);
      });
    } else {
      setOverlayMode(null);
    }
  }, [checkState]);

  const dismiss = useCallback(() => {
    setOverlayMode(null);
  }, []);

  if (!overlayMode) return null;

  if (overlayMode === 'rotate') {
    return (
      <div className="rotate-overlay">
        <div className="rotate-content">
          <div className="rotate-icon">📱</div>
          <div className="rotate-arrow">↻</div>
          <h2>يرجى تدوير جهازك</h2>
          <p>هذه اللعبة تعمل بشكل أفضل في الوضع الأفقي</p>
        </div>
      </div>
    );
  }

  if (overlayMode === 'fullscreen') {
    return (
      <div className="rotate-overlay fullscreen-overlay">
        <div className="rotate-content">
          <div className="fullscreen-icon">⛶</div>
          <h2>شاشة كاملة</h2>
          <p>للحصول على أفضل تجربة لعب بدون شريط المتصفح</p>

          {/* Android: try fullscreen API + show install instructions */}
          {!isIOS && (
            <>
              <button className="fullscreen-btn" onClick={requestFullscreen}>
                ⛶ تفعيل الشاشة الكاملة
              </button>
              <div className="install-divider">
                <span>أو للتجربة الأفضل</span>
              </div>
              <div className="install-instructions">
                <p className="install-title">📲 تثبيت التطبيق:</p>
                <div className="install-steps-list">
                  <div className="install-step-item">
                    <span className="install-step-num">1</span>
                    <span>اضغط على القائمة <span className="menu-icon">⋮</span> في أعلى المتصفح</span>
                  </div>
                  <div className="install-step-item">
                    <span className="install-step-num">2</span>
                    <span>اختر <strong>&quot;إضافة إلى الشاشة الرئيسية&quot;</strong> أو <strong>&quot;تثبيت التطبيق&quot;</strong></span>
                  </div>
                  <div className="install-step-item">
                    <span className="install-step-num">3</span>
                    <span>افتح التطبيق من الأيقونة الجديدة على شاشتك</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* iOS: guide to Add to Home Screen */}
          {isIOS && (
            <div className="install-instructions">
              <p className="install-title">📲 للشاشة الكاملة بدون متصفح:</p>
              <div className="install-steps-list">
                <div className="install-step-item">
                  <span className="install-step-num">1</span>
                  <span>اضغط على زر المشاركة <span className="ios-share-icon">⬆</span> في شريط المتصفح</span>
                </div>
                <div className="install-step-item">
                  <span className="install-step-num">2</span>
                    <span>اختر <strong>&quot;إضافة إلى الشاشة الرئيسية&quot;</strong></span>
                </div>
                <div className="install-step-item">
                  <span className="install-step-num">3</span>
                  <span>افتح التطبيق من الأيقونة الجديدة على شاشتك</span>
                </div>
              </div>
            </div>
          )}

          <button className="fullscreen-skip" onClick={dismiss}>
            متابعة بدون شاشة كاملة ▸
          </button>
        </div>
      </div>
    );
  }

  return null;
}
