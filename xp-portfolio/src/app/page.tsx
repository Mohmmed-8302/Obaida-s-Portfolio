"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CRTMonitor from "@/components/CRTMonitor";
import BootSequence from "@/components/BootSequence";
import XPDesktop from "@/components/XPDesktop";

type Phase = "monitor" | "booting" | "desktop" | "shutting-down";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("monitor");

  const handlePowerOn = useCallback(() => {
    setPhase((p) => (p === "monitor" ? "booting" : p));
  }, []);

  const handleBootComplete = useCallback(() => setPhase("desktop"), []);

  const handleShutdown = useCallback(() => {
    setPhase("shutting-down");
    setTimeout(() => setPhase("monitor"), 2000);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a0c" }}>
      <AnimatePresence mode="wait">
        {/* Powered-off monitor on the desk */}
        {phase === "monitor" && (
          <div key="monitor" className="absolute inset-0">
            <CRTMonitor powered={false} onPower={handlePowerOn} />
          </div>
        )}

        {/* Boot sequence playing inside the CRT screen */}
        {phase === "booting" && (
          <div key="booting" className="absolute inset-0">
            <CRTMonitor powered>
              <BootSequence onComplete={handleBootComplete} />
            </CRTMonitor>
          </div>
        )}

        {/* Full-screen XP desktop (zoomed into the screen) */}
        {phase === "desktop" && (
          <motion.div
            key="desktop"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <XPDesktop onShutdown={handleShutdown} />
          </motion.div>
        )}

        {/* Shutdown: screen turns off, then back to the desk */}
        {phase === "shutting-down" && (
          <motion.div key="shutdown" className="absolute inset-0">
            <ShutdownSequence />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ShutdownSequence() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#000" }}>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        style={{ fontSize: 14, color: "#cfcfcf", fontFamily: "'Tahoma', sans-serif" }}
      >
        ObadiXP is shutting down...
      </motion.div>

      {/* CRT collapse flash */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "#fff" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ delay: 1.2, duration: 0.5, times: [0, 0.12, 1] }}
      />
      <motion.div
        className="absolute left-0 right-0"
        style={{ top: "50%", height: 3, background: "#fff", transform: "translateY(-50%)" }}
        initial={{ opacity: 0, scaleX: 1, scaleY: 1 }}
        animate={{ opacity: [0, 1, 1, 0], scaleX: [1, 1, 0.25, 0], scaleY: [1, 1, 1, 0.2] }}
        transition={{ delay: 1.2, duration: 0.6, times: [0, 0.1, 0.6, 1] }}
      />
    </div>
  );
}
