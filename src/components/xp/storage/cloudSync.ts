"use client";

import { getDeviceId } from "./deviceId";

/** Debounce timer for cloud push */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 1000;

/** Exponential backoff retry helper */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError ?? new Error('Fetch failed after retries');
}

/** Bundles every persisted `xp.*` slice into one document and mirrors it to
 *  Vercel Blob through /api/saves, keyed by the anonymous device id.
 *
 *  localStorage stays the source of truth (instant, offline). The cloud is a
 *  last-write-wins mirror: on boot we hydrate from the cloud if it is newer,
 *  otherwise we push local up. Every store calls scheduleCloudPush() after a
 *  write. If the Blob store isn't provisioned the API reports configured:false
 *  and we silently stay local-only. */

const SYNC_KEYS = ["xp.files", "xp.settings", "xp.games", "xp.pins", "xp.iconPositions", "xp.removedShortcuts"] as const;
const SAVED_AT_KEY = "xp.savedAt";
const MAX_BYTES = 4_000_000;

export type SyncStatus = "local" | "syncing" | "saved" | "offline";

type HydrateFn = (raw: string) => void;
const hydrators = new Map<string, HydrateFn>();
const statusListeners = new Set<(s: SyncStatus) => void>();

let cloudEnabled = false;
let lastStatus: SyncStatus = "local";

/** Stores register here so cloud hydration can refresh their in-memory cache. */
export function registerHydrator(key: string, fn: HydrateFn): void {
  hydrators.set(key, fn);
}

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  statusListeners.add(cb);
  return () => { statusListeners.delete(cb); };
}
export function getSyncStatus(): SyncStatus { return lastStatus; }

function emit(s: SyncStatus): void {
  lastStatus = s;
  statusListeners.forEach((l) => l(s));
}

function localSavedAt(): number {
  try { return Number(window.localStorage.getItem(SAVED_AT_KEY)) || 0; } catch { return 0; }
}
function setLocalSavedAt(n: number): void {
  try { window.localStorage.setItem(SAVED_AT_KEY, String(n)); } catch { /* ignore */ }
}

function bundle(): Record<string, string> {
  const data: Record<string, string> = {};
  for (const k of SYNC_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v != null) data[k] = v;
  }
  return data;
}

/** Hydrate localStorage + every registered store from a cloud snapshot. */
function applySnapshot(data: Record<string, string>): void {
  for (const [k, v] of Object.entries(data)) {
    try { window.localStorage.setItem(k, v); } catch { /* ignore */ }
    hydrators.get(k)?.(v);
  }
}

/** Called once from the desktop on mount. `onAfterHydrate` lets the desktop
 *  refresh React state (settings, icon positions) after a cloud pull. */
export async function initCloudSync(_onAfterHydrate?: () => void): Promise<void> {
  emit("local");
}

export function scheduleCloudPush(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    pushNow();
  }, DEBOUNCE_MS);
}

async function pushNow(): Promise<void> {
  if (typeof window === "undefined" || !cloudEnabled) return;
  const savedAt = Date.now();
  const data = bundle();
  const body = JSON.stringify({ deviceId: getDeviceId(), savedAt, data });
  if (body.length > MAX_BYTES) { emit("local"); return; } // too big to mirror
  emit("syncing");
  try {
    const res = await fetchWithRetry("/api/saves", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
    let json: { configured?: boolean } = {};
    try {
      json = await res.json();
    } catch {
      // Response not JSON, treat as offline
    }
    if (json && json.configured === false) { cloudEnabled = false; emit("local"); return; }
    setLocalSavedAt(savedAt);
    emit("saved");
  } catch (error: unknown) {
    console.warn('[cloudSync] Push failed:', error instanceof Error ? error.message : String(error));
    emit("offline");
  }
}
