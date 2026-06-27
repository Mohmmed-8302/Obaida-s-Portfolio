"use client";

import { useSyncExternalStore } from "react";
import type { AppId, DocType } from "./types";

/** A user-created document, persisted per-visitor in localStorage and mirrored
 *  to the cloud. `content` is the owning app's own serialized format:
 *   - text        → plain text
 *   - word        → contentEditable HTML
 *   - excel       → JSON cell map  { "A1": "…", … }
 *   - powerpoint  → JSON slide array [ { title, body }, … ]
 *  `deleted` (a timestamp) marks a file as living in the Recycle Bin. */
export interface DocFile {
  id: string;
  type: DocType;
  name: string;
  content: string;
  modified: number;
  deleted?: number;
}

/** localStorage key for persisted files */
// const KEY = "xp.files";
/** localStorage key for seeded state */
// const SEEDED_KEY = "xp.seeded";

/** Set of listener callbacks for store subscriptions */
const listeners = new Set<() => void>();

/** Main in-memory cache of all documents */
let cache: DocFile[] | null = null;

/** Flag to prevent reads during cloud hydration (used by hydrateFiles) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hydrating = false;

/** Derived, stable snapshots so useSyncExternalStore doesn't loop on a fresh array. */
let liveCache: DocFile[] = [];
let deletedCache: DocFile[] = [];

/** Memoized snapshot references to avoid unnecessary re-renders */
let memoLiveSnapshot: DocFile[] = [];
let memoBinSnapshot: DocFile[] = [];

function recompute(): void {
  const all = cache ?? [];
  const newLive = all.filter((f) => !f.deleted);
  const newDeleted = all.filter((f) => f.deleted);
  
  // Only update references if arrays actually changed
  if (!arraysEqual(newLive, memoLiveSnapshot)) {
    memoLiveSnapshot = newLive;
  }
  if (!arraysEqual(newDeleted, memoBinSnapshot)) {
    memoBinSnapshot = newDeleted;
  }
  
  liveCache = memoLiveSnapshot;
  deletedCache = memoBinSnapshot;
}

/** Shallow comparison of DocFile arrays by id and modified timestamp */
function arraysEqual(a: DocFile[], b: DocFile[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].modified !== b[i].modified || a[i].deleted !== b[i].deleted) {
      return false;
    }
  }
  return true;
}

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function read(): DocFile[] {
  if (cache) return cache;
  cache = [];
  recompute();
  return cache;
}

function write(next: DocFile[]): void {
  cache = next;
  recompute();
  listeners.forEach((l) => l());
}

/** Stable snapshot accessors (populate cache on first call). */
function liveSnapshot(): DocFile[] { read(); return liveCache; }
function binSnapshot(): DocFile[] { read(); return deletedCache; }

