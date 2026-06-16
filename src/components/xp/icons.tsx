import type { CSSProperties } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   A library of Windows XP–style icons drawn as inline SVG so they stay crisp
   at any size and need no external image assets. Each takes a `size` prop.
   ────────────────────────────────────────────────────────────────────────── */

interface IconProps {
  size?: number;
  style?: CSSProperties;
}

function Svg({ size = 32, style, children, vb = 48 }: IconProps & { children: React.ReactNode; vb?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      style={{ display: "block", imageRendering: "auto", ...style }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ── Internet Explorer ─────────────────────────────────────────────────── */
export function IeIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <radialGradient id="ie-b" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#9fe6ff" />
          <stop offset="45%" stopColor="#3aa0e8" />
          <stop offset="100%" stopColor="#0b4ea2" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#ie-b)" stroke="#073e80" strokeWidth="1" />
      <ellipse cx="24" cy="24" rx="22" ry="8" fill="none" stroke="#f4d24a" strokeWidth="3"
        transform="rotate(-28 24 24)" opacity="0.95" />
      <text x="24" y="32" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic"
        fontWeight="700" fontSize="22" fill="#fff" style={{ textShadow: "0 1px 1px rgba(0,0,0,.4)" }}>e</text>
    </Svg>
  );
}

/* ── My Computer ───────────────────────────────────────────────────────── */
export function MyComputerIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="mc-s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfeaff" />
          <stop offset="50%" stopColor="#2f8fd6" />
          <stop offset="100%" stopColor="#0c4f86" />
        </linearGradient>
        <linearGradient id="mc-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef1f4" />
          <stop offset="100%" stopColor="#aeb6bf" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="32" height="24" rx="2.5" fill="url(#mc-c)" stroke="#5b6470" strokeWidth="1.2" />
      <rect x="9" y="11" width="26" height="18" rx="1" fill="url(#mc-s)" />
      <rect x="9" y="11" width="26" height="6" fill="#ffffff" opacity="0.18" />
      <path d="M16 32 h16 l3 6 H13 z" fill="#cdd4dc" stroke="#5b6470" strokeWidth="1" />
      <rect x="10" y="38" width="28" height="3" rx="1.5" fill="#9aa3ad" stroke="#5b6470" strokeWidth="0.8" />
      <circle cx="31" cy="34.5" r="1" fill="#7c8590" />
    </Svg>
  );
}

/* ── Recycle Bin ───────────────────────────────────────────────────────── */
export function RecycleBinIcon({ size = 32, style, full = false }: IconProps & { full?: boolean }) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="rb-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cfe7d2" />
          <stop offset="50%" stopColor="#8fc59a" />
          <stop offset="100%" stopColor="#5e9e6c" />
        </linearGradient>
      </defs>
      {full && (
        <g>
          <rect x="17" y="9" width="8" height="7" fill="#f4f1e6" stroke="#b9b29a" strokeWidth="0.8" transform="rotate(-18 21 12)" />
          <rect x="23" y="8" width="7" height="6" fill="#e9f2fb" stroke="#9fb6cc" strokeWidth="0.8" transform="rotate(14 26 11)" />
        </g>
      )}
      <path d="M12 16 h24 l-3 24 a2 2 0 0 1 -2 2 H17 a2 2 0 0 1 -2 -2 z" fill="url(#rb-b)" stroke="#3f6e4a" strokeWidth="1.1" />
      <g stroke="#ffffff" strokeWidth="1.1" opacity="0.85">
        <line x1="20" y1="20" x2="22" y2="38" />
        <line x1="24" y1="20" x2="24" y2="38" />
        <line x1="28" y1="20" x2="26" y2="38" />
      </g>
      <ellipse cx="24" cy="16" rx="12" ry="3.2" fill="#bcdcc2" stroke="#3f6e4a" strokeWidth="1.1" />
      <g fill="#2f7d40" transform="translate(24 16) scale(.32)">
        <path d="M-2-9 2-9 6-2 1-2 1 2-5 2-5-2-10-2z" opacity="0.55" />
      </g>
    </Svg>
  );
}

