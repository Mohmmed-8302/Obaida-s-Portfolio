"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { AppId } from "./types";
import { APPS } from "./registry";
import {
  MyComputerIcon, MyDocumentsIcon, ControlPanelIcon, HelpIcon, SearchIcon, RunIcon,
  TurnOffIcon, LogOffIcon, FolderIcon,
} from "./icons";

interface StartMenuProps {
  onOpenApp: (id: AppId) => void;
  onClose: () => void;
  onShutdown: () => void;
}

const PINNED: AppId[] = ["ie", "paint", "mycomputer"];
const FREQUENT: AppId[] = ["minesweeper", "solitaire", "tictactoe", "snake"];
const ALL_GAMES: AppId[] = ["tictactoe", "minesweeper", "solitaire", "snake", "chess", "blockbreaker", "racing"];
const ALL_PROGRAMS: AppId[] = ["ie", "paint", "mycomputer", "mydocuments"];

export default function StartMenu({ onOpenApp, onClose, onShutdown }: StartMenuProps) {
  const [showAll, setShowAll] = useState(false);

  const open = (id: AppId) => { onOpenApp(id); onClose(); };

  return (
    <motion.div
      className="absolute"
      style={{ bottom: 30, left: 0, zIndex: 120, width: 380, fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}
      initial={{ y: 24, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 24, opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div style={{ border: "1px solid #0831a8", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "4px 4px 18px rgba(0,0,0,0.5)" }}>
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3" style={{ height: 58, background: "linear-gradient(to bottom,#1f60db 0%,#3f8af0 45%,#2870e6 55%,#13409e 100%)", borderBottom: "2px solid #f5b840" }}>
          <div style={{ width: 38, height: 38, borderRadius: 5, overflow: "hidden", border: "2px solid rgba(255,255,255,0.7)", background: "linear-gradient(135deg,#c97a8a,#8a3e51)", display: "flex", alignItems: "flex-end", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            <svg width="34" height="30" viewBox="0 0 34 30"><circle cx="17" cy="11" r="7" fill="#fff" opacity="0.95" /><path d="M3 30 c0-9 7-13 14-13 s14 4 14 13z" fill="#fff" opacity="0.95" /></svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>Obaida</span>
        </div>

        {/* Two panes */}
        <div className="flex" style={{ background: "#fff" }}>
          {/* Left pane */}
          <div className="relative" style={{ width: 196, background: "#fff", padding: "6px 0" }}>
            {PINNED.map((id) => <MenuRow key={id} icon={APPS[id].icon(26)} label={shortTitle(id)} onClick={() => open(id)} bold />)}
            <Divider />
            {FREQUENT.map((id) => <MenuRow key={id} icon={APPS[id].icon(26)} label={shortTitle(id)} small onClick={() => open(id)} />)}
            <Divider />
            {/* All Programs */}
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5"
              style={{ fontSize: 12, fontWeight: 700, color: "#13409e", background: showAll ? "#316ac5" : "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={() => setShowAll(true)}
              onClick={() => setShowAll((v) => !v)}
            >
              <span style={{ color: showAll ? "#fff" : "#13409e" }}>All Programs</span>
              <span style={{ marginLeft: "auto", color: showAll ? "#fff" : "#13409e" }}>▸</span>
            </button>

            {/* All Programs flyout */}
            {showAll && (
              <div
                className="absolute"
                style={{ left: 188, bottom: 0, width: 198, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "3px 3px 10px rgba(0,0,0,0.35)", padding: "4px 0", zIndex: 5 }}
                onMouseLeave={() => setShowAll(false)}
              >
                <FlyHeader>Games</FlyHeader>
                {ALL_GAMES.map((id) => <MenuRow key={id} icon={APPS[id].icon(22)} label={APPS[id].title} small onClick={() => open(id)} />)}
                <Divider />
                {ALL_PROGRAMS.map((id) => <MenuRow key={id} icon={APPS[id].icon(22)} label={shortTitle(id)} small onClick={() => open(id)} />)}
              </div>
            )}
          </div>

          {/* Right pane */}
          <div style={{ width: 184, background: "linear-gradient(to bottom,#d3e5fa,#cfe0f7)", padding: "6px 0", borderLeft: "1px solid #b5cbe8" }}>
            <MenuRow icon={<MyDocumentsIcon size={24} />} label="My Documents" onClick={() => open("mydocuments")} right bold />
            <MenuRow icon={<MyComputerIcon size={24} />} label="My Computer" onClick={() => open("mycomputer")} right bold />
            <MenuRow icon={<FolderIcon size={24} />} label="Games" onClick={() => open("games")} right />
            <DividerBlue />
            <MenuRow icon={<ControlPanelIcon size={24} />} label="Control Panel" onClick={() => {}} right disabled />
            <MenuRow icon={<HelpIcon size={24} />} label="Help and Support" onClick={() => {}} right disabled />
            <MenuRow icon={<SearchIcon size={24} />} label="Search" onClick={() => {}} right disabled />
            <MenuRow icon={<RunIcon size={24} />} label="Run..." onClick={() => {}} right disabled />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-4" style={{ height: 40, background: "linear-gradient(to bottom,#3f8af0,#1f60db 40%,#13409e)", borderTop: "1px solid #5a93ec" }}>
          <FooterBtn icon={<LogOffIcon size={26} />} label="Log Off" onClick={onShutdown} />
          <FooterBtn icon={<TurnOffIcon size={26} />} label="Turn Off Computer" onClick={onShutdown} />
        </div>
      </div>
    </motion.div>
  );
}

function shortTitle(id: AppId): string {
  const map: Partial<Record<AppId, string>> = { ie: "Internet Explorer", paint: "Paint", mycomputer: "My Computer", mydocuments: "My Documents" };
  return map[id] ?? APPS[id].title;
}

function MenuRow({ icon, label, onClick, bold, small, right, disabled }: { icon: ReactNode; label: string; onClick: () => void; bold?: boolean; small?: boolean; right?: boolean; disabled?: boolean }) {
  return (
    <button
      className="w-full flex items-center gap-2.5 text-left"
      style={{ padding: small ? "3px 12px" : "5px 12px", border: "none", background: "transparent", cursor: disabled ? "default" : "pointer", color: disabled ? "#7d8aa0" : right ? "#0b2e6b" : "#222" }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "#2f71d8"; e.currentTarget.style.color = "#fff"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = disabled ? "#7d8aa0" : right ? "#0b2e6b" : "#222"; }}
    >
      <span className="shrink-0 flex items-center justify-center" style={{ width: small ? 22 : 28, height: small ? 22 : 28 }}>{icon}</span>
      <span className="truncate" style={{ fontSize: small ? 11.5 : 12, fontWeight: bold ? 700 : 400 }}>{label}</span>
    </button>
  );
}

function FooterBtn({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="flex items-center gap-1.5 px-1.5 py-0.5" style={{ background: "transparent", border: "1px solid transparent", borderRadius: 4, cursor: "pointer", color: "#fff" }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}>
      <span style={{ width: 26, height: 26, display: "inline-flex" }}>{icon}</span>
      <span style={{ fontSize: 11.5, textShadow: "1px 1px 1px rgba(0,0,0,0.4)" }}>{label}</span>
    </button>
  );
}

const Divider = () => <div style={{ height: 1, background: "#dfe6ef", margin: "5px 10px" }} />;
const DividerBlue = () => <div style={{ height: 1, background: "#b5cbe8", margin: "5px 10px" }} />;
function FlyHeader({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 12px 1px" }}>{children}</div>;
}
