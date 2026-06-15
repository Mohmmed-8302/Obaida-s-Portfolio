"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface Cell { mine: boolean; revealed: boolean; flagged: boolean; count: number; }
type Diff = "beginner" | "intermediate" | "expert";
const CONFIG: Record<Diff, { r: number; c: number; m: number }> = {
  beginner: { r: 9, c: 9, m: 10 },
  intermediate: { r: 16, c: 16, m: 40 },
  expert: { r: 16, c: 30, m: 99 },
};
const NUM_COLORS = ["", "#1976d2", "#388e3c", "#d32f2f", "#1a237e", "#7b1f1f", "#00838f", "#222", "#757575"];
const SIZE = 22;

function makeGrid(r: number, c: number): Cell[][] {
  return Array.from({ length: r }, () => Array.from({ length: c }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })));
}

export default function Minesweeper() {
  const [diff, setDiff] = useState<Diff>("beginner");
  const cfg = CONFIG[diff];
  const [grid, setGrid] = useState<Cell[][]>(() => makeGrid(cfg.r, cfg.c));
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [pressing, setPressing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((d: Diff = diff) => {
    const c = CONFIG[d];
    setGrid(makeGrid(c.r, c.c));
    setStarted(false); setDead(false); setWon(false); setFlags(0); setTime(0);
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }, [diff]);

  useEffect(() => { reset(diff); /* eslint-disable-next-line */ }, [diff]);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startTimer = useCallback(() => {
    if (timer.current) return;
    timer.current = setInterval(() => setTime((t) => Math.min(t + 1, 999)), 1000);
  }, []);
  const stopTimer = useCallback(() => { if (timer.current) { clearInterval(timer.current); timer.current = null; } }, []);

  const plant = useCallback((g: Cell[][], safeR: number, safeC: number) => {
    const { r, c, m } = cfg;
    const banned = new Set<number>();
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = safeR + dr, nc = safeC + dc;
      if (nr >= 0 && nr < r && nc >= 0 && nc < c) banned.add(nr * c + nc);
    }
    let placed = 0;
    while (placed < m) {
      const i = Math.floor(Math.random() * r * c);
      if (banned.has(i) || g[Math.floor(i / c)][i % c].mine) continue;
      g[Math.floor(i / c)][i % c].mine = true;
      placed++;
    }
    for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) {
      if (g[y][x].mine) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < r && nx >= 0 && nx < c && g[ny][nx].mine) n++;
      }
      g[y][x].count = n;
    }
  }, [cfg]);

  const floodReveal = useCallback((g: Cell[][], y: number, x: number) => {
    const { r, c } = cfg;
    const stack = [[y, x]];
    while (stack.length) {
      const [cy, cx] = stack.pop()!;
      const cell = g[cy][cx];
      if (cell.revealed || cell.flagged) continue;
      cell.revealed = true;
      if (cell.count === 0 && !cell.mine) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const ny = cy + dy, nx = cx + dx;
          if (ny >= 0 && ny < r && nx >= 0 && nx < c && !g[ny][nx].revealed) stack.push([ny, nx]);
        }
      }
    }
  }, [cfg]);

  const checkWin = useCallback((g: Cell[][]) => {
    for (const row of g) for (const cell of row) if (!cell.mine && !cell.revealed) return false;
    return true;
  }, []);

  const reveal = useCallback((y: number, x: number) => {
    if (dead || won) return;
    if (grid[y][x].flagged || grid[y][x].revealed) return;
    const g = grid.map((row) => row.map((cell) => ({ ...cell })));
    if (!started) { plant(g, y, x); setStarted(true); startTimer(); }
    if (g[y][x].mine) {
      for (const row of g) for (const cell of row) if (cell.mine) cell.revealed = true;
      setDead(true); stopTimer(); setGrid(g);
      return;
    }
    floodReveal(g, y, x);
    if (checkWin(g)) {
      setWon(true); stopTimer();
      for (const row of g) for (const cell of row) if (cell.mine) cell.flagged = true;
      setFlags(cfg.m);
    }
    setGrid(g);
  }, [dead, won, grid, started, plant, floodReveal, checkWin, startTimer, stopTimer, cfg.m]);

  const flag = useCallback((e: React.MouseEvent, y: number, x: number) => {
    e.preventDefault();
    if (dead || won) return;
    if (grid[y][x].revealed) return;
    const g = grid.map((row) => row.map((cell) => ({ ...cell })));
    g[y][x].flagged = !g[y][x].flagged;
    setFlags((f) => f + (g[y][x].flagged ? 1 : -1));
    setGrid(g);
  }, [dead, won, grid]);

  const face = dead ? "😵" : won ? "😎" : pressing ? "😮" : "🙂";
  const minesLeft = cfg.m - flags;

  return (
    <div className="absolute inset-0 overflow-auto flex flex-col items-center" style={{ fontFamily: "Tahoma, sans-serif", background: "#c0c0c0", padding: 10 }}>
      {/* difficulty */}
      <div className="mb-2 flex gap-1 self-start">
        {(Object.keys(CONFIG) as Diff[]).map((d) => (
          <button key={d} onClick={() => setDiff(d)} style={{ fontSize: 11, padding: "2px 8px", textTransform: "capitalize", cursor: "pointer", border: "2px outset #e8e8e8", background: diff === d ? "#d0d0d0" : "#ececec", borderStyle: diff === d ? "inset" : "outset" }}>{d}</button>
        ))}
      </div>

      {/* bezel */}
      <div style={{ border: "3px solid", borderColor: "#fff #808080 #808080 #fff", background: "#c0c0c0", padding: 6 }}>
        {/* header */}
        <div className="flex items-center justify-between mb-1.5 px-1" style={{ border: "3px solid", borderColor: "#808080 #fff #fff #808080", padding: 4 }}>
          <LcdNumber value={minesLeft} />
          <button onClick={() => reset()} onMouseDown={() => setPressing(true)} onMouseUp={() => setPressing(false)} onMouseLeave={() => setPressing(false)}
            style={{ width: 30, height: 30, fontSize: 18, lineHeight: 1, border: "2px outset #e8e8e8", background: "#d8d8d8", cursor: "pointer", padding: 0 }}>{face}</button>
          <LcdNumber value={time} />
        </div>
        {/* board */}
        <div style={{ border: "3px solid", borderColor: "#808080 #fff #fff #808080", display: "inline-block", lineHeight: 0 }}
          onMouseDown={() => !dead && !won && setPressing(true)} onMouseUp={() => setPressing(false)} onMouseLeave={() => setPressing(false)}>
          {grid.map((row, y) => (
            <div key={y} style={{ display: "flex" }}>
              {row.map((cell, x) => (
                <Tile key={x} cell={cell} dead={dead} onReveal={() => reveal(y, x)} onFlag={(e) => flag(e, y, x)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2" style={{ fontSize: 11, color: "#333" }}>
        {won ? "You cleared the minefield! 😎" : dead ? "Boom! Click the face to retry." : "Left-click reveal · Right-click flag"}
      </div>
    </div>
  );
}

function Tile({ cell, dead, onReveal, onFlag }: { cell: Cell; dead: boolean; onReveal: () => void; onFlag: (e: React.MouseEvent) => void }) {
  const common: React.CSSProperties = { width: SIZE, height: SIZE, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", lineHeight: 1, padding: 0 };
  if (cell.revealed) {
    return (
      <div style={{ ...common, border: "1px solid #9a9a9a", background: cell.mine ? (dead ? "#e23b3b" : "#c0c0c0") : "#c0c0c0", color: NUM_COLORS[cell.count] }}>
        {cell.mine ? "💣" : cell.count > 0 ? cell.count : ""}
      </div>
    );
  }
  return (
    <button onClick={onReveal} onContextMenu={onFlag}
      style={{ ...common, border: "3px outset", borderColor: "#fff #808080 #808080 #fff", background: "#c0c0c0", cursor: "pointer" }}>
      {cell.flagged ? "🚩" : ""}
    </button>
  );
}

function LcdNumber({ value }: { value: number }) {
  const v = Math.max(-99, Math.min(999, value));
  const str = (v < 0 ? "-" : "") + Math.abs(v).toString().padStart(v < 0 ? 2 : 3, "0");
  return (
    <div style={{ background: "#000", color: "#ff2200", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 22, letterSpacing: 1, padding: "1px 4px", minWidth: 46, textAlign: "right", border: "1px solid #500", textShadow: "0 0 4px rgba(255,40,0,0.8)" }}>
      {str}
    </div>
  );
}
