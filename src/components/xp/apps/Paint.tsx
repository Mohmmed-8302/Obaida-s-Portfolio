"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Tool = "pencil" | "brush" | "eraser" | "line" | "rect" | "ellipse" | "fill";

const PALETTE = [
  "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4",
  "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7",
];

const TOOLS: { id: Tool; label: string; glyph: React.ReactNode }[] = [
  { id: "pencil", label: "Pencil", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><path d="M11 2 L14 5 L6 13 L3 13 L3 10 Z" fill="#f2c233" stroke="#7a5523" strokeWidth="0.8" /><path d="M3 13 L3 10 L4.5 11.5 Z" fill="#333" /></svg> },
  { id: "brush", label: "Brush", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><rect x="9" y="2" width="3" height="7" transform="rotate(40 10 5)" fill="#c08a3e" /><path d="M3 11 q-1 3 2 3 q3 0 2-3 z" fill="#333" /></svg> },
  { id: "eraser", label: "Eraser", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="7" width="9" height="6" rx="1" transform="rotate(-30 7 10)" fill="#ec9bd0" stroke="#a3477f" strokeWidth="0.8" /></svg> },
  { id: "fill", label: "Fill", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 7 L8 2 L13 7 L8 12 Z" fill="#3b7fd1" stroke="#1c4f86" strokeWidth="0.8" /><path d="M13 8 q2 2 0 3 q-1.5 0-1-3z" fill="#e8a33b" /></svg> },
  { id: "line", label: "Line", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><line x1="3" y1="13" x2="13" y2="3" stroke="#333" strokeWidth="1.6" /></svg> },
  { id: "rect", label: "Rectangle", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="4" width="10" height="8" fill="none" stroke="#333" strokeWidth="1.4" /></svg> },
  { id: "ellipse", label: "Ellipse", glyph: <svg width="16" height="16" viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="5.5" ry="4.5" fill="none" stroke="#333" strokeWidth="1.4" /></svg> },
];

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [lineW, setLineW] = useState(2);
  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // initialise white canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

  const getXY = useCallback((e: React.MouseEvent) => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return { x: Math.round((e.clientX - r.left) * (cv.width / r.width)), y: Math.round((e.clientY - r.top) * (cv.height / r.height)) };
  }, []);

  const floodFill = useCallback((sx: number, sy: number, hex: string) => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const img = ctx.getImageData(0, 0, cv.width, cv.height);
    const d = img.data;
    const W = cv.width, H = cv.height;
    const idx = (x: number, y: number) => (y * W + x) * 4;
    const target = [d[idx(sx, sy)], d[idx(sx, sy) + 1], d[idx(sx, sy) + 2], d[idx(sx, sy) + 3]];
    const fc = hexToRgb(hex);
    if (target[0] === fc[0] && target[1] === fc[1] && target[2] === fc[2]) return;
    const match = (i: number) => Math.abs(d[i] - target[0]) < 12 && Math.abs(d[i + 1] - target[1]) < 12 && Math.abs(d[i + 2] - target[2]) < 12;
    const stack = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = idx(x, y);
      if (!match(i)) continue;
      d[i] = fc[0]; d[i + 1] = fc[1]; d[i + 2] = fc[2]; d[i + 3] = 255;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  const onDown = useCallback((e: React.MouseEvent) => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const p = getXY(e);
    start.current = p;
    if (tool === "fill") { floodFill(p.x, p.y, color); return; }
    drawing.current = true;
    snapshot.current = ctx.getImageData(0, 0, cv.width, cv.height);
    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = tool === "eraser" ? "#fff" : color;
      ctx.lineWidth = tool === "eraser" ? lineW * 4 : tool === "brush" ? lineW * 2.4 : lineW;
      ctx.lineTo(p.x + 0.01, p.y + 0.01);
      ctx.stroke();
    }
  }, [tool, color, lineW, getXY, floodFill]);

  const onMove = useCallback((e: React.MouseEvent) => {
    const p = getXY(e);
    setPos(p);
    if (!drawing.current) return;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      // shape preview: restore snapshot then draw
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      ctx.beginPath();
      const s = start.current;
      if (tool === "line") { ctx.moveTo(s.x, s.y); ctx.lineTo(p.x, p.y); }
      else if (tool === "rect") { ctx.rect(Math.min(s.x, p.x), Math.min(s.y, p.y), Math.abs(p.x - s.x), Math.abs(p.y - s.y)); }
      else if (tool === "ellipse") { ctx.ellipse((s.x + p.x) / 2, (s.y + p.y) / 2, Math.abs(p.x - s.x) / 2, Math.abs(p.y - s.y) / 2, 0, 0, Math.PI * 2); }
      ctx.stroke();
    }
  }, [tool, color, lineW, getXY]);

  const onUp = useCallback(() => { drawing.current = false; snapshot.current = null; }, []);

  const clear = useCallback(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, sans-serif", background: "#ece9d8" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-3 shrink-0 px-2" style={{ height: 20, fontSize: 11, color: "#333", borderBottom: "1px solid #d6d2c2" }}>
        {["File", "Edit", "View", "Image", "Colors", "Help"].map((m) => <span key={m} className="cursor-default">{m}</span>)}
        <button onClick={clear} className="ml-auto px-2" style={{ fontSize: 11, border: "1px solid #aaa", borderRadius: 2, background: "linear-gradient(to bottom,#fff,#e3ddc9)", cursor: "pointer" }}>Clear</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Tool box */}
        <div className="shrink-0 p-1" style={{ width: 56, background: "#ece9d8", borderRight: "1px solid #b8b29c" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {TOOLS.map((t) => (
              <button key={t.id} title={t.label} onClick={() => setTool(t.id)}
                className="flex items-center justify-center"
                style={{ width: 24, height: 24, border: tool === t.id ? "1px solid #2b5d99" : "1px solid #b8b29c", background: tool === t.id ? "#fff" : "linear-gradient(to bottom,#fdfdfb,#e8e3d3)", boxShadow: tool === t.id ? "inset 1px 1px 2px rgba(0,0,0,0.2)" : "none", cursor: "pointer", borderRadius: 2 }}>
                {t.glyph}
              </button>
            ))}
          </div>
          {/* line-width selector */}
          <div className="mt-2 p-1 flex flex-col gap-1 items-center" style={{ border: "1px solid #b8b29c", background: "#fff", borderRadius: 2 }}>
            {[1, 2, 4, 7].map((w) => (
              <button key={w} onClick={() => setLineW(w)} className="w-full flex items-center justify-center"
                style={{ height: 13, background: lineW === w ? "#cce0ff" : "transparent", cursor: "pointer", border: "none" }}>
                <span style={{ width: 28, height: w, background: "#000", borderRadius: w }} />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto p-3" style={{ background: "#808080" }}>
          <div style={{ display: "inline-block", background: "#fff", boxShadow: "2px 2px 6px rgba(0,0,0,0.4)", border: "1px solid #000" }}>
            <canvas
              ref={canvasRef}
              width={560}
              height={380}
              style={{ display: "block", cursor: "crosshair", touchAction: "none" }}
              onMouseDown={onDown}
              onMouseMove={onMove}
              onMouseUp={onUp}
              onMouseLeave={onUp}
            />
          </div>
        </div>
      </div>

      {/* Palette + status */}
      <div className="shrink-0 flex items-center gap-3 px-2" style={{ height: 44, background: "#ece9d8", borderTop: "1px solid #b8b29c" }}>
        <div className="flex items-center" style={{ width: 40, height: 36, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 2, width: 24, height: 24, background: color, border: "1px solid #555", boxShadow: "1px 1px 0 #fff" }} />
          <div style={{ position: "absolute", left: 12, top: 12, width: 24, height: 24, background: "#fff", border: "1px solid #555" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 16px)", gridTemplateRows: "16px 16px", gap: 1 }}>
          {PALETTE.map((c) => (
            <button key={c} onClick={() => setColor(c)} title={c}
              style={{ width: 16, height: 16, background: c, border: "1px solid #888", cursor: "pointer", outline: color === c ? "2px solid #2b5d99" : "none", outlineOffset: -1 }} />
          ))}
        </div>
        <span className="ml-auto" style={{ fontSize: 11, color: "#555" }}>{pos ? `${pos.x},${pos.y} px` : ""}</span>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
