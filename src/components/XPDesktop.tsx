"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import XPTaskbar from "./XPTaskbar";
import BrowserWindow from "./BrowserWindow";
import ShutdownDialog from "./ShutdownDialog";

interface XPDesktopProps {
  onShutdown: () => void;
}

export default function XPDesktop({ onShutdown }: XPDesktopProps) {
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserMinimized, setBrowserMinimized] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const [startOpen, setStartOpen] = useState(false);

  const openBrowser = useCallback(() => {
    if (browserOpen && browserMinimized) {
      setBrowserMinimized(false);
    } else if (!browserOpen) {
      setBrowserOpen(true);
      setBrowserMinimized(false);
    }
    setStartOpen(false);
  }, [browserOpen, browserMinimized]);

  const closeBrowser = useCallback(() => {
    setBrowserOpen(false);
    setBrowserMinimized(false);
  }, []);

  const handleTaskbarBrowserClick = useCallback(() => {
    if (browserMinimized) {
      setBrowserMinimized(false);
    } else {
      setBrowserMinimized(true);
    }
  }, [browserMinimized]);

  const handleShutdown = useCallback(() => {
    setShowShutdown(false);
    setBrowserOpen(false);
    onShutdown();
  }, [onShutdown]);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bliss wallpaper */}
      <div className="absolute inset-0" style={{
        backgroundImage: "url('/assets/bliss.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }} />

      {/* Desktop icons */}
      <div className="absolute top-6 left-6 flex flex-col gap-4">
        <DesktopIcon
          label="Internet Browser"
          onDoubleClick={openBrowser}
          icon={
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full" style={{
                background: "linear-gradient(135deg, #0078d4 0%, #00a2ed 50%, #00bcd4 100%)",
                boxShadow: "0 2px 8px rgba(0,120,212,0.5)",
              }} />
              <div className="absolute flex items-center justify-center" style={{
                top: 4, left: 4, right: 4, bottom: 4,
              }}>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "serif", fontStyle: "italic" }}>e</div>
              </div>
              <div className="absolute rounded-full" style={{
                top: 2, left: 6, width: 14, height: 8,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
                borderRadius: "50%",
              }} />
            </div>
          }
        />
      </div>

      {/* Browser window */}
      <AnimatePresence>
        {browserOpen && !browserMinimized && (
          <BrowserWindow
            onClose={closeBrowser}
            onMinimize={() => setBrowserMinimized(true)}
          />
        )}
      </AnimatePresence>

      {/* Start menu */}
      <AnimatePresence>
        {startOpen && (
          <motion.div
            className="absolute z-[90]"
            style={{ bottom: 36, left: 0 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div style={{
              width: 340, background: "#fff",
              border: "2px solid #0054e3",
              borderRadius: "8px 8px 0 0",
              boxShadow: "4px 4px 12px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3" style={{
                background: "linear-gradient(to right, #0054e3, #2683f5)",
              }}>
                <div className="w-8 h-8 rounded-full" style={{
                  background: "linear-gradient(135deg, #C97A8A, #8A3E51)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                }}>O</div>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Obaida</span>
              </div>
              {/* Menu items */}
              <div className="py-2">
                <MenuItem
                  label="Internet Browser"
                  icon="🌐"
                  onClick={() => { openBrowser(); setStartOpen(false); }}
                />
                <div className="my-1 mx-4" style={{ borderTop: "1px solid #ddd" }} />
                <MenuItem
                  label="Shut Down"
                  icon="⏻"
                  onClick={() => { setShowShutdown(true); setStartOpen(false); }}
                  danger
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away to close start menu */}
      {startOpen && (
        <div className="absolute inset-0 z-[85]" onClick={() => setStartOpen(false)} />
      )}

      {/* Shutdown dialog */}
      <AnimatePresence>
        {showShutdown && (
          <ShutdownDialog
            onConfirm={handleShutdown}
            onCancel={() => setShowShutdown(false)}
          />
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <XPTaskbar
        browserOpen={browserOpen}
        browserMinimized={browserMinimized}
        onStartClick={() => setStartOpen(s => !s)}
        startOpen={startOpen}
        onBrowserClick={handleTaskbarBrowserClick}
        onShutdown={() => { setShowShutdown(true); setStartOpen(false); }}
      />

      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none z-[200]" style={{
        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 3px)",
      }} />
    </motion.div>
  );
}

function DesktopIcon({ label, icon, onDoubleClick }: { label: string; icon: React.ReactNode; onDoubleClick: () => void }) {
  const [selected, setSelected] = useState(false);
  return (
    <div
      className="flex flex-col items-center gap-1 p-2 rounded cursor-pointer"
      style={{
        width: 80,
        background: selected ? "rgba(0,80,200,0.3)" : "transparent",
      }}
      onClick={() => setSelected(true)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setSelected(false)}
      tabIndex={0}
    >
      {icon}
      <span className="text-center leading-tight" style={{
        fontSize: 11, color: "#fff",
        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
        padding: selected ? "1px 4px" : 0,
        background: selected ? "rgba(0,80,200,0.5)" : "transparent",
      }}>
        {label}
      </span>
    </div>
  );
}

function MenuItem({ label, icon, onClick, danger }: { label: string; icon: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-2 text-left"
      style={{ fontSize: 13, color: danger ? "#c00" : "#222", background: "transparent" }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = "#0054e3", e.currentTarget.style.color = "#fff")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = danger ? "#c00" : "#222")}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
