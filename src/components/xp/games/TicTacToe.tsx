"use client";

import { useState, useCallback, useEffect } from "react";

type Cell = "X" | "O" | null;
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b: Cell[]): Cell | "draw" | null {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? "draw" : null;
}

/* Minimax — computer is O, player is X */
function minimax(b: Cell[], isO: boolean): { score: number; move: number } {
  const w = winner(b);
  if (w === "O") return { score: 10, move: -1 };
  if (w === "X") return { score: -10, move: -1 };
  if (w === "draw") return { score: 0, move: -1 };
  let best = { score: isO ? -Infinity : Infinity, move: -1 };
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    const nb = b.slice();
    nb[i] = isO ? "O" : "X";
    const r = minimax(nb, !isO).score;
    if (isO ? r > best.score : r < best.score) best = { score: r, move: i };
  }
  return best;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });
  const [hard, setHard] = useState(true);
  const result = winner(board);

  const reset = useCallback(() => { setBoard(Array(9).fill(null)); setTurn("X"); }, []);

  const play = useCallback((i: number) => {
    if (board[i] || result || turn !== "X") return;
    const nb = board.slice();
    nb[i] = "X";
    setBoard(nb);
    setTurn("O");
  }, [board, result, turn]);

  // computer move
  useEffect(() => {
    if (turn !== "O" || result) return;
    const t = setTimeout(() => {
      const empties = board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
      let move: number;
      if (hard && Math.random() > 0.15) move = minimax(board, true).move;
      else move = empties[Math.floor(Math.random() * empties.length)];
      if (move >= 0) {
        const nb = board.slice();
        nb[move] = "O";
        setBoard(nb);
      }
      setTurn("X");
    }, 420);
    return () => clearTimeout(t);
  }, [turn, board, result, hard]);

  // tally
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => {
      setScore((s) => result === "X" ? { ...s, w: s.w + 1 } : result === "O" ? { ...s, l: s.l + 1 } : { ...s, d: s.d + 1 });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const status = result === "X" ? "You win! 🎉" : result === "O" ? "Computer wins" : result === "draw" ? "It's a draw" : turn === "X" ? "Your turn (X)" : "Computer thinking…";

  return (
    <div className="absolute inset-0 flex flex-col items-center" style={{ fontFamily: "Tahoma, sans-serif", background: "linear-gradient(160deg,#eef3fb,#d4e0f2)", padding: 14 }}>
      <div className="w-full flex items-center justify-between mb-2" style={{ fontSize: 12, color: "#1c3d6e" }}>
        <span style={{ fontWeight: 700 }}>Tic-Tac-Toe</span>
        <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11 }}>
          <input type="checkbox" checked={hard} onChange={(e) => setHard(e.target.checked)} /> Hard
        </label>
      </div>

      <div style={{ background: "#1c3d6e", padding: 6, borderRadius: 6, boxShadow: "inset 0 0 0 2px #fff, 2px 2px 6px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gridTemplateRows: "repeat(3, 70px)", gap: 6 }}>
          {board.map((c, i) => (
            <button key={i} onClick={() => play(i)}
              className="flex items-center justify-center"
              style={{
                fontSize: 44, fontWeight: 700, lineHeight: 1,
                color: c === "X" ? "#e23b3b" : "#2b7fd1",
                background: "linear-gradient(160deg,#ffffff,#dfe8f5)",
                border: "1px solid #9fb6d6", borderRadius: 4,
                cursor: c || result || turn !== "X" ? "default" : "pointer",
                boxShadow: "inset 1px 1px 0 #fff",
                fontFamily: "Tahoma, sans-serif",
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-center" style={{ fontSize: 13, fontWeight: 700, color: result === "X" ? "#1c8a32" : result === "O" ? "#c4302b" : "#1c3d6e", minHeight: 18 }}>{status}</div>

      <div className="mt-2 flex items-center gap-4" style={{ fontSize: 11, color: "#34527d" }}>
        <span>Wins: <b>{score.w}</b></span>
        <span>Losses: <b>{score.l}</b></span>
        <span>Draws: <b>{score.d}</b></span>
      </div>

      <button onClick={reset} className="mt-3 px-5 py-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(to bottom,#5fa0f4,#1257c4)", border: "1px solid #0d49ad", borderRadius: 4, cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}>New Game</button>
    </div>
  );
}