/* ── Folder (closed / open) ────────────────────────────────────────────── */
export function FolderIcon({ size = 32, style, open = false }: IconProps & { open?: boolean }) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="fold-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe79a" />
          <stop offset="100%" stopColor="#f0b733" />
        </linearGradient>
        <linearGradient id="fold-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd97a" />
          <stop offset="100%" stopColor="#e8a32a" />
        </linearGradient>
      </defs>
      <path d="M6 13 h12 l3 4 h21 a2 2 0 0 1 2 2 v18 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V15 a2 2 0 0 1 2 -2 z" fill="url(#fold-b)" stroke="#b9801c" strokeWidth="1" />
      {open ? (
        <path d="M10 22 h34 l-4 16 a2 2 0 0 1 -2 1.6 H6 a1 1 0 0 1 -1 -1.4 z" fill="url(#fold-g)" stroke="#b9801c" strokeWidth="1" />
      ) : (
        <path d="M4 20 h40 v17 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 z" fill="url(#fold-g)" stroke="#b9801c" strokeWidth="1" />
      )}
      <rect x="4" y="20" width="40" height="3" fill="#fff" opacity="0.4" />
    </Svg>
  );
}

/* ── My Documents ──────────────────────────────────────────────────────── */
export function MyDocumentsIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="md-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe79a" />
          <stop offset="100%" stopColor="#f0b733" />
        </linearGradient>
      </defs>
      <rect x="16" y="6" width="20" height="24" rx="1" fill="#fff" stroke="#9fb6cc" strokeWidth="1" transform="rotate(6 26 18)" />
      <g transform="rotate(6 26 18)" stroke="#5e9bd6" strokeWidth="1.4">
        <line x1="20" y1="12" x2="32" y2="12" />
        <line x1="20" y1="16" x2="32" y2="16" />
        <line x1="20" y1="20" x2="32" y2="20" />
        <line x1="20" y1="24" x2="28" y2="24" />
      </g>
      <path d="M4 18 h12 l3 4 h21 a2 2 0 0 1 2 2 v15 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 z" fill="url(#md-f)" stroke="#b9801c" strokeWidth="1" />
      <rect x="2" y="22" width="44" height="3" fill="#fff" opacity="0.35" />
    </Svg>
  );
}

/* ── Paint ─────────────────────────────────────────────────────────────── */
export function PaintIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <radialGradient id="pt-p" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff7e6" />
          <stop offset="100%" stopColor="#e6c98f" />
        </radialGradient>
      </defs>
      <path d="M24 8 C13 8 6 15 6 24 c0 7 6 9 10 9 c3 0 3 3 1 5 c-2 2 0 4 3 4 c11 0 22-7 22-18 C42 15 35 8 24 8 z" fill="url(#pt-p)" stroke="#a98a52" strokeWidth="1.2" />
      <circle cx="15" cy="20" r="2.6" fill="#e84d4d" />
      <circle cx="22" cy="15" r="2.6" fill="#f2c233" />
      <circle cx="30" cy="16" r="2.6" fill="#46a85a" />
      <circle cx="34" cy="23" r="2.6" fill="#3b7fd1" />
      <circle cx="18" cy="28" r="3.4" fill="#2c2c2c" opacity="0.85" />
      {/* brush */}
      <g transform="rotate(40 34 34)">
        <rect x="32.5" y="20" width="3" height="16" fill="#c08a3e" stroke="#7a5523" strokeWidth="0.6" />
        <rect x="32" y="34" width="4" height="6" fill="#cfd6dd" stroke="#8a939c" strokeWidth="0.6" />
        <path d="M32 40 h4 l-1 5 h-2 z" fill="#e84d4d" />
      </g>
    </Svg>
  );
}

/* ── Tic-Tac-Toe ───────────────────────────────────────────────────────── */
export function TicTacToeIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="6" y="6" width="36" height="36" rx="3" fill="#fff" stroke="#888" strokeWidth="1.2" />
      <g stroke="#5b6470" strokeWidth="2.2">
        <line x1="18" y1="8" x2="18" y2="40" />
        <line x1="30" y1="8" x2="30" y2="40" />
        <line x1="8" y1="18" x2="40" y2="18" />
        <line x1="8" y1="30" x2="40" y2="30" />
      </g>
      <g stroke="#e84d4d" strokeWidth="3" strokeLinecap="round">
        <line x1="9" y1="9" x2="16" y2="16" />
        <line x1="16" y1="9" x2="9" y2="16" />
        <line x1="33" y1="33" x2="39" y2="39" />
        <line x1="39" y1="33" x2="33" y2="39" />
      </g>
      <circle cx="24" cy="24" r="4" fill="none" stroke="#3b7fd1" strokeWidth="3" />
    </Svg>
  );
}

