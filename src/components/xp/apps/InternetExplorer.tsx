"use client";

import { useState, useEffect } from "react";
import Portfolio from "../../Portfolio";

/* The Internet Explorer body: toolbar + address bar + the portfolio page,
   complete with the CRT overlay the original browser had. The window frame
   itself is supplied by XPWindow. */
export default function InternetExplorer() {
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

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-3 shrink-0 px-2" style={{ height: 20, background: "#ece9d8", fontSize: 11, color: "#333", borderBottom: "1px solid #d6d2c2" }}>
        {["File", "Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} className="px-1 hover:bg-[#316ac5] hover:text-white cursor-default" style={{ borderRadius: 2 }}>{m}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 shrink-0 px-2" style={{ height: 30, background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <NavBtn label="Back" enabled={false}>◀</NavBtn>
        <NavBtn label="Forward" enabled={false}>▶</NavBtn>
        <NavBtn label="Stop">✕</NavBtn>
        <NavBtn label="Refresh">⟳</NavBtn>
        <NavBtn label="Home">⌂</NavBtn>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 shrink-0 px-2" style={{ height: 26, background: "#ece9d8", borderBottom: "1px solid #b8b29c" }}>
        <span style={{ fontSize: 11, color: "#777" }}>Address</span>
        <div className="flex-1 flex items-center gap-2 h-[19px] px-1.5" style={{ background: "#fff", border: "1px solid #7f9db9", fontSize: 12 }}>
          <span style={{ width: 13, height: 13, display: "inline-block", flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" width="13" height="13"><circle cx="8" cy="8" r="7" fill="#3aa0e8" /><text x="8" y="12" textAnchor="middle" fontStyle="italic" fontWeight="700" fontSize="10" fill="#fff" fontFamily="Georgia">e</text></svg>
          </span>
          <span className="truncate" style={{ color: loaded ? "#000" : "#888" }}>
            {loaded ? "https://obaida.portfolio/home" : "Connecting…"}
          </span>
        </div>
        <button className="px-2 h-[19px]" style={{ fontSize: 11, background: "linear-gradient(to bottom,#fff,#e3ddc9)", border: "1px solid #aaa", borderRadius: 2, cursor: "pointer", color: "#46a85a", fontWeight: 700 }}>Go</button>
      </div>

      {/* Loading strip */}
      {!loaded && (
        <div className="shrink-0" style={{ height: 3, background: "#ddd" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(to right,#0054e3,#4aade8)", transition: "width .19s" }} />
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 overflow-auto relative" style={{ background: loaded ? "var(--color-blue-slate)" : "#fff" }}>
        {loaded ? (
          <Portfolio />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ fontSize: 13, color: "#888" }}>
            Connecting to obaida.portfolio…
          </div>
        )}

        {/* CRT overlay over the rendered page */}
        {loaded && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)", animation: "crtFlicker 9s step-end infinite" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(0,0,0,0.5) 100%)" }} />
            <div className="absolute left-0 right-0" style={{ height: "20%", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.025) 50%, transparent)", animation: "crtScanMove 10s linear infinite" }} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center gap-2 px-2" style={{ height: 20, background: "#ece9d8", borderTop: "1px solid #b8b29c", fontSize: 11, color: "#444" }}>
        <span>{loaded ? "Done" : "Opening page…"}</span>
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

function NavBtn({ children, label, enabled = true }: { children: React.ReactNode; label: string; enabled?: boolean }) {
  return (
    <button
      title={label}
      disabled={!enabled}
      className="flex items-center gap-1 px-1.5 h-[22px]"
      style={{
        fontSize: 12, color: enabled ? "#333" : "#aaa",
        background: "transparent", border: "1px solid transparent", borderRadius: 3,
        cursor: enabled ? "pointer" : "default", whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (enabled) { e.currentTarget.style.background = "#fce9b0"; e.currentTarget.style.border = "1px solid #e3b94e"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
    >
      <span style={{ fontSize: 13 }}>{children}</span>
      <span style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}
