"use client";

import { useSyncExternalStore } from "react";
import { scheduleCloudPush } from "./cloudSync";

/** A site shortcut pinned to the taskbar Quick Launch bar. Opening it launches
 *  the Internet Explorer app navigated to `url`. */
export interface Pin {
  id: string;
  name: string;
  url: string;
}

const KEY = "xp.pins";
const listeners = new Set<() => void>();
let cache: Pin[] | null = null;

const DEFAULTS: Pin[] = [
  { id: "p-portfolio", name: "Obaida Portfolio", url: "portfolio" },
  { id: "p-google", name: "Google", url: "https://www.google.com/webhp?igu=1" },
];

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function read(): Pin[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = DEFAULTS);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) { cache = DEFAULTS; return cache; }
    const parsed = JSON.parse(raw) as Pin[];
    cache = Array.isArray(parsed) ? parsed : DEFAULTS;
  } catch {
    cache = DEFAULTS;
  }
  return cache;
}

function write(next: Pin[], sync = true): void {
  cache = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  }
  listeners.forEach((l) => l());
  if (sync) scheduleCloudPush();
}

export function hydratePins(next: Pin[]): void {
  write(next, false);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const EMPTY: Pin[] = [];

export function usePins(): Pin[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Add a pin (de-duped by url). Returns the pin. */
export function addPin(name: string, url: string): Pin {
  const list = read();
  const existing = list.find((p) => p.url === url);
  if (existing) return existing;
  const pin: Pin = { id: uid(), name: name.trim() || url, url };
  write([...list, pin]);
  return pin;
}

export function removePin(id: string): void {
  write(read().filter((p) => p.id !== id));
}

export function hasPinForUrl(url: string): boolean {
  return read().some((p) => p.url === url);
}
