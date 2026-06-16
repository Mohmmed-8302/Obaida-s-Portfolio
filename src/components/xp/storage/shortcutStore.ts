"use client";

import { useSyncExternalStore } from "react";
import { scheduleCloudPush, registerHydrator } from "./cloudSync";
import type { AppId } from "../types";

/** Shortcuts the visitor has deleted — desktop icons and File-Explorer app/
 *  folder shortcuts. They are hidden (not destroyed) so they can be restored
 *  from the Recycle Bin. Persisted + cloud-synced like everything else. */
export interface RemovedShortcut {
  /** Stable key: "desktop:<appId>" or "explorer:<folderId>:<label>". */
  key: string;
  kind: "desktop" | "explorer";
  label: string;
  /** Set for desktop icons so the bin can show the right glyph. */
  appId?: AppId;
  removedAt: number;
  /** Emptied from the Recycle Bin: stays hidden but no longer restorable/shown. */
  purged?: boolean;
}

const KEY = "xp.removedShortcuts";
const listeners = new Set<() => void>();
let cache: RemovedShortcut[] | null = null;

function read(): RemovedShortcut[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as RemovedShortcut[]) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch { cache = []; }
  return cache;
}

function write(next: RemovedShortcut[], sync = true): void {
  cache = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  }
  listeners.forEach((l) => l());
  if (sync) scheduleCloudPush();
}

function hydrateShortcuts(raw: string): void {
  try {
    const parsed = JSON.parse(raw) as RemovedShortcut[];
    write(Array.isArray(parsed) ? parsed : [], false);
  } catch { /* ignore */ }
}
registerHydrator(KEY, hydrateShortcuts);

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const EMPTY: RemovedShortcut[] = [];

/** Shortcuts shown in the Recycle Bin (hidden but not yet emptied). */
export function useRemovedShortcuts(): RemovedShortcut[] {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return list.filter((s) => !s.purged);
}

/** Reactive set of every hidden key (purged or not), for filtering icons/items. */
export function useHiddenKeys(): Set<string> {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return new Set(list.map((s) => s.key));
}

export function removeShortcut(s: Omit<RemovedShortcut, "removedAt">): void {
  const list = read().filter((x) => x.key !== s.key); // de-dupe (re-delete after restore)
  write([{ ...s, removedAt: Date.now() }, ...list]);
}

/** Bring a shortcut back (un-hide). */
export function restoreShortcut(key: string): void {
  write(read().filter((s) => s.key !== key));
}

/** Permanently delete one shortcut: stays hidden, leaves the Recycle Bin. */
export function purgeShortcut(key: string): void {
  write(read().map((s) => (s.key === key ? { ...s, purged: true } : s)));
}

/** Empty the Recycle Bin's shortcuts: all stay hidden, none restorable. */
export function purgeAllShortcuts(): void {
  if (read().some((s) => !s.purged)) write(read().map((s) => ({ ...s, purged: true })));
}

export const desktopKey = (appId: AppId) => `desktop:${appId}`;
export const explorerKey = (folderId: string, label: string) => `explorer:${folderId}:${label}`;
