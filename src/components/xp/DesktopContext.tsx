"use client";

import { createContext, useContext } from "react";
import type { AppId, AppPayload, XpSettings } from "./types";

export const DEFAULT_SETTINGS: XpSettings = {
  wallpaper: "/assets/bliss.jpg",
  wallpaperName: "Bliss",
  wallpaperFit: "stretch",
  bgColor: "#3a6ea5",
  brightness: 100,
  screensaver: { type: "bliss", waitMs: 60000 },
};

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
}

export const DesktopContext = createContext<DesktopApi>({
  openApp: () => {},
  closeApp: () => {},
  payloads: {},
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function useDesktop() {
  return useContext(DesktopContext);
}
