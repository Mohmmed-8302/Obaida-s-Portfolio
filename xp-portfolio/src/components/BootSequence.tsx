"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

type Phase = "bios" | "xplogo" | "desktop";

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("bios");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("xplogo"), 2200);
    const t2 = setTimeout(() => setPhase("desktop"), 6500);
    const t3 = setTimeout(onComplete, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ animation: "crtOn 0.6s ease-out forwards" }}>
      <AnimatePresence mode="wait">
        {phase === "bios" && (
          <motion.div
            key="bios"
            className="absolute inset-0 p-8"
            style={{ background: "#000", fontFamily: "var(--font-mono)", fontSize: 13, color: "#aaa" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div style={{ color: "#fff" }}>ObaidaTech BIOS v2.4</div>
            <div className="mt-1" style={{ color: "#888" }}>Copyright (C) 2024-2026 Obaida Corp.</div>
            <div className="mt-4">CPU: Creative Processor @ 3.2GHz</div>
            <div>RAM: 512MB DDR</div>
            <div>HDD: 80GB — Portfolio Storage</div>
            <div className="mt-4" style={{ color: "#4ade80" }}>All systems OK</div>
            <motion.div
              className="mt-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              Loading OS...
            </motion.div>
          </motion.div>
        )}

        {phase === "xplogo" && (
          <motion.div
            key="xplogo"
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "#000" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* XP-inspired logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative" style={{ width: 60, height: 60 }}>
                <div className="absolute inset-0 rounded-full" style={{
                  background: "conic-gradient(#e8463a 0deg, #e8463a 90deg, #4aade8 90deg, #4aade8 180deg, #4ade50 180deg, #4ade50 270deg, #f0c040 270deg, #f0c040 360deg)",
                }} />
                <div className="absolute rounded-full" style={{
                  top: 6, left: 6, right: 6, bottom: 6, background: "#000",
                }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
                  Obaida<span style={{ color: "#4aade8", fontWeight: 400, fontSize: 20, verticalAlign: "super" }}>XP</span>
                </div>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.15em" }}>
                  PORTFOLIO EDITION
                </div>
              </div>
            </div>

            {/* Loading bar */}
            <div style={{ width: 220, height: 14, background: "#111", border: "1px solid #333", borderRadius: 2, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{
                  position: "absolute", top: 0, bottom: 0, width: "30%",
                  background: "linear-gradient(90deg, transparent, #4aade8, #4ade50, transparent)",
                  borderRadius: 2,
                }}
                animate={{ left: ["-30%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="mt-4" style={{ fontSize: 11, color: "#666" }}>
              Starting Obaida Portfolio Experience...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px)",
        zIndex: 50,
      }} />
    </div>
  );
}
