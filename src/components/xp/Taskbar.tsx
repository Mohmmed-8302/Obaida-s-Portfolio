"use client";

import { useState, useEffect, type ReactNode } from "react";
import type { WindowInstance } from "./types";
import { XPFlag } from "./icons";
import { APPS } from "./registry";

interface TaskbarProps {
  windows: WindowInstance[];
  activeId: string | null;
  startOpen: boolean;
  onStartClick: () => void;
  onTaskClick: (id: string) => void;
}

export const TASKBAR_HEIGHT = 30;

export default function Taskbar({ windows, activeId, startOpen, onStartClick, onTaskClick }: TaskbarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-stretch"
      style={{
        height: TASKBAR_HEIGHT, zIndex: 110,
        background: "linear-gradient(to bottom,#3168d5 0%,#3a7bea 8%,#2e6adf 40%,#2361dc 88%,#1d4fc4 100%)",
        borderTop: "1px solid #1042c0",
        fontFamily: "Tahoma, 'Segoe UI', sans-serif",
      }}
    >
      {/* Start button */}
      <button
        onMouseDown={(e) => { e.stopPropagation(); onStartClick(); }}
        className="flex items-center gap-1.5 pl-2 pr-5 relative"
        style={{
          height: "100%",
          background: startOpen
            ? "linear-gradient(to bottom,#1f7a1f,#176a17 50%,#2a8a2a)"
            : "linear-gradient(to bottom,#5cb85c 0%,#3f9f3f 8%,#2f8f2f 45%,#247824 90%,#3a9a3a 100%)",
          border: "none",
          borderRadius: "0 4px 4px 0",
          color: "#fff", fontWeight: 700, fontSize: 15, fontStyle: "italic",
          letterSpacing: "0.01em", cursor: "pointer",
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          boxShadow: startOpen ? "inset 0 2px 6px rgba(0,0,0,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.4)",
          paddingTop: 1,
        }}
      >
        <XPFlag size={20} style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }} />
        <span>start</span>
      </button>

      {/* Quick launch separator */}
      <div style={{ width: 1, background: "rgba(255,255,255,0.25)", margin: "4px 0 4px 4px" }} />
      <div style={{ width: 1, background: "rgba(0,0,0,0.25)", margin: "4px 4px 4px 0" }} />

      {/* Task buttons */}
      <div className="flex items-center gap-1 flex-1 px-1 overflow-hidden">
        {windows.map((w) => {
          const active = w.id === activeId && !w.minimized;
          return (
            <button
              key={w.id}
              onClick={() => onTaskClick(w.id)}
              className="flex items-center gap-1.5 px-2 h-[23px] min-w-0"
              style={{
                flex: "1 1 0", maxWidth: 160, minWidth: 40,
                background: active
                  ? "linear-gradient(to bottom,#1c54bf,#2a68d8 50%,#1c54bf)"
                  : "linear-gradient(to bottom,#3f86ee,#3175e6 50%,#2867dc)",
                border: active ? "1px solid #0d3a9c" : "1px solid #4a8cf0",
                borderRadius: 3,
                color: "#fff", fontSize: 11.5, cursor: "pointer",
                boxShadow: active ? "inset 1px 1px 3px rgba(0,0,0,0.45)" : "inset 0 1px 0 rgba(255,255,255,0.25)",
                textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
              }}
            >
              <span className="shrink-0 flex items-center" style={{ width: 16, height: 16, opacity: w.minimized ? 0.85 : 1 }}>{APPS[w.appId].icon(16)}</span>
              <span className="truncate text-left flex-1" style={{ fontStyle: w.minimized ? "italic" : "normal" }}>{w.title}</span>
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className="flex items-center gap-2 px-2.5" style={{ background: "linear-gradient(to bottom,#138ee0 0%,#1898e8 8%,#0f7ad6 50%,#0d6ec8 100%)", borderLeft: "1px solid #0c4ea0", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.25)" }}>
        <TrayIcon title="Volume">
          <svg width="14" height="14" viewBox="0 0 16 16"><path d="M2 6 H5 L9 3 V13 L5 10 H2 Z" fill="#fff" /><path d="M11 5 a4 4 0 0 1 0 6" stroke="#fff" strokeWidth="1.3" fill="none" /></svg>
        </TrayIcon>
        <TrayIcon title="Network">
          <svg width="14" height="14" viewBox="0 0 16 16"><rect x="2" y="9" width="5" height="4" fill="#cfe6ff" stroke="#fff" strokeWidth="0.6" /><rect x="9" y="4" width="5" height="4" fill="#cfe6ff" stroke="#fff" strokeWidth="0.6" /><path d="M6 11 L9 6" stroke="#fff" strokeWidth="0.8" /></svg>
        </TrayIcon>
        <span style={{ color: "#fff", fontSize: 11.5, textShadow: "1px 1px 1px rgba(0,0,0,0.3)", whiteSpace: "nowrap", paddingLeft: 2 }}>{time}</span>
      </div>
    </div>
  );
}

function TrayIcon({ children, title }: { children: ReactNode; title: string }) {
  return <span title={title} className="flex items-center justify-center" style={{ width: 16, height: 16, cursor: "default" }}>{children}</span>;
}
