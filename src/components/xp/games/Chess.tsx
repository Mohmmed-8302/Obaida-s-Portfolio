"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

/* ──────────────────────────── Engine ──────────────────────────── */
type Color = "w" | "b";
type PType = "p" | "n" | "b" | "r" | "q" | "k";
interface Piece { t: PType; c: Color; }
type Square = Piece | null;
type Board = Square[][];
interface Move { fr: number; fc: number; tr: number; tc: number; ep?: boolean; castle?: "K" | "Q"; promo?: boolean; double?: boolean; }
interface State { board: Board; turn: Color; castling: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean }; ep: [number, number] | null; }

const GLYPH: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};
const VALUE: Record<PType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function initialState(): State {
  const back: PType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const board: Board = Array.from({ length: 8 }, () => Array<Square>(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = { t: back[c], c: "b" };
    board[1][c] = { t: "p", c: "b" };
    board[6][c] = { t: "p", c: "w" };
    board[7][c] = { t: back[c], c: "w" };
  }
  return { board, turn: "w", castling: { wK: true, wQ: true, bK: true, bQ: true }, ep: null };
}

const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const cloneBoard = (b: Board): Board => b.map((row) => row.map((s) => (s ? { ...s } : null)));

function isAttacked(b: Board, r: number, c: number, by: Color): boolean {
  const pd = by === "w" ? 1 : -1; // white attacks upward (toward row 0) so pawns sit at r+1
  for (const dc of [-1, 1]) { const pr = r + pd, pc = c + dc; if (inB(pr, pc)) { const p = b[pr][pc]; if (p && p.c === by && p.t === "p") return true; } }
  for (const [dr, dc] of [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]]) { const nr = r + dr, nc = c + dc; if (inB(nr, nc)) { const p = b[nr][nc]; if (p && p.c === by && p.t === "n") return true; } }
  for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) { const nr = r + dr, nc = c + dc; if (inB(nr, nc)) { const p = b[nr][nc]; if (p && p.c === by && p.t === "k") return true; } }
  const rays = (dirs: number[][], types: PType[]) => {
    for (const [dr, dc] of dirs) { let nr = r + dr, nc = c + dc; while (inB(nr, nc)) { const p = b[nr][nc]; if (p) { if (p.c === by && types.includes(p.t)) return true; break; } nr += dr; nc += dc; } }
    return false;
  };
  if (rays([[-1, 0], [1, 0], [0, -1], [0, 1]], ["r", "q"])) return true;
  if (rays([[-1, -1], [-1, 1], [1, -1], [1, 1]], ["b", "q"])) return true;
  return false;
}

function kingPos(b: Board, c: Color): [number, number] {
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const p = b[r][f]; if (p && p.t === "k" && p.c === c) return [r, f]; }
  return [-1, -1];
}
function inCheck(b: Board, c: Color): boolean { const [r, f] = kingPos(b, c); return r >= 0 && isAttacked(b, r, f, c === "w" ? "b" : "w"); }

function pseudoMoves(s: State, color: Color): Move[] {
  const { board: b } = s;
  const moves: Move[] = [];
  const add = (m: Move) => moves.push(m);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p || p.c !== color) continue;
    if (p.t === "p") {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      const promoRow = color === "w" ? 0 : 7;
      if (inB(r + dir, c) && !b[r + dir][c]) {
        add({ fr: r, fc: c, tr: r + dir, tc: c, promo: r + dir === promoRow });
        if (r === startRow && !b[r + 2 * dir][c]) add({ fr: r, fc: c, tr: r + 2 * dir, tc: c, double: true });
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (!inB(nr, nc)) continue;
        const t = b[nr][nc];
        if (t && t.c !== color) add({ fr: r, fc: c, tr: nr, tc: nc, promo: nr === promoRow });
        else if (s.ep && s.ep[0] === nr && s.ep[1] === nc) add({ fr: r, fc: c, tr: nr, tc: nc, ep: true });
      }
    } else if (p.t === "n") {
      for (const [dr, dc] of [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]]) { const nr = r + dr, nc = c + dc; if (inB(nr, nc) && (!b[nr][nc] || b[nr][nc]!.c !== color)) add({ fr: r, fc: c, tr: nr, tc: nc }); }
    } else if (p.t === "k") {
      for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) { const nr = r + dr, nc = c + dc; if (inB(nr, nc) && (!b[nr][nc] || b[nr][nc]!.c !== color)) add({ fr: r, fc: c, tr: nr, tc: nc }); }
      // castling
      const rights = s.castling;
      const enemy = color === "w" ? "b" : "w";
      const homeRow = color === "w" ? 7 : 0;
      if (r === homeRow && c === 4 && !isAttacked(b, r, 4, enemy)) {
        const kSide = color === "w" ? rights.wK : rights.bK;
        const qSide = color === "w" ? rights.wQ : rights.bQ;
        if (kSide && !b[homeRow][5] && !b[homeRow][6] && b[homeRow][7]?.t === "r" && !isAttacked(b, homeRow, 5, enemy) && !isAttacked(b, homeRow, 6, enemy)) add({ fr: r, fc: c, tr: homeRow, tc: 6, castle: "K" });
        if (qSide && !b[homeRow][3] && !b[homeRow][2] && !b[homeRow][1] && b[homeRow][0]?.t === "r" && !isAttacked(b, homeRow, 3, enemy) && !isAttacked(b, homeRow, 2, enemy)) add({ fr: r, fc: c, tr: homeRow, tc: 2, castle: "Q" });
      }
    } else {
      const dirs = p.t === "r" ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
        : p.t === "b" ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) { let nr = r + dr, nc = c + dc; while (inB(nr, nc)) { const t = b[nr][nc]; if (!t) add({ fr: r, fc: c, tr: nr, tc: nc }); else { if (t.c !== color) add({ fr: r, fc: c, tr: nr, tc: nc }); break; } nr += dr; nc += dc; } }
    }
  }
  return moves;
}

