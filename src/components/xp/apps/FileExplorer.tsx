"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useDesktop } from "../DesktopContext";
import type { AppId } from "../types";
import {
  FolderIcon, MyDocumentsIcon, MyComputerIcon, RecycleBinIcon, ControlPanelIcon,
  IeIcon, PaintIcon, TicTacToeIcon, MinesweeperIcon, SolitaireIcon, SnakeIcon,
  ChessIcon, BlockBreakerIcon, RacingIcon, AppIcon,
} from "../icons";

/* ── tiny drive/file glyphs local to the explorer ── */
function HardDrive({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48"><rect x="6" y="14" width="36" height="20" rx="2" fill="#d8dde3" stroke="#7c8794" strokeWidth="1.2" /><rect x="6" y="14" width="36" height="7" rx="2" fill="#eef1f4" /><circle cx="36" cy="28" r="2" fill="#46a85a" /><rect x="10" y="25" width="14" height="2" fill="#9aa3ad" /></svg>
  );
}
function Floppy({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48"><rect x="9" y="9" width="30" height="30" rx="2" fill="#2b2b2b" /><rect x="14" y="9" width="16" height="11" fill="#cfcfcf" /><rect x="24" y="11" width="4" height="7" fill="#2b2b2b" /><rect x="13" y="24" width="22" height="12" rx="1" fill="#dcdcdc" /></svg>
  );
}
function CdDrive({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48"><ellipse cx="24" cy="20" rx="15" ry="7" fill="#cdd6df" stroke="#7c8794" strokeWidth="1" /><circle cx="24" cy="20" r="3" fill="#fff" stroke="#7c8794" /><rect x="9" y="24" width="30" height="14" rx="2" fill="#d8dde3" stroke="#7c8794" strokeWidth="1" /><rect x="13" y="33" width="10" height="2" fill="#9aa3ad" /><circle cx="34" cy="34" r="1.4" fill="#46a85a" /></svg>
  );
}
function FileGlyph({ size = 32, color = "#3b7fd1" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48"><path d="M12 5 h18 l8 8 v30 a1 1 0 0 1 -1 1 H12 a1 1 0 0 1 -1 -1 V6 a1 1 0 0 1 1 -1z" fill="#fff" stroke="#9aa3ad" strokeWidth="1.2" /><path d="M30 5 v8 h8z" fill="#dde3ea" stroke="#9aa3ad" strokeWidth="1" /><rect x="15" y="20" width="18" height="2.2" fill={color} /><rect x="15" y="25" width="18" height="2.2" fill={color} /><rect x="15" y="30" width="12" height="2.2" fill={color} /></svg>
  );
}
function PictureGlyph({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48"><rect x="7" y="10" width="34" height="28" rx="2" fill="#fff" stroke="#9aa3ad" strokeWidth="1.2" /><rect x="10" y="13" width="28" height="22" fill="#bfe0ff" /><circle cx="18" cy="20" r="3" fill="#f2c233" /><path d="M10 35 L20 25 L27 32 L33 26 L38 33 v2 H10 z" fill="#46a85a" /></svg>
  );
}

type ItemKind = "drive" | "folder" | "file" | "app";
interface FsItem {
  label: string;
  icon: ReactNode;
  kind: ItemKind;
  /** folder id to navigate into */
  target?: string;
  /** app to launch */
  app?: AppId;
  detail?: string;
}
interface FsFolder {
  id: string;
  title: string;
  parent?: string;
  items: FsItem[];
}

