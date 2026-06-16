"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { XpNotice } from "./DesktopContext";
import { TASKBAR_HEIGHT } from "./Taskbar";

/** XP-style balloon notifications that rise from the system-tray corner. */
export default function NotificationStack({ notices, onDismiss }: { notices: XpNotice[]; onDismiss: (id: number) => void }) {
  return (
    <div className="absolute" style={{ right: 8, bottom: TASKBAR_HEIGHT + 8, zIndex: 195, display: "flex", flexDirection: "column-reverse", gap: 8, pointerEvents: "none" }}>
      <AnimatePresence>
        {notices.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onClick={() => onDismiss(n.id)}
            style={{
              pointerEvents: "auto", cursor: "pointer", width: 260,
              background: "linear-gradient(to bottom,#fffef0,#fff8c8)",
              border: "1px solid #c9a227", borderRadius: 6,
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
              fontFamily: "Tahoma, 'Segoe UI', sans-serif", color: "#222",
              position: "relative",
            }}
          >
            {/* balloon tail */}
            <div style={{ position: "absolute", right: 26, bottom: -8, width: 14, height: 14, background: "#fff8c8", borderRight: "1px solid #c9a227", borderBottom: "1px solid #c9a227", transform: "rotate(45deg)" }} />
            <div className="flex items-start gap-2" style={{ padding: "8px 10px" }}>
              <span className="shrink-0" style={{ width: 18, height: 18, display: "inline-flex", marginTop: 1 }}>
                {n.icon ?? <DefaultIcon />}
              </span>
              <div className="min-w-0">
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1c3d6e" }} className="truncate">{n.title}</div>
                <div style={{ fontSize: 11, lineHeight: 1.35, marginTop: 1 }}>{n.body}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#888", lineHeight: 1 }}>✕</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#3a7bea" /><text x="9" y="13" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="Georgia">i</text></svg>
  );
}
