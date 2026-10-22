// Generates assets/activity-pulse.svg from your real GitHub contribution calendar.
// Local:  node scripts/generate-pulse.mjs
// CI:     GITHUB_TOKEN=... node scripts/generate-pulse.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGIN = process.env.GH_LOGIN || "Gemy21";

const QUERY = `query($login:String!){
  user(login:$login){
    contributionsCollection{
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ contributionCount date weekday } }
      }
    }
  }
}`;

const INK = "#070605";
const CELL = { 0: "#1a1615", 1: "#33201d", 2: "#5f2422", 3: "#a2342f", 4: "#ecdad3" };
const TODAY = "#d95c4f";

async function getCalendar() {
  if (process.env.GITHUB_TOKEN) {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "gemy21-profile",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return json.data.user.contributionsCollection.contributionCalendar;
  }

  const raw = execFileSync(
    process.platform === "win32" ? "gh.exe" : "gh",
    ["api", "graphql", "-f", `query=${QUERY}`, "-f", `login=${LOGIN}`],
    { encoding: "utf8" },
  );
  return JSON.parse(raw).data.user.contributionsCollection.contributionCalendar;
}

function level(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function build(calendar) {
  const weeks = calendar.weeks;
  const total = calendar.totalContributions;
  const cols = weeks.length;
  const gap = 5;
  const cell = Math.min(16, Math.floor((1200 - 88 - (cols - 1) * gap) / cols));
  const gridW = cols * cell + (cols - 1) * gap;
  const x0 = (1200 - gridW) / 2;
  const y0 = 56;
  const rows = 7;
  const gridH = rows * cell + (rows - 1) * gap;
  const height = Math.round(y0 + gridH + 30);
  const r = 4.2;

  const days = weeks.flatMap((w) => w.contributionDays);
  const today = days.at(-1)?.date;

  const cellMarkup = [];
  const glowMarkup = [];
  weeks.forEach((week, cx) => {
    week.contributionDays.forEach((day) => {
      const x = x0 + cx * (cell + gap);
      const y = y0 + day.weekday * (cell + gap);
      const lv = level(day.contributionCount);
      const title = `${day.date} · ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}`;
      const isToday = day.date === today;
      const ring = isToday
        ? ` stroke="${TODAY}" stroke-opacity="0.85" stroke-width="1.2"`
        : "";
      cellMarkup.push(
        `<rect x="${x.toFixed(1)}" y="${y}" width="${cell}" height="${cell}" rx="${r}" fill="${CELL[lv]}"${ring}><title>${title}</title></rect>`,
      );
      if (lv >= 3) {
        glowMarkup.push(
          `<rect x="${x.toFixed(1)}" y="${y}" width="${cell}" height="${cell}" rx="${r}" fill="${CELL[lv]}" opacity="${lv === 4 ? 0.55 : 0.28}"/>`,
        );
      }
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-label="Activity pulse: ${total} contributions in the last year">
  <title>Activity pulse — ${total} contributions in the last year</title>
  <defs>
    <linearGradient id="pulseBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0909"/>
      <stop offset="1" stop-color="${INK}"/>
    </linearGradient>
    <radialGradient id="pulseAmbient" cx="0.5" cy="0" r="0.9">
      <stop offset="0" stop-color="#3f080d" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#070605" stop-opacity="0"/>
    </radialGradient>
    <filter id="pulseGlow" x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
    <filter id="textGlow" x="-40%" y="-120%" width="180%" height="340%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="pulseGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="1200" height="${height}" rx="12" fill="url(#pulseBg)"/>
  <rect width="1200" height="${height}" rx="12" fill="url(#pulseAmbient)"/>
  <rect x="0.5" y="0.5" width="1199" height="${height - 1}" rx="11.5" fill="none" stroke="#241c1a"/>

  <g font-family="'Helvetica Neue',Helvetica,Arial,sans-serif">
    <text x="44" y="31" fill="#e2d3cd" font-size="12.5" font-weight="500" letter-spacing="5.4" filter="url(#textGlow)">ACTIVITY PULSE</text>
    <text x="1156" y="31" text-anchor="end" font-size="12" letter-spacing="0.3">
      <tspan fill="#ecdad3" font-weight="600">${total}</tspan><tspan fill="#7d6a65"> contributions · last 365 days</tspan>
    </text>
  </g>

  <g filter="url(#pulseGlow)">${glowMarkup.join("")}</g>
  <g>${cellMarkup.join("")}</g>
  <rect width="1200" height="${height}" rx="12" filter="url(#pulseGrain)" opacity="0.05"/>
</svg>
`;
}

const calendar = await getCalendar();
const svg = build(calendar);
mkdirSync(join(ROOT, "assets"), { recursive: true });
writeFileSync(join(ROOT, "assets", "activity-pulse.svg"), svg, "utf8");
console.log(`activity-pulse.svg · ${calendar.totalContributions} contributions · ${calendar.weeks.length} weeks`);
