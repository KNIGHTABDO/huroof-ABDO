'use client';

import './HexBoard.css';

/**
 * HexBoard — TV show accurate design with integrated background.
 *
 * Background: 4 SVG triangles filling the ENTIRE area
 *   - GREEN triangles top & bottom
 *   - ORANGE triangles left & right
 *
 * Board: Purple hex borders → white/colored fills → purple text
 * NO extra perimeter lines — the background alone shows team directions.
 */

const ROWS = 5;
const COLS = 5;
const HEX_R = 46;

const HEX_W = Math.sqrt(3) * HEX_R;
const COL_STEP = HEX_W;
const ROW_STEP = HEX_R * 1.5;
const GRID_PAD = 20;

// Extra space for background to extend well beyond the hex grid
const BG_EXT = 200;

function center(row, col) {
  const ox = row % 2 === 1 ? HEX_W / 2 : 0;
  return {
    x: GRID_PAD + BG_EXT + HEX_W / 2 + col * COL_STEP + ox,
    y: GRID_PAD + BG_EXT + HEX_R + row * ROW_STEP,
  };
}

function verts(cx, cy, r) {
  const v = [];
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    v.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return v;
}

function polyPts(cx, cy, r) {
  return verts(cx, cy, r).map(v => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(' ');
}

function hexFill(hex, activeId) {
  if (hex.id === activeId && !hex.owner) return '#FFD700';
  if (hex.owner === 'orange') return '#F47B20';
  if (hex.owner === 'green') return '#2DB84B';
  return '#FFFFFF';
}

function txtCol(hex, activeId) {
  if (hex.owner || (hex.id === activeId && !hex.owner)) return '#FFFFFF';
  return '#6B3FA0';
}

export default function HexBoard({ hexagons, activeHexId, onHexClick, canClick }) {
  // Grid bounds (hex centers range)
  const gridRight = center(1, COLS - 1).x + HEX_W / 2;
  const gridBottom = center(ROWS - 1, 0).y + HEX_R;

  // SVG total size (grid + generous BG extension on all sides)
  const svgW = gridRight + GRID_PAD + BG_EXT;
  const svgH = gridBottom + GRID_PAD + BG_EXT;

  // Center of the SVG for the X-split
  const cx = svgW / 2;
  const cy = svgH / 2;

  return (
    <div className="hex-board-container">
      <svg
        viewBox={`0 0 ${svgW.toFixed(0)} ${svgH.toFixed(0)}`}
        className="hex-board-svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* BACKGROUND: 4 triangles forming X-split */}
        <polygon points={`0,0 ${svgW},0 ${cx},${cy}`} fill="#1EA83A" />
        <polygon points={`0,${svgH} ${svgW},${svgH} ${cx},${cy}`} fill="#1EA83A" />
        <polygon points={`0,0 0,${svgH} ${cx},${cy}`} fill="#E8751A" />
        <polygon points={`${svgW},0 ${svgW},${svgH} ${cx},${cy}`} fill="#E8751A" />

        {/* LAYER 1: Purple hex borders (full-size polygons) */}
        {hexagons.map((hex) => {
          const { x, y } = center(hex.row, hex.col);
          return (
            <polygon
              key={`b-${hex.id}`}
              points={polyPts(x, y, HEX_R)}
              fill="#6B3FA0"
            />
          );
        })}

        {/* LAYER 2: Hex fills + text */}
        {hexagons.map((hex) => {
          const { x, y } = center(hex.row, hex.col);
          const fill = hexFill(hex, activeHexId);
          const clickable = canClick && !hex.owner && hex.id !== activeHexId;
          const active = hex.id === activeHexId && !hex.owner;

          return (
            <g
              key={hex.id}
              className={`hg ${clickable ? 'clk' : ''} ${hex.owner ? 'cap cap-' + hex.owner : ''} ${active ? 'act' : ''}`}
              onClick={() => clickable && onHexClick?.(hex.id)}
            >
              <polygon
                points={polyPts(x, y, HEX_R - 4)}
                fill={fill}
                className="hex-fill"
              />
              <text
                x={x} y={y + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={txtCol(hex, activeHexId)}
                className="hex-txt"
                style={{
                  fontSize: `${HEX_R * 0.52}px`,
                  fontWeight: 900,
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                {hex.letter}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
