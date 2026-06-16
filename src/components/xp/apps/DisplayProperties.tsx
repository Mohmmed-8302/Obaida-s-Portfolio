"use client";

import { useRef, useState, type ReactNode } from "react";
import { useDesktop } from "../DesktopContext";
import type { XpSettings } from "../types";
import { PHOTOS } from "./photos";
import { previewScreenSaver } from "../ScreenSaver";

const src = (name: string) => PHOTOS.find((p) => p.name === name)?.src ?? "";

const WALLPAPERS: { name: string; wallpaper: string }[] = [
  { name: "Bliss", wallpaper: "/assets/bliss.jpg" },
  { name: "Sunset", wallpaper: src("Sunset.jpg") },
  { name: "Mountains", wallpaper: src("Mountains.jpg") },
  { name: "Ocean", wallpaper: src("Ocean.jpg") },
  { name: "(None)", wallpaper: "" },
];

const BG_COLORS = ["#3a6ea5", "#0b5e8a", "#5a7a3a", "#6b6b6b", "#102a54", "#2d1b3d"];

const SAVERS: { value: XpSettings["screensaver"]["type"]; label: string }[] = [
  { value: "none", label: "(None)" },
  { value: "starfield", label: "Starfield" },
  { value: "mystify", label: "Mystify" },
  { value: "bliss", label: "Windows XP" },
];

const WAITS: { ms: number; label: string }[] = [
  { ms: 10000, label: "10 sec" },
  { ms: 30000, label: "30 sec" },
  { ms: 60000, label: "1 min" },
  { ms: 300000, label: "5 min" },
];