/* ── Minesweeper ───────────────────────────────────────────────────────── */
export function MinesweeperIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="5" y="5" width="38" height="38" rx="3" fill="#c0c0c0" stroke="#7d7d7d" strokeWidth="1.2" />
      <rect x="5" y="5" width="38" height="3" fill="#fff" opacity="0.7" />
      <circle cx="24" cy="24" r="10" fill="#1a1a1a" />
      <g stroke="#1a1a1a" strokeWidth="2.4">
        <line x1="24" y1="9" x2="24" y2="39" />
        <line x1="9" y1="24" x2="39" y2="24" />
        <line x1="13.4" y1="13.4" x2="34.6" y2="34.6" />
        <line x1="34.6" y1="13.4" x2="13.4" y2="34.6" />
      </g>
      <circle cx="24" cy="24" r="10" fill="#1a1a1a" />
      <circle cx="20.5" cy="20.5" r="3" fill="#e8e8e8" opacity="0.9" />
    </Svg>
  );
}

/* ── Solitaire ─────────────────────────────────────────────────────────── */
export function SolitaireIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <g transform="rotate(-16 24 26)">
        <rect x="8" y="12" width="18" height="26" rx="2.5" fill="#fff" stroke="#7d7d7d" strokeWidth="1" />
        <text x="11" y="22" fontFamily="Georgia" fontSize="9" fontWeight="700" fill="#222">A</text>
        <path d="M17 22 l4 6 -4 4 -4-4 z" fill="#222" />
      </g>
      <g transform="rotate(10 26 24)">
        <rect x="22" y="9" width="18" height="26" rx="2.5" fill="#fff" stroke="#7d7d7d" strokeWidth="1" />
        <text x="25" y="19" fontFamily="Georgia" fontSize="9" fontWeight="700" fill="#cc2222">K</text>
        <path d="M31 20 c-2-3-6-1-6 2 c0 3 6 6 6 6 c0 0 6-3 6-6 c0-3-4-5-6-2z" fill="#cc2222" />
      </g>
    </Svg>
  );
}

/* ── Snake ─────────────────────────────────────────────────────────────── */
export function SnakeIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="5" y="5" width="38" height="38" rx="4" fill="#9bbc5a" stroke="#5d7a2e" strokeWidth="1.2" />
      <path d="M12 14 h12 v8 h-8 v8 h12" fill="none" stroke="#243a10" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
      <rect x="32" y="28" width="6" height="6" fill="#243a10" />
      <rect x="33.5" y="29.5" width="1.6" height="1.6" fill="#9bbc5a" />
      <circle cx="16" cy="16" r="2.6" fill="#d24b4b" />
    </Svg>
  );
}

/* ── Chess ─────────────────────────────────────────────────────────────── */
export function ChessIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="6" y="6" width="36" height="36" rx="2" fill="#f0d9b5" stroke="#7a5a33" strokeWidth="1.2" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) =>
          (r + c) % 2 === 1 ? (
            <rect key={`${r}-${c}`} x={6 + c * 9} y={6 + r * 9} width="9" height="9" fill="#b58863" />
          ) : null
        )
      )}
      <g transform="translate(24 26)" fill="#1c1c1c" stroke="#000" strokeWidth="0.6">
        <path d="M-6 9 h12 l-1-3 h-10 z" />
        <path d="M-4 6 c-1-6 3-7 1-11 c2 0 3-2 1-3 c1-2-2-3-3-1 c-3 1-6 5-5 9 c0 3 2 4 1 6 z" />
        <circle cx="-3.5" cy="-9" r="1" fill="#fff" />
      </g>
    </Svg>
  );
}

