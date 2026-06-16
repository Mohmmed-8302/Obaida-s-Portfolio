"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDesktop } from "../DesktopContext";
import { useGameSave, recordBest } from "../storage/gameStore";

const CELLS = 20;
const CELL = 17;
const SIZE = CELLS * CELL;

type Pt = { x: number; y: number };
const eq = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y;

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useDesktop();
  const { data } = useGameSave("snake");
  const best = data.highScore ?? 0;
  const [score, setScore] = useState(0);
  const [state, setState] = useState<"ready" | "playing" | "over" | "paused">("ready");
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const snake = useRef<Pt[]>([{ x: 10, y: 10 }]);
  const dir = useRef<Pt>({ x: 1, y: 0 });
  const nextDir = useRef<Pt>({ x: 1, y: 0 });
  const food = useRef<Pt>({ x: 15, y: 10 });
  const acc = useRef(0);
  const last = useRef(0);
  const raf = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const placeFood = useCallback(() => {
    let p: Pt;
    do { p = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) }; }
    while (snake.current.some((s) => eq(s, p)));
    food.current = p;
  }, []);

  const start = useCallback(() => {
    snake.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    placeFood();
    setScore(0);
    setState("playing");
    setTimeout(() => containerRef.current?.focus(), 0);
  }, [placeFood]);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    // background grid (Nokia-ish)
    ctx.fillStyle = "#9bbc5a";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = "rgba(60,80,30,0.12)";
    for (let i = 0; i <= CELLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }
    // food
    ctx.fillStyle = "#7a1f1f";
    ctx.fillRect(food.current.x * CELL + 3, food.current.y * CELL + 3, CELL - 6, CELL - 6);
    // snake
    snake.current.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#1e3308" : "#2f4d12";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const step = useCallback(() => {
    dir.current = nextDir.current;
    const head = snake.current[0];
    const nh = { x: head.x + dir.current.x, y: head.y + dir.current.y };
    if (nh.x < 0 || nh.y < 0 || nh.x >= CELLS || nh.y >= CELLS || snake.current.some((s) => eq(s, nh))) {
      setState("over");
      if (recordBest("snake", "highScore", score)) notify("New high score!", `Snake — ${score} point${score === 1 ? "" : "s"}.`);
      return;
    }
    snake.current.unshift(nh);
    if (eq(nh, food.current)) {
      setScore((s) => s + 1);
      placeFood();
    } else {
      snake.current.pop();
    }
  }, [placeFood, score, notify]);

  // game loop
  useEffect(() => {
    const loop = (t: number) => {
      raf.current = requestAnimationFrame(loop);
      if (stateRef.current !== "playing") { last.current = t; draw(); return; }
      const dt = t - last.current;
      last.current = t;
      acc.current += dt;
      const speed = Math.max(70, 150 - snake.current.length * 3); // speeds up as it grows
      if (acc.current >= speed) { acc.current = 0; step(); }
      draw();
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [draw, step]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const d = dir.current;
    if ((k === "arrowup" || k === "w") && d.y === 0) nextDir.current = { x: 0, y: -1 };
    else if ((k === "arrowdown" || k === "s") && d.y === 0) nextDir.current = { x: 0, y: 1 };
    else if ((k === "arrowleft" || k === "a") && d.x === 0) nextDir.current = { x: -1, y: 0 };
    else if ((k === "arrowright" || k === "d") && d.x === 0) nextDir.current = { x: 1, y: 0 };
    else if (k === " ") { setState((s) => s === "playing" ? "paused" : s === "paused" ? "playing" : s); }
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKey}
      onMouseDown={() => containerRef.current?.focus()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="absolute inset-0 flex flex-col items-center justify-center outline-none"
      style={{ fontFamily: "Tahoma, sans-serif", background: "linear-gradient(160deg,#33402a,#1e2618)", padding: 12 }}
    >
      <div className="w-full flex items-center justify-between mb-2" style={{ maxWidth: SIZE, color: "#cfe0a8", fontSize: 12 }}>
        <span>Score: <b>{score}</b></span>
        <span>Best: <b>{best}</b></span>
      </div>

      <div style={{ position: "relative", border: "4px solid #4a5a32", borderRadius: 4, boxShadow: "inset 0 0 10px rgba(0,0,0,0.4)" }}>
        <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{ display: "block" }} />
        {state !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(20,28,12,0.78)", color: "#cfe0a8", textAlign: "center" }}>
            {state === "over" && <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#ff9a9a" }}>Game Over</div>}
            {state === "paused" && <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Paused</div>}
            {state === "ready" && <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🐍 Snake</div>}
            <button onClick={start} style={{ fontSize: 13, fontWeight: 700, color: "#1e2618", background: "linear-gradient(to bottom,#cfe0a8,#9bbc5a)", border: "1px solid #4a5a32", borderRadius: 4, padding: "6px 16px", cursor: "pointer" }}>
              {state === "over" ? "Play Again" : state === "paused" ? "Resume" : "Start"}
            </button>
            <div style={{ fontSize: 10, marginTop: 8, opacity: 0.8 }}>Arrow keys / WASD · Space to pause</div>
          </div>
        )}
      </div>

      {!focused && state === "playing" && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#ffd27f" }}>Click the game to control the snake</div>
      )}
    </div>
  );
}