function applyMove(s: State, m: Move): State {
  const b = cloneBoard(s.board);
  const piece = b[m.fr][m.fc]!;
  const color = piece.c;
  const castling = { ...s.castling };
  let ep: [number, number] | null = null;

  b[m.tr][m.tc] = m.promo ? { t: "q", c: color } : piece;
  b[m.fr][m.fc] = null;
  if (m.ep) b[m.fr][m.tc] = null; // captured pawn
  if (m.castle) {
    const row = m.fr;
    if (m.castle === "K") { b[row][5] = b[row][7]; b[row][7] = null; }
    else { b[row][3] = b[row][0]; b[row][0] = null; }
  }
  if (m.double) ep = [(m.fr + m.tr) / 2, m.fc];
  // update castling rights
  if (piece.t === "k") { if (color === "w") { castling.wK = false; castling.wQ = false; } else { castling.bK = false; castling.bQ = false; } }
  if (m.fr === 7 && m.fc === 0) castling.wQ = false;
  if (m.fr === 7 && m.fc === 7) castling.wK = false;
  if (m.fr === 0 && m.fc === 0) castling.bQ = false;
  if (m.fr === 0 && m.fc === 7) castling.bK = false;
  if (m.tr === 7 && m.tc === 0) castling.wQ = false;
  if (m.tr === 7 && m.tc === 7) castling.wK = false;
  if (m.tr === 0 && m.tc === 0) castling.bQ = false;
  if (m.tr === 0 && m.tc === 7) castling.bK = false;

  return { board: b, turn: color === "w" ? "b" : "w", castling, ep };
}

function legalMoves(s: State, color: Color): Move[] {
  return pseudoMoves(s, color).filter((m) => { const ns = applyMove(s, m); return !inCheck(ns.board, color); });
}

function evaluate(b: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (!p) continue; const v = VALUE[p.t] + (p.t === "p" ? (p.c === "w" ? (6 - r) : (r - 1)) * 4 : 0); score += p.c === "w" ? v : -v; }
  return score;
}

/* minimax with alpha-beta; AI plays black → minimises score */
function search(s: State, depth: number, alpha: number, beta: number, color: Color): number {
  if (depth === 0) return evaluate(s.board);
  const moves = legalMoves(s, color);
  if (moves.length === 0) return inCheck(s.board, color) ? (color === "w" ? -100000 : 100000) : 0;
  moves.sort((a, b2) => captureScore(s.board, b2) - captureScore(s.board, a));
  if (color === "w") {
    let best = -Infinity;
    for (const m of moves) { best = Math.max(best, search(applyMove(s, m), depth - 1, alpha, beta, "b")); alpha = Math.max(alpha, best); if (beta <= alpha) break; }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) { best = Math.min(best, search(applyMove(s, m), depth - 1, alpha, beta, "w")); beta = Math.min(beta, best); if (beta <= alpha) break; }
    return best;
  }
}
const captureScore = (b: Board, m: Move) => { const t = b[m.tr][m.tc]; return t ? VALUE[t.t] : 0; };

function bestMove(s: State, color: Color, depth: number): Move | null {
  const moves = legalMoves(s, color);
  if (!moves.length) return null;
  moves.sort((a, b) => captureScore(s.board, b) - captureScore(s.board, a));
  let best = moves[0]; let bestScore = color === "w" ? -Infinity : Infinity;
  for (const m of moves) {
    const sc = search(applyMove(s, m), depth - 1, -Infinity, Infinity, color === "w" ? "b" : "w");
    if (color === "w" ? sc > bestScore : sc < bestScore) { bestScore = sc; best = m; }
  }
  return best;
}

