"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppId, AppPayload, Rect, WindowInstance, XpSettings } from "./xp/types";
import { APPS } from "./xp/registry";
import { DesktopContext, DEFAULT_SETTINGS } from "./xp/DesktopContext";
import XPWindow from "./xp/XPWindow";
import Taskbar, { TASKBAR_HEIGHT } from "./xp/Taskbar";
import StartMenu from "./xp/StartMenu";
import ScreenSaver from "./xp/ScreenSaver";
import ShutdownDialog from "./ShutdownDialog";

const SETTINGS_KEY = "xp.settings";
const ICON_POS_KEY = "xp.iconPositions";
const GRID_W = 82;
const GRID_H = 78;
const GRID_PAD_X = 8;
const GRID_PAD_Y = 8;

function loadSettings(): XpSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<XpSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed, screensaver: { ...DEFAULT_SETTINGS.screensaver, ...parsed.screensaver } };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

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

type IconPositions = Record<string, { x: number; y: number }>;

function computeDefaultPositions(vw: number, vh: number): IconPositions {
  const usableH = vh - TASKBAR_HEIGHT - GRID_PAD_Y * 2;
  const rows = Math.max(1, Math.floor(usableH / GRID_H));
  const pos: IconPositions = {};
  DESKTOP_ICONS.forEach((d, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    pos[d.id] = { x: GRID_PAD_X + col * GRID_W, y: GRID_PAD_Y + row * GRID_H };
  });
  return pos;
}

function loadIconPositions(): IconPositions | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ICON_POS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IconPositions;
  } catch { return null; }
}

function snapToGrid(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round(x / GRID_W) * GRID_W + GRID_PAD_X),
    y: Math.max(0, Math.round(y / GRID_H) * GRID_H + GRID_PAD_Y),
  };
}

