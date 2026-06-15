"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const W = 320, H = 480;
const LANES = 4;
const LANE_W = W / LANES;
const CAR_W = 46, CAR_H = 74;

interface Obstacle { lane: number; y: number; color: string; }
const ENEMY_COLORS = ["#f2c233", "#46a85a", "#9a59c4", "#e8853b", "#3b7fd1"];

export default function Racing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"ready" | "playing" | "over">("ready");
  const [distance, setDistance] = useState(0);
  const [best, setBest] = useState(0);

  const lane = useRef(1);
  const targetX = useRef(LANE_W * 1 + LANE_W / 2);
  const carX = useRef(LANE_W * 1 + LANE_W / 2);
  const obstacles = useRef<Obstacle[]>([]);
  const roadOffset = useRef(0);
  const speed = useRef(4);
  const distRef = useRef(0);
  const spawnT = useRef(0);
  const raf = useRef(0);
  const keys = useRef<Set<string>>(new Set());
  const stateRef = useRef(state);
  stateRef.current = state;

  const start = useCallback(() => {
    lane.current = 1;
    carX.current = targetX.current = LANE_W * 1 + LANE_W / 2;
    obstacles.current = [];
    roadOffset.current = 0;
    speed.current = 4;
    distRef.current = 0; setDistance(0);
    spawnT.current = 0;
    setState("playing");
  }, []);

  const move = useCallback((dir: -1 | 1) => {
    if (stateRef.current !== "playing") return;
    lane.current = Math.max(0, Math.min(LANES - 1, lane.current + dir));
    targetX.current = lane.current * LANE_W + LANE_W / 2;
  }, []);

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, flip = false) => {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(1, -1);
    // body
    ctx.fillStyle = color;
    roundRect(ctx, -CAR_W / 2, -CAR_H / 2, CAR_W, CAR_H, 8); ctx.fill();
    // windshield
    ctx.fillStyle = "rgba(190,225,255,0.9)";
    roundRect(ctx, -CAR_W / 2 + 7, -CAR_H / 2 + 10, CAR_W - 14, 18, 4); ctx.fill();
    roundRect(ctx, -CAR_W / 2 + 7, CAR_H / 2 - 26, CAR_W - 14, 14, 4); ctx.fill();
    // wheels
    ctx.fillStyle = "#111";
    ctx.fillRect(-CAR_W / 2 - 3, -CAR_H / 2 + 12, 5, 16);
    ctx.fillRect(CAR_W / 2 - 2, -CAR_H / 2 + 12, 5, 16);
    ctx.fillRect(-CAR_W / 2 - 3, CAR_H / 2 - 28, 5, 16);
    ctx.fillRect(CAR_W / 2 - 2, CAR_H / 2 - 28, 5, 16);
    ctx.restore();
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // grass
    ctx.fillStyle = "#2f6b34";
    ctx.fillRect(0, 0, W, H);
    // road
    ctx.fillStyle = "#3a3f4a";
    ctx.fillRect(16, 0, W - 32, H);
    // edges
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(16, 0, 5, H); ctx.fillRect(W - 21, 0, 5, H);
    // lane dashes
    ctx.fillStyle = "#e8e23b";
    for (let l = 1; l < LANES; l++) {
      const x = l * LANE_W - 2;
      for (let y = -40 + (roadOffset.current % 50); y < H; y += 50) ctx.fillRect(x, y, 4, 28);
    }
    // obstacles
    obstacles.current.forEach((o) => drawCar(ctx, o.lane * LANE_W + LANE_W / 2, o.y, o.color, true));
    // player
    drawCar(ctx, carX.current, H - 70, "#e23b3b");
  }, [drawCar]);

  const update = useCallback(() => {
    // smooth lane change
    carX.current += (targetX.current - carX.current) * 0.25;
    roadOffset.current += speed.current;
    distRef.current += speed.current / 10;
    setDistance(Math.floor(distRef.current));
    speed.current = Math.min(11, 4 + distRef.current / 220);
    // spawn
    spawnT.current -= 1;
    if (spawnT.current <= 0) {
      const lanesFree = [0, 1, 2, 3];
      const l = lanesFree[Math.floor(Math.random() * LANES)];
      obstacles.current.push({ lane: l, y: -CAR_H, color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)] });
      spawnT.current = Math.max(28, 70 - distRef.current / 30);
    }
    // move obstacles + collision
    const px = carX.current, py = H - 70;
    for (const o of obstacles.current) {
      o.y += speed.current;
      const ox = o.lane * LANE_W + LANE_W / 2;
      if (Math.abs(ox - px) < CAR_W - 8 && Math.abs(o.y - py) < CAR_H - 12) {
        setBest((b) => Math.max(b, Math.floor(distRef.current)));
        setState("over");
        return;
      }
    }
    obstacles.current = obstacles.current.filter((o) => o.y < H + CAR_H);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      if (stateRef.current === "playing") {
        if (keys.current.has("arrowleft")) { move(-1); keys.current.delete("arrowleft"); }
        if (keys.current.has("arrowright")) { move(1); keys.current.delete("arrowright"); }
        update();
      }
      draw(ctx);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [update, draw, move]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") { move(-1); e.preventDefault(); }
    if (k === "arrowright" || k === "d") { move(1); e.preventDefault(); }
  }, [move]);

  return (
    <div tabIndex={0} onKeyDown={onKey} className="absolute inset-0 flex flex-col items-center justify-center outline-none" style={{ fontFamily: "Tahoma, sans-serif", background: "#16321a", padding: 10 }}>
      <div className="flex items-center justify-between mb-2" style={{ width: W, color: "#dff3e0", fontSize: 12 }}>
        <span>Distance: <b>{distance}m</b></span>
        <span>Best: <b>{best}m</b></span>
      </div>
      <div style={{ position: "relative", border: "3px solid #1a3d20", borderRadius: 6, overflow: "hidden" }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block" }} />
        {state !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(12,28,14,0.82)", color: "#dff3e0", textAlign: "center" }}>
            {state === "over" && <><div style={{ fontSize: 22, fontWeight: 700, color: "#ff9a9a" }}>Crash!</div><div style={{ fontSize: 13, margin: "4px 0 10px" }}>You drove {distance}m</div></>}
            {state === "ready" && <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>🏎️ Road Racer</div>}
            <button onClick={start} style={{ fontSize: 13, fontWeight: 700, color: "#16321a", background: "linear-gradient(to bottom,#dff3e0,#8fd49a)", border: "1px solid #1a3d20", borderRadius: 4, padding: "7px 18px", cursor: "pointer" }}>
              {state === "over" ? "Race Again" : "Start Race"}
            </button>
            <div style={{ fontSize: 10, marginTop: 8, opacity: 0.85 }}>← → or A/D to steer · avoid traffic</div>
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
