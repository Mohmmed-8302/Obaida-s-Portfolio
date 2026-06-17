"use client";

import { useState, useEffect } from "react";
import Portfolio from "../../Portfolio";

export default function InternetExplorer() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-3 shrink-0 px-2" style={{ height: 20, background: "#ece9d8", fontSize: 11, color: "#333", borderBottom: "1px solid #d6d2c2" }}>
        {["File", "Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} className="px-1 cursor-default" style={{ borderRadius: 2 }}>{m}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 shrink-0 px-2" style={{ height: 30, background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <span className="flex items-center gap-1 px-1.5 h-[22px]" style={{ fontSize: 12, color: "#aaa" }}>
          <span style={{ fontSize: 13 }}>◀</span><span style={{ fontSize: 11 }}>Back</span>
        </span>
        <span className="flex items-center gap-1 px-1.5 h-[22px]" style={{ fontSize: 12, color: "#aaa" }}>
          <span style={{ fontSize: 13 }}>▶</span><span style={{ fontSize: 11 }}>Forward</span>
        </span>
        <span className="flex items-center gap-1 px-1.5 h-[22px]" style={{ fontSize: 12, color: "#333" }}>
          <span style={{ fontSize: 13 }}>⌂</span><span style={{ fontSize: 11 }}>Home</span>
        </span>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 shrink-0 px-2" style={{ height: 26, background: "#ece9d8", borderBottom: "1px solid #b8b29c" }}>
        <span style={{ fontSize: 11, color: "#777" }}>Address</span>
        <div className="flex-1 flex items-center gap-2 h-[19px] px-1.5" style={{ background: "#fff", border: "1px solid #7f9db9", fontSize: 12 }}>
          <span style={{ width: 13, height: 13, display: "inline-block", flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" width="13" height="13"><circle cx="8" cy="8" r="7" fill="#3aa0e8" /><text x="8" y="12" textAnchor="middle" fontStyle="italic" fontWeight="700" fontSize="10" fill="#fff" fontFamily="Georgia">e</text></svg>
          </span>
          <span className="flex-1" style={{ fontSize: 12, color: "#333" }}>https://obaida.portfolio/home</span>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto relative" style={{ background: "var(--color-blue-slate)" }}>
        <PortfolioPage />
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center gap-2 px-2" style={{ height: 20, background: "#ece9d8", borderTop: "1px solid #b8b29c", fontSize: 11, color: "#444" }}>
        <span>Done</span>
        <span className="ml-auto flex items-center gap-1" style={{ color: "#666" }}>
          <span style={{ width: 11, height: 11, display: "inline-block" }}>
            <svg viewBox="0 0 16 16" width="11" height="11"><circle cx="8" cy="8" r="6" fill="#e8a33b" /><path d="M5 8 L8 5 L11 8 L8 11 Z" fill="#fff" /></svg>
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
