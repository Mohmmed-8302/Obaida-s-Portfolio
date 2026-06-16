"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppId, AppPayload, Rect, WindowInstance } from "./xp/types";
import { APPS } from "./xp/registry";
import { DesktopContext } from "./xp/DesktopContext";
import XPWindow from "./xp/XPWindow";
import Taskbar, { TASKBAR_HEIGHT } from "./xp/Taskbar";
import StartMenu from "./xp/StartMenu";
import ShutdownDialog from "./ShutdownDialog";

interface XPDesktopProps {
  onShutdown: () => void;
}

/** Icons shown on the desktop, in order. */
const DESKTOP_ICONS: { id: AppId; label: string }[] = [
  { id: "mycomputer", label: "My Computer" },
  { id: "mydocuments", label: "My Documents" },
  { id: "recyclebin", label: "Recycle Bin" },
  { id: "ie", label: "Internet" },
  { id: "word", label: "Microsoft Word" },
  { id: "excel", label: "Microsoft Excel" },
  { id: "powerpoint", label: "PowerPoint" },
  { id: "notepad", label: "Notepad" },
  { id: "paint", label: "Paint" },
  { id: "games", label: "Games" },
];

export default function XPDesktop({ onShutdown }: XPDesktopProps) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [payloads, setPayloads] = useState<Partial<Record<AppId, AppPayload>>>({});
  const zCounter = useRef(10);
  const openCount = useRef(0);

  const focusWindow = useCallback((id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
    setActiveId(id);
  }, []);

  const openApp = useCallback((appId: AppId, payload?: AppPayload) => {
    setStartOpen(false);
    if (payload !== undefined) setPayloads((p) => ({ ...p, [appId]: payload }));
    setWindows((ws) => {
      // singleton: focus existing instance if present
      const existing = ws.find((w) => w.appId === appId);
      if (existing) {
        zCounter.current += 1;
        setActiveId(existing.id);
        return ws.map((w) => (w.id === existing.id ? { ...w, z: zCounter.current, minimized: false } : w));
      }
      const meta = APPS[appId];
      const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
      const vh = typeof window !== "undefined" ? window.innerHeight : 800;
      const w = Math.min(meta.defaultSize.w, vw - 40);
      const h = Math.min(meta.defaultSize.h, vh - TASKBAR_HEIGHT - 20);
      const cascade = (openCount.current % 6) * 26;
      const x = Math.max(8, Math.round((vw - w) / 2) - 80 + cascade);
      const y = Math.max(8, Math.round((vh - TASKBAR_HEIGHT - h) / 2) - 40 + cascade);
      openCount.current += 1;
      zCounter.current += 1;
      const id = `${appId}-${Date.now()}`;
      const rect: Rect = { x, y, w, h };
      const inst: WindowInstance = { id, appId, title: meta.title, minimized: false, maximized: false, rect, prevRect: rect, z: zCounter.current };
      setActiveId(id);
      return [...ws, inst];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => {
      const next = ws.filter((w) => w.id !== id);
      setActiveId((cur) => {
        if (cur !== id) return cur;
        const top = next.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
        return top ? top.id : null;
      });
      return next;
    });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => {
      const next = ws.map((w) => (w.id === id ? { ...w, minimized: true } : w));
      setActiveId((cur) => {
        if (cur !== id) return cur;
        const top = next.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
        return top ? top.id : null;
      });
      return next;
    });
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    setWindows((ws) => ws.map((w) => {
      if (w.id !== id) return w;
      if (w.maximized) return { ...w, maximized: false, rect: w.prevRect };
      return { ...w, maximized: true, prevRect: w.rect, rect: { x: 0, y: 0, w: vw, h: vh - TASKBAR_HEIGHT } };
    }));
    focusWindow(id);
  }, [focusWindow]);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, rect: { ...w.rect, x, y } } : w)));
  }, []);

  const resizeWindow = useCallback((id: string, rect: Rect) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const taskClick = useCallback((id: string) => {
    setWindows((ws) => {
      const w = ws.find((x) => x.id === id);
      if (!w) return ws;
      if (w.minimized) { zCounter.current += 1; setActiveId(id); return ws.map((x) => (x.id === id ? { ...x, minimized: false, z: zCounter.current } : x)); }
      if (activeId === id) { // minimize
        const next = ws.map((x) => (x.id === id ? { ...x, minimized: true } : x));
        const top = next.filter((x) => !x.minimized).sort((a, b) => b.z - a.z)[0];
        setActiveId(top ? top.id : null);
        return next;
      }
      zCounter.current += 1; setActiveId(id);
      return ws.map((x) => (x.id === id ? { ...x, z: zCounter.current } : x));
    });
  }, [activeId]);

  const handleShutdown = useCallback(() => { setShowShutdown(false); onShutdown(); }, [onShutdown]);

  const onDesktopMouseDown = useCallback(() => { setStartOpen(false); setSelectedIcon(null); }, []);

  const desktopApi = useMemo(() => ({ openApp, payloads }), [openApp, payloads]);

  // Esc closes the start menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setStartOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <DesktopContext.Provider value={desktopApi}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        onMouseDown={onDesktopMouseDown}
      >
        {/* Wallpaper */}
        <div className="absolute inset-0" style={{ backgroundImage: "url('/assets/bliss.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#3a6ea5" }} />

        {/* Desktop icons */}
        <div className="absolute top-4 left-3 flex flex-col gap-1" onMouseDown={(e) => e.stopPropagation()}>
          {DESKTOP_ICONS.map((d) => (
            <DesktopIcon
              key={d.id}
              label={d.label}
              icon={APPS[d.id].desktopIcon(40)}
              selected={selectedIcon === d.id}
              onSelect={() => setSelectedIcon(d.id)}
              onOpen={() => openApp(d.id)}
            />
          ))}
        </div>

        {/* Windows */}
        {windows.map((w) => (
          !w.minimized && (
            <XPWindow
              key={w.id}
              win={w}
              active={activeId === w.id}
              icon={APPS[w.appId].icon(16)}
              resizable={APPS[w.appId].resizable}
              minSize={APPS[w.appId].minSize}
              onClose={() => closeWindow(w.id)}
              onMinimize={() => minimizeWindow(w.id)}
              onToggleMaximize={() => toggleMaximize(w.id)}
              onFocus={() => { if (activeId !== w.id) focusWindow(w.id); }}
              onMove={(x, y) => moveWindow(w.id, x, y)}
              onResize={(r) => resizeWindow(w.id, r)}
            >
              {APPS[w.appId].render()}
            </XPWindow>
          )
        ))}

        {/* Start menu */}
        <AnimatePresence>
          {startOpen && (
            <StartMenu onOpenApp={openApp} onClose={() => setStartOpen(false)} onShutdown={() => { setStartOpen(false); setShowShutdown(true); }} />
          )}
        </AnimatePresence>

        {/* Taskbar */}
        <Taskbar
          windows={windows}
          activeId={activeId}
          startOpen={startOpen}
          onStartClick={() => setStartOpen((s) => !s)}
          onTaskClick={taskClick}
        />

        {/* Shutdown dialog */}
        <AnimatePresence>
          {showShutdown && <ShutdownDialog onConfirm={handleShutdown} onCancel={() => setShowShutdown(false)} />}
        </AnimatePresence>

        {/* Faint global CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 200, background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.018) 3px, rgba(0,0,0,0.018) 4px)" }} />
      </motion.div>
    </DesktopContext.Provider>
  );
}

function DesktopIcon({ label, icon, selected, onSelect, onOpen }: { label: string; icon: React.ReactNode; selected: boolean; onSelect: () => void; onOpen: () => void }) {
  return (
    <button
      className="flex flex-col items-center gap-0.5 p-1.5 rounded"
      style={{ width: 82, background: "transparent", border: "1px dotted transparent", cursor: "default" }}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={onOpen}
    >
      <span style={{ filter: selected ? "drop-shadow(0 0 1px #fff)" : "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))", opacity: selected ? 0.75 : 1 }}>{icon}</span>
      <span className="text-center leading-tight" style={{
        fontSize: 11, color: "#fff", fontFamily: "Tahoma, sans-serif",
        textShadow: selected ? "none" : "1px 1px 1px rgba(0,0,0,0.9)",
        padding: "1px 3px",
        background: selected ? "#0b61d8" : "transparent",
        border: selected ? "1px dotted rgba(255,255,255,0.7)" : "1px dotted transparent",
      }}>{label}</span>
    </button>
  );
}
