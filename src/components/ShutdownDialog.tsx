"use client";

import { motion } from "framer-motion";

interface ShutdownDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ShutdownDialog({ onConfirm, onCancel }: ShutdownDialogProps) {
  return (
    <motion.div
      className="absolute inset-0 z-[150] flex items-center justify-center"
      style={{ background: "rgba(0,30,80,0.6)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 360,
          background: "#ece9d8",
          border: "2px solid #0054e3",
          borderRadius: "8px 8px 4px 4px",
          boxShadow: "6px 6px 20px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-3" style={{
          height: 28,
          background: "linear-gradient(to bottom, #0A69F0, #0054e3, #0040b0)",
        }}>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 700, textShadow: "1px 1px 1px rgba(0,0,0,0.3)" }}>
            Shut Down ObadiXP
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 flex items-center justify-center" style={{ fontSize: 32 }}>⏻</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>
                Are you sure you want to shut down?
              </div>
              <div className="mt-1" style={{ fontSize: 11, color: "#666" }}>
                The portfolio experience will end and you will return to the monitor view.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <XPButton onClick={onConfirm}>Shut Down</XPButton>
            <XPButton onClick={onCancel}>Cancel</XPButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function XPButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="px-6 py-1"
      style={{
        fontSize: 12,
        background: "linear-gradient(to bottom, #fff, #e8e4d8)",
        border: "1px solid #003c74",
        borderRadius: 3,
        color: "#222",
        cursor: "pointer",
        minWidth: 80,
        boxShadow: "inset 0 1px 0 #fff",
      }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(to bottom, #e8f0ff, #c8d8f0)")}
      onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(to bottom, #fff, #e8e4d8)")}
    >
      {children}
    </button>
  );
}
