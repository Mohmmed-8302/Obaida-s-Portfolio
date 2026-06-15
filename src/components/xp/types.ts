export type AppId =
  | "ie"
  | "mycomputer"
  | "mydocuments"
  | "recyclebin"
  | "games"
  | "paint"
  | "tictactoe"
  | "minesweeper"
  | "solitaire"
  | "snake"
  | "chess"
  | "blockbreaker"
  | "racing";

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
