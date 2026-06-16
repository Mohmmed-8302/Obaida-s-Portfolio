"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useDesktop } from "../DesktopContext";
import type { AppId, AppPayload, DocType } from "../types";
import {
  FolderIcon, MyDocumentsIcon, MyComputerIcon, RecycleBinIcon, ControlPanelIcon,
  IeIcon, PaintIcon, TicTacToeIcon, MinesweeperIcon, SolitaireIcon, SnakeIcon,
  ChessIcon, BlockBreakerIcon, RacingIcon, AppIcon,
  WordIcon, ExcelIcon, PowerPointIcon, NotepadIcon, FlappyBirdIcon,
} from "../icons";
import { PHOTOS, photoIndexByName } from "./photos";
import {
  useFiles, useRecycleBin, createFile, deleteFile, restoreFile, renameFile,
  permanentlyDelete, emptyRecycleBin, appForDoc, type DocFile,
} from "../fileStore";
import { play } from "../storage/sound";

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
/** Live thumbnail of an actual photo, framed like an XP picture file. */
function Thumb({ src }: { src: string }) {
  return (
    <span style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #9aa3ad", padding: 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }} />
    </span>
  );
}

type ItemKind = "drive" | "folder" | "file" | "app";
interface FsItem {
  label: string;
  icon: ReactNode;
  kind: ItemKind;
  /** folder id to navigate into */
  target?: string;
  /** app to launch (works for kind "app" and openable "file"s) */
  app?: AppId;
  /** optional data handed to the launched app (photo to view, doc text…) */
  payload?: AppPayload;
  detail?: string;
  /** present for user files in fileStore — enables rename/delete/restore. */
  docId?: string;
}
interface FsFolder {
  id: string;
  title: string;
  parent?: string;
  items: FsItem[];
}

/* Static system folders. User documents and recycle-bin contents are merged in
   dynamically from fileStore. */
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
      { label: "Microsoft Office", icon: <FolderIcon size={32} />, kind: "folder", target: "msoffice", detail: "File Folder" },
      { label: "Internet Explorer", icon: <IeIcon size={32} />, kind: "app", app: "ie" },
      { label: "Paint", icon: <PaintIcon size={32} />, kind: "app", app: "paint" },
      { label: "Notepad", icon: <NotepadIcon size={32} />, kind: "app", app: "notepad" },
      { label: "Games", icon: <FolderIcon size={32} />, kind: "folder", target: "games", detail: "File Folder" },
    ],
  },
  msoffice: {
    id: "msoffice", title: "Microsoft Office", parent: "programfiles",
    items: [
      { label: "Microsoft Word", icon: <WordIcon size={32} />, kind: "app", app: "word" },
      { label: "Microsoft Excel", icon: <ExcelIcon size={32} />, kind: "app", app: "excel" },
      { label: "Microsoft PowerPoint", icon: <PowerPointIcon size={32} />, kind: "app", app: "powerpoint" },
    ],
  },
  windows: {
    id: "windows", title: "WINDOWS", parent: "cdrive",
    items: [
      { label: "system32", icon: <FolderIcon size={32} />, kind: "folder", target: "windows", detail: "File Folder" },
      { label: "Web", icon: <FolderIcon size={32} />, kind: "folder", target: "windows", detail: "File Folder" },
      { label: "notepad.exe", icon: <AppIcon size={32} />, kind: "app", app: "notepad", detail: "Application" },
      { label: "win.ini", icon: <FileGlyph size={32} color="#888" />, kind: "file", detail: "Configuration Settings" },
    ],
  },
  mydocuments: {
    id: "mydocuments", title: "My Documents", parent: "mycomputer",
    items: [
      { label: "My Pictures", icon: <PictureGlyph size={32} />, kind: "folder", target: "mypictures", detail: "File Folder" },
      { label: "My Music", icon: <FolderIcon size={32} />, kind: "folder", target: "mymusic", detail: "File Folder" },
      { label: "Portfolio", icon: <IeIcon size={32} />, kind: "app", app: "ie", detail: "Internet Shortcut" },
    ],
  },
  mymusic: {
    id: "mymusic", title: "My Music", parent: "mydocuments",
    items: [{ label: "sample.wma", icon: <FileGlyph size={32} color="#6a4caf" />, kind: "file", detail: "Windows Media Audio" }],
  },
  mypictures: {
    id: "mypictures", title: "My Pictures", parent: "mydocuments",
    items: PHOTOS.map((p) => ({
      label: p.name,
      icon: <Thumb src={p.src} />,
      kind: "file" as ItemKind,
      app: "photoviewer" as AppId,
      payload: { kind: "photo", index: photoIndexByName(p.name), name: p.name } as AppPayload,
      detail: p.detail,
    })),
  },
  controlpanel: {
    id: "controlpanel", title: "Control Panel", parent: "mycomputer",
    items: [
      { label: "Display", icon: <ControlPanelIcon size={32} />, kind: "app", app: "display", detail: "Customize your desktop" },
      { label: "Sounds and Audio", icon: <ControlPanelIcon size={32} />, kind: "app", app: "display", detail: "Change sound settings" },
      { label: "Date and Time", icon: <ControlPanelIcon size={32} />, kind: "file", detail: "Set the date and time" },
      { label: "Add or Remove Programs", icon: <ControlPanelIcon size={32} />, kind: "file", detail: "Install or remove programs" },
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
      { label: "Flappy Bird", icon: <FlappyBirdIcon size={32} />, kind: "app", app: "flappybird" },
    ],
  },
  recyclebin: { id: "recyclebin", title: "Recycle Bin", items: [] },
};

