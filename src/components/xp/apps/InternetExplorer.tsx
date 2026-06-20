"use client";

import { useState, useEffect } from "react";
import Portfolio from "../../Portfolio";

export default function InternetExplorer() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-2 shrink-0 px-1.5" style={{ height: 16, background: "#ece9d8", fontSize: 10, color: "#333", borderBottom: "1px solid #d6d2c2" }}>
        {["File", "Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} className="px-0.5 cursor-default" style={{ borderRadius: 2 }}>{m}</span>
        ))}
      </div>

      {/* Toolbar + Address bar combined */}
      <div className="flex items-center gap-1.5 shrink-0 px-1.5" style={{ height: 22, background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <span className="flex items-center gap-0.5 px-1 h-[16px]" style={{ fontSize: 10, color: "#aaa" }}>
          <span style={{ fontSize: 10 }}>◀</span><span style={{ fontSize: 10 }}>Back</span>
        </span>
        <span className="flex items-center gap-0.5 px-1 h-[16px]" style={{ fontSize: 10, color: "#aaa" }}>
          <span style={{ fontSize: 10 }}>▶</span><span style={{ fontSize: 10 }}>Forward</span>
        </span>
        <span className="flex items-center gap-0.5 px-1 h-[16px]" style={{ fontSize: 10, color: "#333" }}>
          <span style={{ fontSize: 10 }}>⌂</span><span style={{ fontSize: 10 }}>Home</span>
        </span>
        <div className="flex-1 flex items-center gap-1 h-[15px] px-1" style={{ background: "#fff", border: "1px solid #7f9db9", fontSize: 10, marginLeft: 4 }}>
          <span style={{ width: 10, height: 10, display: "inline-block", flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" width="10" height="10"><circle cx="8" cy="8" r="7" fill="#3aa0e8" /><text x="8" y="12" textAnchor="middle" fontStyle="italic" fontWeight="700" fontSize="10" fill="#fff" fontFamily="Georgia">e</text></svg>
          </span>
          <span className="flex-1" style={{ fontSize: 10, color: "#333" }}>https://obaida.portfolio/home</span>
        </div>
      </div>

      {/* Page content — CRT effect wrapper */}
      <div className="flex-1 overflow-hidden relative" style={{ background: "#0a0a0a" }}>
        <div className="absolute inset-0 overflow-auto crt-content" style={{ imageRendering: "pixelated" }}>
          <PortfolioPage />
        </div>
        {/* Scanlines */}
        <div className="pointer-events-none absolute inset-0 z-10 crt-scanlines" />
        {/* Screen edge vignette */}
        <div className="pointer-events-none absolute inset-0 z-10" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)" }} />
        {/* Phosphor RGB fringe */}
        <div className="pointer-events-none absolute inset-0 z-10 crt-rgb" />
        {/* Flicker */}
        <div className="pointer-events-none absolute inset-0 z-10 crt-flicker" />
        <style>{`
          .crt-scanlines {
            background: repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 2px,
              rgba(0,0,0,0.15) 2px,
              rgba(0,0,0,0.15) 4px
            );
          }
          .crt-rgb {
            background: repeating-linear-gradient(
              to right,
              rgba(255,0,0,0.02) 0px,
              rgba(0,255,0,0.02) 1px,
              rgba(0,0,255,0.02) 2px,
              transparent 3px
            );
            mix-blend-mode: screen;
          }
          .crt-flicker {
            animation: crt-flicker 0.15s infinite;
            background: transparent;
          }
          @keyframes crt-flicker {
            0% { opacity: 0.97; }
            50% { opacity: 1; }
            100% { opacity: 0.98; }
          }
          .crt-content {
            text-shadow: 0 0 3px rgba(170,255,170,0.12);
          }
          .crt-content * {
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
        `}</style>
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center gap-2 px-1.5" style={{ height: 15, background: "#ece9d8", borderTop: "1px solid #b8b29c", fontSize: 9, color: "#444" }}>
        <span>Done</span>
        <span className="ml-auto flex items-center gap-1" style={{ color: "#666" }}>
          <span style={{ width: 9, height: 9, display: "inline-block" }}>
            <svg viewBox="0 0 16 16" width="9" height="9"><circle cx="8" cy="8" r="6" fill="#e8a33b" /><path d="M5 8 L8 5 L11 8 L8 11 Z" fill="#fff" /></svg>
          </span>
          Internet
        </span>
      </div>
    </div>
  );
}

function PortfolioPage() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setLoaded(true), 280); }
      setProgress(p);
    }, 190);
    return () => clearInterval(id);
  }, []);
  if (!loaded) {
    return (
      <>
        <div className="shrink-0" style={{ height: 3, background: "#ddd" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(to right,#0054e3,#4aade8)", transition: "width .19s" }} />
        </div>
        <div className="flex items-center justify-center h-full" style={{ fontSize: 13, color: "#888" }}>Connecting to obaida.portfolio…</div>
      </>
    );
  }
  return <Portfolio />;
}