/* ──────────────────────────── Component ──────────────────────────── */
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Chess() {
  const [state, setState] = useState<State>(initialState);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [last, setLast] = useState<Move | null>(null);
  const [vsAI, setVsAI] = useState(true);
  const [thinking, setThinking] = useState(false);

  const myLegal = useMemo(() => legalMoves(state, state.turn), [state]);
  const selMoves = useMemo(() => (sel ? myLegal.filter((m) => m.fr === sel[0] && m.fc === sel[1]) : []), [sel, myLegal]);
  const checked = inCheck(state.board, state.turn);
  const gameOver = myLegal.length === 0;
  const status = gameOver
    ? (checked ? `Checkmate — ${state.turn === "w" ? "Black" : "White"} wins` : "Stalemate — draw")
    : thinking ? "Computer is thinking…"
    : checked ? `${state.turn === "w" ? "White" : "Black"} is in check`
    : `${state.turn === "w" ? "White" : "Black"} to move`;

  const doMove = useCallback((m: Move) => {
    setState((prev) => applyMove(prev, m));
    setLast(m);
    setSel(null);
  }, []);

  const onSquare = useCallback((r: number, c: number) => {
    if (gameOver) return;
    if (vsAI && state.turn === "b") return;
    const target = selMoves.find((m) => m.tr === r && m.tc === c);
    if (target) { doMove(target); return; }
    const p = state.board[r][c];
    if (p && p.c === state.turn) setSel([r, c]);
    else setSel(null);
  }, [gameOver, vsAI, state.turn, state.board, selMoves, doMove]);

  // AI move
  useEffect(() => {
    if (!vsAI || state.turn !== "b" || gameOver) return;
    setThinking(true);
    const t = setTimeout(() => {
      const m = bestMove(state, "b", 3);
      if (m) { setState((prev) => applyMove(prev, m)); setLast(m); }
      setThinking(false);
    }, 250);
    return () => clearTimeout(t);
  }, [vsAI, state, gameOver]);

  const reset = useCallback(() => { setState(initialState()); setSel(null); setLast(null); setThinking(false); }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center" style={{ fontFamily: "Tahoma, sans-serif", background: "linear-gradient(160deg,#e8ecf3,#cdd6e2)", padding: 12 }}>
      <div className="w-full flex items-center justify-between mb-2" style={{ maxWidth: 360, fontSize: 12, color: "#2a3a52" }}>
        <span style={{ fontWeight: 700 }}>Chess</span>
        <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11 }}>
          <input type="checkbox" checked={vsAI} onChange={(e) => { setVsAI(e.target.checked); }} /> vs Computer
        </label>
      </div>

      <div style={{ border: "6px solid #5a4632", borderRadius: 4, boxShadow: "3px 3px 10px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 42px)", gridTemplateRows: "repeat(8, 42px)" }}>
          {state.board.map((row, r) => row.map((sq, c) => {
            const lightSq = (r + c) % 2 === 0;
            const isSel = sel && sel[0] === r && sel[1] === c;
            const moveHere = selMoves.find((m) => m.tr === r && m.tc === c);
            const isLast = last && ((last.fr === r && last.fc === c) || (last.tr === r && last.tc === c));
            return (
              <div key={`${r}-${c}`} onClick={() => onSquare(r, c)}
                className="relative flex items-center justify-center"
                style={{
                  background: isSel ? "#f6d96b" : isLast ? (lightSq ? "#e6e08a" : "#c9c066") : lightSq ? "#efe6d2" : "#9c7a55",
                  cursor: gameOver ? "default" : "pointer", fontSize: 32, lineHeight: 1, userSelect: "none",
                }}>
                {/* file/rank labels */}
                {c === 0 && <span style={{ position: "absolute", left: 1, top: 0, fontSize: 8, color: lightSq ? "#9c7a55" : "#efe6d2" }}>{8 - r}</span>}
                {r === 7 && <span style={{ position: "absolute", right: 1, bottom: 0, fontSize: 8, color: lightSq ? "#9c7a55" : "#efe6d2" }}>{FILES[c]}</span>}
                {sq && (
                  <span style={{ color: sq.c === "w" ? "#fff" : "#1c1c1c", textShadow: sq.c === "w" ? "0 0 1px #000, 0 1px 1px rgba(0,0,0,0.4)" : "0 1px 1px rgba(255,255,255,0.2)" }}>
                    {GLYPH[sq.c + sq.t]}
                  </span>
                )}
                {moveHere && !sq && <span style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: "rgba(40,90,40,0.45)" }} />}
                {moveHere && sq && <span style={{ position: "absolute", inset: 2, border: "3px solid rgba(40,90,40,0.5)", borderRadius: "50%" }} />}
              </div>
            );
          }))}
        </div>
      </div>

      <div className="mt-2.5 text-center" style={{ fontSize: 13, fontWeight: 700, color: checked || gameOver ? "#c4302b" : "#2a3a52", minHeight: 18 }}>{status}</div>
      <button onClick={reset} className="mt-2 px-5 py-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(to bottom,#5fa0f4,#1257c4)", border: "1px solid #0d49ad", borderRadius: 4, cursor: "pointer" }}>New Game</button>
    </div>
  );
}