const HEADER_ICON: Record<string, ReactNode> = {
  mycomputer: <MyComputerIcon size={16} />,
  mydocuments: <MyDocumentsIcon size={16} />,
  recyclebin: <RecycleBinIcon size={16} full />,
  games: <FolderIcon size={16} open />,
};

const DOC_DETAIL: Record<DocType, string> = {
  text: "Text Document",
  word: "Microsoft Word Document",
  excel: "Microsoft Excel Worksheet",
  powerpoint: "Microsoft PowerPoint Presentation",
};

function docIcon(type: DocType, size = 32): ReactNode {
  switch (type) {
    case "word": return <WordIcon size={size} />;
    case "excel": return <ExcelIcon size={size} />;
    case "powerpoint": return <PowerPointIcon size={size} />;
    default: return <FileGlyph size={size} color="#888" />;
  }
}

function fileToItem(f: DocFile): FsItem {
  return {
    label: f.name,
    icon: docIcon(f.type),
    kind: "file",
    app: appForDoc(f.type),
    payload: { kind: "doc", docId: f.id, docType: f.type, name: f.name, content: f.content },
    detail: DOC_DETAIL[f.type],
    docId: f.id,
  };
}

const NEW_TYPES: { label: string; type: DocType | "bitmap" }[] = [
  { label: "Text Document", type: "text" },
  { label: "Microsoft Word Document", type: "word" },
  { label: "Microsoft Excel Worksheet", type: "excel" },
  { label: "Microsoft PowerPoint Presentation", type: "powerpoint" },
  { label: "Bitmap Image", type: "bitmap" },
];