const FS: Record<string, FsFolder> = {
  mycomputer: {
    id: "mycomputer", title: "My Computer",
    items: [
      { label: "3½ Floppy (A:)", icon: <Floppy size={32} />, kind: "drive", detail: "3½-Inch Floppy Disk" },
      { label: "Local Disk (C:)", icon: <HardDrive size={32} />, kind: "drive", target: "cdrive", detail: "Local Disk" },
      { label: "CD Drive (D:)", icon: <CdDrive size={32} />, kind: "drive", detail: "CD Drive" },
      { label: "My Documents", icon: <MyDocumentsIcon size={32} />, kind: "folder", target: "mydocuments", detail: "File Folder" },
      { label: "Control Panel", icon: <ControlPanelIcon size={32} />, kind: "folder", target: "controlpanel", detail: "System Folder" },
    ],
  },
  cdrive: {
    id: "cdrive", title: "Local Disk (C:)", parent: "mycomputer",
    items: [
      { label: "Documents and Settings", icon: <FolderIcon size={32} />, kind: "folder", target: "mydocuments", detail: "File Folder" },
      { label: "Program Files", icon: <FolderIcon size={32} />, kind: "folder", target: "programfiles", detail: "File Folder" },
      { label: "Games", icon: <FolderIcon size={32} />, kind: "folder", target: "games", detail: "File Folder" },
      { label: "WINDOWS", icon: <FolderIcon size={32} />, kind: "folder", target: "windows", detail: "File Folder" },
    ],
  },
  programfiles: {
    id: "programfiles", title: "Program Files", parent: "cdrive",
    items: [
      { label: "Internet Explorer", icon: <IeIcon size={32} />, kind: "app", app: "ie" },
      { label: "Paint", icon: <PaintIcon size={32} />, kind: "app", app: "paint" },
      { label: "Games", icon: <FolderIcon size={32} />, kind: "folder", target: "games", detail: "File Folder" },
    ],
  },
  windows: {
    id: "windows", title: "WINDOWS", parent: "cdrive",
    items: [
      { label: "system32", icon: <FolderIcon size={32} />, kind: "folder", target: "windows", detail: "File Folder" },
      { label: "Web", icon: <FolderIcon size={32} />, kind: "folder", target: "windows", detail: "File Folder" },
      { label: "notepad.exe", icon: <AppIcon size={32} />, kind: "file", detail: "Application" },
      { label: "win.ini", icon: <FileGlyph size={32} color="#888" />, kind: "file", detail: "Configuration Settings" },
    ],
  },
  mydocuments: {
    id: "mydocuments", title: "My Documents", parent: "mycomputer",
    items: [
      { label: "My Pictures", icon: <PictureGlyph size={32} />, kind: "folder", target: "mypictures", detail: "File Folder" },
      { label: "My Music", icon: <FolderIcon size={32} />, kind: "folder", target: "mydocuments", detail: "File Folder" },
      { label: "resume.doc", icon: <FileGlyph size={32} color="#2b6bb0" />, kind: "file", detail: "Microsoft Word Document" },
      { label: "about_obaida.txt", icon: <FileGlyph size={32} color="#888" />, kind: "file", detail: "Text Document" },
      { label: "Portfolio", icon: <IeIcon size={32} />, kind: "app", app: "ie", detail: "Internet Shortcut" },
    ],
  },
  mypictures: {
    id: "mypictures", title: "My Pictures", parent: "mydocuments",
    items: [
      { label: "Bliss.bmp", icon: <PictureGlyph size={32} />, kind: "file", detail: "Bitmap Image" },
      { label: "showreel_01.jpg", icon: <PictureGlyph size={32} />, kind: "file", detail: "JPEG Image" },
      { label: "logo.png", icon: <PictureGlyph size={32} />, kind: "file", detail: "PNG Image" },
    ],
  },
  controlpanel: {
    id: "controlpanel", title: "Control Panel", parent: "mycomputer",
    items: [
      { label: "Display", icon: <ControlPanelIcon size={32} />, kind: "file", detail: "Visual only" },
      { label: "Sounds and Audio", icon: <ControlPanelIcon size={32} />, kind: "file", detail: "Visual only" },
      { label: "Date and Time", icon: <ControlPanelIcon size={32} />, kind: "file", detail: "Visual only" },
      { label: "Add or Remove Programs", icon: <ControlPanelIcon size={32} />, kind: "file", detail: "Visual only" },
    ],
  },
  games: {
    id: "games", title: "Games", parent: "cdrive",
    items: [
      { label: "Tic-Tac-Toe", icon: <TicTacToeIcon size={32} />, kind: "app", app: "tictactoe" },
      { label: "Minesweeper", icon: <MinesweeperIcon size={32} />, kind: "app", app: "minesweeper" },
      { label: "Solitaire", icon: <SolitaireIcon size={32} />, kind: "app", app: "solitaire" },
      { label: "Snake", icon: <SnakeIcon size={32} />, kind: "app", app: "snake" },
      { label: "Chess", icon: <ChessIcon size={32} />, kind: "app", app: "chess" },
      { label: "Block Breaker", icon: <BlockBreakerIcon size={32} />, kind: "app", app: "blockbreaker" },
      { label: "Racing", icon: <RacingIcon size={32} />, kind: "app", app: "racing" },
    ],
  },
  recyclebin: {
    id: "recyclebin", title: "Recycle Bin",
    items: [
      { label: "old_draft.txt", icon: <FileGlyph size={32} color="#888" />, kind: "file", detail: "Text Document" },
      { label: "untitled.bmp", icon: <PictureGlyph size={32} />, kind: "file", detail: "Bitmap Image" },
    ],
  },
};

