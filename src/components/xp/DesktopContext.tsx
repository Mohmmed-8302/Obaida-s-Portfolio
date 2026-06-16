"use client";

import { createContext, useContext } from "react";
import type { AppId, AppPayload } from "./types";

interface DesktopApi {
  /** Open (or focus) an app. An optional payload is stashed per-AppId and can
   *  be read by the target app via `useDesktop().payloads[appId]`. */
  openApp: (appId: AppId, payload?: AppPayload) => void;
  payloads: Partial<Record<AppId, AppPayload>>;
}

export const DesktopContext = createContext<DesktopApi>({ openApp: () => {}, payloads: {} });

export function useDesktop() {
  return useContext(DesktopContext);
}