export default function FileExplorer({ initialPath = "mycomputer" }: { initialPath?: string }) {
  const { openApp, notify } = useDesktop();
  const files = useFiles();
  const bin = useRecycleBin();
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fileMenu, setFileMenu] = useState(false);
  const [ctx, setCtx] = useState<null | { x: number; y: number; item?: FsItem }>(null);
  const [editing, setEditing] = useState<{ docId: string; value: string } | null>(null);
  const [props, setProps] = useState<DocFile | null>(null);

  const folderId = history[idx] ?? "mycomputer";
  const base = FS[folderId] ?? FS.mycomputer;

  // Merge dynamic fileStore content into the relevant folders.
  const items: FsItem[] =
    folderId === "mydocuments" ? [...base.items, ...files.map(fileToItem)]
    : folderId === "recyclebin" ? bin.map(fileToItem)
    : base.items;

  const current = { ...base, items };
  const canCreate = folderId === "mydocuments";
  const isBin = folderId === "recyclebin";

  const navigate = useCallback((id: string) => {
    setHistory((h) => [...h.slice(0, idx + 1), id]);
    setIdx((i) => i + 1);
    setSelected(null);
  }, [idx]);

  const back = useCallback(() => { if (idx > 0) { setIdx((i) => i - 1); setSelected(null); } }, [idx]);
  const forward = useCallback(() => { if (idx < history.length - 1) { setIdx((i) => i + 1); setSelected(null); } }, [idx, history.length]);
  const up = useCallback(() => { if (base.parent) navigate(base.parent); }, [base.parent, navigate]);

  const openItem = useCallback((item: FsItem) => {
    if (isBin) return; // can't open from the bin; use the context menu to restore
    if (item.app) openApp(item.app, item.payload);
    else if (item.target) navigate(item.target);
  }, [openApp, navigate, isBin]);

  const createNew = useCallback((type: DocType | "bitmap") => {
    setFileMenu(false); setCtx(null);
    if (type === "bitmap") { openApp("paint"); return; }
    const f = createFile(type);
    openApp(appForDoc(type), { kind: "doc", docId: f.id, docType: type, name: f.name, content: f.content });
    notify("File created", `“${f.name}” was created in My Documents.`);
  }, [openApp, notify]);

  const doDelete = useCallback((item: FsItem) => {
    if (!item.docId) return;
    deleteFile(item.docId);
    play("trash");
    notify("Deleted", `“${item.label}” was moved to the Recycle Bin.`);
    setCtx(null); setSelected(null);
  }, [notify]);

  const doRestore = useCallback((item: FsItem) => {
    if (!item.docId) return;
    restoreFile(item.docId);
    notify("Restored", `“${item.label}” was restored to My Documents.`);
    setCtx(null); setSelected(null);
  }, [notify]);

  // Close menus on outside interaction.
  useEffect(() => {
    if (!ctx && !fileMenu) return;
    const close = () => { setCtx(null); setFileMenu(false); };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [ctx, fileMenu]);

  const canBack = idx > 0;
  const canFwd = idx < history.length - 1;
  const canUp = !!base.parent;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, 'Segoe UI', sans-serif", background: "#fff" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-3 shrink-0 px-2 relative" style={{ height: 20, background: "#ece9d8", fontSize: 11, color: "#333", borderBottom: "1px solid #d6d2c2" }} onMouseDown={(e) => e.stopPropagation()}>
        <span
          className="px-1 cursor-default"
          style={{ borderRadius: 2, background: fileMenu ? "#316ac5" : "transparent", color: fileMenu ? "#fff" : "#333" }}
          onClick={() => setFileMenu((v) => !v)}
        >File</span>
        {["Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} className="px-1 cursor-default" style={{ borderRadius: 2 }}>{m}</span>
        ))}
        {fileMenu && (
          <div className="absolute" style={{ top: 20, left: 6, zIndex: 40, minWidth: 230, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "2px 2px 8px rgba(0,0,0,0.3)", fontSize: 11, padding: "2px 0" }}>
            {canCreate && <MenuHeader>New</MenuHeader>}
            {canCreate && NEW_TYPES.map((n) => (
              <MenuRow key={n.label} icon={n.type === "bitmap" ? <PaintIcon size={16} /> : docIcon(n.type as DocType, 16)} label={n.label} onClick={() => createNew(n.type)} />
            ))}
            {isBin && <MenuRow label="Empty Recycle Bin" onClick={() => { emptyRecycleBin(); play("trash"); notify("Recycle Bin", "The Recycle Bin is now empty."); setFileMenu(false); }} />}
            {!canCreate && !isBin && <MenuRow label="(No actions here)" disabled onClick={() => {}} />}
          </div>
        )}
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
          {isBin ? (
            <SidePanel title="Recycle Bin Tasks">
              <SideLink onClick={() => { emptyRecycleBin(); play("trash"); notify("Recycle Bin", "The Recycle Bin is now empty."); }}>Empty the Recycle Bin</SideLink>
              {selected !== null && current.items[selected]?.docId && (
                <SideLink onClick={() => doRestore(current.items[selected])}>Restore this item</SideLink>
              )}
            </SidePanel>
          ) : (
            <SidePanel title={canCreate ? "File and Folder Tasks" : "System Tasks"}>
              {canCreate && <SideLink onClick={() => createNew("text")}>Make a new document</SideLink>}
              <SideLink onClick={() => openApp("display")}>Change a setting</SideLink>
              <SideLink onClick={() => navigate("controlpanel")}>Add or remove programs</SideLink>
            </SidePanel>
          )}
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
        <div
          className="flex-1 overflow-auto p-3"
          style={{ background: "#fff" }}
          onClick={() => setSelected(null)}
          onContextMenu={(e) => {
            if (!canCreate && !isBin) return;
            e.preventDefault();
            setFileMenu(false);
            setCtx({ x: e.clientX, y: e.clientY });
          }}
        >
          {current.items.length === 0 ? (
            <div className="h-full flex items-center justify-center" style={{ fontSize: 12, color: "#888" }}>
              {isBin ? "The Recycle Bin is empty." : "This folder is empty."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 4, alignContent: "start" }}>
              {current.items.map((item, i) => (
                <button
                  key={item.docId ?? `${item.label}-${i}`}
                  className="flex items-center gap-2 p-1.5 text-left"
                  style={{
                    borderRadius: 3,
                    background: selected === i ? "#cce0ff" : "transparent",
                    border: selected === i ? "1px solid #99c2ff" : "1px solid transparent",
                    cursor: "default",
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                  onDoubleClick={() => openItem(item)}
                  onContextMenu={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setSelected(i); setFileMenu(false);
                    setCtx({ x: e.clientX, y: e.clientY, item });
                  }}
                >
                  <span className="shrink-0" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
                  <span className="min-w-0">
                    {editing && editing.docId === item.docId ? (
                      <input
                        autoFocus
                        value={editing.value}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditing({ docId: editing.docId, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { renameFile(editing.docId, editing.value.trim() || item.label); setEditing(null); }
                          else if (e.key === "Escape") setEditing(null);
                        }}
                        onBlur={() => { renameFile(editing.docId, editing.value.trim() || item.label); setEditing(null); }}
                        style={{ fontSize: 12, border: "1px solid #316ac5", padding: "0 2px", width: "100%" }}
                      />
                    ) : (
                      <span className="block truncate" style={{ fontSize: 12, color: "#222" }}>{item.label}</span>
                    )}
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

      {/* Right-click context menu */}
      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          item={ctx.item}
          isBin={isBin}
          canCreate={canCreate}
          onMouseDown={(e) => e.stopPropagation()}
          onOpen={() => { if (ctx.item) openItem(ctx.item); setCtx(null); }}
          onRename={() => { if (ctx.item?.docId) setEditing({ docId: ctx.item.docId, value: ctx.item.label }); setCtx(null); }}
          onDelete={() => { if (ctx.item) doDelete(ctx.item); }}
          onRestore={() => { if (ctx.item) doRestore(ctx.item); }}
          onPermDelete={() => { if (ctx.item?.docId) { permanentlyDelete(ctx.item.docId); play("trash"); } setCtx(null); }}
          onProperties={() => { const f = files.concat(bin).find((x) => x.id === ctx.item?.docId); if (f) setProps(f); setCtx(null); }}
          onNew={createNew}
          onEmptyBin={() => { emptyRecycleBin(); play("trash"); notify("Recycle Bin", "The Recycle Bin is now empty."); setCtx(null); }}
        />
      )}

      {/* Properties dialog */}
      {props && <PropertiesDialog file={props} onClose={() => setProps(null)} />}
    </div>
  );
}

function ContextMenu(props: {
  x: number; y: number; item?: FsItem; isBin: boolean; canCreate: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onOpen: () => void; onRename: () => void; onDelete: () => void; onRestore: () => void;
  onPermDelete: () => void; onProperties: () => void; onNew: (t: DocType | "bitmap") => void; onEmptyBin: () => void;
}) {
  const { x, y, item, isBin, canCreate } = props;
  const left = typeof window !== "undefined" ? Math.min(x, window.innerWidth - 200) : x;
  const top = typeof window !== "undefined" ? Math.min(y, window.innerHeight - 220) : y;
  const userFile = !!item?.docId;
  return (
    <div className="absolute" onMouseDown={props.onMouseDown} style={{ left, top, zIndex: 60, minWidth: 184, background: "#fff", border: "1px solid #8a8a8a", boxShadow: "3px 3px 10px rgba(0,0,0,0.35)", padding: "2px 0", fontFamily: "Tahoma, sans-serif" }}>
      {item && !isBin && <MenuRow label="Open" bold onClick={props.onOpen} />}
      {item && !isBin && userFile && <MenuRow label="Rename" onClick={props.onRename} />}
      {item && !isBin && userFile && <MenuRow label="Delete" onClick={props.onDelete} />}
      {item && isBin && <MenuRow label="Restore" bold onClick={props.onRestore} />}
      {item && isBin && <MenuRow label="Delete permanently" onClick={props.onPermDelete} />}
      {item && userFile && <Sep />}
      {item && userFile && <MenuRow label="Properties" onClick={props.onProperties} />}
      {!item && canCreate && (
        <>
          <MenuHeader>New</MenuHeader>
          {NEW_TYPES.map((n) => <MenuRow key={n.label} icon={n.type === "bitmap" ? <PaintIcon size={16} /> : docIcon(n.type as DocType, 16)} label={n.label} onClick={() => props.onNew(n.type)} />)}
        </>
      )}
      {!item && isBin && <MenuRow label="Empty Recycle Bin" onClick={props.onEmptyBin} />}
    </div>
  );
}

function PropertiesDialog({ file, onClose }: { file: DocFile; onClose: () => void }) {
  const kb = (file.content.length / 1024).toFixed(1);
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 70, background: "rgba(0,0,0,0.2)" }} onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ width: 290, background: "#ece9d8", border: "1px solid #0831a8", borderRadius: "8px 8px 4px 4px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", fontFamily: "Tahoma, sans-serif", overflow: "hidden" }}>
        <div style={{ background: "var(--xp-title,#0A53C8)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "5px 8px" }}>{file.name} Properties</div>
        <div style={{ padding: 14, fontSize: 11, color: "#222", lineHeight: 1.9 }}>
          <Row k="Name" v={file.name} />
          <Row k="Type" v={DOC_DETAIL[file.type]} />
          <Row k="Size" v={`${kb} KB (${file.content.length} bytes)`} />
          <Row k="Modified" v={new Date(file.modified).toLocaleString()} />
          {file.deleted && <Row k="Deleted" v={new Date(file.deleted).toLocaleString()} />}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={onClose} style={{ fontSize: 11, padding: "3px 16px", border: "1px solid #7f7c6b", borderRadius: 3, cursor: "pointer", background: "linear-gradient(to bottom,#fdfdfb,#e2ddc9)" }}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <span style={{ width: 70, color: "#555" }}>{k}:</span>
      <span style={{ flex: 1, fontWeight: 600, wordBreak: "break-word" }}>{v}</span>
    </div>
  );
}

function MenuHeader({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 14px 1px" }}>{children}</div>;
}

function Sep() {
  return <div style={{ height: 1, background: "#d6d2c2", margin: "3px 6px" }} />;
}

function MenuRow({ icon, label, onClick, bold, disabled }: { icon?: ReactNode; label: string; onClick: () => void; bold?: boolean; disabled?: boolean }) {
  return (
    <button
      className="w-full flex items-center gap-2 text-left"
      style={{ padding: "5px 14px", border: "none", background: "transparent", fontSize: 11, fontWeight: bold ? 700 : 400, color: disabled ? "#9aa0aa" : "#222", cursor: disabled ? "default" : "pointer" }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "#316ac5"; e.currentTarget.style.color = "#fff"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = disabled ? "#9aa0aa" : "#222"; }}
    >
      {icon && <span className="shrink-0" style={{ width: 16, height: 16, display: "inline-flex" }}>{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
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