const HEADER_ICON: Record<string, ReactNode> = {
  mycomputer: <MyComputerIcon size={16} />,
  mydocuments: <MyDocumentsIcon size={16} />,
  recyclebin: <RecycleBinIcon size={16} full />,
  games: <FolderIcon size={16} open />,
};

export default function FileExplorer({ initialPath = "mycomputer" }: { initialPath?: string }) {
  const { openApp } = useDesktop();
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const current = FS[history[idx]] ?? FS.mycomputer;

  const navigate = useCallback((folderId: string) => {
    setHistory((h) => [...h.slice(0, idx + 1), folderId]);
    setIdx((i) => i + 1);
    setSelected(null);
  }, [idx]);

  const back = useCallback(() => { if (idx > 0) { setIdx((i) => i - 1); setSelected(null); } }, [idx]);
  const forward = useCallback(() => { if (idx < history.length - 1) { setIdx((i) => i + 1); setSelected(null); } }, [idx, history.length]);
  const up = useCallback(() => { if (current.parent) navigate(current.parent); }, [current.parent, navigate]);

  const openItem = useCallback((item: FsItem) => {
    if (item.kind === "app" && item.app) openApp(item.app);
    else if (item.target) navigate(item.target);
  }, [openApp, navigate]);

  const canBack = idx > 0;
  const canFwd = idx < history.length - 1;
  const canUp = !!current.parent;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, 'Segoe UI', sans-serif", background: "#fff" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-3 shrink-0 px-2" style={{ height: 20, background: "#ece9d8", fontSize: 11, color: "#333", borderBottom: "1px solid #d6d2c2" }}>
        {["File", "Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} className="px-1 cursor-default" style={{ borderRadius: 2 }}>{m}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 shrink-0 px-2" style={{ height: 32, background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <TBtn label="Back" enabled={canBack} onClick={back} green>◀</TBtn>
        <TBtn label="" enabled={canFwd} onClick={forward} green>▶</TBtn>
        <TBtn label="Up" enabled={canUp} onClick={up}>↑</TBtn>
        <div style={{ width: 1, height: 22, background: "#c9c3ad", margin: "0 3px" }} />
        <TBtn label="Search" enabled>🔍</TBtn>
        <TBtn label="Folders" enabled>📁</TBtn>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 shrink-0 px-2" style={{ height: 26, background: "#ece9d8", borderBottom: "1px solid #b8b29c" }}>
        <span style={{ fontSize: 11, color: "#777" }}>Address</span>
        <div className="flex-1 flex items-center gap-1.5 h-[19px] px-1.5" style={{ background: "#fff", border: "1px solid #7f9db9", fontSize: 12 }}>
          <span style={{ width: 14, height: 14, display: "inline-flex" }}>{HEADER_ICON[current.id] ?? <FolderIcon size={14} open />}</span>
          <span className="truncate">{current.title}</span>
        </div>
      </div>

      {/* Body: blue side pane + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side pane */}
        <div className="shrink-0 overflow-auto" style={{ width: 180, background: "linear-gradient(180deg,#7aa1e8 0%,#6a93e0 8%,#5b86d6 100%)", padding: 10 }}>
          <SidePanel title={current.id === "recyclebin" ? "Recycle Bin Tasks" : "System Tasks"}>
            <SideLink onClick={() => {}}>View system information</SideLink>
            <SideLink onClick={() => {}}>Add or remove programs</SideLink>
            <SideLink onClick={() => {}}>Change a setting</SideLink>
          </SidePanel>
          <SidePanel title="Other Places">
            <SideLink onClick={() => navigate("mycomputer")}>My Computer</SideLink>
            <SideLink onClick={() => navigate("mydocuments")}>My Documents</SideLink>
            <SideLink onClick={() => navigate("controlpanel")}>Control Panel</SideLink>
          </SidePanel>
          <SidePanel title="Details">
            <div style={{ fontSize: 11, color: "#fff", lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700 }}>{current.title}</div>
              <div style={{ opacity: 0.85 }}>{current.items.length} object{current.items.length === 1 ? "" : "s"}</div>
            </div>
          </SidePanel>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3" style={{ background: "#fff" }} onClick={() => setSelected(null)}>
          {current.items.length === 0 ? (
            <div className="h-full flex items-center justify-center" style={{ fontSize: 12, color: "#888" }}>This folder is empty.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 4, alignContent: "start" }}>
              {current.items.map((item, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 p-1.5 text-left"
                  style={{
                    borderRadius: 3,
                    background: selected === i ? "#cce0ff" : "transparent",
                    border: selected === i ? "1px solid #99c2ff" : "1px solid transparent",
                    cursor: "default",
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                  onDoubleClick={() => openItem(item)}
                >
                  <span className="shrink-0" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate" style={{ fontSize: 12, color: "#222" }}>{item.label}</span>
                    {item.detail && <span className="block truncate" style={{ fontSize: 10, color: "#888" }}>{item.detail}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center px-2" style={{ height: 20, background: "#ece9d8", borderTop: "1px solid #b8b29c", fontSize: 11, color: "#444" }}>
        <span>{selected !== null ? current.items[selected]?.label : `${current.items.length} object${current.items.length === 1 ? "" : "s"}`}</span>
        <span className="ml-auto flex items-center gap-1" style={{ color: "#666" }}>
          <span style={{ width: 12, height: 12, display: "inline-flex" }}><MyComputerIcon size={12} /></span> My Computer
        </span>
      </div>
    </div>
  );
}

function TBtn({ children, label, enabled, onClick, green }: { children: ReactNode; label: string; enabled: boolean; onClick?: () => void; green?: boolean }) {
  return (
    <button
      disabled={!enabled}
      onClick={onClick}
      className="flex items-center gap-1 px-1.5 h-[24px]"
      style={{ fontSize: 11, color: enabled ? (green ? "#1c6b2e" : "#333") : "#aaa", background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: enabled ? "pointer" : "default", whiteSpace: "nowrap" }}
      onMouseEnter={(e) => { if (enabled) { e.currentTarget.style.background = "#fce9b0"; e.currentTarget.style.border = "1px solid #e3b94e"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
    >
      <span style={{ fontSize: 12 }}>{children}</span>
      {label && <span>{label}</span>}
    </button>
  );
}

function SidePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-2.5" style={{ background: "rgba(255,255,255,0.92)", borderRadius: 4, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
      <div style={{ background: "linear-gradient(to right,#f0f4fb,#d9e4f5)", padding: "5px 9px", fontSize: 11, fontWeight: 700, color: "#2b5d99" }}>{title}</div>
      <div className="px-2 py-2 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function SideLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left" style={{ fontSize: 11, color: "#2b5d99", cursor: "pointer", background: "transparent", border: "none", padding: 0 }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
      {children}
    </button>
  );
}
