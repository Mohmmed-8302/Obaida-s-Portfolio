"use client";

import { useState, type ReactNode } from "react";

/** A reusable Office-style menu strip with a working File menu (New / Save /
 *  Save As). Other menu names render as inert labels, matching the look of the
 *  original mock editors. */
export default function EditorMenuBar({ menus, onNew, onSave, onSaveAs }: {
  menus: string[];
  onNew: () => void;
  onSave: () => void;
  onSaveAs: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="flex items-center shrink-0 relative"
      style={{ height: 21, background: "#ece9d8", borderBottom: "1px solid #d6d2c2", fontSize: 11, color: "#222" }}
      onMouseLeave={() => setOpen(false)}
    >
      {menus.map((m) => (
        <button
          key={m}
          className="h-full"
          style={{ padding: "0 8px", border: "none", background: open && m === "File" ? "#316ac5" : "transparent", color: open && m === "File" ? "#fff" : "#222", cursor: "default" }}
          onClick={() => setOpen(m === "File" ? !open : false)}
        >
          {m}
        </button>
      ))}
      {open && (
        <div className="absolute" style={{ top: 21, left: 0, zIndex: 30, minWidth: 168, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "2px 2px 8px rgba(0,0,0,0.3)", fontSize: 11 }}>
          <Item label="New" onClick={() => { onNew(); setOpen(false); }} />
          <Item label="Save" shortcut="Ctrl+S" onClick={() => { onSave(); setOpen(false); }} />
          <Item label="Save As…" onClick={() => { onSaveAs(); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function Item({ label, shortcut, onClick }: { label: string; shortcut?: string; onClick: () => void }) {
  return (
    <button
      className="w-full flex items-center text-left"
      style={{ padding: "5px 10px", border: "none", background: "transparent", cursor: "default", gap: 16 }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#316ac5"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#222"; }}
      onClick={onClick}
    >
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && <span style={{ opacity: 0.6, fontSize: 10 }}>{shortcut}</span>}
    </button>
  );
}
