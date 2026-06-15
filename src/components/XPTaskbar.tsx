"use client";

import { useState, useEffect } from "react";

interface XPTaskbarProps {
  browserOpen: boolean;
  browserMinimized: boolean;
  onStartClick: () => void;
  startOpen: boolean;
  onBrowserClick: () => void;
  onShutdown: () => void;
}

export default function XPTaskbar({ browserOpen, browserMinimized, onStartClick, startOpen, onBrowserClick }: XPTaskbarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[100] flex items-center" style={{
      height: 36,
      background: "linear-gradient(to bottom, #245EDC 0%, #1940A0 50%, #245EDC 100%)",
      borderTop: "1px solid #5B9BF5",
    }}>
      {/* Start button */}
      <button
        className="flex items-center gap-1 h-full px-3 relative"
        style={{
          background: startOpen
            ? "linear-gradient(to bottom, #1a8a1a, #0e6e0e)"
            : "linear-gradient(to bottom, #3caa3c, #2d8a2d, #1a6a1a)",
          borderRadius: "0 10px 10px 0",
          border: "none",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.02em",
          cursor: "pointer",
          minWidth: 100,
          marginLeft: 4,
          textShadow: "1px 1px 1px rgba(0,0,0,0.4)",
          boxShadow: startOpen
            ? "inset 0 1px 4px rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        }}
        onClick={onStartClick}
      >
        <div className="w-5 h-5 rounded-full" style={{
          background: "conic-gradient(#e8463a 0deg, #e8463a 90deg, #4aade8 90deg, #4aade8 180deg, #4ade50 180deg, #4ade50 270deg, #f0c040 270deg, #f0c040 360deg)",
        }} />
        <span>Start</span>
      </button>

      {/* Taskbar buttons area */}
      <div className="flex items-center gap-1 flex-1 px-2 h-full overflow-hidden">
        {browserOpen && (
          <button
            className="flex items-center gap-2 h-7 px-3 max-w-[200px]"
            style={{
              background: browserMinimized
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 3,
              color: "#fff",
              fontSize: 11,
              cursor: "pointer",
              boxShadow: browserMinimized ? "none" : "inset 0 0 4px rgba(255,255,255,0.1)",
            }}
            onClick={onBrowserClick}
          >
            <span style={{ fontSize: 12 }}>🌐</span>
            <span className="truncate">Obaida Portfolio</span>
          </button>
        )}
      </div>

      {/* System tray */}
      <div className="flex items-center justify-center h-full" style={{
        background: "linear-gradient(to bottom, #0F6DE8, #0854CC)",
        borderLeft: "1px solid #5B9BF5",
        minWidth: 90,
        padding: "0 16px",
      }}>
        <span style={{ fontSize: 12, color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>{time}</span>
      </div>
    </div>
  );
}
