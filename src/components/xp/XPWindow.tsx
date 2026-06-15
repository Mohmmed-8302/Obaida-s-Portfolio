"use client";

import { useRef, useCallback, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Rect, WindowInstance } from "./types";

interface XPWindowProps {
  win: WindowInstance;
  active: boolean;
  icon: ReactNode;
  resizable?: boolean;
  minSize?: { w: number; h: number };
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (rect: Rect) => void;
  children: ReactNode;
}

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const DIRS: ResizeDir[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const EDGE = 6;

const cursorMap: Record<ResizeDir, string> = {
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize",
};

export default function XPWindow({
  win, active, icon, resizable = true, minSize = { w: 280, h: 200 },
  onClose, onMinimize, onToggleMaximize, onFocus, onMove, onResize, children,
}: XPWindowProps) {
  const { rect, maximized } = win;
  const dragData = useRef<{ ox: number; oy: number } | null>(null);
  const resizeData = useRef<{ dir: ResizeDir; sx: number; sy: number; r: Rect } | null>(null);

  /* ── Dragging the title bar ── */
  const onTitleDown = useCallback((e: React.MouseEvent) => {
    onFocus();
    if (maximized) return;
    dragData.current = { ox: e.clientX - rect.x, oy: e.clientY - rect.y };
    const move = (ev: MouseEvent) => {
      if (!dragData.current) return;
      const x = ev.clientX - dragData.current.ox;
      const y = Math.max(0, ev.clientY - dragData.current.oy);
      onMove(x, y);
    };
    const up = () => {
      dragData.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [maximized, rect.x, rect.y, onMove, onFocus]);

  /* ── Resizing from edges / corners ── */
  const startResize = useCallback((dir: ResizeDir, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    if (maximized) return;
    resizeData.current = { dir, sx: e.clientX, sy: e.clientY, r: { ...rect } };
    const move = (ev: MouseEvent) => {
      const d = resizeData.current;
      if (!d) return;
      const dx = ev.clientX - d.sx;
      const dy = ev.clientY - d.sy;
      let { x, y, w, h } = d.r;
      if (d.dir.includes("e")) w = Math.max(minSize.w, d.r.w + dx);
      if (d.dir.includes("s")) h = Math.max(minSize.h, d.r.h + dy);
      if (d.dir.includes("w")) {
        const pw = d.r.w - dx;
        if (pw >= minSize.w) { w = pw; x = d.r.x + dx; }
        else { w = minSize.w; x = d.r.x + (d.r.w - minSize.w); }
      }
      if (d.dir.includes("n")) {
        const ph = d.r.h - dy;
        if (ph >= minSize.h) { h = ph; y = Math.max(0, d.r.y + dy); }
        else { h = minSize.h; y = d.r.y + (d.r.h - minSize.h); }
      }
      onResize({ x, y, w, h });
    };
    const up = () => {
      resizeData.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [maximized, rect, minSize.w, minSize.h, onResize, onFocus]);

  /* Clean up listeners if the window unmounts mid-drag. */
  useEffect(() => () => { dragData.current = null; resizeData.current = null; }, []);

  const titleGradient = active
    ? "linear-gradient(to bottom, #0A69F0 0%, #2E8DEF 8%, #0A60E0 40%, #0A53C8 88%, #0848B8 100%)"
    : "linear-gradient(to bottom, #7AA7E8 0%, #9CBEEE 10%, #7FA8E0 50%, #6E97D6 100%)";

  return (
    <motion.div
      className="absolute flex flex-col"
      style={{
        left: rect.x, top: rect.y, width: rect.w, height: rect.h,
        zIndex: win.z,
        borderLeft: `1px solid ${active ? "#0531a0" : "#83a9e8"}`,
        borderRight: `1px solid ${active ? "#0531a0" : "#83a9e8"}`,
        borderBottom: `1px solid ${active ? "#0531a0" : "#83a9e8"}`,
        borderRadius: "8px 8px 0 0",
        boxShadow: active
          ? "3px 4px 18px rgba(0,0,0,0.45)"
          : "2px 3px 10px rgba(0,0,0,0.30)",
        overflow: "hidden",
        background: "#ece9d8",
      }}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between shrink-0 select-none"
        style={{
          height: 29,
          background: titleGradient,
          padding: "0 3px 0 5px",
          borderRadius: "7px 7px 0 0",
          borderTop: `1px solid ${active ? "#3C8CF0" : "#A9C7F2"}`,
          cursor: maximized ? "default" : "default",
        }}
        onMouseDown={onTitleDown}
        onDoubleClick={onToggleMaximize}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="shrink-0 flex items-center" style={{ width: 16, height: 16 }}>{icon}</span>
          <span className="truncate" style={{
            fontSize: 12, color: "#fff", fontWeight: 700,
            fontFamily: "Tahoma, 'Segoe UI', sans-serif",
            textShadow: "1px 1px 1px rgba(0,0,0,0.45)",
            opacity: active ? 1 : 0.9,
          }}>
            {win.title}
          </span>
        </div>
        <div className="flex items-center gap-[2px] shrink-0">
          <WinBtn type="minimize" onClick={onMinimize} />
          {resizable && <WinBtn type="maximize" maximized={maximized} onClick={onToggleMaximize} />}
          <WinBtn type="close" onClick={onClose} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "#ece9d8" }}>
        {children}
      </div>

      {/* Resize handles */}
      {resizable && !maximized && DIRS.map((dir) => {
        const s: React.CSSProperties = { position: "absolute", zIndex: 50, cursor: cursorMap[dir] };
        if (dir === "n") Object.assign(s, { top: -EDGE / 2, left: EDGE, right: EDGE, height: EDGE });
        else if (dir === "s") Object.assign(s, { bottom: -EDGE / 2, left: EDGE, right: EDGE, height: EDGE });
        else if (dir === "e") Object.assign(s, { right: -EDGE / 2, top: EDGE, bottom: EDGE, width: EDGE });
        else if (dir === "w") Object.assign(s, { left: -EDGE / 2, top: EDGE, bottom: EDGE, width: EDGE });
        else if (dir === "nw") Object.assign(s, { top: -EDGE / 2, left: -EDGE / 2, width: EDGE * 2, height: EDGE * 2 });
        else if (dir === "ne") Object.assign(s, { top: -EDGE / 2, right: -EDGE / 2, width: EDGE * 2, height: EDGE * 2 });
        else if (dir === "sw") Object.assign(s, { bottom: -EDGE / 2, left: -EDGE / 2, width: EDGE * 2, height: EDGE * 2 });
        else Object.assign(s, { bottom: -EDGE / 2, right: -EDGE / 2, width: EDGE * 2, height: EDGE * 2 });
        return <div key={dir} style={s} onMouseDown={(e) => startResize(dir, e)} />;
      })}
    </motion.div>
  );
}

function WinBtn({ type, onClick, maximized }: { type: "minimize" | "maximize" | "close"; onClick: () => void; maximized?: boolean }) {
  const base = type === "close"
    ? { bg: "linear-gradient(to bottom, #f0a08c 0%, #e06850 18%, #d2452c 60%, #b8331e 100%)", hover: "linear-gradient(to bottom, #f8b8a4 0%, #ee7e64 18%, #e25238 60%, #c63a22 100%)" }
    : { bg: "linear-gradient(to bottom, #5fa0f4 0%, #2f7fe8 28%, #1257c4 80%, #0d49ad 100%)", hover: "linear-gradient(to bottom, #7bb4f8 0%, #4a93ee 28%, #2a6fd4 80%, #205cc0 100%)" };
  return (
    <button
      className="flex items-center justify-center"
      style={{
        width: 21, height: 21, borderRadius: 3,
        background: base.bg,
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 1px rgba(0,0,0,0.4)",
        cursor: "pointer", padding: 0,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={(e) => (e.currentTarget.style.background = base.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = base.bg)}
      aria-label={type}
    >
      <Glyph type={type} maximized={maximized} />
    </button>
  );
}

function Glyph({ type, maximized }: { type: "minimize" | "maximize" | "close"; maximized?: boolean }) {
  const c = "#fff";
  if (type === "minimize") return <svg width="11" height="11" viewBox="0 0 11 11"><rect x="2" y="7.5" width="7" height="2" fill={c} /></svg>;
  if (type === "close") return (
    <svg width="11" height="11" viewBox="0 0 11 11">
      <path d="M2 2 L9 9 M9 2 L2 9" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  // maximize / restore
  return maximized ? (
    <svg width="11" height="11" viewBox="0 0 11 11">
      <rect x="3.2" y="1.8" width="6" height="5" fill="none" stroke={c} strokeWidth="1.4" />
      <rect x="1.6" y="3.6" width="6" height="5.4" fill="#1257c4" stroke={c} strokeWidth="1.4" />
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 11 11">
      <rect x="1.8" y="1.8" width="7.4" height="7" fill="none" stroke={c} strokeWidth="1.4" />
      <rect x="1.8" y="1.8" width="7.4" height="2" fill={c} />
    </svg>
  );
}
