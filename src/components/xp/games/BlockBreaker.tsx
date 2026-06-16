"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDesktop } from "../DesktopContext";
import { useGameSave, recordBest } from "../storage/gameStore";

const W = 440, H = 460;
const COLS = 8, ROWS = 5;
const BRICK_W = 48, BRICK_H = 18, BRICK_GAP = 4, BRICK_TOP = 40, BRICK_LEFT = 12;
const PADDLE_W = 76, PADDLE_H = 12;
const BALL_R = 6;
const ROW_COLORS = ["#e23b3b", "#f2a33b", "#f2d033", "#46a85a", "#3b7fd1"];

export default function BlockBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useDesktop();
  const { data } = useGameSave("blockbreaker");
  const best = data.highScore ?? 0;
  const [state, setState] = useState<"ready" | "playing" | "over" | "won" | "paused">("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const bricks = useRef<boolean[]>([]);
  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef({ x: W / 2, y: H - 40, vx: 3, vy: -3 });
  const raf = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);

  const resetBricks = useCallback(() => { bricks.current = Array(COLS * ROWS).fill(true); }, []);
  const resetBall = useCallback(() => {
    const sp = 3 + levelRef.current * 0.4;
    ball.current = { x: W / 2, y: H - 40, vx: sp * (Math.random() > 0.5 ? 1 : -1), vy: -sp };
    paddleX.current = W / 2 - PADDLE_W / 2;
  }, []);

  const startGame = useCallback(() => {
    setScore(0); scoreRef.current = 0;
    setLives(3); livesRef.current = 3;
    setLevel(1); levelRef.current = 1;
    resetBricks(); resetBall();
    setState("playing");
    setTimeout(() => containerRef.current?.focus(), 0);
  }, [resetBricks, resetBall]);

  const nextLevel = useCallback(() => {
    levelRef.current += 1; setLevel(levelRef.current);
    resetBricks(); resetBall();
    setState("playing");
    setTimeout(() => containerRef.current?.focus(), 0);
  }, [resetBricks, resetBall]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#0c1018";
    ctx.fillRect(0, 0, W, H);
    // bricks
    bricks.current.forEach((alive, i) => {
      if (!alive) return;
      const r = Math.floor(i / COLS), c = i % COLS;
      const x = BRICK_LEFT + c * (BRICK_W + BRICK_GAP);
      const y = BRICK_TOP + r * (BRICK_H + BRICK_GAP);
      ctx.fillStyle = ROW_COLORS[r % ROW_COLORS.length];
      ctx.fillRect(x, y, BRICK_W, BRICK_H);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x, y, BRICK_W, 3);
    });
    // paddle
    ctx.fillStyle = "#9fc8ff";
    roundRect(ctx, paddleX.current, H - 24, PADDLE_W, PADDLE_H, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    roundRect(ctx, paddleX.current, H - 24, PADDLE_W, 4, 4); ctx.fill();
    // ball
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, []);

  const update = useCallback(() => {
    const b = ball.current;
    b.x += b.vx; b.y += b.vy;
    if (b.x < BALL_R) { b.x = BALL_R; b.vx *= -1; }
    if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx *= -1; }
    if (b.y < BALL_R) { b.y = BALL_R; b.vy *= -1; }
    // paddle collision
    if (b.y + BALL_R >= H - 24 && b.y + BALL_R <= H - 24 + PADDLE_H + 4 && b.x >= paddleX.current && b.x <= paddleX.current + PADDLE_W && b.vy > 0) {
      const hit = (b.x - (paddleX.current + PADDLE_W / 2)) / (PADDLE_W / 2);
      const sp = Math.hypot(b.vx, b.vy);
      b.vx = sp * hit * 0.85;
      b.vy = -Math.sqrt(Math.max(1, sp * sp - b.vx * b.vx));
    }
    // brick collision
    for (let i = 0; i < bricks.current.length; i++) {
      if (!bricks.current[i]) continue;
      const r = Math.floor(i / COLS), c = i % COLS;
      const bx = BRICK_LEFT + c * (BRICK_W + BRICK_GAP);
      const by = BRICK_TOP + r * (BRICK_H + BRICK_GAP);
      if (b.x + BALL_R > bx && b.x - BALL_R < bx + BRICK_W && b.y + BALL_R > by && b.y - BALL_R < by + BRICK_H) {
        bricks.current[i] = false;
        scoreRef.current += 10; setScore(scoreRef.current);
        // bounce vertical or horizontal based on overlap
        const overlapX = Math.min(b.x + BALL_R - bx, bx + BRICK_W - (b.x - BALL_R));
        const overlapY = Math.min(b.y + BALL_R - by, by + BRICK_H - (b.y - BALL_R));
        if (overlapX < overlapY) b.vx *= -1; else b.vy *= -1;
        break;
      }
    }
    if (bricks.current.every((x) => !x)) { setState("won"); return; }
    // ball lost
    if (b.y - BALL_R > H) {
      livesRef.current -= 1; setLives(livesRef.current);
      if (livesRef.current <= 0) {
        setState("over");
        if (recordBest("blockbreaker", "highScore", scoreRef.current)) notify("New high score!", `Block Breaker — ${scoreRef.current} points.`);
      }
      else resetBall();
    }
  }, [resetBall, notify]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      if (stateRef.current === "playing") update();
      draw(ctx);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [update, draw]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * (W / r.width);
    paddleX.current = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
  }, []);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") { paddleX.current = Math.max(0, paddleX.current - 28); e.preventDefault(); }
    if (k === "arrowright" || k === "d") { paddleX.current = Math.min(W - PADDLE_W, paddleX.current + 28); e.preventDefault(); }
    if (k === " ") { e.preventDefault(); setState((s) => s === "playing" ? "paused" : s === "paused" ? "playing" : s); }
  }, []);

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={onKey} onMouseDown={() => containerRef.current?.focus()} className="absolute inset-0 flex flex-col items-center justify-center outline-none" style={{ fontFamily: "Tahoma, sans-serif", background: "#1a1f2b", padding: 10 }}>
      <div className="flex items-center justify-between mb-2" style={{ width: W, color: "#cfe0ff", fontSize: 12 }}>
        <span>Score: <b>{score}</b></span>
        <span>High: <b>{best}</b></span>
        <span>Level: <b>{level}</b></span>
        <span>Lives: <b style={{ color: "#ff8a8a" }}>{"●".repeat(Math.max(0, lives))}</b></span>
      </div>
      <div style={{ position: "relative", border: "2px solid #2b3550", borderRadius: 4 }}>
        <canvas ref={canvasRef} width={W} height={H} onMouseMove={onMouseMove} style={{ display: "block", cursor: "none" }} />
        {state !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(10,14,24,0.82)", color: "#cfe0ff", textAlign: "center" }}>
            {state === "over" && <div style={{ fontSize: 22, fontWeight: 700, color: "#ff8a8a", marginBottom: 6 }}>Game Over</div>}
            {state === "won" && <div style={{ fontSize: 22, fontWeight: 700, color: "#9fffb0", marginBottom: 6 }}>Level Cleared!</div>}
            {state === "ready" && <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Block Breaker</div>}
            {state === "paused" && <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Paused</div>}
            <button onClick={state === "won" ? nextLevel : state === "paused" ? () => setState("playing") : startGame}
              style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(to bottom,#5fa0f4,#1257c4)", border: "1px solid #0d49ad", borderRadius: 4, padding: "7px 18px", cursor: "pointer" }}>
              {state === "over" ? "Try Again" : state === "won" ? "Next Level" : state === "paused" ? "Resume" : "Start"}
            </button>
            <div style={{ fontSize: 10, marginTop: 8, opacity: 0.8 }}>Move mouse / arrows · Space to pause</div>
          </div>
        )}
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
