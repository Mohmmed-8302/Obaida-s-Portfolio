"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { useDesktop } from "../DesktopContext";
import type { TextPayload } from "../types";

const MENUS = ["File", "Edit", "View", "Insert", "Format", "Tools", "Table", "Help"];

const DEFAULT_HTML = `<h1 style="font-size:22px;color:#1f3864;margin-bottom:10px;">Obaida — Curriculum Vitae</h1>
<p style="margin-bottom:8px;"><b>Motion Designer &amp; Creative Developer</b></p>
<p style="margin-bottom:8px;">This is a working word processor. Select text and use the toolbar to make it
<b>bold</b>, <i>italic</i> or <u>underlined</u>, change the font size, colour and alignment.</p>
<p>Open <i>resume.doc</i> from My Documents to edit it here.</p>`;

export default function Word() {
  const { payloads } = useDesktop();
  const payload = payloads.word as TextPayload | undefined;
  const ref = useRef<HTMLDivElement>(null);
  const [font, setFont] = useState("Times New Roman");
  const [size, setSize] = useState("3");

  // Load default / opened-document content once on mount and whenever a new file arrives.
  const seed = payload?.content;
  const lastSeed = useRef<string | undefined>("__init__");
  useEffect(() => {
    if (!ref.current) return;
    if (lastSeed.current === "__init__") {
      ref.current.innerHTML = seed ?? DEFAULT_HTML;
      lastSeed.current = seed;
    } else if (seed !== undefined && seed !== lastSeed.current) {
      ref.current.innerHTML = seed;
      lastSeed.current = seed;
    }
  }, [seed]);

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#fff", fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Menu bar */}
      <div className="flex items-center shrink-0" style={{ height: 21, background: "#ece9d8", borderBottom: "1px solid #d6d2c2", fontSize: 11, color: "#222" }}>
        {MENUS.map((m) => (
          <span key={m} style={{ padding: "0 7px", cursor: "default", lineHeight: "21px" }}>{m}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 shrink-0 flex-wrap" style={{ minHeight: 30, padding: "3px 6px", background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <select value={font} onChange={(e) => { setFont(e.target.value); exec("fontName", e.target.value); }}
          style={selStyle(116)}>
          {["Times New Roman", "Arial", "Tahoma", "Georgia", "Courier New", "Verdana"].map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={size} onChange={(e) => { setSize(e.target.value); exec("fontSize", e.target.value); }} style={selStyle(46)}>
          {[["1", "8"], ["2", "10"], ["3", "12"], ["4", "14"], ["5", "18"], ["6", "24"], ["7", "36"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Sep />
        <TBtn onClick={() => exec("bold")} title="Bold"><b>B</b></TBtn>
        <TBtn onClick={() => exec("italic")} title="Italic"><i>I</i></TBtn>
        <TBtn onClick={() => exec("underline")} title="Underline"><u>U</u></TBtn>
        <Sep />
        <TBtn onClick={() => exec("justifyLeft")} title="Align left">≡</TBtn>
        <TBtn onClick={() => exec("justifyCenter")} title="Center">≣</TBtn>
        <TBtn onClick={() => exec("justifyRight")} title="Align right">☰</TBtn>
        <Sep />
        <TBtn onClick={() => exec("insertUnorderedList")} title="Bullets">•</TBtn>
        <label className="flex items-center" style={{ cursor: "pointer", position: "relative", width: 26, height: 22 }} title="Font colour">
          <span style={{ fontWeight: 700, fontSize: 13 }}>A</span>
          <input type="color" defaultValue="#c00000" onChange={(e) => exec("foreColor", e.target.value)}
            style={{ position: "absolute", left: 2, bottom: 1, width: 20, height: 5, padding: 0, border: "none", background: "none", cursor: "pointer" }} />
        </label>
      </div>

      {/* Ruler */}
      <div className="shrink-0" style={{ height: 14, background: "#f3f1e7", borderBottom: "1px solid #cfc9b4", backgroundImage: "repeating-linear-gradient(to right, transparent 0, transparent 18px, #c9c3ad 18px, #c9c3ad 19px)" }} />

      {/* Page */}
      <div className="flex-1 overflow-auto" style={{ background: "#808080", padding: "16px 0" }}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="mx-auto"
          style={{
            width: "90%", maxWidth: 560, minHeight: "calc(100% - 0px)", background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)", padding: "40px 46px", outline: "none",
            fontFamily: font, fontSize: 14, color: "#000", lineHeight: 1.45,
          }}
        />
      </div>
    </div>
  );
}

const selStyle = (w: number): React.CSSProperties => ({
  height: 22, width: w, fontSize: 11, border: "1px solid #9a958a", background: "#fff", padding: "0 2px",
});

function Sep() {
  return <div style={{ width: 1, height: 20, background: "#c9c3ad", margin: "0 3px" }} />;
}

function TBtn({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center justify-center"
      style={{ width: 24, height: 22, fontSize: 13, border: "1px solid transparent", borderRadius: 3, background: "transparent", cursor: "pointer", color: "#222" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#fce9b0"; e.currentTarget.style.border = "1px solid #e3b94e"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
    >
      {children}
    </button>
  );
}
