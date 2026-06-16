"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useDesktop } from "../DesktopContext";
import type { PhotoPayload } from "../types";
import { PHOTOS } from "./photos";

export default function PhotoViewer() {
  const { payloads } = useDesktop();
  const payload = payloads.photoviewer as PhotoPayload | undefined;

  const [index, setIndex] = useState(payload?.index ?? 0);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  // When a different photo is opened from the file explorer, jump to it.
  const lastPayload = useRef<PhotoPayload | undefined>(payload);
  useEffect(() => {
    if (payload && payload !== lastPayload.current) {
      lastPayload.current = payload;
      if (typeof payload.index === "number" && payload.index >= 0) setIndex(payload.index);
      setZoom(1);
      setRotate(0);
    }
  }, [payload]);

  const photo = PHOTOS[Math.max(0, Math.min(PHOTOS.length - 1, index))];

  const go = (d: number) => { setIndex((i) => (i + d + PHOTOS.length) % PHOTOS.length); setZoom(1); setRotate(0); };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#5b5b5b", fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Image stage */}
      <div className="flex-1 overflow-auto flex items-center justify-center" style={{ background: "#4a4a4a", padding: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.name}
          draggable={false}
          style={{
            maxWidth: zoom === 1 ? "100%" : "none", maxHeight: zoom === 1 ? "100%" : "none",
            transform: `scale(${zoom}) rotate(${rotate}deg)`, transition: "transform 0.12s ease",
            boxShadow: "0 2px 14px rgba(0,0,0,0.6)", background: "#fff", userSelect: "none",
          }}
        />
      </div>

      {/* Caption */}
      <div className="shrink-0 flex items-center justify-between" style={{ height: 22, padding: "0 12px", background: "#3f3f3f", color: "#e6e6e6", fontSize: 11 }}>
        <span>{photo.name}</span>
        <span style={{ opacity: 0.8 }}>{index + 1} / {PHOTOS.length} · {Math.round(zoom * 100)}%</span>
      </div>

      {/* Windows Picture Viewer toolbar */}
      <div className="shrink-0 flex items-center justify-center gap-1.5" style={{ height: 40, background: "linear-gradient(to bottom,#5e6166,#3c3e42)", borderTop: "1px solid #2a2c2f" }}>
        <Round onClick={() => go(-1)} title="Previous"><Chevron dir="left" /></Round>
        <Round onClick={() => go(1)} title="Next"><Chevron dir="right" /></Round>
        <Gap />
        <Round onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))} title="Zoom in">
          <Glass plus />
        </Round>
        <Round onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))} title="Zoom out">
          <Glass />
        </Round>
        <Round onClick={() => { setZoom(1); setRotate(0); }} title="Best fit">⬚</Round>
        <Gap />
        <Round onClick={() => setRotate((r) => r - 90)} title="Rotate left">↺</Round>
        <Round onClick={() => setRotate((r) => r + 90)} title="Rotate right">↻</Round>
      </div>
    </div>
  );
}

function Round({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center"
      style={{
        width: 28, height: 28, borderRadius: "50%", cursor: "pointer", color: "#eaeaea", fontSize: 15,
        border: "1px solid #2a2c2f",
        background: "linear-gradient(to bottom,#8a8d92,#5a5d62)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(to bottom,#a6dcff,#5aa0e0)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(to bottom,#8a8d92,#5a5d62)")}
    >
      {children}
    </button>
  );
}

const Gap = () => <div style={{ width: 10 }} />;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      {dir === "left"
        ? <polygon points="8,2 8,10 3,6" fill="#1f5fa8" />
        : <polygon points="4,2 4,10 9,6" fill="#1f5fa8" />}
    </svg>
  );
}

function Glass({ plus }: { plus?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15">
      <circle cx="6" cy="6" r="4.4" fill="#cfe7ff" stroke="#1f5fa8" strokeWidth="1.4" />
      <line x1="9.4" y1="9.4" x2="13" y2="13" stroke="#1f5fa8" strokeWidth="2" strokeLinecap="round" />
      <line x1="3.6" y1="6" x2="8.4" y2="6" stroke="#1f5fa8" strokeWidth="1.2" />
      {plus && <line x1="6" y1="3.6" x2="6" y2="8.4" stroke="#1f5fa8" strokeWidth="1.2" />}
    </svg>
  );
}
