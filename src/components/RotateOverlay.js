'use client';

import { useState, useEffect } from 'react';
import './RotateOverlay.css';

export default function RotateOverlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    function checkOrientation() {
      const isPhone = window.innerWidth < 768 || window.innerHeight < 500;
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowOverlay(isPhone && isPortrait);
    }

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    });

    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  if (!showOverlay) return null;

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