export default function XPDesktop({ onShutdown }: XPDesktopProps) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [payloads, setPayloads] = useState<Partial<Record<AppId, AppPayload>>>({});
  const [settings, setSettings] = useState<XpSettings>(loadSettings);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [iconPositions, setIconPositions] = useState<IconPositions>(() => {
    const saved = loadIconPositions();
    if (saved && Object.keys(saved).length >= DESKTOP_ICONS.length) return saved;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    return computeDefaultPositions(vw, vh);
  });
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number; currentX: number; currentY: number } | null>(null);
  const zCounter = useRef(10);
  const openCount = useRef(0);

  const updateSettings = useCallback((patch: Partial<XpSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined") {
        try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      }
      return next;
    });
  }, []);

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
      const title = titleFor(APPS[appId].title, payload);
      // singleton: focus existing instance if present (and relabel for the new doc)
      const existing = ws.find((w) => w.appId === appId);
      if (existing) {
        zCounter.current += 1;
        setActiveId(existing.id);
        return ws.map((w) => (w.id === existing.id ? { ...w, z: zCounter.current, minimized: false, title } : w));
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
      const inst: WindowInstance = { id, appId, title, minimized: false, maximized: false, rect, prevRect: rect, z: zCounter.current };
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

  const closeApp = useCallback((appId: AppId) => {
    setWindows((ws) => ws.filter((w) => w.appId !== appId));
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

  const onDesktopMouseDown = useCallback(() => { setStartOpen(false); setSelectedIcon(null); setCtxMenu(null); }, []);

  const onDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setStartOpen(false);
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const desktopApi = useMemo(() => ({ openApp, closeApp, payloads, settings, updateSettings }), [openApp, closeApp, payloads, settings, updateSettings]);

  // Persist icon positions
  useEffect(() => {
    try { window.localStorage.setItem(ICON_POS_KEY, JSON.stringify(iconPositions)); } catch { /* ignore */ }
  }, [iconPositions]);

  // Drag move/up handlers (attached to window during drag)
  useEffect(() => {
    if (!dragging) return;
    const maxX = window.innerWidth - GRID_W;
    const maxY = window.innerHeight - TASKBAR_HEIGHT - GRID_H;
    const onMove = (e: MouseEvent) => {
      setDragging((d) => {
        if (!d) return null;
        const x = Math.max(0, Math.min(e.clientX - d.offsetX, maxX));
        const y = Math.max(0, Math.min(e.clientY - d.offsetY, maxY));
        return { ...d, currentX: x, currentY: y };
      });
    };
    const onUp = (e: MouseEvent) => {
      const rawX = Math.max(0, Math.min(e.clientX - dragging.offsetX, maxX));
      const rawY = Math.max(0, Math.min(e.clientY - dragging.offsetY, maxY));
      const snapped = snapToGrid(rawX, rawY);
      snapped.y = Math.min(snapped.y, maxY);
      setIconPositions((prev) => ({ ...prev, [dragging.id]: snapped }));
      setDragging(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const onIconDragStart = useCallback((id: string, e: React.MouseEvent) => {
    const pos = iconPositions[id];
    if (!pos) return;
    setDragging({ id, offsetX: e.clientX - pos.x, offsetY: e.clientY - pos.y, currentX: pos.x, currentY: pos.y });
  }, [iconPositions]);

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
        onContextMenu={onDesktopContextMenu}
      >
        {/* Wallpaper (driven by Display Properties settings) */}
        <div className="absolute inset-0" style={wallpaperStyle(settings)} />

        {/* Desktop icons — absolutely positioned, draggable */}
        {DESKTOP_ICONS.map((d) => {
          const isDragging = dragging?.id === d.id;
          const pos = isDragging ? { x: dragging.currentX, y: dragging.currentY } : iconPositions[d.id] ?? { x: 0, y: 0 };
          return (
            <DesktopIcon
              key={d.id}
              label={d.label}
              icon={APPS[d.id].desktopIcon(40)}
              selected={selectedIcon === d.id}
              isDragging={isDragging}
              x={pos.x}
              y={pos.y}
              onMouseDown={(e) => { e.stopPropagation(); setSelectedIcon(d.id); onIconDragStart(d.id, e); }}
              onOpen={() => openApp(d.id)}
            />
          );
        })}

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

        {/* Desktop right-click menu */}
        {ctxMenu && (
          <DesktopMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            onClose={() => setCtxMenu(null)}
            onProperties={() => { setCtxMenu(null); openApp("display"); }}
          />
        )}

        {/* Brightness dimmer (above windows + taskbar, below scanlines) */}
        {settings.brightness < 100 && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 190, background: `rgba(0,0,0,${((100 - settings.brightness) / 100) * 0.72})` }} />
        )}

        {/* Faint global CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 200, background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.018) 3px, rgba(0,0,0,0.018) 4px)" }} />

        {/* Screen saver (idle-triggered, dismissed on input) */}
        <ScreenSaver settings={settings.screensaver} />
      </motion.div>
    </DesktopContext.Provider>
  );
}

/** Title bar text, incorporating the open document's filename when present. */
function titleFor(base: string, payload?: AppPayload): string {
  if (payload && payload.kind === "doc" && payload.name) {
    const dash = base.indexOf("—");
    const suffix = dash >= 0 ? base.slice(dash + 1).trim() : base;
    return `${payload.name} — ${suffix}`;
  }
  return base;
}

/** Background style for the desktop wallpaper, per Display Properties settings. */
function wallpaperStyle(s: XpSettings): React.CSSProperties {
  const base: React.CSSProperties = { backgroundColor: s.bgColor };
  if (!s.wallpaper) return base;
  if (s.wallpaperFit === "tile") {
    return { ...base, backgroundImage: `url('${s.wallpaper}')`, backgroundRepeat: "repeat" };
  }
  if (s.wallpaperFit === "center") {
    return { ...base, backgroundImage: `url('${s.wallpaper}')`, backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "auto" };
  }
  return { ...base, backgroundImage: `url('${s.wallpaper}')`, backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover" };
}

function DesktopMenu({ x, y, onClose, onProperties }: { x: number; y: number; onClose: () => void; onProperties: () => void }) {
  // Keep the menu on-screen.
  const left = typeof window !== "undefined" ? Math.min(x, window.innerWidth - 170) : x;
  const top = typeof window !== "undefined" ? Math.min(y, window.innerHeight - 180) : y;
  const Item = ({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) => (
    <button
      className="w-full text-left"
      style={{ padding: "4px 22px", border: "none", background: "transparent", fontSize: 11, color: disabled ? "#9aa0aa" : "#222", cursor: disabled ? "default" : "pointer" }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "#316ac5"; e.currentTarget.style.color = "#fff"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = disabled ? "#9aa0aa" : "#222"; }}
    >
      {label}
    </button>
  );
  const Sep = () => <div style={{ height: 1, background: "#d6d2c2", margin: "3px 2px" }} />;
  return (
    <div
      className="absolute"
      style={{ left, top, zIndex: 150, minWidth: 160, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "3px 3px 10px rgba(0,0,0,0.35)", padding: "2px 0", fontFamily: "Tahoma, sans-serif" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Item label="Arrange Icons By" disabled />
      <Item label="Refresh" onClick={onClose} />
      <Sep />
      <Item label="Paste" disabled />
      <Item label="New" disabled />
      <Sep />
      <Item label="Properties" onClick={onProperties} />
    </div>
  );
}

function DesktopIcon({ label, icon, selected, isDragging, x, y, onMouseDown, onOpen }: {
  label: string; icon: React.ReactNode; selected: boolean; isDragging: boolean;
  x: number; y: number; onMouseDown: (e: React.MouseEvent) => void; onOpen: () => void;
}) {
  return (
    <button
      className="absolute flex flex-col items-center gap-0.5 p-1.5 rounded"
      style={{
        width: GRID_W, left: x, top: y, zIndex: isDragging ? 100 : 1,
        background: "transparent", border: "1px dotted transparent", cursor: "default",
        opacity: isDragging ? 0.7 : 1,
      }}
      onMouseDown={onMouseDown}
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
