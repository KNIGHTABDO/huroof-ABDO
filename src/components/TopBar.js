'use client';

import './TopBar.css';

export default function TopBar({ title = 'حروف مع عبدو', roomCode, onOptionsClick }) {
  return (
    <div className="top-bar">
      <div className="top-bar-right">
        <span className="top-bar-title">{title}</span>
      </div>
      <div className="top-bar-left">
        {roomCode && (
          <span className="room-code-badge">
            كود الغرفة: <strong>{roomCode}</strong>
          </span>
        )}
        <button className="options-btn" onClick={onOptionsClick}>
          خيارات
        </button>
      </div>
    </div>
  );
}
