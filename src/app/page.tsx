"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Portfolio from "@/components/Portfolio";

const ZOOM_HEIGHT = 2.5;

export default function Home() {
  const zoomRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const zoom = zoomRef.current;
    if (!zoom) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rect = zoom.getBoundingClientRect();
        const total = zoom.scrollHeight - window.innerHeight;
        if (total <= 0) return;
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(1, scrolled / total));
        setProgress(p);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scale = 1 + progress * 8;
  const monitorOpacity = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.2);
  const portfolioReady = progress > 0.85;

  return (
    <main className="retro-scrollbar" style={{ background: "#0a0a0c" }}>
      {/* Zoom-into-monitor section */}
      <div ref={zoomRef} style={{ height: `${ZOOM_HEIGHT * 100}vh`, position: "relative" }}>
        <div
          ref={stickyRef}
          className="sticky top-0 w-screen overflow-hidden"
          style={{ height: "100vh" }}
        >
          {/* Scaled monitor */}
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${scale})`,
              transformOrigin: "50% 38%",
              opacity: monitorOpacity,
              willChange: "transform",
            }}
          >
            <MonitorScene progress={progress} />
          </div>

          {/* Dark overlay fading in */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "#0a0a0c",
              opacity: progress > 0.65 ? Math.min(1, (progress - 0.65) / 0.25) : 0,
              transition: "opacity 0.1s",
            }}
          />

          {/* Scroll prompt */}
          <div
            className="absolute bottom-8 left-1/2 flex flex-col items-center"
            style={{
              transform: "translateX(-50%)",
              opacity: Math.max(0, 1 - progress * 5),
              transition: "opacity 0.2s",
              pointerEvents: progress > 0.1 ? "none" : "auto",
            }}
          >
            <span
              style={{
                fontFamily: "'Courier New Custom', 'Courier New', monospace",
                fontSize: 13,
                color: "rgba(120,210,120,0.5)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Scroll to enter
            </span>
            <div className="scroll-indicator">
              <div className="scroll-indicator-dot" />
            </div>
          </div>

          {/* Scanlines during zoom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: progress > 0.2 && progress < 0.8
                ? Math.min(0.5, (progress - 0.2) * 2) * (1 - Math.max(0, (progress - 0.6) / 0.2))
                : 0,
              background:
                "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.08) 2px 4px)",
            }}
          />
        </div>
      </div>

      {/* Portfolio — always in DOM, fades in as zoom completes */}
      <div
        style={{
          opacity: portfolioReady ? 1 : 0,
          transition: "opacity 0.5s ease",
          marginTop: -20,
        }}
      >
        <Portfolio />
      </div>
    </main>
  );
}

/* ── Static Monitor Scene ── */

function MonitorScene({ progress }: { progress: number }) {
  const screenGlow = Math.min(1, progress * 2);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 35%, #20242e 0%, #0a0a0c 75%)",
      }}
    >
      {/* Wooden desk */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: "26%",
          background: "linear-gradient(180deg, #5a4632 0%, #3f3122 60%, #2a2017 100%)",
          boxShadow: "inset 0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 26px)",
          }}
        />
        <div className="absolute left-0 right-0 top-0" style={{ height: 4, background: "rgba(255,240,200,0.12)" }} />
      </div>

      {/* Centered scene */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: "translate(-50%, -50%) scale(0.94)", width: 660, height: 620 }}
      >
        {/* Mouse */}
        <div className="absolute" style={{ left: 575, top: 530, width: 76, height: 100, zIndex: 1 }}>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(150deg, #e6dcbb 0%, #cabf95 55%, #a89d76 100%)",
              borderRadius: "38px 38px 30px 30px",
              boxShadow: "inset -3px -3px 0 #8f8460, inset 3px 3px 0 #f2ead0, 3px 4px 0 rgba(0,0,0,0.35)",
            }}
          />
          <div className="absolute" style={{ left: "50%", top: 6, width: 2, height: 34, background: "#9b906c", transform: "translateX(-50%)" }} />
          <div className="absolute" style={{ left: 14, top: 26, width: 48, height: 8, background: "#b6ab83", borderRadius: 4 }} />
        </div>

        {/* Monitor */}
        <div className="absolute left-1/2" style={{ top: 0, transform: "translateX(-50%)", width: 520, height: 470 }}>
          {/* Casing */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: 14,
              background: "linear-gradient(155deg, #e3d9b9 0%, #cdc299 40%, #b3a87f 75%, #9b9069 100%)",
              boxShadow: "inset -6px -6px 0 rgba(120,110,80,0.55), inset 6px 6px 0 rgba(255,250,225,0.45), 10px 14px 0 rgba(0,0,0,0.45)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                borderRadius: 14,
                backgroundImage: "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)",
                backgroundSize: "3px 3px",
              }}
            />
          </div>

          {/* Screen bezel */}
          <div
            className="absolute"
            style={{
              top: 26, left: 34, right: 34, bottom: 92,
              borderRadius: 8,
              background: "#15140f",
              boxShadow: "inset 5px 5px 0 #07060455, inset -4px -4px 0 #3a3626",
            }}
          />

          {/* Screen surface */}
          <div
            className="absolute overflow-hidden"
            style={{
              top: 38, left: 46, right: 46, bottom: 104,
              borderRadius: 5,
              background: "#0c100b",
            }}
          >
            {/* Screen content — glows as you scroll */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                style={{
                  fontFamily: "'Courier New Custom', 'Courier New', monospace",
                  fontSize: 11,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "rgba(120,210,120,0.25)",
                }}
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                Check my latest work
              </motion.div>
            </div>

            {/* Screen glow reacting to scroll */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(100,200,60,0.12), transparent 70%)",
                opacity: screenGlow,
              }}
            />

            {/* CRT effects */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.45) 100%)" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.10) 2px 3px)" }} />
            <div className="absolute pointer-events-none" style={{ top: "4%", left: "5%", width: "34%", height: "22%", background: "linear-gradient(135deg, rgba(255,255,255,0.07), transparent 70%)", borderRadius: "50%" }} />
          </div>

          {/* Brand badge */}
          <div className="absolute" style={{ bottom: 50, left: 50, fontFamily: "'Courier New Custom', monospace" }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "#6b6346" }}>OBAIDA</span>
            <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8a8160", marginLeft: 6 }}>1700</span>
          </div>

          {/* Vents */}
          <div className="absolute flex gap-[3px]" style={{ bottom: 38, left: 50 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 3, height: 14, background: "#8c8160", boxShadow: "inset -1px 0 0 #b6ab84" }} />
            ))}
          </div>

          {/* Power button */}
          <div
            className="absolute"
            style={{
              bottom: 34, right: 48, width: 30, height: 30, borderRadius: 6,
              background: "linear-gradient(160deg, #d8ceac, #b3a87f)",
              boxShadow: "inset -3px -3px 0 #8f8460, inset 3px 3px 0 #f2ead0",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "#5c5538", fontWeight: 700 }}>⏻</span>
          </div>

          {/* Power LED — lights up as you scroll */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: 42, right: 92, width: 9, height: 9,
              background: screenGlow > 0.3 ? "#56e06a" : "#3a3a2a",
              boxShadow: screenGlow > 0.3
                ? `0 0 ${8 + screenGlow * 8}px #56e06a`
                : "inset 1px 1px 0 rgba(0,0,0,0.4)",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          />
        </div>

        {/* Monitor stand */}
        <div className="absolute left-1/2" style={{ top: 462, transform: "translateX(-50%)" }}>
          <div style={{ width: 130, height: 34, margin: "0 auto", background: "linear-gradient(180deg, #c2b78d, #a59a72)", boxShadow: "inset -4px 0 0 #8f8460, inset 4px 0 0 #ddd3aa" }} />
          <div style={{ width: 210, height: 16, margin: "0 auto", borderRadius: "0 0 10px 10px", background: "linear-gradient(180deg, #b3a87f, #8f8460)", boxShadow: "0 6px 14px rgba(0,0,0,0.45)" }} />
        </div>

        {/* Keyboard */}
        <div
          className="absolute"
          style={{ left: 80, top: 510, width: 470, height: 150, zIndex: 2, transform: "perspective(700px) rotateX(34deg)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              borderRadius: 12,
              background: "linear-gradient(180deg, #ddd3aa 0%, #c2b78d 60%, #a89d76 100%)",
              boxShadow: "inset -5px -5px 0 #8f8460, inset 5px 5px 0 #f2ead0, 0 12px 18px rgba(0,0,0,0.45)",
              padding: 14,
            }}
          >
            <div className="flex flex-col gap-[6px] h-full">
              {[14, 13, 12, 11].map((n, row) => (
                <div key={row} className="flex gap-[5px] flex-1">
                  {Array.from({ length: n }).map((_, i) => (
                    <div key={i} className="flex-1" style={{ background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
                  ))}
                </div>
              ))}
              <div className="flex gap-[5px] flex-1">
                <div style={{ width: "18%", background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
                <div className="flex-1" style={{ background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
                <div style={{ width: "18%", background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
