'use client';

import { useState, useEffect, useCallback } from 'react';
import './RotateOverlay.css';

export default function RotateOverlay() {
  const [overlayMode, setOverlayMode] = useState(null); // null | 'rotate' | 'fullscreen'
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  const isMobileOrTablet = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  }, []);

  const checkIsFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return false;
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }, []);

  const checkIsPWA = useCallback(() => {
    if (typeof window === 'undefined') return false;
    // Check if running as installed PWA / standalone
    return window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches;
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
    // Detect iOS
    const ua = navigator.userAgent || '';
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    checkState();
    window.addEventListener('resize', checkState);
    window.addEventListener('orientationchange', () => setTimeout(checkState, 200));
    document.addEventListener('fullscreenchange', checkState);
    document.addEventListener('webkitfullscreenchange', checkState);

    return () => {
      window.removeEventListener('resize', checkState);
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
                    <span>اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> أو <strong>"تثبيت التطبيق"</strong></span>
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
                  <span>اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong></span>
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