/* ── Block Breaker ─────────────────────────────────────────────────────── */
export function BlockBreakerIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="5" y="5" width="38" height="38" rx="3" fill="#10131c" stroke="#000" strokeWidth="1" />
      {[["#e84d4d", 8], ["#f2a33b", 14], ["#46a85a", 20]].map(([col, y], i) => (
        <g key={i}>
          {[8, 18, 28].map((x) => (
            <rect key={x} x={x} y={y as number} width="9" height="4.5" rx="1" fill={col as string} stroke="#000" strokeWidth="0.5" />
          ))}
        </g>
      ))}
      <circle cx="30" cy="30" r="2.6" fill="#fff" />
      <rect x="16" y="37" width="16" height="3.4" rx="1.6" fill="#7fb6ff" stroke="#2b5d99" strokeWidth="0.6" />
    </Svg>
  );
}

/* ── Racing ────────────────────────────────────────────────────────────── */
export function RacingIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="5" y="5" width="38" height="38" rx="3" fill="#3a3f4a" stroke="#1c1f26" strokeWidth="1" />
      <rect x="22" y="6" width="4" height="36" fill="#cfd6dd" strokeDasharray="4 4" />
      <g>
        <rect x="15" y="14" width="18" height="22" rx="5" fill="#e23b3b" stroke="#7a1010" strokeWidth="1.2" />
        <rect x="18" y="18" width="12" height="6" rx="2" fill="#bfe3ff" />
        <rect x="11" y="17" width="4" height="6" rx="1.5" fill="#222" />
        <rect x="33" y="17" width="4" height="6" rx="1.5" fill="#222" />
        <rect x="11" y="28" width="4" height="6" rx="1.5" fill="#222" />
        <rect x="33" y="28" width="4" height="6" rx="1.5" fill="#222" />
        <rect x="19" y="29" width="10" height="4" rx="1" fill="#7a1010" />
      </g>
    </Svg>
  );
}

/* ── Control Panel ─────────────────────────────────────────────────────── */
export function ControlPanelIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <circle cx="18" cy="18" r="9" fill="#dfe6ee" stroke="#7c8794" strokeWidth="1.4" />
      <circle cx="18" cy="18" r="3.4" fill="#5b6470" />
      <g stroke="#7c8794" strokeWidth="3">
        <line x1="18" y1="5" x2="18" y2="9" /><line x1="18" y1="27" x2="18" y2="31" />
        <line x1="5" y1="18" x2="9" y2="18" /><line x1="27" y1="18" x2="31" y2="18" />
      </g>
      <rect x="24" y="28" width="18" height="13" rx="2" fill="#3b7fd1" stroke="#1c4f86" strokeWidth="1" />
      <rect x="27" y="31" width="12" height="2.4" rx="1.2" fill="#bfe0ff" />
      <rect x="27" y="35" width="9" height="2.4" rx="1.2" fill="#bfe0ff" />
    </Svg>
  );
}

/* ── Help & Support ────────────────────────────────────────────────────── */
export function HelpIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <circle cx="24" cy="24" r="18" fill="#f2c233" stroke="#b88a14" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="18" fill="url(#help-sh)" />
      <defs>
        <radialGradient id="help-sh" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <text x="24" y="33" textAnchor="middle" fontFamily="Tahoma, sans-serif" fontWeight="700" fontSize="24" fill="#fff" style={{ textShadow: "0 1px 1px rgba(0,0,0,.3)" }}>?</text>
    </Svg>
  );
}

/* ── Search ────────────────────────────────────────────────────────────── */
export function SearchIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <circle cx="20" cy="20" r="12" fill="#cfe7ff" stroke="#2b6bb0" strokeWidth="2.4" />
      <circle cx="20" cy="20" r="12" fill="url(#srch-g)" />
      <defs>
        <radialGradient id="srch-g" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="29" y1="29" x2="40" y2="40" stroke="#3a3f4a" strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

