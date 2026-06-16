export type AppId =
  | "ie"
  | "mycomputer"
  | "mydocuments"
  | "recyclebin"
  | "games"
  | "paint"
  | "notepad"
  | "word"
  | "excel"
  | "powerpoint"
  | "photoviewer"
  | "display"
  | "controlpanel"
  | "tictactoe"
  | "minesweeper"
  | "solitaire"
  | "snake"
  | "chess"
  | "blockbreaker"
  | "racing"
  | "flappybird";

/** Document kinds that can be created/saved to the virtual file system. */
export type DocType = "text" | "word" | "excel" | "powerpoint";

/** Optional data handed to an app when it is opened (e.g. a photo to view,
 *  a document's text). Stored per-AppId in the desktop and read via useDesktop. */
export interface PhotoPayload {
  kind: "photo";
  /** Index into the shared photo gallery, or -1 for a one-off src. */
  index?: number;
  src?: string;
  name?: string;
}
export interface TextPayload {
  kind: "text";
  name?: string;
  content?: string;
}
/** Handed to an editor app when opening a saved/new document. `content` is the
 *  app's own serialized format (plain text, HTML, or JSON). */
export interface DocPayload {
  kind: "doc";
  docId?: string;
  docType: DocType;
  name?: string;
  content?: string;
}
export type AppPayload = PhotoPayload | TextPayload | DocPayload;

/** Persisted desktop appearance settings (localStorage key `xp.settings`). */
export interface XpSettings {
  /** Wallpaper image url / data-uri, or "" for a solid colour. */
  wallpaper: string;
  wallpaperName: string;
  wallpaperFit: "stretch" | "center" | "tile";
  /** Solid colour shown behind / instead of a wallpaper. */
  bgColor: string;
  /** 0..100, where 100 = no dimming. */
  brightness: number;
  screensaver: { type: "none" | "starfield" | "mystify" | "bliss"; waitMs: number };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  rect: Rect;
  /** Restore target when un-maximizing. */
  prevRect: Rect;
  z: number;
}
