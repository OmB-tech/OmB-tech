// Shared helpers for the One Piece–themed profile artwork.
// Every SVG is fully self-contained (fonts embedded as data URIs, no external
// requests) so it renders identically on github.com, the GitHub mobile app,
// light mode, dark mode and anywhere the README is mirrored.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ASSETS = join(ROOT, 'assets');

export const C = {
  night: '#0a1424',
  deep: '#0f1f36',
  navy: '#142a47',
  sea: '#1b4965',
  teal: '#2a7f8f',
  foam: '#9fd3e0',
  gold: '#f2c14e',
  goldDeep: '#c99a2e',
  straw: '#e9c46a',
  red: '#d62828',
  redDeep: '#9d1c1c',
  parchment: '#f1e2bf',
  parchDark: '#d9c08f',
  ink: '#3a2414',
  text: '#e8eef6',
  muted: '#9fb3c8',
  green: '#4ade80',
};

const fontCache = {};
function fontData(name) {
  if (!fontCache[name]) {
    fontCache[name] = readFileSync(join(ASSETS, 'fonts', `${name}.woff`)).toString('base64');
  }
  return fontCache[name];
}

export const PIRATA = `'Pirata', 'Pirata One', Georgia, 'Times New Roman', serif`;
export const SANS = `'Outfit', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

export function fontCss({ pirata = true, outfit = true } = {}) {
  let css = '';
  if (pirata) css += `@font-face{font-family:'Pirata';src:url(data:font/woff;base64,${fontData('Pirata')}) format('woff');}`;
  if (outfit) css += `@font-face{font-family:'Outfit';font-weight:100 900;src:url(data:font/woff;base64,${fontData('Outfit')}) format('woff');}`;
  return css;
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function svgDoc({ w, h, title, css = '', body, fonts = {} }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${fontCss(fonts)}
.p{font-family:${PIRATA};}
.s{font-family:${SANS};}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important;}}
</style>
${body}
</svg>
`;
}

