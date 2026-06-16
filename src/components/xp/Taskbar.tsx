"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import type { WindowInstance, AppId, AppPayload, XpSettings } from "./types";
import { XPFlag, IeIcon } from "./icons";
import { APPS } from "./registry";
import { usePins, addPin, removePin, type Pin } from "./storage/pinsStore";

interface TaskbarProps {
  windows: WindowInstance[];
  activeId: string | null;
  startOpen: boolean;
  settings: XpSettings;
  updateSettings: (patch: Partial<XpSettings>) => void;
  onStartClick: () => void;
  onTaskClick: (id: string) => void;
  onOpenApp: (appId: AppId, payload?: AppPayload) => void;
  onShowDesktop: () => void;
}

export const TASKBAR_HEIGHT = 30;

export default function Taskbar({ windows, activeId, startOpen, settings, updateSettings, onStartClick, onTaskClick, onOpenApp, onShowDesktop }: TaskbarProps) {
  const [time, setTime] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [tray, setTray] = useState<null | "clock" | "volume">(null);
  const [pinMenu, setPinMenu] = useState<null | { x: number; pin?: Pin }>(null);
  const [addOpen, setAddOpen] = useState(false);
  const pins = usePins();

  useEffect(() => {
    const update = () => { const d = new Date(); setNow(d); setTime(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); };
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  // Close popups on any outside click.
  useEffect(() => {
    if (!tray && !pinMenu) return;
    const close = () => { setTray(null); setPinMenu(null); };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [tray, pinMenu]);

  const openPin = (p: Pin) => onOpenApp("ie", { kind: "site", url: p.url, name: p.name });

  return (
    <>
      <div
        className="absolute bottom-0 left-0 right-0 flex items-stretch"
        style={{
          height: TASKBAR_HEIGHT, zIndex: 110,
          background: "var(--xp-taskbar, linear-gradient(to bottom,#3168d5 0%,#3a7bea 8%,#2e6adf 40%,#2361dc 88%,#1d4fc4 100%))",
          borderTop: "1px solid #1042c0",
          fontFamily: "Tahoma, 'Segoe UI', sans-serif",
        }}
      >
        {/* Start button */}
        <button
          onMouseDown={(e) => { e.stopPropagation(); onStartClick(); }}
          className="flex items-center gap-1.5 pl-2 pr-5 relative"
          style={{
            height: "100%",
            background: startOpen
              ? "linear-gradient(to bottom,#1f7a1f,#176a17 50%,#2a8a2a)"
              : "linear-gradient(to bottom,#5cb85c 0%,#3f9f3f 8%,#2f8f2f 45%,#247824 90%,#3a9a3a 100%)",
            border: "none",
            borderRadius: "0 4px 4px 0",
            color: "#fff", fontWeight: 700, fontSize: 15, fontStyle: "italic",
            letterSpacing: "0.01em", cursor: "pointer",
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            boxShadow: startOpen ? "inset 0 2px 6px rgba(0,0,0,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.4)",
            paddingTop: 1,
          }}
        >
          <XPFlag size={20} style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }} />
          <span>start</span>
        </button>

        {/* Quick Launch */}
        <div style={{ width: 1, background: "rgba(255,255,255,0.25)", margin: "4px 0 4px 4px" }} />
        <div
          className="flex items-center gap-0.5 px-1"
          onMouseDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); setTray(null); setPinMenu({ x: e.clientX }); }}
        >
          <QuickBtn title="Show Desktop" onClick={onShowDesktop}>
            <svg width="15" height="15" viewBox="0 0 16 16"><rect x="1.5" y="2" width="13" height="9" rx="1" fill="#cfe6ff" stroke="#fff" strokeWidth="0.8" /><rect x="1.5" y="11.5" width="13" height="2.5" fill="#9bc4f0" stroke="#fff" strokeWidth="0.6" /></svg>
          </QuickBtn>
          {pins.map((p) => (
            <QuickBtn
              key={p.id}
              title={p.name}
              onClick={() => openPin(p)}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setTray(null); setPinMenu({ x: e.clientX, pin: p }); }}
            >
              <PinIcon pin={p} />
            </QuickBtn>
          ))}
          <QuickBtn title="Add a web link…" onClick={() => setAddOpen(true)}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1, textShadow: "1px 1px 1px rgba(0,0,0,0.4)" }}>+</span>
          </QuickBtn>
        </div>
        <div style={{ width: 1, background: "rgba(0,0,0,0.25)", margin: "4px 4px 4px 0" }} />

        {/* Task buttons */}
        <div className="flex items-center gap-1 flex-1 px-1 overflow-hidden">
          {windows.map((w) => {
            const active = w.id === activeId && !w.minimized;
            return (
              <button
                key={w.id}
                onClick={() => onTaskClick(w.id)}
                className="flex items-center gap-1.5 px-2 h-[23px] min-w-0"
                style={{
                  flex: "1 1 0", maxWidth: 160, minWidth: 40,
                  background: active
                    ? "linear-gradient(to bottom,#1c54bf,#2a68d8 50%,#1c54bf)"
                    : "linear-gradient(to bottom,#3f86ee,#3175e6 50%,#2867dc)",
                  border: active ? "1px solid #0d3a9c" : "1px solid #4a8cf0",
                  borderRadius: 3,
                  color: "#fff", fontSize: 11.5, cursor: "pointer",
                  boxShadow: active ? "inset 1px 1px 3px rgba(0,0,0,0.45)" : "inset 0 1px 0 rgba(255,255,255,0.25)",
                  textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
                }}
              >
                <span className="shrink-0 flex items-center" style={{ width: 16, height: 16, opacity: w.minimized ? 0.85 : 1 }}>{APPS[w.appId].icon(16)}</span>
                <span className="truncate text-left flex-1" style={{ fontStyle: w.minimized ? "italic" : "normal" }}>{w.title}</span>
              </button>
            );
          })}
        </div>

        {/* System tray */}
        <div
          className="flex items-center gap-2 px-2.5"
          style={{ background: "var(--xp-tray, linear-gradient(to bottom,#138ee0 0%,#1898e8 8%,#0f7ad6 50%,#0d6ec8 100%))", borderLeft: "1px solid #0c4ea0", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.25)" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <TrayIcon title={settings.muted ? "Volume (muted)" : "Volume"} onClick={() => setTray((t) => (t === "volume" ? null : "volume"))}>
            {settings.muted ? (
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M2 6 H5 L9 3 V13 L5 10 H2 Z" fill="#fff" /><path d="M11 5 L15 11 M15 5 L11 11" stroke="#fff" strokeWidth="1.3" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M2 6 H5 L9 3 V13 L5 10 H2 Z" fill="#fff" /><path d="M11 5 a4 4 0 0 1 0 6" stroke="#fff" strokeWidth="1.3" fill="none" /></svg>
            )}
          </TrayIcon>
          <TrayIcon title="Network">
            <svg width="14" height="14" viewBox="0 0 16 16"><rect x="2" y="9" width="5" height="4" fill="#cfe6ff" stroke="#fff" strokeWidth="0.6" /><rect x="9" y="4" width="5" height="4" fill="#cfe6ff" stroke="#fff" strokeWidth="0.6" /><path d="M6 11 L9 6" stroke="#fff" strokeWidth="0.8" /></svg>
          </TrayIcon>
          <button
            onClick={() => setTray((t) => (t === "clock" ? null : "clock"))}
            style={{ color: "#fff", fontSize: 11.5, textShadow: "1px 1px 1px rgba(0,0,0,0.3)", whiteSpace: "nowrap", paddingLeft: 2, background: "transparent", border: "none", cursor: "pointer" }}
          >
            {time}
          </button>
        </div>
      </div>

      {/* Tray popups */}
      {tray === "clock" && <ClockPopup now={now} onMouseDown={(e) => e.stopPropagation()} />}
      {tray === "volume" && (
        <VolumePopup settings={settings} updateSettings={updateSettings} onMouseDown={(e) => e.stopPropagation()} />
      )}

      {/* Quick Launch context menu */}
      {pinMenu && (
        <PinMenu
          x={pinMenu.x}
          pin={pinMenu.pin}
          onAdd={() => { setPinMenu(null); setAddOpen(true); }}
          onOpen={() => { if (pinMenu.pin) openPin(pinMenu.pin); setPinMenu(null); }}
          onRemove={() => { if (pinMenu.pin) removePin(pinMenu.pin.id); setPinMenu(null); }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}

      {/* Add Web Link dialog */}
      {addOpen && <AddLinkDialog onClose={() => setAddOpen(false)} onAdd={(name, url) => { const p = addPin(name, url); setAddOpen(false); openPin(p); }} />}
    </>
  );
}

function QuickBtn({ children, title, onClick, onContextMenu }: { children: ReactNode; title: string; onClick: () => void; onContextMenu?: (e: React.MouseEvent) => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="flex items-center justify-center"
      style={{ width: 22, height: 22, background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: "pointer" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
    >
      {children}
    </button>
  );
}

function PinIcon({ pin }: { pin: Pin }) {
  if (pin.url === "portfolio") return <IeIcon size={15} />;
  const letter = (pin.name || pin.url).replace(/^https?:\/\//, "").charAt(0).toUpperCase();
  return (
    <span style={{ position: "relative", width: 15, height: 15, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="15" height="15" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#3aa0e8" stroke="#fff" strokeWidth="0.6" /></svg>
      <span style={{ position: "absolute", color: "#fff", fontSize: 9, fontWeight: 700 }}>{letter}</span>
    </span>
  );
}

function TrayIcon({ children, title, onClick }: { children: ReactNode; title: string; onClick?: () => void }) {
  return (
    <button title={title} onClick={onClick} className="flex items-center justify-center" style={{ width: 16, height: 16, background: "transparent", border: "none", cursor: onClick ? "pointer" : "default", padding: 0 }}>
      {children}
    </button>
  );
}

function ClockPopup({ now, onMouseDown }: { now: Date; onMouseDown: (e: React.MouseEvent) => void }) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="absolute" onMouseDown={onMouseDown} style={{ right: 6, bottom: TASKBAR_HEIGHT + 6, zIndex: 130, width: 196, background: "#fff", border: "1px solid #0831a8", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", fontFamily: "Tahoma, sans-serif", overflow: "hidden" }}>
      <div style={{ background: "var(--xp-menu-header,#1f60db)", color: "#fff", padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>{monthNames[m]} {y}</div>
      <div style={{ padding: 8 }}>
        <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#1c3d6e", marginBottom: 6 }}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, fontSize: 10 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontWeight: 700, color: "#888" }}>{d}</div>)}
          {cells.map((c, i) => (
            <div key={i} style={{ textAlign: "center", padding: "2px 0", borderRadius: 3, background: c === today ? "#316ac5" : "transparent", color: c === today ? "#fff" : "#222" }}>{c ?? ""}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VolumePopup({ settings, updateSettings, onMouseDown }: { settings: XpSettings; updateSettings: (p: Partial<XpSettings>) => void; onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div className="absolute" onMouseDown={onMouseDown} style={{ right: 40, bottom: TASKBAR_HEIGHT + 6, zIndex: 130, width: 84, background: "#ece9d8", border: "1px solid #0831a8", borderRadius: 5, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", fontFamily: "Tahoma, sans-serif", padding: "10px 8px" }}>
      <div style={{ fontSize: 11, textAlign: "center", marginBottom: 8, color: "#222" }}>Volume</div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <input
          type="range" min={0} max={100} value={settings.volume}
          onChange={(e) => updateSettings({ volume: Number(e.target.value), muted: false })}
          style={{ writingMode: "vertical-lr", direction: "rtl", width: 18, height: 90 }}
        />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, justifyContent: "center", cursor: "pointer", color: "#222" }}>
        <input type="checkbox" checked={settings.muted} onChange={(e) => updateSettings({ muted: e.target.checked })} /> Mute
      </label>
    </div>
  );
}

function PinMenu({ x, pin, onAdd, onOpen, onRemove, onMouseDown }: { x: number; pin?: Pin; onAdd: () => void; onOpen: () => void; onRemove: () => void; onMouseDown: (e: React.MouseEvent) => void }) {
  const left = typeof window !== "undefined" ? Math.min(x, window.innerWidth - 180) : x;
  const Item = ({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) => (
    <button className="w-full text-left" style={{ padding: "5px 18px", border: "none", background: "transparent", fontSize: 11, color: danger ? "#b01818" : "#222", cursor: "pointer" }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#316ac5"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = danger ? "#b01818" : "#222"; }}>
      {label}
    </button>
  );
  return (
    <div className="absolute" onMouseDown={onMouseDown} style={{ left, bottom: TASKBAR_HEIGHT + 2, zIndex: 130, minWidth: 160, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "3px 3px 10px rgba(0,0,0,0.35)", padding: "2px 0", fontFamily: "Tahoma, sans-serif" }}>
      {pin && <Item label="Open" onClick={onOpen} />}
      {pin && pin.url !== "portfolio" && <Item label="Remove from taskbar" onClick={onRemove} danger />}
      <Item label="Add a web link…" onClick={onAdd} />
    </div>
  );
}

function AddLinkDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, url: string) => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => {
    let u = url.trim();
    if (!u || u === "https://") return;
    if (!/^https?:\/\//i.test(u) && u !== "portfolio") u = `https://${u}`;
    onAdd(name.trim() || u, u);
  };
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 300, background: "rgba(0,0,0,0.25)" }} onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ width: 320, background: "#ece9d8", border: "1px solid #0831a8", borderRadius: "8px 8px 4px 4px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", fontFamily: "Tahoma, sans-serif", overflow: "hidden" }}>
        <div style={{ background: "var(--xp-title,#0A53C8)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "5px 8px", textShadow: "1px 1px 1px rgba(0,0,0,0.4)" }}>Add a web link to the taskbar</div>
        <div style={{ padding: 12, fontSize: 11, color: "#222" }}>
          <div style={{ marginBottom: 4 }}>Name:</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Site" style={inp} />
          <div style={{ margin: "10px 0 4px" }}>Address (URL):</div>
          <input ref={ref} value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="https://example.com" style={inp} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 14 }}>
            <DlgBtn onClick={submit}>Add</DlgBtn>
            <DlgBtn onClick={onClose}>Cancel</DlgBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", height: 22, border: "1px solid #7f9db9", fontSize: 12, padding: "0 5px", fontFamily: "Tahoma, sans-serif" };

function DlgBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, fontFamily: "Tahoma, sans-serif", padding: "3px 14px", minWidth: 68, border: "1px solid #7f7c6b", borderRadius: 3, cursor: "pointer", color: "#222", background: "linear-gradient(to bottom,#fdfdfb,#e2ddc9)" }}>
      {children}
    </button>
  );
}
