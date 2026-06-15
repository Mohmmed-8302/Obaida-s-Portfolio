"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Portfolio from "./Portfolio";

interface BrowserWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

export default function BrowserWindow({ onClose, onMinimize }: BrowserWindowProps) {
  const [maximized, setMaximized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [pos, setPos] = useState({ x: 60, y: 30 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const prevRect = useRef({ x: 60, y: 30, w: 0, h: 0 });

  useEffect(() => {
    const w = Math.min(900, window.innerWidth - 120);
    const h = Math.min(600, window.innerHeight - 100);
    setSize({ w, h });
    prevRect.current = { x: 60, y: 30, w, h };
  }, []);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setLoaded(true), 300); }
      setLoadProgress(p);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (maximized) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [maximized, pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX - dragOffset.current.x, y: Math.max(0, e.clientY - dragOffset.current.y) });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      setSize(s => ({
        w: Math.max(400, e.clientX - pos.x),
        h: Math.max(300, e.clientY - pos.y),
      }));
    };
    const onUp = () => setResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [resizing, pos]);

  const toggleMaximize = useCallback(() => {
    if (maximized) {
      setPos({ x: prevRect.current.x, y: prevRect.current.y });
      setSize({ w: prevRect.current.w, h: prevRect.current.h });
    } else {
      prevRect.current = { x: pos.x, y: pos.y, w: size.w, h: size.h };
      setPos({ x: 0, y: 0 });
      setSize({ w: window.innerWidth, h: window.innerHeight - 36 });
    }
    setMaximized(m => !m);
  }, [maximized, pos, size]);

  const windowStyle = {
    left: pos.x,
    top: pos.y,
    width: size.w,
    height: size.h,
  };

  return (
    <motion.div
      className="absolute z-[80] flex flex-col"
      style={{
        ...windowStyle,
        border: "2px solid #0054e3",
        borderRadius: "8px 8px 0 0",
        boxShadow: "4px 4px 16px rgba(0,0,0,0.4)",
        overflow: "hidden",
        background: "#ece9d8",
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between shrink-0 select-none"
        style={{
          height: 30,
          background: "linear-gradient(to bottom, #0A69F0 0%, #0054e3 40%, #0040b0 100%)",
          padding: "0 4px 0 8px",
          cursor: dragging ? "grabbing" : "grab",
        }}
        onMouseDown={onDragStart}
        onDoubleClick={toggleMaximize}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12 }}>🌐</span>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 700, textShadow: "1px 1px 1px rgba(0,0,0,0.3)" }}>
            Obaida Portfolio - Internet Browser
          </span>
        </div>
        <div className="flex items-center gap-1">
          <WinBtn type="minimize" onClick={onMinimize} />
          <WinBtn type="maximize" onClick={toggleMaximize} />
          <WinBtn type="close" onClick={onClose} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 shrink-0 px-2" style={{
        height: 32, background: "#ece9d8", borderBottom: "1px solid #aaa",
      }}>
        <ToolbarBtn>◀</ToolbarBtn>
        <ToolbarBtn>▶</ToolbarBtn>
        <div className="flex-1 flex items-center h-6 px-2" style={{
          background: "#fff", border: "1px solid #7f9db9", fontSize: 12,
        }}>
          <span style={{ color: loaded ? "#000" : "#888" }}>
            {loaded ? "https://obaida.portfolio/home" : "Loading..."}
          </span>
        </div>
      </div>

      {/* Loading bar */}
      {!loaded && (
        <div className="shrink-0" style={{ height: 3, background: "#ddd" }}>
          <div style={{
            height: "100%", width: `${loadProgress}%`,
            background: "linear-gradient(to right, #0054e3, #4aade8)",
            transition: "width 0.2s",
          }} />
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto relative" style={{ background: loaded ? "var(--color-blue-slate)" : "#fff" }}>
        {!loaded ? (
          <div className="flex items-center justify-center h-full">
            <div style={{ fontSize: 13, color: "#888" }}>Connecting to obaida.portfolio...</div>
          </div>
        ) : (
          <Portfolio />
        )}
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center px-3" style={{
        height: 22, background: "#ece9d8", borderTop: "1px solid #aaa", fontSize: 11, color: "#444",
      }}>
        <span>{loaded ? "Done" : "Loading..."}</span>
      </div>

      {/* Resize handle */}
      {!maximized && (
        <div
          className="absolute"
          style={{
            bottom: 0, right: 0, width: 16, height: 16,
            cursor: "nwse-resize",
          }}
          onMouseDown={(e) => { e.preventDefault(); setResizing(true); }}
        />
      )}
    </motion.div>
  );
}

function WinBtn({ type, onClick }: { type: "minimize" | "maximize" | "close"; onClick: () => void }) {
  const colors = {
    minimize: { bg: "linear-gradient(to bottom, #3d8ae5, #2470c8)", hoverBg: "#5ca0f0" },
    maximize: { bg: "linear-gradient(to bottom, #3d8ae5, #2470c8)", hoverBg: "#5ca0f0" },
    close: { bg: "linear-gradient(to bottom, #e87461, #c4523e)", hoverBg: "#f08070" },
  };
  const c = colors[type];
  const symbols = { minimize: "─", maximize: "☐", close: "✕" };

  return (
    <button
      className="flex items-center justify-center"
      style={{
        width: 22, height: 22, borderRadius: 3,
        background: c.bg,
        border: "1px solid rgba(0,0,0,0.2)",
        color: "#fff", fontSize: type === "close" ? 11 : 10,
        cursor: "pointer", fontWeight: 700,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = c.bg)}
    >
      {symbols[type]}
    </button>
  );
}

function ToolbarBtn({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      width: 26, height: 24,
      background: "linear-gradient(to bottom, #fff, #e8e4d8)",
      border: "1px solid #aaa",
      borderRadius: 3,
      fontSize: 12,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#555",
    }}>
      {children}
    </button>
  );
}