/* ── Run ───────────────────────────────────────────────────────────────── */
export function RunIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="6" y="9" width="36" height="28" rx="2" fill="#fff" stroke="#7c8794" strokeWidth="1.2" />
      <rect x="6" y="9" width="36" height="7" rx="2" fill="#3b7fd1" />
      <circle cx="10" cy="12.5" r="1.4" fill="#fff" />
      <circle cx="14" cy="12.5" r="1.4" fill="#fff" />
      <path d="M14 30 l8-7 -8-7 z" fill="#46a85a" stroke="#2c6b3a" strokeWidth="1" />
      <rect x="24" y="21" width="12" height="4" fill="#dfe6ee" stroke="#9aa3ad" strokeWidth="0.6" />
    </Svg>
  );
}

/* ── Turn Off / Log Off ────────────────────────────────────────────────── */
export function TurnOffIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <circle cx="24" cy="24" r="18" fill="#e23b3b" stroke="#7a1010" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="18" fill="url(#off-sh)" />
      <defs>
        <radialGradient id="off-sh" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="24" y1="14" x2="24" y2="24" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M17 19 a10 10 0 1 0 14 0" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </Svg>
  );
}

export function LogOffIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <circle cx="24" cy="24" r="18" fill="#f2a33b" stroke="#b06b12" strokeWidth="1.4" />
      <path d="M20 14 a11 11 0 1 0 8 0" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <rect x="22.2" y="11" width="3.6" height="13" rx="1.8" fill="#fff" />
    </Svg>
  );
}

/* ── Generic program / app fallback ────────────────────────────────────── */
export function AppIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="8" y="6" width="32" height="36" rx="2" fill="#fff" stroke="#9aa3ad" strokeWidth="1.2" />
      <rect x="8" y="6" width="32" height="7" fill="#3b7fd1" />
      <rect x="12" y="18" width="24" height="3" fill="#c9d3dd" />
      <rect x="12" y="24" width="24" height="3" fill="#c9d3dd" />
      <rect x="12" y="30" width="16" height="3" fill="#c9d3dd" />
    </Svg>
  );
}

/* ── Microsoft Word ────────────────────────────────────────────────────── */
export function WordIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="wd-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9bd5" />
          <stop offset="100%" stopColor="#2b5797" />
        </linearGradient>
      </defs>
      <rect x="10" y="5" width="30" height="38" rx="2.5" fill="#fff" stroke="#b9c2cc" strokeWidth="1.2" />
      <rect x="14" y="11" width="22" height="2.6" rx="1" fill="#9fb6cc" />
      <rect x="14" y="16" width="22" height="2.6" rx="1" fill="#cdd7e2" />
      <rect x="14" y="21" width="22" height="2.6" rx="1" fill="#cdd7e2" />
      <rect x="14" y="26" width="16" height="2.6" rx="1" fill="#cdd7e2" />
      <rect x="4" y="14" width="24" height="22" rx="3" fill="url(#wd-b)" />
      <text x="16" y="31" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="18" fill="#fff">W</text>
    </Svg>
  );
}

/* ── Microsoft Excel ───────────────────────────────────────────────────── */
export function ExcelIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="xl-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#57b97f" />
          <stop offset="100%" stopColor="#1d7045" />
        </linearGradient>
      </defs>
      <rect x="10" y="5" width="30" height="38" rx="2.5" fill="#fff" stroke="#b9c2cc" strokeWidth="1.2" />
      <g stroke="#cdd7e2" strokeWidth="1">
        <line x1="14" y1="12" x2="36" y2="12" /><line x1="14" y1="18" x2="36" y2="18" />
        <line x1="14" y1="24" x2="36" y2="24" /><line x1="14" y1="30" x2="36" y2="30" />
        <line x1="22" y1="9" x2="22" y2="38" /><line x1="29" y1="9" x2="29" y2="38" />
      </g>
      <rect x="4" y="14" width="24" height="22" rx="3" fill="url(#xl-b)" />
      <text x="16" y="31" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="18" fill="#fff">X</text>
    </Svg>
  );
}

/* ── Microsoft PowerPoint ──────────────────────────────────────────────── */
export function PowerPointIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <defs>
        <linearGradient id="pp-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9824a" />
          <stop offset="100%" stopColor="#c0451b" />
        </linearGradient>
      </defs>
      <rect x="10" y="5" width="30" height="38" rx="2.5" fill="#fff" stroke="#b9c2cc" strokeWidth="1.2" />
      <circle cx="25" cy="20" r="7" fill="none" stroke="#e9824a" strokeWidth="2.4" />
      <rect x="14" y="30" width="22" height="2.6" rx="1" fill="#cdd7e2" />
      <rect x="14" y="35" width="16" height="2.6" rx="1" fill="#cdd7e2" />
      <rect x="4" y="14" width="24" height="22" rx="3" fill="url(#pp-b)" />
      <text x="16" y="31" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="18" fill="#fff">P</text>
    </Svg>
  );
}

