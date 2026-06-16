"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

/** A minimal XP "Save As" dialog: a filename field with Save / Cancel. Rendered
 *  inside an editor window (absolutely positioned over it). */
export default function SaveAsDialog({ initialName, onSave, onClose }: { initialName: string; onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(initialName);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const submit = () => { const n = name.trim(); if (n) onSave(n); };
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50, background: "rgba(0,0,0,0.2)" }} onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: 300, background: "#ece9d8", border: "1px solid #0831a8", borderRadius: "8px 8px 4px 4px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", fontFamily: "Tahoma, 'Segoe UI', sans-serif", overflow: "hidden" }}
      >
        <div style={{ background: "var(--xp-title,#0A53C8)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "5px 8px", textShadow: "1px 1px 1px rgba(0,0,0,0.4)" }}>Save As</div>
        <div style={{ padding: 12, fontSize: 11, color: "#222" }}>
          <div style={{ marginBottom: 4 }}>File name:</div>
          <input
            ref={ref}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
            style={{ width: "100%", height: 22, border: "1px solid #7f9db9", fontSize: 12, padding: "0 5px", fontFamily: "Tahoma, sans-serif" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 14 }}>
            <Btn onClick={submit}>Save</Btn>
            <Btn onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, fontFamily: "Tahoma, sans-serif", padding: "3px 14px", minWidth: 68, border: "1px solid #7f7c6b", borderRadius: 3, cursor: "pointer", color: "#222", background: "linear-gradient(to bottom,#fdfdfb,#e2ddc9)" }}>
      {children}
    </button>
  );
}
