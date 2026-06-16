"use client";

import { useSyncExternalStore } from "react";
import type { AppId, DocType } from "./types";

/** A user-created document, persisted per-visitor in localStorage.
 *  `content` is the owning app's own serialized format:
 *   - text        → plain text
 *   - word        → contentEditable HTML
 *   - excel       → JSON cell map  { "A1": "…", … }
 *   - powerpoint  → JSON slide array [ { title, body }, … ] */
export interface DocFile {
  id: string;
  type: DocType;
  name: string;
  content: string;
  modified: number;
}

const KEY = "xp.files";
const listeners = new Set<() => void>();
let cache: DocFile[] | null = null;

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function read(): DocFile[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as DocFile[]) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: DocFile[]): void {
  cache = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota / private mode */ }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const EMPTY: DocFile[] = [];

/** Reactive, sorted (newest first) list of the visitor's files. */
export function useFiles(): DocFile[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function getFile(id: string): DocFile | undefined {
  return read().find((f) => f.id === id);
}

/** Upsert. Returns the (possibly new) document id. */
export function saveFile(p: { id?: string; type: DocType; name: string; content: string }): string {
  const list = read();
  const now = Date.now();
  if (p.id) {
    const i = list.findIndex((f) => f.id === p.id);
    if (i >= 0) {
      const next = list.slice();
      next[i] = { ...next[i], name: p.name, content: p.content, type: p.type, modified: now };
      write(next);
      return p.id;
    }
  }
  const id = p.id ?? uid();
  write([{ id, type: p.type, name: p.name, content: p.content, modified: now }, ...list]);
  return id;
}

export function deleteFile(id: string): void {
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

function uniqueName(base: string): string {
  const names = new Set(read().map((f) => f.name));
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
