"use client";

import { useState, useMemo } from "react";
import { useDesktop } from "../DesktopContext";
import type { TextPayload } from "../types";

const MENUS = ["File", "Edit", "Format", "View", "Help"];

const DEFAULT_TEXT = `Welcome to Notepad.

This is a fully working text editor — type anything you like.

Tip: open .txt files from My Documents to read them here,
and toggle Format ▸ Word Wrap below.`;

export default function Notepad() {
  const { payloads } = useDesktop();
  const payload = payloads.notepad as TextPayload | undefined;

  // Re-seed the editor when a new file is opened (payload identity changes).
  const initial = payload?.content ?? DEFAULT_TEXT;
  const [text, setText] = useState(initial);
  const [seed, setSeed] = useState(initial);
  if (payload && payload.content !== undefined && payload.content !== seed) {
    setSeed(payload.content);
    setText(payload.content);
  }

  const [wrap, setWrap] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const stats = useMemo(() => {
    const lines = text.split("\n").length;
    return { chars: text.length, lines };
  }, [text]);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#fff", fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Menu bar */}
      <div
        className="flex items-center shrink-0"
        style={{ height: 21, background: "#ece9d8", borderBottom: "1px solid #d6d2c2", fontSize: 11, color: "#222" }}
        onMouseLeave={() => setOpenMenu(null)}
      >
        {MENUS.map((m) => (
          <button
            key={m}
            className="h-full"
            style={{ padding: "0 8px", border: "none", background: openMenu === m ? "#316ac5" : "transparent", color: openMenu === m ? "#fff" : "#222", cursor: "default" }}
            onClick={() => setOpenMenu((v) => (v === m ? null : m))}
            onMouseEnter={() => openMenu && setOpenMenu(m)}
          >
            {m}
          </button>
        ))}
        {openMenu === "Format" && (
          <div className="absolute" style={{ top: 21, left: 64, zIndex: 10, minWidth: 150, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "2px 2px 8px rgba(0,0,0,0.3)", fontSize: 11 }}>
            <button
              className="w-full flex items-center gap-2 text-left"
              style={{ padding: "5px 10px", border: "none", background: "transparent", cursor: "default" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#316ac5", e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "#222")}
              onClick={() => { setWrap((w) => !w); setOpenMenu(null); }}
            >
              <span style={{ width: 12 }}>{wrap ? "✓" : ""}</span> Word Wrap
            </button>
          </div>
        )}
        {openMenu === "Edit" && (
          <div className="absolute" style={{ top: 21, left: 32, zIndex: 10, minWidth: 150, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "2px 2px 8px rgba(0,0,0,0.3)", fontSize: 11 }}>
            <MenuItem label="Select All" onClick={() => { document.execCommand?.("selectAll"); setOpenMenu(null); }} />
            <MenuItem label="Clear" onClick={() => { setText(""); setOpenMenu(null); }} />
          </div>
        )}
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        wrap={wrap ? "soft" : "off"}
        className="flex-1 w-full"
        style={{
          resize: "none", border: "none", outline: "none", padding: "4px 6px",
          fontFamily: "'Lucida Console', 'Courier New', monospace", fontSize: 13, lineHeight: 1.35,
          color: "#000", whiteSpace: wrap ? "pre-wrap" : "pre", overflow: "auto",
        }}
      />

      {/* Status bar */}
      <div className="shrink-0 flex items-center justify-end gap-4" style={{ height: 19, padding: "0 10px", background: "#ece9d8", borderTop: "1px solid #d6d2c2", fontSize: 11, color: "#444" }}>
        <span>Lines: {stats.lines}</span>
        <span>Chars: {stats.chars}</span>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="w-full text-left"
      style={{ padding: "5px 10px", border: "none", background: "transparent", cursor: "default" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#316ac5", e.currentTarget.style.color = "#fff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "#222")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
