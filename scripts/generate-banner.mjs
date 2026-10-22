// Generates the Chase Atlantic - style banner and renders it to assets/banner.png
// node scripts/generate-banner.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 400;
const CX = 600;
const CY = 200;

/* source rose: Wikimedia Commons, "Red rose with black background" by Laitche — CC BY-SA 4.0 */
const roseSrc = join(ROOT, "scripts", "src", "rose.jpg");
const roseHref = "data:image/jpeg;base64," + readFileSync(roseSrc).toString("base64");
const S_W = 1920;
const S_H = 1478;
const ANCHOR = { x: 960, y: 739 }; // centre of the bloom in source coords

/* photo placement */
const scale = 0.346;
const dx = (CX - ANCHOR.x * scale).toFixed(2);
const dy = (CY + 22 - ANCHOR.y * scale).toFixed(2);
const drawW = Math.round(S_W * scale);
const drawH = Math.round(S_H * scale);

/* white, boxed, heavy oblique wordmark */
const WORD = "CHASE ATLANTIC";
const BOX_W = 392;
const BOX_H = 66;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>Chase Atlantic — red rose on black</title>
  <defs>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.62">
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
    <filter id="duotone" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0.0 0.55 0.82 0.92"/>
        <feFuncG type="table" tableValues="0.0 0.09 0.17 0.23"/>
        <feFuncB type="table" tableValues="0.0 0.09 0.16 0.22"/>
      </feComponentTransfer>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.18" intercept="-0.06"/>
        <feFuncG type="linear" slope="1.18" intercept="-0.03"/>
        <feFuncB type="linear" slope="1.18" intercept="-0.03"/>
      </feComponentTransfer>
    </filter>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
    <filter id="grainX">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="#000000"/>

  <g filter="url(#duotone)">
    <image href="${roseHref}" x="0" y="0" width="${S_W}" height="${S_H}" transform="translate(${dx} ${dy}) scale(${scale.toFixed(4)})"/>
  </g>

  <g>
    <rect x="${W / 2 - BOX_W / 2}" y="${CY - BOX_H / 2}" width="${BOX_W}" height="${BOX_H}" fill="#000000" stroke="#f2efe9" stroke-width="3"/>
    <g transform="translate(${CX} ${CY + 1}) skewX(-8)">
      <text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="34" letter-spacing="0.5" fill="#f2efe9">${WORD}</text>
    </g>
  </g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grainX)" opacity="0.06"/>
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