export function save(rel, content) {
  const file = join(ASSETS, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log(`  wrote assets/${rel} (${(content.length / 1024).toFixed(1)} KB)`);
}

// Rough text width for Outfit (good enough for laying out chips).
export const textW = (s, size, k = 0.56) => String(s).length * size * k;

// ---------------------------------------------------------------------------
// Artwork pieces
// ---------------------------------------------------------------------------

/** An original straw-hat jolly roger, centred on (0,0), ~140px wide at scale 1. */
export function jollyRoger({ bone = '#f5f1e6', skull = '#f5f1e6', dark = '#111', hat = C.straw, band = C.red } = {}) {
  const boneEl = (rot) => `
    <g transform="rotate(${rot})">
      <rect x="-62" y="-7" width="124" height="14" rx="7" fill="${bone}"/>
      <circle cx="-62" cy="-8" r="10" fill="${bone}"/><circle cx="-62" cy="8" r="10" fill="${bone}"/>
      <circle cx="62" cy="-8" r="10" fill="${bone}"/><circle cx="62" cy="8" r="10" fill="${bone}"/>
    </g>`;
  return `
  <g>
    <g transform="translate(0,22)">${boneEl(32)}${boneEl(-32)}</g>
    <path d="M-40,4 C-40,-34 40,-34 40,4 C40,22 30,30 24,32 L24,46 L-24,46 L-24,32 C-30,30 -40,22 -40,4 Z" fill="${skull}"/>
    <ellipse cx="-15" cy="8" rx="10" ry="12" fill="${dark}"/>
    <ellipse cx="15" cy="8" rx="10" ry="12" fill="${dark}"/>
    <path d="M0,20 L-6,30 L6,30 Z" fill="${dark}"/>
    <g stroke="${dark}" stroke-width="2.4">
      <line x1="-14" y1="36" x2="-14" y2="46"/><line x1="-5" y1="36" x2="-5" y2="46"/>
      <line x1="5" y1="36" x2="5" y2="46"/><line x1="14" y1="36" x2="14" y2="46"/>
    </g>
    <path d="M-34,-16 C-34,-50 34,-50 34,-16 Z" fill="${hat}"/>
    <rect x="-34" y="-24" width="68" height="9" fill="${band}"/>
    <ellipse cx="0" cy="-15" rx="58" ry="9" fill="${hat}"/>
    <path d="M-52,-15 Q0,-9 52,-15" stroke="#00000033" stroke-width="2" fill="none"/>
  </g>`;
}

/** An original little sailing ship, origin at waterline centre. ~220px wide. */
export function ship() {
  return `
  <g>
    <!-- masts -->
    <rect x="-4" y="-150" width="7" height="150" fill="#5b3a1e"/>
    <rect x="-62" y="-95" width="5" height="95" fill="#5b3a1e"/>
    <!-- flag -->
    <path class="flag" d="M3,-150 L36,-142 L3,-134 Z" fill="${C.red}"/>
    <!-- main sail -->
    <path d="M-48,-132 Q0,-140 50,-132 Q60,-85 50,-40 Q0,-48 -48,-40 Q-58,-85 -48,-132 Z" fill="#f6efdc" stroke="#cdbf9f" stroke-width="2"/>
    <g transform="translate(1,-88) scale(0.42)">${jollyRoger({ skull: '#1a1a1a', bone: '#1a1a1a', dark: '#f6efdc' })}</g>
    <!-- fore sail -->
    <path d="M-60,-90 L-60,-34 L-104,-34 Z" fill="#f6efdc" stroke="#cdbf9f" stroke-width="2"/>
    <!-- hull -->
    <path d="M-118,-30 L110,-30 Q104,4 72,14 L-86,14 Q-110,0 -118,-30 Z" fill="#7a4a24"/>
    <path d="M-118,-30 L110,-30 L108,-22 L-115,-22 Z" fill="${C.gold}"/>
    <g fill="#3d2410"><circle cx="-60" cy="-6" r="5"/><circle cx="-24" cy="-6" r="5"/><circle cx="12" cy="-6" r="5"/><circle cx="48" cy="-6" r="5"/></g>
    <!-- figurehead (a cheerful round head) -->
    <circle cx="116" cy="-38" r="14" fill="#f2e2b6"/>
    <path d="M104,-44 Q116,-58 128,-44" stroke="#c99a2e" stroke-width="3" fill="none"/>
  </g>`;
}

/** Seamlessly scrolling sine-ish wave band. */
export function waveBand({ w, y, amp, period, fill, cls, h = 200 }) {
  const reps = Math.ceil((w * 2) / period) + 2;
  let d = `M0,${y}`;
  for (let i = 0; i < reps; i++) {
    const x = i * period;
    d += ` Q${x + period / 4},${y - amp} ${x + period / 2},${y} T${x + period},${y}`;
  }
  d += ` L${reps * period},${y + h} L0,${y + h} Z`;
  return `<path class="${cls}" d="${d}" fill="${fill}"/>`;
}

export function waveCss(cls, period, seconds, reverse = false) {
  const from = reverse ? -period : 0;
  const to = reverse ? 0 : -period;
  return `.${cls}{animation:${cls} ${seconds}s linear infinite;}
@keyframes ${cls}{from{transform:translateX(${from}px);}to{transform:translateX(${to}px);}}`;
}

/** Small compass rose, centred. */
export function compass(r = 40, color = C.gold) {
  return `
  <g opacity="0.9">
    <circle r="${r}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>
    <circle r="${r * 0.7}" fill="none" stroke="${color}" stroke-width="1" opacity="0.35"/>
    <path d="M0,${-r} L${r * 0.14},0 L0,${r} L${-r * 0.14},0 Z" fill="${color}"/>
    <path d="M${-r},0 L0,${r * 0.14} L${r},0 L0,${-r * 0.14} Z" fill="${color}" opacity="0.55"/>
    <circle r="${r * 0.08}" fill="${C.night}"/>
  </g>`;
}

/** Rope border inside a rounded rect. */
export function rope(x, y, w, h, r = 18) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${C.goldDeep}" stroke-width="3" stroke-dasharray="7 4" opacity="0.55"/>`;
}

export function chip(x, y, label, { size = 13, fg = C.gold, bg = '#f2c14e1a', stroke = '#f2c14e55' } = {}) {
  const w = textW(label, size) + 22;
  return {
    w,
    svg: `<g transform="translate(${x},${y})"><rect width="${w}" height="${size + 13}" rx="${(size + 13) / 2}" fill="${bg}" stroke="${stroke}"/><text x="${w / 2}" y="${size + 2.5}" text-anchor="middle" class="s" font-size="${size}" font-weight="500" fill="${fg}">${esc(label)}</text></g>`,
  };
}
