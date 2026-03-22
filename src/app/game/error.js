'use client';

import './page.css';

export default function GameError({ error, reset }) {
  return (
    <div className="game-loading">
      <p className="error-msg">حدث خطأ غير متوقع أثناء تشغيل اللعبة.</p>
      <button className="back-btn" onClick={() => reset()}>
        إعادة المحاولة
      </button>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
        {error?.message ? `تفاصيل: ${error.message}` : 'حاول مرة أخرى أو ارجع للرئيسية.'}
      </p>
    </div>
  );
}
