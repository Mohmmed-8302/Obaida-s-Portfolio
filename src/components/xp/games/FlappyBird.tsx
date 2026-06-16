"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const W = 320;
const H = 460;
const GROUND = 60;
const PLAY_H = H - GROUND;

const BIRD_X = 78;
const BIRD_R = 13;
const GRAVITY = 0.42;
const FLAP = -7.2;
const PIPE_W = 56;
const GAP = 140;
const PIPE_SPEED = 2.1;
const PIPE_SPACING = 200; // horizontal px between pipes

interface Pipe { x: number; gapY: number; passed: boolean; }

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [state, setState] = useState<"ready" | "playing" | "over">("ready");

  const bird = useRef({ y: PLAY_H / 2, v: 0 });
  const pipes = useRef<Pipe[]>([]);
  const frame = useRef(0);
  const raf = useRef(0);
  const stateRef = useRef(state);
  const scoreRef = useRef(0);
  stateRef.current = state;

  const reset = useCallback(() => {
    bird.current = { y: PLAY_H / 2, v: 0 };
    pipes.current = [];
    frame.current = 0;
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const start = useCallback(() => {
    reset();
    bird.current.v = FLAP;
    setState("playing");
  }, [reset]);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (s === "ready") { start(); return; }
    if (s === "over") { setState("ready"); reset(); return; }
    bird.current.v = FLAP;
  }, [start, reset]);

  const spawnPipe = useCallback(() => {
    const margin = 54;
    const gapY = margin + Math.random() * (PLAY_H - GAP - margin * 2);
    pipes.current.push({ x: W + PIPE_W, gapY, passed: false });
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, PLAY_H);
    sky.addColorStop(0, "#4ec0ca");
    sky.addColorStop(1, "#9be0e6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, PLAY_H);

    // distant clouds
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 140 - (frame.current * 0.3) % 460) + 460) % 460 - 60;
      ctx.beginPath();
      ctx.arc(cx, 70 + i * 30, 20, 0, Math.PI * 2);
      ctx.arc(cx + 22, 70 + i * 30, 26, 0, Math.PI * 2);
      ctx.arc(cx + 48, 70 + i * 30, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // pipes
    for (const p of pipes.current) {
      drawPipe(ctx, p.x, p.gapY);
    }

    // ground
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, PLAY_H, W, GROUND);
    ctx.fillStyle = "#5ec84e";
    ctx.fillRect(0, PLAY_H, W, 8);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    for (let x = -((frame.current * PIPE_SPEED) % 24); x < W; x += 24) {
      ctx.fillRect(x, PLAY_H + 8, 12, GROUND - 8);
    }

    // bird
    const b = bird.current;
    const angle = Math.max(-0.5, Math.min(1.2, b.v / 10));
    ctx.save();
    ctx.translate(BIRD_X, b.y);
    ctx.rotate(angle);
    // body
    ctx.fillStyle = "#ffd24a";
    ctx.strokeStyle = "#d99a1e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // wing
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-3, 3, 6, 4, Math.sin(frame.current * 0.3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // eye
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(6, -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(7.5, -4, 1.8, 0, Math.PI * 2); ctx.fill();
    // beak
    ctx.fillStyle = "#f0892a";
    ctx.beginPath(); ctx.moveTo(11, -1); ctx.lineTo(19, 1); ctx.lineTo(11, 4); ctx.closePath(); ctx.fill();
    ctx.restore();

    // score
    if (stateRef.current === "playing") {
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 3;
      ctx.font = "bold 34px Tahoma, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeText(String(scoreRef.current), W / 2, 60);
      ctx.fillText(String(scoreRef.current), W / 2, 60);
    }
  }, []);

  const update = useCallback(() => {
    const b = bird.current;
    b.v += GRAVITY;
    b.y += b.v;

    // spawn pipes
    if (frame.current % Math.round(PIPE_SPACING / PIPE_SPEED) === 0) spawnPipe();

    // move pipes + scoring
    for (const p of pipes.current) {
      p.x -= PIPE_SPEED;
      if (!p.passed && p.x + PIPE_W < BIRD_X) {
        p.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    }
    pipes.current = pipes.current.filter((p) => p.x + PIPE_W > -4);

    // collisions
    const hitGround = b.y + BIRD_R >= PLAY_H;
    const hitCeil = b.y - BIRD_R <= 0;
    let hitPipe = false;
    for (const p of pipes.current) {
      const inX = BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
      if (inX && (b.y - BIRD_R < p.gapY || b.y + BIRD_R > p.gapY + GAP)) hitPipe = true;
    }
    if (hitGround || hitCeil || hitPipe) {
      b.y = Math.min(b.y, PLAY_H - BIRD_R);
      setBest((bs) => Math.max(bs, scoreRef.current));
      setState("over");
    }
  }, [spawnPipe]);

  // main loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      if (stateRef.current === "playing") {
        frame.current += 1;
        update();
      }
      draw(ctx);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [draw, update]);

  // keyboard
  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); flap(); }
  }, [flap]);

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      onMouseDown={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).focus(); flap(); }}
      className="absolute inset-0 flex flex-col items-center justify-center outline-none"
      style={{ background: "linear-gradient(160deg,#1b3a4b,#0d1f2a)", padding: 10, cursor: "pointer" }}
    >
      <div className="w-full flex items-center justify-between mb-2" style={{ maxWidth: W, color: "#cdeef2", fontSize: 12, fontFamily: "Tahoma, sans-serif" }}>
        <span>Score: <b>{score}</b></span>
        <span>Best: <b>{best}</b></span>
      </div>

      <div style={{ position: "relative", border: "4px solid #2a8f99", borderRadius: 6, boxShadow: "inset 0 0 12px rgba(0,0,0,0.4)", lineHeight: 0 }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", borderRadius: 2 }} />
        {state !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 12, background: "rgba(10,25,32,0.55)", color: "#fff", textAlign: "center", fontFamily: "Tahoma, sans-serif" }}>
            {state === "over" && <div style={{ fontSize: 24, fontWeight: 800, color: "#ffd24a", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Game Over</div>}
            {state === "over" && <div style={{ fontSize: 14 }}>Score: <b>{score}</b> · Best: <b>{best}</b></div>}
            {state === "ready" && <div style={{ fontSize: 22, fontWeight: 800 }}>🐤 Flappy Bird</div>}
            <button
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.stopPropagation(); start(); }}
              style={{ fontSize: 14, fontWeight: 700, color: "#1b3a4b", background: "linear-gradient(to bottom,#ffe169,#ffc23a)", border: "2px solid #d99a1e", borderRadius: 6, padding: "8px 22px", cursor: "pointer" }}
            >
              {state === "over" ? "Play Again" : "Start"}
            </button>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Click or press Space to flap</div>
          </div>
        )}
      </div>
    </div>
  );
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, gapY: number) {
  const grad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
  grad.addColorStop(0, "#74d863");
  grad.addColorStop(0.5, "#5ec84e");
  grad.addColorStop(1, "#3a9b34");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#2e7a28";
  ctx.lineWidth = 2;
  const lip = 22;
  // top pipe
  ctx.fillRect(x, 0, PIPE_W, gapY);
  ctx.strokeRect(x, 0, PIPE_W, gapY);
  ctx.fillRect(x - 4, gapY - lip, PIPE_W + 8, lip);
  ctx.strokeRect(x - 4, gapY - lip, PIPE_W + 8, lip);
  // bottom pipe
  const by = gapY + GAP;
  ctx.fillRect(x, by, PIPE_W, PLAY_H - by);
  ctx.strokeRect(x, by, PIPE_W, PLAY_H - by);
  ctx.fillRect(x - 4, by, PIPE_W + 8, lip);
  ctx.strokeRect(x - 4, by, PIPE_W + 8, lip);
}
