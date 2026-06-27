/** Centralized z-index constants for the XP desktop */
export const Z = {
  desktop: 1,
  iconDragging: 100,
  window: { min: 10, max: 99 },
  taskbar: 110,
  startMenu: 120,
  notifications: 195,
  dimmer: 190,
  scanlines: 200,
  screenSaver: 9999,
} as const;
