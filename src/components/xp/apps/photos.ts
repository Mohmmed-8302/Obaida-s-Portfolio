// Shared sample-photo gallery used by the Photo Viewer and the file explorer.
// Real assets where we have them, plus a few self-contained SVG "photos" so the
// viewer always has something to show (no missing-image placeholders).

export interface Photo {
  name: string;
  /** image src usable directly in <img> */
  src: string;
  detail: string;
}

const svg = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>${body}</svg>`
  )}`;

const SUNSET = svg(
  `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ff9a3c'/><stop offset='.5' stop-color='#ff6f91'/><stop offset='1' stop-color='#6a3093'/></linearGradient></defs>` +
  `<rect width='400' height='300' fill='url(#g)'/>` +
  `<circle cx='200' cy='185' r='52' fill='#ffe169' opacity='.95'/>` +
  `<path d='M0 235 L120 185 L220 222 L320 178 L400 216 L400 300 L0 300 Z' fill='#2d1b3d'/>` +
  `<path d='M0 262 L90 234 L200 262 L300 232 L400 256 L400 300 L0 300 Z' fill='#190f24'/>`
);

const MOUNTAINS = svg(
  `<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#aee1ff'/><stop offset='1' stop-color='#e8f6ff'/></linearGradient></defs>` +
  `<rect width='400' height='300' fill='url(#s)'/>` +
  `<circle cx='320' cy='70' r='34' fill='#fff7cf'/>` +
  `<polygon points='0,300 110,120 180,210 250,90 330,230 400,160 400,300' fill='#6b8aa6'/>` +
  `<polygon points='110,120 150,170 70,170' fill='#fff'/>` +
  `<polygon points='250,90 300,150 200,150' fill='#fff'/>` +
  `<rect y='250' width='400' height='50' fill='#3f6b4a'/>`
);

const OCEAN = svg(
  `<defs><linearGradient id='o' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#9be7ff'/><stop offset='.55' stop-color='#2aa7d8'/><stop offset='1' stop-color='#0b5e8a'/></linearGradient></defs>` +
  `<rect width='400' height='300' fill='url(#o)'/>` +
  `<circle cx='90' cy='70' r='28' fill='#fff3c4'/>` +
  `<g stroke='#ffffff' stroke-opacity='.5' stroke-width='3' fill='none'>` +
  `<path d='M0 170 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0'/>` +
  `<path d='M0 205 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0'/>` +
  `<path d='M0 240 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0'/></g>`
);

export const PHOTOS: Photo[] = [
  { name: "Bliss.bmp", src: "/assets/bliss.jpg", detail: "Bitmap Image" },
  { name: "Sunset.jpg", src: SUNSET, detail: "JPEG Image" },
  { name: "Mountains.jpg", src: MOUNTAINS, detail: "JPEG Image" },
  { name: "Ocean.jpg", src: OCEAN, detail: "JPEG Image" },
  { name: "logo.png", src: "/assets/logo-glow.png", detail: "PNG Image" },
];

export const photoIndexByName = (name: string) => PHOTOS.findIndex((p) => p.name === name);
