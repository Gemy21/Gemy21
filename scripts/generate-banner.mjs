// Generates the DIE FOR ME banner and renders it to assets/banner.png
// node scripts/generate-banner.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 400;

/* source: Chase Atlantic — DIE FOR ME (single artwork) */
const artSrc = join(ROOT, "scripts", "src", "die-for-me.jpg");
const artHref = "data:image/jpeg;base64," + readFileSync(artSrc).toString("base64");
const S = 1400;
const scaleX = W / S;
const scaleY = H / S;

const WORD = "CHASE ATLANTIC";
const TITLE = "DIE FOR ME";
const STAMP = "00:23:36";

/* logo box */
const BOX = { w: 420, h: 68, cx: 536, cy: 200 };

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>Chase Atlantic — Die For Me</title>
  <defs>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.38" stop-color="#d3dae3"/>
      <stop offset="0.5" stop-color="#8e97a4"/>
      <stop offset="0.62" stop-color="#eef2f7"/>
      <stop offset="0.86" stop-color="#b9c1cc"/>
      <stop offset="1" stop-color="#f7f9fc"/>
    </linearGradient>
    <linearGradient id="chromeSoft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f7fb"/>
      <stop offset="0.55" stop-color="#c2cad5"/>
      <stop offset="1" stop-color="#f2f5f9"/>
    </linearGradient>
    <linearGradient id="cornerFade" gradientUnits="userSpaceOnUse" x1="990" y1="295" x2="1215" y2="415">
      <stop offset="0" stop-color="#020204" stop-opacity="0"/>
      <stop offset="0.6" stop-color="#020204" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#020204" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.74" stop-color="#020204" stop-opacity="0"/>
      <stop offset="1" stop-color="#020204" stop-opacity="0.8"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.62">
      <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.6"/>
    </radialGradient>
    <filter id="art" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="1.3"/>
      <feComponentTransfer>
        <feFuncR type="gamma" amplitude="1" exponent="0.9" offset="0"/>
        <feFuncG type="gamma" amplitude="1" exponent="0.9" offset="0"/>
        <feFuncB type="gamma" amplitude="1" exponent="0.9" offset="0"/>
      </feComponentTransfer>
    </filter>
    <filter id="glow" x="-40%" y="-160%" width="180%" height="420%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <filter id="grainX">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="#020204"/>

  <g filter="url(#art)">
    <image href="${artHref}" x="0" y="0" width="${S}" height="${S}" transform="scale(${scaleX.toFixed(4)} ${scaleY.toFixed(4)})"/>
  </g>

  <g opacity="0.5" filter="url(#glow)">
    <rect x="${BOX.cx - BOX.w / 2}" y="${BOX.cy - 18}" width="${BOX.w}" height="36" rx="18" fill="#1a1030"/>
  </g>

  <g font-family="'Helvetica Neue',Helvetica,Arial,sans-serif">
    <rect x="${BOX.cx - BOX.w / 2}" y="${BOX.cy - BOX.h / 2}" width="${BOX.w}" height="${BOX.h}" rx="2" fill="none" stroke="url(#chrome)" stroke-width="2.4"/>
    <text x="${BOX.cx}" y="${BOX.cy + 1}" text-anchor="middle" dominant-baseline="central" font-size="47" font-weight="700" letter-spacing="1.4" fill="url(#chrome)" stroke="#0b0c10" stroke-width="0.6">${WORD}</text>

    <text x="768" y="${BOX.cy - 4}" dominant-baseline="central" font-size="22" font-weight="400" letter-spacing="3.6" fill="url(#chromeSoft)">${TITLE}</text>
    <text x="769" y="${BOX.cy + 23}" dominant-baseline="central" font-size="11.5" font-weight="400" letter-spacing="1.6" fill="#767e8b">${STAMP}</text>
  </g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" fill="url(#bottomFade)"/>
  <rect x="990" y="295" width="210" height="105" fill="url(#cornerFade)"/>
  <rect width="${W}" height="${H}" filter="url(#grainX)" opacity="0.07"/>
</svg>
`;

const outDir = join(ROOT, "scripts", "tmp");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "banner.svg"), svg, "utf8");

const frame = `<!doctype html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden}img{display:block}</style></head>
<body><img src="banner.svg" width="${W}" height="${H}"></body></html>`;
writeFileSync(join(outDir, "frame.html"), frame, "utf8");

console.log("banner.svg + frame written");
