import type { ReactNode } from "react";
import type { AppId } from "./types";
import {
  IeIcon, MyComputerIcon, MyDocumentsIcon, RecycleBinIcon, FolderIcon, PaintIcon,
  TicTacToeIcon, MinesweeperIcon, SolitaireIcon, SnakeIcon, ChessIcon, BlockBreakerIcon, RacingIcon,
  WordIcon, ExcelIcon, PowerPointIcon, NotepadIcon, PhotoViewerIcon, FlappyBirdIcon, ControlPanelIcon,
} from "./icons";
import InternetExplorer from "./apps/InternetExplorer";
import FileExplorer from "./apps/FileExplorer";
import DisplayProperties from "./apps/DisplayProperties";
import Paint from "./apps/Paint";
import Notepad from "./apps/Notepad";
import Word from "./apps/Word";
import Excel from "./apps/Excel";
import PowerPoint from "./apps/PowerPoint";
import PhotoViewer from "./apps/PhotoViewer";
import TicTacToe from "./games/TicTacToe";
import Minesweeper from "./games/Minesweeper";
import Solitaire from "./games/Solitaire";
import Snake from "./games/Snake";
import Chess from "./games/Chess";
import BlockBreaker from "./games/BlockBreaker";
import Racing from "./games/Racing";
import FlappyBird from "./games/FlappyBird";

export interface AppMeta {
  id: AppId;
  title: string;
  /** 16px icon for title bars / taskbar / menus. */
  icon: (size?: number) => ReactNode;
  /** Larger icon for desktop. */
  desktopIcon: (size?: number) => ReactNode;
  render: () => ReactNode;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  resizable: boolean;
}

