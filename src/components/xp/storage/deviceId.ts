"use client";

/** Anonymous per-browser identity used to namespace this visitor's cloud saves.
 *  There is no login on the portfolio, so each device gets a random, unguessable
 *  id persisted in localStorage. It is the Vercel Blob path prefix for saves. */

const KEY = "xp.deviceId";

/** Flag indicating whether localStorage-based sync is available */
let syncEnabled = true;

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

let cached: string | null = null;

export function getDeviceId(): string {
  if (cached) return cached;
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) { id = uid(); window.localStorage.setItem(KEY, id); }
    cached = id;
    syncEnabled = true;
    return id;
  } catch {
    syncEnabled = false;
    console.warn('[deviceId] localStorage unavailable - cloud sync disabled, using session-only ID');
    cached = uid();
    return cached;
  }
}

/** Returns whether localStorage-based sync is available */
export function isSyncEnabled(): boolean {
  // Ensure getDeviceId has been called to set the flag
  if (cached === null) getDeviceId();
  return syncEnabled;
}
