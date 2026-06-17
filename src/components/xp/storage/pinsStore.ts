"use client";

import { useSyncExternalStore } from "react";

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
];

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function read(): Pin[] {
  if (cache) return cache;
  cache = DEFAULTS;
  return cache;
}

function write(next: Pin[]): void {
  cache = next;
  listeners.forEach((l) => l());
}

export function hydratePins(next: Pin[]): void {
  write(next);
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
