"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SCENE_W = 660;
const SCENE_H = 620;

/** Scale the fixed-size desk scene so it always fits the viewport. */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const s = Math.min(window.innerWidth / SCENE_W, window.innerHeight / SCENE_H) * 0.94;
      setScale(Math.min(s, 1.15));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

interface CRTMonitorProps {
  /** Power-on click handler (used on the powered-off monitor screen). */
  onPower?: () => void;
  powered: boolean;
  /** Content rendered inside the CRT screen (boot sequence, prompts, etc.). */
  children?: React.ReactNode;
}

/*
 * A full retro desk scene: an aged beige CRT monitor sitting on a wooden desk
 * with a chunky keyboard and a mouse. Everything is given a slightly pixelated,
 * old-hardware feel with stepped bevels and a faint pixel grid.
 */
export default function CRTMonitor({ onPower, powered, children }: CRTMonitorProps) {
  const scale = useFitScale();
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 35%, #20242e 0%, #0a0a0c 75%)" }}>
      {/* Wooden desk */}
      <div className="absolute left-0 right-0 bottom-0" style={{
        height: "26%",
        background: "linear-gradient(180deg, #5a4632 0%, #3f3122 60%, #2a2017 100%)",
        boxShadow: "inset 0 8px 24px rgba(0,0,0,0.5)",
        imageRendering: "pixelated",
      }}>
        {/* desk wood grain */}
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 26px)",
        }} />
        {/* front desk edge highlight */}
        <div className="absolute left-0 right-0 top-0" style={{ height: 4, background: "rgba(255,240,200,0.12)" }} />
      </div>

      {/* Scene: monitor + keyboard + mouse, centered and scaled to fit */}
      <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) scale(${scale})`, width: SCENE_W, height: SCENE_H }}>
        {/* ── Mouse (right of keyboard, on the desk) ── */}
        <div className="absolute" style={{ left: 550, top: 470, width: 76, height: 116, zIndex: 1 }}>
          {/* cable */}
          <div className="absolute" style={{
            left: -30, top: 8, width: 60, height: 40,
            borderLeft: "3px solid #7a7256", borderTop: "3px solid #7a7256",
            borderTopLeftRadius: 30,
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(150deg, #e6dcbb 0%, #cabf95 55%, #a89d76 100%)",
            borderRadius: "38px 38px 30px 30px",
            boxShadow: "inset -3px -3px 0 #8f8460, inset 3px 3px 0 #f2ead0, 3px 4px 0 rgba(0,0,0,0.35)",
          }} />
          {/* buttons */}
          <div className="absolute" style={{ left: "50%", top: 6, width: 2, height: 34, background: "#9b906c", transform: "translateX(-50%)" }} />
          <div className="absolute" style={{ left: 14, top: 26, width: 48, height: 8, background: "#b6ab83", borderRadius: 4 }} />
        </div>

        {/* ── Monitor ── */}
        <div className="absolute left-1/2" style={{ top: 0, transform: "translateX(-50%)", width: 520, height: 470 }}>
          {/* Casing */}
          <div className="absolute inset-0" style={{
            borderRadius: 14,
            background: "linear-gradient(155deg, #e3d9b9 0%, #cdc299 40%, #b3a87f 75%, #9b9069 100%)",
            boxShadow: "inset -6px -6px 0 rgba(120,110,80,0.55), inset 6px 6px 0 rgba(255,250,225,0.45), 10px 14px 0 rgba(0,0,0,0.45)",
            imageRendering: "pixelated",
          }}>
            {/* aged dithering */}
            <div className="absolute inset-0 opacity-[0.12]" style={{
              borderRadius: 14,
              backgroundImage: "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)",
              backgroundSize: "3px 3px",
            }} />
          </div>

          {/* Screen bezel (thick) */}
          <div className="absolute" style={{
            top: 26, left: 34, right: 34, bottom: 92,
            borderRadius: 8,
            background: "#15140f",
            boxShadow: "inset 5px 5px 0 #07060455, inset -4px -4px 0 #3a3626",
          }} />

          {/* Screen (the live surface) */}
          <motion.div
            className="absolute overflow-hidden"
            style={{
              top: 38, left: 46, right: 46, bottom: 104,
              borderRadius: 5,
              background: powered ? "#000" : "#0c100b",
              cursor: !powered && onPower ? "pointer" : "default",
              imageRendering: "pixelated",
            }}
            onClick={!powered ? onPower : undefined}
            whileHover={!powered && onPower ? { boxShadow: "0 0 26px rgba(120,210,120,0.18)" } : undefined}
          >
            {/* live content */}
            <div className="absolute inset-0 z-0">{children}</div>

            {/* powered-off prompt */}
            {!powered && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div
                  className="text-[12px] tracking-[0.32em] uppercase"
                  style={{ color: "rgba(120,210,120,0.22)", fontFamily: "var(--font-mono)" }}
                  animate={{ opacity: [0.12, 0.4, 0.12] }}
                  transition={{ duration: 2.6, repeat: Infinity }}
                >
                  Click to power on
                </motion.div>
              </div>
            )}

            {/* curvature vignette */}
            <div className="absolute inset-0 pointer-events-none z-10" style={{
              background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.45) 100%)",
            }} />
            {/* scanlines */}
            <div className="absolute inset-0 pointer-events-none z-10" style={{
              background: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.10) 2px 3px)",
            }} />
            {/* glass reflection */}
            <div className="absolute pointer-events-none z-10" style={{
              top: "4%", left: "5%", width: "34%", height: "22%",
              background: "linear-gradient(135deg, rgba(255,255,255,0.07), transparent 70%)",
              borderRadius: "50%",
            }} />
          </motion.div>

          {/* Front control panel */}
          {/* brand badge */}
          <div className="absolute" style={{ bottom: 50, left: 50, fontFamily: "var(--font-mono)" }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "#6b6346" }}>OBAIDA</span>
            <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8a8160", marginLeft: 6 }}>1700</span>
          </div>
          {/* vents */}
          <div className="absolute flex gap-[3px]" style={{ bottom: 38, left: 50 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 3, height: 14, background: "#8c8160", boxShadow: "inset -1px 0 0 #b6ab84" }} />
            ))}
          </div>
          {/* power button */}
          <button
            onClick={!powered ? onPower : undefined}
            className="absolute"
            style={{
              bottom: 34, right: 48, width: 30, height: 30, borderRadius: 6,
              background: "linear-gradient(160deg, #d8ceac, #b3a87f)",
              boxShadow: "inset -3px -3px 0 #8f8460, inset 3px 3px 0 #f2ead0",
              cursor: !powered && onPower ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "#5c5538", fontWeight: 700 }}>⏻</span>
          </button>
          {/* power LED */}
          <motion.div
            className="absolute rounded-full"
            style={{
              bottom: 42, right: 92, width: 9, height: 9,
              background: powered ? "#56e06a" : "#3a3a2a",
              boxShadow: powered ? "0 0 8px #56e06a" : "inset 1px 1px 0 rgba(0,0,0,0.4)",
            }}
            animate={powered ? { opacity: [1, 0.65, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* ── Monitor stand ── */}
        <div className="absolute left-1/2" style={{ top: 462, transform: "translateX(-50%)" }}>
          <div style={{
            width: 130, height: 34, margin: "0 auto",
            background: "linear-gradient(180deg, #c2b78d, #a59a72)",
            boxShadow: "inset -4px 0 0 #8f8460, inset 4px 0 0 #ddd3aa",
          }} />
          <div style={{
            width: 210, height: 16, margin: "0 auto",
            borderRadius: "0 0 10px 10px",
            background: "linear-gradient(180deg, #b3a87f, #8f8460)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.45)",
          }} />
        </div>

        {/* ── Keyboard ── */}
        <div className="absolute left-1/2" style={{ top: 500, transform: "translateX(-50%) perspective(700px) rotateX(34deg)", width: 470, height: 150 }}>
          <div className="absolute inset-0" style={{
            borderRadius: 12,
            background: "linear-gradient(180deg, #ddd3aa 0%, #c2b78d 60%, #a89d76 100%)",
            boxShadow: "inset -5px -5px 0 #8f8460, inset 5px 5px 0 #f2ead0, 0 12px 18px rgba(0,0,0,0.45)",
            padding: 14,
            imageRendering: "pixelated",
          }}>
            {/* key rows */}
            <div className="flex flex-col gap-[6px] h-full">
              {[14, 13, 12, 11].map((n, row) => (
                <div key={row} className="flex gap-[5px] flex-1">
                  {Array.from({ length: n }).map((_, i) => (
                    <div key={i} className="flex-1" style={{
                      background: "linear-gradient(180deg, #efe7c8, #cfc49b)",
                      borderRadius: 3,
                      boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2",
                    }} />
                  ))}
                </div>
              ))}
              {/* spacebar row */}
              <div className="flex gap-[5px] flex-1">
                <div style={{ width: "18%", background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
                <div className="flex-1" style={{ background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
                <div style={{ width: "18%", background: "linear-gradient(180deg, #efe7c8, #cfc49b)", borderRadius: 3, boxShadow: "inset -2px -2px 0 #a89d76, inset 1px 1px 0 #fffdf2" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global pixel grid over the whole scene */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px)",
        mixBlendMode: "multiply",
      }} />
    </div>
  );
}
