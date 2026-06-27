"use client";

import { useEffect, useRef, useState } from "react";
import type { XpSettings } from "./types";

type SaverCfg = XpSettings["screensaver"];
type SaverType = SaverCfg["type"];

const ACTIVITY = ["mousemove", "mousedown", "keydown", "wheel", "touchstart"] as const;

/** Fires the screen saver immediately (used by the Display Properties "Preview" button). */
export function previewScreenSaver(type: SaverType) {
  if (typeof window !== "undefined" && type !== "none") {
    window.dispatchEvent(new CustomEvent("xp-ss-preview", { detail: { type } }));
  }
}

export default function ScreenSaver({ settings }: { settings: SaverCfg }) {
  const [active, setActive] = useState<SaverType | null>(null);
  const lastActivity = useRef(Date.now());
  const cfg = useRef(settings);
  cfg.current = settings;

  // Idle watcher → activate.
  useEffect(() => {
    const bump = () => { lastActivity.current = Date.now(); };
    ACTIVITY.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const iv = window.setInterval(() => {
      const s = cfg.current;
      if (s.type === "none") return;
      if (Date.now() - lastActivity.current >= s.waitMs) setActive((a) => a ?? s.type);
    }, 1000);
    return () => { ACTIVITY.forEach((e) => window.removeEventListener(e, bump)); clearInterval(iv); };
  }, []);

  // Preview trigger from Display Properties.
  useEffect(() => {
    const onPreview = (e: Event) => {
      const t = (e as CustomEvent).detail?.type as SaverType | undefined;
      if (t && t !== "none") setActive(t);
    };
    window.addEventListener("xp-ss-preview", onPreview as EventListener);
    return () => window.removeEventListener("xp-ss-preview", onPreview as EventListener);
  }, []);

  // While active, any input dismisses (after a short grace so Preview is visible).
  useEffect(() => {
    if (!active) return;
    const since = Date.now();
    const dismiss = () => {
      if (Date.now() - since < 700) return;
      lastActivity.current = Date.now();
      setActive(null);
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, dismiss, { passive: true }));
    return () => ACTIVITY.forEach((e) => window.removeEventListener(e, dismiss));
  }, [active]);

  if (!active) return null;
  return (
    <div className="fixed inset-0" style={{ zIndex: 9999, background: "#000", cursor: "none" }}>
      <SaverCanvas type={active} />
    </div>
  );
}

function SaverCanvas({ type }: { type: SaverType }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let frame = 0;

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let lastW = 0, lastH = 0;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Skip if dimensions haven't changed
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      cv.width = w;
      cv.height = h;
    };
    const debouncedResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    resize();
    window.addEventListener("resize", debouncedResize);

    // ── starfield ──
    let stars = newStars(cv.width, cv.height);

    // ── mystify ──
    const shapes = newShapes(cv.width, cv.height);

    // ── bliss (DVD-style bouncing wordmark) ──
    const logo = { x: cv.width * 0.3, y: cv.height * 0.4, vx: 2.4, vy: 1.8, hue: 0 };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      const W = cv.width, H = cv.height;

      if (type === "starfield") {
        if (stars.length === 0 || frame === 1) stars = newStars(W, H);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2;
        ctx.fillStyle = "#fff";
        for (const s of stars) {
          s.z -= 8;
          if (s.z <= 1) { s.x = (Math.random() - 0.5) * W; s.y = (Math.random() - 0.5) * H; s.z = W; }
          const k = 128 / s.z;
          const px = s.x * k + cx, py = s.y * k + cy;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          const size = (1 - s.z / W) * 3.2;
          ctx.globalAlpha = Math.min(1, (1 - s.z / W) * 1.5);
          ctx.fillRect(px, py, size, size);
        }
        ctx.globalAlpha = 1;
      } else if (type === "mystify") {
        // fade previous frame for trails
        ctx.fillStyle = "rgba(0,0,0,0.14)";
        ctx.fillRect(0, 0, W, H);
        for (const sh of shapes) {
          for (const p of sh.pts) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
            if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
          }
          ctx.strokeStyle = sh.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          sh.pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.closePath();
          ctx.stroke();
        }
      } else {
        // bliss: soft sky→grass gradient + bouncing "Windows XP"
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#2b73c4");
        g.addColorStop(0.55, "#74a8e0");
        g.addColorStop(0.62, "#8fbf6a");
        g.addColorStop(1, "#3c7a32");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        logo.x += logo.vx; logo.y += logo.vy;
        const tw = 320, th = 64;
        if (logo.x < 0 || logo.x + tw > W) { logo.vx *= -1; logo.hue = (logo.hue + 40) % 360; logo.x = Math.max(0, Math.min(W - tw, logo.x)); }
        if (logo.y < 40 || logo.y + th > H) { logo.vy *= -1; logo.hue = (logo.hue + 40) % 360; logo.y = Math.max(40, Math.min(H - th, logo.y)); }
        ctx.font = "bold 52px Tahoma, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillText("Windows XP", logo.x + 2, logo.y + 2);
        ctx.fillStyle = `hsl(${logo.hue}, 85%, 96%)`;
        ctx.fillText("Windows", logo.x, logo.y);
        ctx.fillStyle = `hsl(${(logo.hue + 60) % 360}, 90%, 70%)`;
        ctx.fillText("Windows XP".slice(8), logo.x + ctx.measureText("Windows ").width, logo.y);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", debouncedResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [type]);

  return <canvas ref={ref} style={{ display: "block", width: "100%", height: "100%" }} />;
}

function newStars(w: number, h: number) {
  return Array.from({ length: 360 }, () => ({ x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: Math.random() * w }));
}
function newShapes(w: number, h: number) {
  const mk = (color: string) => ({
    color,
    pts: Array.from({ length: 4 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() * 2 - 1) * 2.4 || 1.6, vy: (Math.random() * 2 - 1) * 2.4 || 1.4,
    })),
  });
  return [mk("#46b4ff"), mk("#ff5fa2")];
}