export const APPS: Record<AppId, AppMeta> = {
  ie: {
    id: "ie", title: "Obaida Portfolio — Internet Explorer",
    icon: (s = 16) => <IeIcon size={s} />, desktopIcon: (s = 44) => <IeIcon size={s} />,
    render: () => <InternetExplorer />, defaultSize: { w: 900, h: 600 }, minSize: { w: 420, h: 320 }, resizable: true,
  },
  mycomputer: {
    id: "mycomputer", title: "My Computer",
    icon: (s = 16) => <MyComputerIcon size={s} />, desktopIcon: (s = 44) => <MyComputerIcon size={s} />,
    render: () => <FileExplorer initialPath="mycomputer" />, defaultSize: { w: 660, h: 470 }, minSize: { w: 420, h: 300 }, resizable: true,
  },
  mydocuments: {
    id: "mydocuments", title: "My Documents",
    icon: (s = 16) => <MyDocumentsIcon size={s} />, desktopIcon: (s = 44) => <MyDocumentsIcon size={s} />,
    render: () => <FileExplorer initialPath="mydocuments" />, defaultSize: { w: 660, h: 470 }, minSize: { w: 420, h: 300 }, resizable: true,
  },
  recyclebin: {
    id: "recyclebin", title: "Recycle Bin",
    icon: (s = 16) => <RecycleBinIcon size={s} full />, desktopIcon: (s = 44) => <RecycleBinIcon size={s} full />,
    render: () => <FileExplorer initialPath="recyclebin" />, defaultSize: { w: 620, h: 440 }, minSize: { w: 420, h: 300 }, resizable: true,
  },
  games: {
    id: "games", title: "Games",
    icon: (s = 16) => <FolderIcon size={s} open />, desktopIcon: (s = 44) => <FolderIcon size={s} />,
    render: () => <FileExplorer initialPath="games" />, defaultSize: { w: 620, h: 440 }, minSize: { w: 420, h: 300 }, resizable: true,
  },
  paint: {
    id: "paint", title: "untitled — Paint",
    icon: (s = 16) => <PaintIcon size={s} />, desktopIcon: (s = 44) => <PaintIcon size={s} />,
    render: () => <Paint />, defaultSize: { w: 700, h: 540 }, minSize: { w: 520, h: 420 }, resizable: true,
  },
  notepad: {
    id: "notepad", title: "Untitled — Notepad",
    icon: (s = 16) => <NotepadIcon size={s} />, desktopIcon: (s = 44) => <NotepadIcon size={s} />,
    render: () => <Notepad />, defaultSize: { w: 560, h: 440 }, minSize: { w: 320, h: 240 }, resizable: true,
  },
  word: {
    id: "word", title: "Document1 — Microsoft Word",
    icon: (s = 16) => <WordIcon size={s} />, desktopIcon: (s = 44) => <WordIcon size={s} />,
    render: () => <Word />, defaultSize: { w: 720, h: 560 }, minSize: { w: 480, h: 360 }, resizable: true,
  },
  excel: {
    id: "excel", title: "Book1 — Microsoft Excel",
    icon: (s = 16) => <ExcelIcon size={s} />, desktopIcon: (s = 44) => <ExcelIcon size={s} />,
    render: () => <Excel />, defaultSize: { w: 720, h: 520 }, minSize: { w: 480, h: 340 }, resizable: true,
  },
  powerpoint: {
    id: "powerpoint", title: "Presentation1 — Microsoft PowerPoint",
    icon: (s = 16) => <PowerPointIcon size={s} />, desktopIcon: (s = 44) => <PowerPointIcon size={s} />,
    render: () => <PowerPoint />, defaultSize: { w: 760, h: 560 }, minSize: { w: 520, h: 400 }, resizable: true,
  },
  photoviewer: {
    id: "photoviewer", title: "Windows Picture and Fax Viewer",
    icon: (s = 16) => <PhotoViewerIcon size={s} />, desktopIcon: (s = 44) => <PhotoViewerIcon size={s} />,
    render: () => <PhotoViewer />, defaultSize: { w: 620, h: 520 }, minSize: { w: 360, h: 320 }, resizable: true,
  },
  tictactoe: {
    id: "tictactoe", title: "Tic-Tac-Toe",
    icon: (s = 16) => <TicTacToeIcon size={s} />, desktopIcon: (s = 44) => <TicTacToeIcon size={s} />,
    render: () => <TicTacToe />, defaultSize: { w: 300, h: 410 }, resizable: false,
  },
  minesweeper: {
    id: "minesweeper", title: "Minesweeper",
    icon: (s = 16) => <MinesweeperIcon size={s} />, desktopIcon: (s = 44) => <MinesweeperIcon size={s} />,
    render: () => <Minesweeper />, defaultSize: { w: 320, h: 430 }, minSize: { w: 260, h: 320 }, resizable: true,
  },
  solitaire: {
    id: "solitaire", title: "Solitaire",
    icon: (s = 16) => <SolitaireIcon size={s} />, desktopIcon: (s = 44) => <SolitaireIcon size={s} />,
    render: () => <Solitaire />, defaultSize: { w: 580, h: 480 }, minSize: { w: 480, h: 380 }, resizable: true,
  },
  snake: {
    id: "snake", title: "Snake",
    icon: (s = 16) => <SnakeIcon size={s} />, desktopIcon: (s = 44) => <SnakeIcon size={s} />,
    render: () => <Snake />, defaultSize: { w: 380, h: 470 }, resizable: false,
  },
  chess: {
    id: "chess", title: "Chess",
    icon: (s = 16) => <ChessIcon size={s} />, desktopIcon: (s = 44) => <ChessIcon size={s} />,
    render: () => <Chess />, defaultSize: { w: 392, h: 540 }, resizable: false,
  },
  blockbreaker: {
    id: "blockbreaker", title: "Block Breaker",
    icon: (s = 16) => <BlockBreakerIcon size={s} />, desktopIcon: (s = 44) => <BlockBreakerIcon size={s} />,
    render: () => <BlockBreaker />, defaultSize: { w: 470, h: 540 }, resizable: false,
  },
  racing: {
    id: "racing", title: "Road Racer",
    icon: (s = 16) => <RacingIcon size={s} />, desktopIcon: (s = 44) => <RacingIcon size={s} />,
    render: () => <Racing />, defaultSize: { w: 352, h: 560 }, resizable: false,
  },
  flappybird: {
    id: "flappybird", title: "Flappy Bird",
    icon: (s = 16) => <FlappyBirdIcon size={s} />, desktopIcon: (s = 44) => <FlappyBirdIcon size={s} />,
    render: () => <FlappyBird />, defaultSize: { w: 360, h: 560 }, resizable: false,
  },
  display: {
    id: "display", title: "Display Properties",
    icon: (s = 16) => <ControlPanelIcon size={s} />, desktopIcon: (s = 44) => <ControlPanelIcon size={s} />,
    render: () => <DisplayProperties />, defaultSize: { w: 420, h: 480 }, minSize: { w: 380, h: 400 }, resizable: false,
  },
  controlpanel: {
    id: "controlpanel", title: "Control Panel",
    icon: (s = 16) => <ControlPanelIcon size={s} />, desktopIcon: (s = 44) => <ControlPanelIcon size={s} />,
    render: () => <FileExplorer initialPath="controlpanel" />, defaultSize: { w: 660, h: 470 }, minSize: { w: 420, h: 300 }, resizable: true,
  },
};
