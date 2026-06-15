"use client";

import { createContext, useContext } from "react";
import type { AppId } from "./types";

interface DesktopApi {
  openApp: (appId: AppId) => void;
}

export const DesktopContext = createContext<DesktopApi>({ openApp: () => {} });

export function useDesktop() {
  return useContext(DesktopContext);
}
