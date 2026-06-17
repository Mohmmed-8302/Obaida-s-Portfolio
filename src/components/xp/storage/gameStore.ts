"use client";

import { useSyncExternalStore, useCallback } from "react";

/** Per-game saved data (high scores, best times, win tallies …). Each game owns
 *  the shape of its own slice; everything is persisted to localStorage and synced
 *  to the cloud via the shared sync layer. */
export type GameSave = Record<string, number>;
export type GameSaves = Record<string, GameSave>;

const KEY = "xp.games";
const listeners = new Set<() => void>();
let cache: GameSaves | null = null;

function read(): GameSaves {
  if (cache) return cache;
  cache = {};
  return cache;
}

function write(next: GameSaves): void {
  cache = next;
  listeners.forEach((l) => l());
}

/** Replace the whole store (used by cloud hydration). */
export function hydrateGameSaves(next: GameSaves): void {
  write(next);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const EMPTY: GameSave = {};

/** Reactive per-game save slice plus a merge-saver. Returns the slice for `id`
 *  and `save(patch)` which shallow-merges numeric fields into it. */
export function useGameSave(id: string): { data: GameSave; save: (patch: GameSave) => void } {
  const all = useSyncExternalStore(subscribe, read, () => ({}) as GameSaves);
  const data = all[id] ?? EMPTY;
  const save = useCallback((patch: GameSave) => {
    const cur = read();
    write({ ...cur, [id]: { ...(cur[id] ?? {}), ...patch } });
  }, [id]);
  return { data, save };
}

/** Record a high score, only persisting when it beats the stored best.
 *  Returns true when a new record was set (for "new high score" feedback). */
export function recordBest(id: string, field: string, value: number, higherIsBetter = true): boolean {
  const cur = read();
  const prev = cur[id]?.[field];
  const isBetter = prev === undefined || (higherIsBetter ? value > prev : value < prev);
  if (!isBetter) return false;
  write({ ...cur, [id]: { ...(cur[id] ?? {}), [field]: value } });
  return true;
}