/** Replace the whole store (used by cloud hydration). */
export function hydrateFiles(raw: string): void {
  hydrating = true;
  try {
    const parsed = JSON.parse(raw) as DocFile[];
    write(Array.isArray(parsed) ? parsed : []);
  } catch { /* ignore */ }
  finally {
    hydrating = false;
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const EMPTY: DocFile[] = [];

/** Reactive list of the visitor's *live* (non-deleted) files. */
export function useFiles(): DocFile[] {
  return useSyncExternalStore(subscribe, liveSnapshot, () => EMPTY);
}

/** Reactive list of files currently in the Recycle Bin. */
export function useRecycleBin(): DocFile[] {
  return useSyncExternalStore(subscribe, binSnapshot, () => EMPTY);
}

export function getFile(id: string): DocFile | undefined {
  return read().find((f) => f.id === id);
}

/** Characters not allowed in file names */
const INVALID_CHARS = /[<>:"/\\|?*]/g;

/** Sanitize file name by removing invalid characters and path traversal */
function sanitizeName(name: string): string {
  return name
    .replace(INVALID_CHARS, '')
    .replace(/\.\./g, '')
    .trim()
    .slice(0, 255);
}

/** Upsert. Returns the (possibly new) document id. */
export function saveFile(p: { id?: string; type: DocType; name: string; content: string }): string {
  // Validate name
  if (!p.name || typeof p.name !== 'string') {
    throw new Error('File name is required');
  }
  const sanitized = sanitizeName(p.name);
  if (sanitized.length === 0) {
    throw new Error('File name cannot be empty after sanitization');
  }
  if (sanitized.length > 255) {
    throw new Error('File name exceeds 255 characters');
  }
  
  // Validate content
  if (typeof p.content !== 'string') {
    throw new Error('File content must be a string');
  }
  
  const list = read();
  const now = Date.now();
  if (p.id) {
    const i = list.findIndex((f) => f.id === p.id);
    if (i >= 0) {
      const next = list.slice();
      next[i] = { ...next[i], name: p.name, content: p.content, type: p.type, modified: now, deleted: undefined };
      write(next);
      return p.id;
    }
  }
  const id = p.id ?? uid();
  write([{ id, type: p.type, name: p.name, content: p.content, modified: now }, ...list]);
  return id;
}

/** Rename a file (keeps the extension if the new name omits one). */
export function renameFile(id: string, name: string): void {
  const list = read();
  const i = list.findIndex((f) => f.id === id);
  if (i < 0) return;
  const old = list[i];
  const oldDot = old.name.lastIndexOf(".");
  const ext = oldDot > 0 ? old.name.slice(oldDot) : "";
  const finalName = name.includes(".") || !ext ? name : `${name}${ext}`;
  const next = list.slice();
  next[i] = { ...old, name: uniqueName(finalName, id), modified: Date.now() };
  write(next);
}

/** Move a file to the Recycle Bin (soft delete). */
export function deleteFile(id: string): void {
  const list = read();
  const i = list.findIndex((f) => f.id === id);
  if (i < 0) return;
  const next = list.slice();
  next[i] = { ...next[i], deleted: Date.now() };
  write(next);
}

/** Restore a file out of the Recycle Bin. */
export function restoreFile(id: string): void {
  const list = read();
  const i = list.findIndex((f) => f.id === id);
  if (i < 0) return;
  const next = list.slice();
  next[i] = { ...next[i], deleted: undefined };
  write(next);
}

/** Permanently remove every file currently in the Recycle Bin. */
export function emptyRecycleBin(): void {
  write(read().filter((f) => !f.deleted));
}

/** Permanently remove a single file. */
export function permanentlyDelete(id: string): void {
  write(read().filter((f) => f.id !== id));
}

const DEFAULTS: Record<DocType, { name: string; content: string }> = {
  text: { name: "New Text Document.txt", content: "" },
  word: { name: "New Document.doc", content: "<div><br></div>" },
  excel: { name: "New Worksheet.xls", content: "{}" },
  powerpoint: {
    name: "New Presentation.ppt",
    content: JSON.stringify([{ title: "Click to add title", body: "Click to add text" }]),
  },
};

/** Default blank content for a freshly created document of `type`. */
export function blankContent(type: DocType): string {
  return DEFAULTS[type].content;
}

function uniqueName(base: string, ignoreId?: string): string {
  const names = new Set(read().filter((f) => f.id !== ignoreId).map((f) => f.name));
  if (!names.has(base)) return base;
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  for (let n = 2; ; n++) {
    const candidate = `${stem} (${n})${ext}`;
    if (!names.has(candidate)) return candidate;
  }
}

/** Create + persist a blank document, returning it (ready to open in its app). */
export function createFile(type: DocType, name?: string): DocFile {
  const file: DocFile = {
    id: uid(),
    type,
    name: uniqueName(name ?? DEFAULTS[type].name),
    content: DEFAULTS[type].content,
    modified: Date.now(),
  };
  write([file, ...read()]);
  return file;
}

/** Which app opens a given document type. */
export function appForDoc(type: DocType): AppId {
  switch (type) {
    case "text": return "notepad";
    case "word": return "word";
    case "excel": return "excel";
    case "powerpoint": return "powerpoint";
  }
}

/* ── First-run demo documents ───────────────────────────────────────────────
   These give My Documents real, editable/savable files instead of blank
   editors. Only seeded once, and never when the store already has files (e.g.
   after a cloud hydrate), so they don't duplicate. */

const ABOUT_TXT = `ABOUT OBAIDA
============

Motion designer & creative developer.

I build brand animations, title sequences and playful
interactive experiences for the web — like this very
Windows XP desktop you're poking around in right now.

Double-click the other files in My Documents to open them
in Word, Excel and PowerPoint, edit them, then File > Save.
Create your own with right-click > New. Have fun!`;

const RESUME_HTML = `<h1 style="font-size:22px;color:#1f3864;margin-bottom:10px;">Obaida — Curriculum Vitae</h1>
<p style="margin-bottom:8px;"><b>Motion Designer &amp; Creative Developer</b></p>
<p style="margin-bottom:8px;">Brand animation, title sequences and interactive web experiences.
Select text and use the toolbar to format it, then File &gt; Save to keep your changes.</p>
<ul><li>Showreel editing &amp; compositing</li><li>Logo &amp; brand animation</li><li>Creative web development</li></ul>`;

const BUDGET_CELLS = JSON.stringify({
  A1: "Item", B1: "Qty", C1: "Price", D1: "Total",
  A2: "Showreel edit", B2: "3", C2: "120", D2: "=B2*C2",
  A3: "Logo animation", B3: "2", C3: "200", D3: "=B3*C3",
  A4: "Title sequence", B4: "1", C4: "450", D4: "=B4*C4",
  A6: "Grand total", D6: "=SUM(D2:D4)",
});

const REEL_SLIDES = JSON.stringify([
  { title: "Obaida — Motion Reel 2025", body: "Creative developer & motion designer\nPress “Slide Show” to present" },
  { title: "What I do", body: "• Brand animation\n• Title sequences\n• Interactive web experiences\n• 3D & compositing" },
  { title: "Get in touch", body: "Double-click any text to edit this deck.\nAdd your own slides with “New Slide”." },
]);

const SEEDS: { id: string; type: DocType; name: string; content: string }[] = [
  { id: "seed-about", type: "text", name: "about_obaida.txt", content: ABOUT_TXT },
  { id: "seed-resume", type: "word", name: "resume.doc", content: RESUME_HTML },
  { id: "seed-budget", type: "excel", name: "budget.xls", content: BUDGET_CELLS },
  { id: "seed-reel", type: "powerpoint", name: "reel_2025.ppt", content: REEL_SLIDES },
];

/** Seed demo docs into the in-memory store on each session. */
export function seedDemoFiles(): void {
  if (read().length > 0) return;
  const now = Date.now();
  write(SEEDS.map((s, i) => ({ ...s, modified: now - i })));
}
