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
  | "tictactoe"
  | "minesweeper"
  | "solitaire"
  | "snake"
  | "chess"
  | "blockbreaker"
  | "racing"
  | "flappybird";

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
export type AppPayload = PhotoPayload | TextPayload;

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
