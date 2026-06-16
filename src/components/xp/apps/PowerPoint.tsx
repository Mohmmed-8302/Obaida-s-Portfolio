"use client";

import { useState, useCallback, useEffect } from "react";
import { useDocFile } from "./useDocFile";
import SaveAsDialog from "./SaveAsDialog";

interface Slide { id: number; title: string; body: string; }

const THEME = { bg: "linear-gradient(135deg,#f4f7fc 0%,#dbe6f5 100%)", bar: "#c0451b", title: "#1f3864", body: "#333" };

const INITIAL: Slide[] = [
  { id: 1, title: "Obaida — Motion Reel 2025", body: "Creative developer & motion designer\nPress “Slide Show” to present" },
  { id: 2, title: "What I do", body: "• Brand animation\n• Title sequences\n• Interactive web experiences\n• 3D & compositing" },
  { id: 3, title: "Get in touch", body: "Double-click any text to edit this deck.\nAdd your own slides with “New Slide”." },
];

const DEFAULT_CONTENT = JSON.stringify(INITIAL.map((s) => ({ title: s.title, body: s.body })));

export default function PowerPoint() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL);
  const [cur, setCur] = useState(0);
  const [show, setShow] = useState(false);
  const [nextId, setNextId] = useState(4);

  const doc = useDocFile({
    docType: "powerpoint",
    defaultContent: DEFAULT_CONTENT,
    untitled: "Presentation1",
    applyContent: (c) => {
      try {
        const arr = JSON.parse(c) as { title?: string; body?: string }[];
        if (Array.isArray(arr) && arr.length) {
          setSlides(arr.map((s, i) => ({ id: i + 1, title: s.title ?? "", body: s.body ?? "" })));
          setNextId(arr.length + 1);
          setCur(0);
        }
      } catch { /* ignore */ }
    },
    getContent: () => JSON.stringify(slides.map((s) => ({ title: s.title, body: s.body }))),
  });

  const slide = slides[cur] ?? slides[0];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); doc.requestSave(); }
  };

  const update = useCallback((patch: Partial<Slide>) => {
    setSlides((s) => s.map((sl, i) => (i === cur ? { ...sl, ...patch } : sl)));
  }, [cur]);

  const addSlide = useCallback(() => {
    setSlides((s) => {
      const copy = [...s];
      copy.splice(cur + 1, 0, { id: nextId, title: "New Slide", body: "Click to add text" });
      return copy;
    });
    setNextId((n) => n + 1);
    setCur((c) => c + 1);
  }, [cur, nextId]);

  const delSlide = useCallback(() => {
    setSlides((s) => (s.length <= 1 ? s : s.filter((_, i) => i !== cur)));
    setCur((c) => Math.max(0, c - (cur === slides.length - 1 ? 1 : 0)));
  }, [cur, slides.length]);

  // Slideshow keyboard controls
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShow(false);
      else if (e.key === "ArrowRight" || e.key === " ") setCur((c) => Math.min(slides.length - 1, c + 1));
      else if (e.key === "ArrowLeft") setCur((c) => Math.max(0, c - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, slides.length]);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#ece9d8", fontFamily: "Tahoma, 'Segoe UI', sans-serif" }} onKeyDown={onKeyDown}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 shrink-0" style={{ height: 30, padding: "0 8px", background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <ToolButton onClick={doc.requestSave}>💾 Save</ToolButton>
        <ToolButton onClick={addSlide}>＋ New Slide</ToolButton>
        <ToolButton onClick={delSlide}>🗑 Delete</ToolButton>
        <div style={{ flex: 1 }} />
        <ToolButton onClick={() => setShow(true)} primary>▶ Slide Show</ToolButton>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails */}
        <div className="shrink-0 overflow-auto" style={{ width: 116, background: "#3a4a63", padding: 8 }}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCur(i)}
              className="w-full flex gap-1 mb-2 text-left"
              style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
            >
              <span style={{ color: "#cdd7e2", fontSize: 10, width: 12, paddingTop: 14 }}>{i + 1}</span>
              <div style={{ flex: 1, aspectRatio: "4/3", background: THEME.bg, border: i === cur ? "2px solid #f0a33b" : "1px solid #1f2a3d", borderRadius: 2, padding: 4, overflow: "hidden" }}>
                <div style={{ height: 3, background: THEME.bar, marginBottom: 3, borderRadius: 1 }} />
                <div style={{ fontSize: 6, fontWeight: 700, color: THEME.title, lineHeight: 1.1 }} className="truncate">{s.title}</div>
                <div style={{ fontSize: 5, color: THEME.body, marginTop: 2, whiteSpace: "pre-line", lineHeight: 1.15 }}>{s.body.slice(0, 60)}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Editor canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center" style={{ background: "#7d8aa0", padding: 18 }}>
          <div style={{ width: "100%", maxWidth: 520, aspectRatio: "4/3", background: THEME.bg, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", borderRadius: 4, padding: "26px 32px", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 5, width: 70, background: THEME.bar, borderRadius: 2, marginBottom: 14 }} />
            <input
              value={slide.title}
              onChange={(e) => update({ title: e.target.value })}
              style={{ border: "1px dashed transparent", background: "transparent", fontSize: 24, fontWeight: 700, color: THEME.title, outline: "none", fontFamily: "Georgia, serif" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px dashed #9aa6bb")}
              onBlur={(e) => (e.currentTarget.style.border = "1px dashed transparent")}
            />
            <textarea
              value={slide.body}
              onChange={(e) => update({ body: e.target.value })}
              spellCheck={false}
              className="flex-1"
              style={{ marginTop: 14, border: "1px dashed transparent", background: "transparent", resize: "none", fontSize: 16, color: THEME.body, outline: "none", lineHeight: 1.5, fontFamily: "Tahoma, sans-serif" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px dashed #9aa6bb")}
              onBlur={(e) => (e.currentTarget.style.border = "1px dashed transparent")}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0 flex items-center" style={{ height: 20, padding: "0 10px", background: "#ece9d8", borderTop: "1px solid #d6d2c2", fontSize: 11, color: "#444" }}>
        Slide {cur + 1} of {slides.length}
      </div>

      {doc.saveAsOpen && <SaveAsDialog initialName={doc.suggestedName.endsWith(".ppt") ? doc.suggestedName : `${doc.suggestedName}.ppt`} onSave={doc.commitSaveAs} onClose={doc.closeSaveAs} />}

      {/* Slideshow overlay */}
      {show && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 30, background: "#000", cursor: "pointer" }}
          onClick={() => setCur((c) => (c < slides.length - 1 ? c + 1 : c))}
          onContextMenu={(e) => { e.preventDefault(); setShow(false); }}
        >
          <div style={{ width: "92%", maxWidth: 680, aspectRatio: "4/3", background: THEME.bg, borderRadius: 4, padding: "44px 56px", display: "flex", flexDirection: "column", boxShadow: "0 0 40px rgba(0,0,0,0.6)" }}>
            <div style={{ height: 7, width: 110, background: THEME.bar, borderRadius: 3, marginBottom: 22 }} />
            <div style={{ fontSize: 34, fontWeight: 700, color: THEME.title, fontFamily: "Georgia, serif" }}>{slide.title}</div>
            <div style={{ marginTop: 22, fontSize: 22, color: THEME.body, whiteSpace: "pre-line", lineHeight: 1.6 }}>{slide.body}</div>
          </div>
          <div style={{ position: "absolute", bottom: 14, right: 18, color: "#888", fontSize: 12 }}>
            {cur + 1} / {slides.length} · click to advance · Esc to exit
          </div>
        </div>
      )}
    </div>
  );
}

function ToolButton({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, height: 22, padding: "0 10px", cursor: "pointer", borderRadius: 3,
        border: primary ? "1px solid #2a8f3a" : "1px solid #b8b29c",
        background: primary ? "linear-gradient(to bottom,#7ed27e,#46a85a)" : "linear-gradient(to bottom,#fff,#e7e2d2)",
        color: primary ? "#fff" : "#222", fontWeight: primary ? 700 : 400,
      }}
    >
      {children}
    </button>
  );
}