/* ── Notepad ───────────────────────────────────────────────────────────── */
export function NotepadIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <path d="M12 5 h18 l8 8 v30 a1 1 0 0 1 -1 1 H12 a1 1 0 0 1 -1 -1 V6 a1 1 0 0 1 1 -1z" fill="#fff" stroke="#8aa0b6" strokeWidth="1.2" />
      <path d="M30 5 v8 h8z" fill="#dfe7ef" stroke="#8aa0b6" strokeWidth="1" />
      <g stroke="#5e9bd6" strokeWidth="1.6">
        <line x1="15" y1="20" x2="33" y2="20" /><line x1="15" y1="25" x2="33" y2="25" />
        <line x1="15" y1="30" x2="33" y2="30" /><line x1="15" y1="35" x2="27" y2="35" />
      </g>
      <rect x="6" y="6" width="6" height="38" fill="#3b7fd1" opacity="0.85" />
    </Svg>
  );
}

/* ── Windows Picture & Fax Viewer ──────────────────────────────────────── */
export function PhotoViewerIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="5" y="9" width="38" height="30" rx="2.5" fill="#fff" stroke="#8a939c" strokeWidth="1.4" />
      <rect x="8" y="12" width="32" height="24" fill="#bfe0ff" />
      <circle cx="17" cy="19" r="3.2" fill="#ffd24a" />
      <path d="M8 36 L19 24 L26 31 L32 25 L40 33 v3 H8 z" fill="#46a85a" />
      <path d="M8 36 L19 24 L26 31 L32 25 L40 33" fill="#3a8b4c" opacity="0.4" />
    </Svg>
  );
}

/* ── Flappy Bird ───────────────────────────────────────────────────────── */
export function FlappyBirdIcon({ size = 32, style }: IconProps) {
  return (
    <Svg size={size} style={style}>
      <rect x="4" y="4" width="40" height="40" rx="4" fill="#4ec0ca" stroke="#2a8f99" strokeWidth="1.2" />
      <rect x="4" y="34" width="40" height="10" fill="#ded895" />
      <rect x="4" y="34" width="40" height="3" fill="#5ec84e" />
      {/* pipe */}
      <rect x="30" y="20" width="9" height="14" fill="#5ec84e" stroke="#3a8b3a" strokeWidth="1" />
      <rect x="29" y="18" width="11" height="4" fill="#74d863" stroke="#3a8b3a" strokeWidth="1" />
      {/* bird */}
      <circle cx="18" cy="22" r="7" fill="#ffd24a" stroke="#d99a1e" strokeWidth="1" />
      <circle cx="21" cy="20" r="2.4" fill="#fff" stroke="#333" strokeWidth="0.6" />
      <circle cx="22" cy="20" r="1" fill="#222" />
      <path d="M24 23 l5 -1 -5 -2 z" fill="#f08a2a" />
      <path d="M12 23 q3 4 6 0 z" fill="#fff" opacity="0.85" />
    </Svg>
  );
}

/* ── The little 4-colour XP "flag" used on the Start button ─────────────── */
export function XPFlag({ size = 22, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", ...style }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <g transform="skewX(-8)">
        <path d="M4 5 C7 4 9 4 11 5 L11 11 C9 10 7 10 4 11 Z" fill="#e8463a" />
        <path d="M12 5 C14 4 16 4 19 5 L19 11 C16 10 14 10 12 11 Z" fill="#4ade50" />
        <path d="M4 12 C7 11 9 11 11 12 L11 18 C9 17 7 17 4 18 Z" fill="#4aade8" />
        <path d="M12 12 C14 11 16 11 19 12 L19 18 C16 17 14 17 12 18 Z" fill="#f0c040" />
      </g>
    </svg>
  );
}
