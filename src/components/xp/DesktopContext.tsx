"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppId, AppPayload, XpSettings } from "./types";

export const DEFAULT_SETTINGS: XpSettings = {
  wallpaper: "/assets/bliss.jpg",
  wallpaperName: "Bliss",
  wallpaperFit: "stretch",
  bgColor: "#3a6ea5",
  brightness: 100,
  screensaver: { type: "none", waitMs: 60000 },
  theme: "blue",
  muted: false,
  volume: 70,
};

/** A transient XP balloon notification shown above the system tray. */
export interface XpNotice {
  id: number;
  title: string;
  body: string;
  icon?: ReactNode;
}

interface DesktopApi {
  /** Open (or focus) an app. An optional payload is stashed per-AppId and can
   *  be read by the target app via `useDesktop().payloads[appId]`. */
  openApp: (appId: AppId, payload?: AppPayload) => void;
  /** Close the (singleton) window for an app, if open. */
  closeApp: (appId: AppId) => void;
  payloads: Partial<Record<AppId, AppPayload>>;
  /** Persisted desktop appearance settings. */
  settings: XpSettings;
  /** Shallow-merge a patch into settings (persisted to localStorage). */
  updateSettings: (patch: Partial<XpSettings>) => void;
  /** Show a transient balloon notification near the system tray. */
  notify: (title: string, body: string, icon?: ReactNode) => void;
  /** Relabel an open app's window title with a document name (after Save As). */
  setDocTitle: (appId: AppId, name: string) => void;
}

export const DesktopContext = createContext<DesktopApi>({
  openApp: () => {},
  closeApp: () => {},
  payloads: {},
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  notify: () => {},
  setDocTitle: () => {},
});

export function useDesktop() {
  const ctx = useContext(DesktopContext);
  if (!ctx) {
    throw new Error('useDesktop must be used inside DesktopContext.Provider');
  }
  return ctx;
}