const TABS = ["Themes", "Desktop", "Screen Saver", "Appearance", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function DisplayProperties() {
  const { settings, updateSettings, closeApp } = useDesktop();
  const snapshot = useRef<XpSettings>(settings);
  const [tab, setTab] = useState<Tab>("Desktop");

  const ok = () => closeApp("display");
  const cancel = () => { updateSettings(snapshot.current); closeApp("display"); };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#ece9d8", fontFamily: "Tahoma, 'Segoe UI', sans-serif", fontSize: 11, color: "#222" }}>
      {/* Tab strip */}
      <div className="flex shrink-0" style={{ padding: "6px 8px 0", gap: 2 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "4px 9px", fontSize: 11, borderRadius: "4px 4px 0 0", cursor: "pointer",
              border: "1px solid #b0ab93", borderBottom: tab === t ? "1px solid #fff" : "1px solid #b0ab93",
              background: tab === t ? "#fff" : "#e3dfcb",
              position: "relative", top: tab === t ? 1 : 0,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto" style={{ margin: "0 8px", background: "#fff", border: "1px solid #b0ab93", borderRadius: "0 4px 4px 4px", padding: 12 }}>
        <MonitorPreview settings={settings} />
        <div style={{ marginTop: 12 }}>
          {tab === "Desktop" && <DesktopTab settings={settings} updateSettings={updateSettings} />}
          {tab === "Screen Saver" && <ScreenSaverTab settings={settings} updateSettings={updateSettings} />}
          {tab === "Settings" && <SettingsTab settings={settings} updateSettings={updateSettings} />}
          {tab === "Themes" && <ThemesTab />}
          {tab === "Appearance" && <AppearanceTab />}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end shrink-0" style={{ gap: 7, padding: "10px 12px" }}>
        <DlgBtn onClick={ok}>OK</DlgBtn>
        <DlgBtn onClick={cancel}>Cancel</DlgBtn>
        <DlgBtn onClick={ok}>Apply</DlgBtn>
      </div>
    </div>
  );
}

function MonitorPreview({ settings }: { settings: XpSettings }) {
  const bg = settings.wallpaper
    ? { backgroundImage: `url('${settings.wallpaper}')`, backgroundSize: settings.wallpaperFit === "stretch" ? "cover" : settings.wallpaperFit === "tile" ? "auto" : "contain", backgroundRepeat: settings.wallpaperFit === "tile" ? "repeat" : "no-repeat", backgroundPosition: "center", backgroundColor: settings.bgColor }
    : { background: settings.bgColor };
  const dim = (100 - settings.brightness) / 100 * 0.72;
  return (
    <div className="flex justify-center">
      <div style={{ width: 200, height: 168, position: "relative" }}>
        {/* monitor bezel */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#e7e3d3,#cfc9b2)", borderRadius: 10, border: "1px solid #a8a288", boxShadow: "inset 0 1px 2px #fff" }} />
        {/* screen */}
        <div style={{ position: "absolute", left: 18, top: 14, right: 18, height: 108, borderRadius: 3, overflow: "hidden", border: "2px solid #6f6a55", ...bg }}>
          {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dim})` }} />}
        </div>
        {/* stand */}
        <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 56, height: 18, background: "linear-gradient(#d8d3bd,#bdb79e)", borderRadius: "0 0 8px 8px" }} />
      </div>
    </div>
  );
}

function DesktopTab({ settings, updateSettings }: TabProps) {
  return (
    <Group label="Background">
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, border: "1px solid #7f9db9", height: 132, overflow: "auto", background: "#fff" }}>
          {WALLPAPERS.map((w) => {
            const sel = settings.wallpaperName === w.name;
            return (
              <button
                key={w.name}
                onClick={() => updateSettings({ wallpaper: w.wallpaper, wallpaperName: w.name })}
                className="w-full flex items-center gap-2 text-left"
                style={{ padding: "3px 8px", border: "none", fontSize: 11, cursor: "pointer", background: sel ? "#316ac5" : "transparent", color: sel ? "#fff" : "#222" }}
              >
                <span style={{ width: 14, height: 11, display: "inline-block", border: "1px solid #888", background: w.wallpaper ? `center/cover url('${w.wallpaper}')` : settings.bgColor }} />
                {w.name}
              </button>
            );
          })}
        </div>
        <div style={{ width: 130 }}>
          <Field label="Position">
            <Select
              value={settings.wallpaperFit}
              onChange={(v) => updateSettings({ wallpaperFit: v as XpSettings["wallpaperFit"] })}
              options={[{ value: "stretch", label: "Stretch" }, { value: "center", label: "Center" }, { value: "tile", label: "Tile" }]}
            />
          </Field>
          {!settings.wallpaper && (
            <Field label="Color">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {BG_COLORS.map((c) => (
                  <button key={c} onClick={() => updateSettings({ bgColor: c })}
                    style={{ width: 20, height: 16, background: c, cursor: "pointer", border: settings.bgColor === c ? "2px solid #1c3d6e" : "1px solid #888" }} />
                ))}
              </div>
            </Field>
          )}
        </div>
      </div>
    </Group>
  );
}

function ScreenSaverTab({ settings, updateSettings }: TabProps) {
  const ss = settings.screensaver;
  return (
    <>
      <Group label="Screen saver">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select
            value={ss.type}
            onChange={(v) => updateSettings({ screensaver: { ...ss, type: v as XpSettings["screensaver"]["type"] } })}
            options={SAVERS.map((s) => ({ value: s.value, label: s.label }))}
          />
          <DlgBtn onClick={() => previewScreenSaver(ss.type)} disabled={ss.type === "none"}>Preview</DlgBtn>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span>Wait:</span>
          <Select
            value={String(ss.waitMs)}
            onChange={(v) => updateSettings({ screensaver: { ...ss, waitMs: Number(v) } })}
            options={WAITS.map((w) => ({ value: String(w.ms), label: w.label }))}
          />
          <span style={{ color: "#666" }}>before activating</span>
        </div>
      </Group>
      <Group label="Monitor power">
        <Brightness settings={settings} updateSettings={updateSettings} />
      </Group>
    </>
  );
}

function SettingsTab({ settings, updateSettings }: TabProps) {
  return (
    <>
      <Group label="Screen resolution">
        <input type="range" min={0} max={3} defaultValue={2} style={{ width: 160 }} />
        <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>1280 by 1024 pixels</div>
      </Group>
      <Group label="Color quality">
        <Select value="32" onChange={() => {}} options={[{ value: "32", label: "Highest (32 bit)" }, { value: "16", label: "Medium (16 bit)" }]} />
      </Group>
      <Group label="Brightness">
        <Brightness settings={settings} updateSettings={updateSettings} />
      </Group>
    </>
  );
}

function Brightness({ settings, updateSettings }: TabProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13 }}>🔅</span>
      <input
        type="range" min={20} max={100} value={settings.brightness}
        onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
        style={{ width: 170 }}
      />
      <span style={{ fontSize: 13 }}>🔆</span>
      <span style={{ width: 34, textAlign: "right", color: "#444" }}>{settings.brightness}%</span>
    </div>
  );
}

function ThemesTab() {
  return (
    <Group label="Theme">
      <Select value="luna" onChange={() => {}} options={[{ value: "luna", label: "Windows XP" }, { value: "classic", label: "Windows Classic" }]} />
      <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
        To apply a wallpaper or screen saver, use the Desktop and Screen Saver tabs.
      </div>
    </Group>
  );
}

function AppearanceTab() {
  return (
    <Group label="Windows and buttons">
      <Select value="luna" onChange={() => {}} options={[{ value: "luna", label: "Windows XP style" }, { value: "classic", label: "Windows Classic style" }]} />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <span>Color scheme:</span>
        <Select value="blue" onChange={() => {}} options={[{ value: "blue", label: "Default (blue)" }, { value: "olive", label: "Olive Green" }, { value: "silver", label: "Silver" }]} />
      </div>
    </Group>
  );
}

/* ── shared bits ── */
interface TabProps { settings: XpSettings; updateSettings: (p: Partial<XpSettings>) => void }

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset style={{ border: "1px solid #c8c4ae", borderRadius: 3, padding: "10px 12px 12px", marginBottom: 12 }}>
      <legend style={{ padding: "0 4px", color: "#1c3d6e", fontWeight: 700 }}>{label}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 3, color: "#444" }}>{label}:</div>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ fontSize: 11, fontFamily: "Tahoma, sans-serif", padding: "1px 2px", border: "1px solid #7f9db9", background: "#fff", maxWidth: "100%" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function DlgBtn({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        fontSize: 11, fontFamily: "Tahoma, sans-serif", padding: "3px 14px", minWidth: 70,
        border: "1px solid #7f7c6b", borderRadius: 3, cursor: disabled ? "default" : "pointer",
        color: disabled ? "#9a9a8c" : "#222", background: "linear-gradient(to bottom,#fdfdfb,#e2ddc9)",
      }}
    >
      {children}
    </button>
  );
}
