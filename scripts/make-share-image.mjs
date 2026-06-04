// Generates public/share.png — the 1200x630 social-share card used by the
// Open Graph / Twitter meta tags in index.html. Re-run with `npm run make:share-image`
// after changing the wording or palette. Dev-only: never bundled into the app.
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "public", "share.png");

// Palette pulled straight from the app's CSS variables.
const GOLD = "#ffd23f";
const CREAM = "#fbf7ec";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="-12%" r="125%">
      <stop offset="0%" stop-color="#15a05a"/>
      <stop offset="42%" stop-color="#0a5c34"/>
      <stop offset="100%" stop-color="#04140c"/>
    </radialGradient>
    <pattern id="grid" width="70" height="70" patternUnits="userSpaceOnUse">
      <path d="M70 0H0V70" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.05"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Soccer ball -->
  <circle cx="600" cy="150" r="66" fill="none" stroke="${GOLD}" stroke-width="4"/>
  <circle cx="600" cy="150" r="62" fill="#ffffff"/>
  <path d="M600,128 L620.9,143.2 L612.9,167.8 L587.1,167.8 L579.1,143.2 Z" fill="#0e1a12"/>
  <g stroke="#0e1a12" stroke-width="3" stroke-linecap="round">
    <line x1="600" y1="128" x2="600" y2="90"/>
    <line x1="620.9" y1="143.2" x2="658" y2="131"/>
    <line x1="612.9" y1="167.8" x2="635" y2="199"/>
    <line x1="587.1" y1="167.8" x2="565" y2="199"/>
    <line x1="579.1" y1="143.2" x2="542" y2="131"/>
  </g>

  <!-- Kicker -->
  <text x="600" y="292" text-anchor="middle" fill="${GOLD}"
        font-family="Helvetica, Arial, sans-serif" font-size="25" font-weight="700"
        letter-spacing="5">SUMMER 2026 · 48 NATIONS · ONE FAMILY RIVALRY</text>

  <!-- Title -->
  <text x="600" y="392" text-anchor="middle" fill="${CREAM}"
        font-family="Impact, 'Arial Black', sans-serif" font-size="96" font-weight="900"
        letter-spacing="2">THE FAMILY</text>
  <text x="600" y="486" text-anchor="middle" fill="${GOLD}"
        font-family="Impact, 'Arial Black', sans-serif" font-size="96" font-weight="900"
        letter-spacing="2">WORLD CUP DRAW</text>

  <!-- Subtitle -->
  <text x="600" y="544" text-anchor="middle" fill="${CREAM}" fill-opacity="0.82"
        font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="500">Share out all 48 teams · climb the family leaderboard</text>

  <!-- ProfitPulse credit -->
  <text x="600" y="598" text-anchor="middle" fill="${GOLD}"
        font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700"
        letter-spacing="2">BUILT BY PROFITPULSE</text>
</svg>`;

mkdirSync(dirname(out), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(out);
console.log("Wrote", out);
