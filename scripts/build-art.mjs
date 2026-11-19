// Builds the static artwork used by README.md.
//   node scripts/build-art.mjs
// Icons are fetched from skillicons.dev once and cached in assets/icons/, so
// later builds (and the README itself) never depend on a third-party server.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ASSETS, C, esc, svgDoc, save, textW, jollyRoger, ship, waveBand, waveCss, compass, rope, chip,
} from './lib.mjs';

// deterministic PRNG so rebuilding doesn't churn the files
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function wrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
function hero() {
  const W = 960, H = 380;
  const lines = [
    'Full-Stack Engineer · MERN · Next.js · TypeScript',
    'Cloud & DevOps explorer on AWS',
    'Building AI products with Gemini, RAG & voice agents',
    '2× Avishkar winner · 4× national hackathon finalist',
    'Java DSA grinder · 150+ LeetCode problems',
  ];
  const per = 3.2, cycle = per * lines.length;
  const pct = (s) => ((s / cycle) * 100).toFixed(2);
  const stars = Array.from({ length: 55 }, (_, i) => {
    const x = (rnd() * W).toFixed(1), y = (rnd() * 230).toFixed(1), r = (0.6 + rnd() * 1.4).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" class="tw" style="animation-delay:${(rnd() * 4).toFixed(2)}s;animation-duration:${(2.5 + rnd() * 3).toFixed(2)}s"/>`;
  }).join('');
  const roles = lines.map((l, i) => `<text x="0" y="0" class="s role r${i}" font-size="23" font-weight="500" fill="${C.text}" style="animation-delay:${(i * per).toFixed(2)}s">${esc(l)}</text>`).join('');
  const gull = (x, y, s, d) => `<g transform="translate(${x},${y}) scale(${s})"><path class="gull" style="animation-delay:${d}s" d="M-12,0 Q-6,-8 0,0 Q6,-8 12,0" stroke="#dfe7ef" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;

  const css = `
.tw{animation:tw 3s ease-in-out infinite;}
@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}
.role{opacity:0;animation:role ${cycle}s ease-in-out infinite;}
.r0{opacity:1;}
@keyframes role{0%{opacity:0;transform:translateY(12px)}${pct(0.45)}%{opacity:1;transform:translateY(0)}${pct(per - 0.45)}%{opacity:1;transform:translateY(0)}${pct(per)}%{opacity:0;transform:translateY(-10px)}100%{opacity:0}}
.bob{animation:bob 4.5s ease-in-out infinite;}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.6deg)}50%{transform:translateY(5px) rotate(1.6deg)}}
.flag{animation:flag 1.2s ease-in-out infinite alternate;transform-origin:3px -142px;}
@keyframes flag{from{transform:scaleX(1)}to{transform:scaleX(.78)}}
.gull{animation:gull 1.4s ease-in-out infinite alternate;}
@keyframes gull{from{transform:scaleY(1)}to{transform:scaleY(-.5)}}
.drift{animation:drift 26s linear -4s infinite;}
@keyframes drift{from{transform:translateX(-120px)}to{transform:translateX(1100px)}}
.glow{animation:glow 5s ease-in-out infinite;}
@keyframes glow{0%,100%{opacity:.55}50%{opacity:.9}}
.cur{animation:cur 1s steps(1) infinite;}
@keyframes cur{50%{opacity:0}}
${waveCss('w1', 160, 9)}${waveCss('w2', 220, 13, true)}${waveCss('w3', 140, 7)}`;

  const body = `
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.night}"/><stop offset=".55" stop-color="#16294a"/><stop offset=".85" stop-color="#3a2f52"/><stop offset="1" stop-color="#6b3f4f"/>
  </linearGradient>
  <radialGradient id="moonGlow"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
  <linearGradient id="nameG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars}
  <circle cx="842" cy="78" r="90" fill="url(#moonGlow)" class="glow"/>
  <circle cx="842" cy="78" r="32" fill="#f8efd4"/>
  <circle cx="852" cy="70" r="6" fill="#e6d9b4"/><circle cx="832" cy="90" r="4" fill="#e6d9b4"/>
  <g class="drift">${gull(80, 70, 1, 0)}${gull(118, 92, 0.75, 0.4)}</g>
  ${gull(640, 120, 0.8, 0.2)}${gull(668, 104, 0.6, 0.7)}

  <g transform="translate(0,0)">${waveBand({ w: W, y: 292, amp: 9, period: 160, fill: '#23507a', cls: 'w1' })}</g>
  <g transform="translate(735,300) scale(.92)"><g class="bob">${ship()}</g></g>
  <g>${waveBand({ w: W, y: 308, amp: 8, period: 220, fill: '#1a3d63', cls: 'w2' })}</g>
  <g>${waveBand({ w: W, y: 330, amp: 7, period: 140, fill: '#10294a', cls: 'w3' })}</g>

  <text x="54" y="92" class="s" font-size="17" font-weight="600" letter-spacing="6" fill="${C.straw}">HI THERE, I'M</text>
  <text x="50" y="168" class="p" font-size="84" fill="url(#nameG)" stroke="#1a0f05" stroke-width="2" paint-order="stroke">Om Sanjay Borle</text>
  <rect x="54" y="196" width="4" height="30" rx="2" fill="${C.red}"/>
  <g transform="translate(70,220)">${roles}</g>
  <text x="54" y="262" class="s" font-size="15" fill="${C.muted}" letter-spacing="1">Final-year B.Tech · Computer Engineering · RCPIT Shirpur, Maharashtra, India</text>
  <text x="${W / 2}" y="364" text-anchor="middle" class="s" font-size="14" letter-spacing="3" fill="#9fb3c8cc">— DESIGNING, BUILDING &amp; SHIPPING SOFTWARE PEOPLE ENJOY USING —</text>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="21" fill="none" stroke="${C.gold}" stroke-opacity=".45" stroke-width="3"/>`;
  save('hero.svg', svgDoc({ w: W, h: H, title: 'Om Sanjay Borle — Full-Stack Engineer', css, body }));
}

// ---------------------------------------------------------------------------
// SOCIAL BUTTONS
// ---------------------------------------------------------------------------
function buttons() {
  const list = [
    ['portfolio', 'Portfolio', 'myself-om.vercel.app', 'compass'],
    ['linkedin', 'LinkedIn', 'in/om-borle', 'in'],
    ['leetcode', 'LeetCode', '150+ solved', 'lc'],
    ['x', 'Twitter / X', '@omborle', 'x'],
  ];
  for (const [file, label, sub, glyph] of list) {
    const W = 230, H = 64;
    let g;
    if (glyph === 'compass') g = `<g transform="translate(34,32)">${compass(17)}</g>`;
    else if (glyph === 'in') g = `<rect x="18" y="16" width="32" height="32" rx="7" fill="#0a66c2"/><text x="34" y="40" text-anchor="middle" class="s" font-weight="800" font-size="19" fill="#fff">in</text>`;
    else if (glyph === 'lc') g = `<rect x="18" y="16" width="32" height="32" rx="7" fill="#ffa116"/><path d="M38,24 L29,33 L38,42" stroke="#1a1a1a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="32" y1="33" x2="43" y2="33" stroke="#7a7a7a" stroke-width="3" stroke-linecap="round"/>`;
    else g = `<rect x="18" y="16" width="32" height="32" rx="7" fill="#000" stroke="#444"/><path d="M26,24 L42,40 M42,24 L26,40" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    const body = `
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${C.deep}" stroke="${C.gold}" stroke-opacity=".7" stroke-width="2"/>
${g}
<text x="64" y="32" class="p" font-size="25" fill="${C.gold}">${esc(label)}</text>
<text x="64" y="50" class="s" font-size="12.5" fill="${C.muted}">${esc(sub)}</text>`;
    save(`buttons/${file}.svg`, svgDoc({ w: W, h: H, title: label, body }));
  }
}

// ---------------------------------------------------------------------------
// SECTION HEADERS
// ---------------------------------------------------------------------------
const SECTIONS = [
  ['about', '01', 'About Me', 'who I am & what I do'],
  ['stack', '02', 'Tech Stack', 'tools & technologies I work with'],
  ['projects', '03', 'Featured Projects', 'live demos & private builds'],
  ['cloud', '04', 'Cloud Projects', 'serverless & DevOps on AWS'],
  ['achievements', '05', 'Achievements', 'hackathons, awards & milestones'],
  ['stats', '06', 'GitHub Stats', 'auto-updated daily by GitHub Actions'],
];
function headers() {
  for (const [file, num, title, sub] of SECTIONS) {
    const W = 960, H = 92;
    const css = `.spin{animation:spin 30s linear infinite;}@keyframes spin{to{transform:rotate(360deg)}}`;
    const body = `
<defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient></defs>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="18" fill="url(#hg)" stroke="${C.gold}" stroke-opacity=".5" stroke-width="2"/>
<g transform="translate(52,46)"><g class="spin">${compass(26)}</g></g>
<text x="98" y="61" class="p" font-size="46" fill="${C.gold}">${esc(title)}</text>
<text x="${W - 34}" y="40" text-anchor="end" class="s" font-size="15" font-weight="700" letter-spacing="4" fill="${C.red}">${num} / 06</text>
<text x="${W - 34}" y="64" text-anchor="end" class="s" font-size="17" fill="${C.muted}">${esc(sub)}</text>`;
    save(`headers/${file}.svg`, svgDoc({ w: W, h: H, title: `${title} — ${sub}`, css, body }));
  }
}

// ---------------------------------------------------------------------------
// ABOUT ME
// ---------------------------------------------------------------------------
function about() {
  const W = 960, PAD = 40;
  const bio = 'I build products end to end: React & Next.js frontends, Node/Express APIs and MongoDB & Redis data layers, shipped on AWS and Vercel, increasingly with AI built in.';
  const tiles = [
    ['ROLE', 'Full-Stack Engineer · MERN, Next.js & TypeScript', C.red],
    ['EDUCATION', 'B.Tech Computer Engineering, RCPIT Shirpur · CGPA 8.65', C.gold],
    ['EXPERIENCE', 'SDE Intern @ Nullclass: shipped "Twiller", a MERN social app', C.teal],
    ['CURRENTLY LEARNING', 'AWS serverless, CI/CD pipelines & DevOps', C.teal],
    ['EXPLORING', 'AI products with Gemini: RAG & voice agents', C.red],
    ['PRACTICE', 'Java DSA · 150+ LeetCode · Blender for 3D', C.gold],
  ];
  const bioLines = wrap(bio, 98);
  let y = 64;
  let body = `
<defs><linearGradient id="ab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>
<clipPath id="ac"><rect x="2" y="2" width="${W - 4}" height="10000" rx="20"/></clipPath></defs>`;
  let inner = '';
  bioLines.forEach((l, i) => { inner += `<text x="${PAD}" y="${y + i * 30}" class="s" font-size="20" fill="${C.text}">${esc(l)}</text>`; });
  y += (bioLines.length - 1) * 30 + 34;
  const COLS = 3, G = 16, TW = (W - PAD * 2 - G * (COLS - 1)) / COLS, LINE = 23, CH = 32;
  const wrapped = tiles.map(([, v]) => wrap(v, CH));
  const rows = Math.ceil(tiles.length / COLS);
  for (let r = 0; r < rows; r++) {
    const rowTiles = tiles.slice(r * COLS, r * COLS + COLS);
    const maxLines = Math.max(...rowTiles.map((_, i) => wrapped[r * COLS + i].length));
    const TH = 50 + maxLines * LINE + 6;
    rowTiles.forEach(([label, , color], c) => {
      const tx = PAD + c * (TW + G);
      inner += `<g transform="translate(${tx.toFixed(1)},${y})">
<rect x="0" y="0" width="${TW.toFixed(1)}" height="${TH}" rx="14" fill="#0a1424" fill-opacity=".55" stroke="${C.gold}" stroke-opacity=".22"/>
<rect x="0" y="14" width="4" height="${TH - 28}" rx="2" fill="${color}"/>
<text x="20" y="32" class="s" font-size="12.5" font-weight="700" letter-spacing="2.2" fill="${C.gold}">${label}</text>
${wrapped[r * COLS + c].map((l, i) => `<text x="20" y="${58 + i * LINE}" class="s" font-size="16.5" fill="${C.text}">${esc(l)}</text>`).join('')}
</g>`;
    });
    y += TH + G;
  }
  y += 14;
  inner += `<g transform="translate(${PAD + 8},${y})">
  <circle r="6" fill="${C.green}" class="pulse"/><circle r="6" fill="${C.green}"/>
  <text x="18" y="5.5" class="s" font-size="16" font-weight="600" fill="${C.green}">Open to internships, freelance &amp; full-time roles</text>
</g>`;
  const H = y + 34;
  body += `
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="url(#ab)"/>
<g transform="translate(${W - 74},${H - 36}) scale(.3)" opacity=".5">${jollyRoger({ skull: C.gold, bone: C.gold, dark: C.deep, hat: C.straw, band: C.red })}</g>
${inner}
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="none" stroke="${C.gold}" stroke-opacity=".5" stroke-width="2.5"/>`;
  const css = `.pulse{animation:pulse 1.8s ease-out infinite;transform-origin:center;transform-box:fill-box;}
@keyframes pulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.6);opacity:0}}`;
  save('about.svg', svgDoc({ w: W, h: H, title: 'About Om Sanjay Borle', css, body }));
}

// ---------------------------------------------------------------------------
// TECH STACK
// ---------------------------------------------------------------------------
const ICON_LABEL = {
  react: 'React', nextjs: 'Next.js', ts: 'TypeScript', js: 'JavaScript', tailwind: 'Tailwind', vite: 'Vite',
  nodejs: 'Node.js', express: 'Express', mongodb: 'MongoDB', redis: 'Redis', firebase: 'Firebase', mysql: 'MySQL',
  aws: 'AWS', docker: 'Docker', githubactions: 'Actions', nginx: 'Nginx', vercel: 'Vercel', linux: 'Linux',
  java: 'Java', python: 'Python', git: 'Git', postman: 'Postman', vscode: 'VS Code', blender: 'Blender',
};
async function icon(name) {
  const dir = join(ASSETS, 'icons');
  const file = join(dir, `${name}.svg`);
  if (!existsSync(file)) {
    mkdirSync(dir, { recursive: true });
    const res = await fetch(`https://skillicons.dev/icons?i=${name}&theme=dark`);
    if (!res.ok) throw new Error(`icon ${name}: ${res.status}`);
    writeFileSync(file, await res.text());
  }
  const raw = readFileSync(file, 'utf8');
  // keep only the inner icon <svg>, and namespace its ids so icons don't collide
  const start = raw.indexOf('<svg', raw.indexOf('<g'));
  const end = raw.lastIndexOf('</svg>', raw.lastIndexOf('</svg>') - 1) + 6;
  let inner = raw.slice(start, end);
  inner = inner.replace(/id="([^"]+)"/g, `id="${name}_$1"`).replace(/url\(#([^)]+)\)/g, `url(#${name}_$1)`).replace(/href="#([^"]+)"/g, `href="#${name}_$1"`);
  // drop the icon's own size so we can position/scale it ourselves
  inner = inner.replace(/^<svg([^>]*)>/, (_, attrs) => `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, '')}>`);
  return inner;
}
async function arsenal() {
  const panels = [
    ['Frontend', 'Responsive, accessible interfaces', ['react', 'nextjs', 'ts', 'js', 'tailwind', 'vite']],
    ['Backend & Data', 'APIs, databases & caching', ['nodejs', 'express', 'mongodb', 'redis', 'firebase', 'mysql']],
    ['Cloud & DevOps', 'Deployments, pipelines & infrastructure', ['aws', 'docker', 'githubactions', 'nginx', 'vercel', 'linux']],
    ['Languages & Tools', 'Problem solving, tooling & 3D', ['java', 'python', 'git', 'postman', 'vscode', 'blender']],
  ];
  const W = 960, PW = 468, PH = 214, GAP = 24;
  let body = '';
  for (let p = 0; p < panels.length; p++) {
    const [title, kicker, icons] = panels[p];
    const px = (p % 2) * (PW + GAP), py = Math.floor(p / 2) * (PH + GAP);
    body += `<g transform="translate(${px},${py})">
<rect x="1" y="1" width="${PW - 2}" height="${PH - 2}" rx="18" fill="${C.deep}" stroke="${C.gold}" stroke-opacity=".4" stroke-width="2"/>
<rect x="1" y="1" width="8" height="${PH - 2}" rx="4" fill="${[C.red, C.gold, C.teal, C.straw][p]}" opacity=".9"/>
<text x="30" y="46" class="p" font-size="32" fill="${C.gold}">${esc(title)}</text>
<text x="30" y="72" class="s" font-size="14" font-style="italic" fill="${C.muted}">${esc(kicker)}</text>`;
    const size = 56, gap = (PW - 60 - icons.length * size) / (icons.length - 1);
    for (let i = 0; i < icons.length; i++) {
      const ix = 30 + i * (size + gap), iy = 96;
      const svg = (await icon(icons[i])).replace('<svg ', `<svg x="${ix.toFixed(1)}" y="${iy}" width="${size}" height="${size}" `);
      body += `<g class="ic" style="animation-delay:${((p * 6 + i) * 0.15).toFixed(2)}s">${svg}</g>`;
      body += `<text x="${(ix + size / 2).toFixed(1)}" y="${iy + size + 24}" text-anchor="middle" class="s" font-size="13" fill="${C.text}" opacity=".85">${ICON_LABEL[icons[i]]}</text>`;
    }
    body += '</g>';
  }
  const H = PH * 2 + GAP;
  const css = `.ic{animation:ic 6s ease-in-out infinite;}@keyframes ic{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`;
  save('tech-stack.svg', svgDoc({ w: W, h: H, title: 'Tech stack: React, Next.js, TypeScript, Node.js, Express, MongoDB, Redis, AWS, Docker, Java, Python and more', css, body }));
}

// ---------------------------------------------------------------------------
// PROJECT CARDS
// ---------------------------------------------------------------------------
export const PROJECTS = [
  {
    file: 'flowforge', name: 'FlowForge', kind: 'AUTOMATION PLATFORM', status: 'live',
    tagline: 'Visual workflow automation engine',
    desc: 'Drag trigger and action blocks (schedules, HTTP calls, filters, email) onto a canvas to build pipelines. A Redis + BullMQ worker fleet runs them reliably in the background.',
    tech: ['Next.js', 'TypeScript', 'React Flow', 'BullMQ', 'Redis', 'MongoDB'],
  },
  {
    file: 'productiq', name: 'ProductIQ', kind: 'AI SAAS', status: 'private',
    tagline: 'AI post-sale support for physical products',
    desc: 'Customers scan a QR code on a product and get instant, mobile-first help. Answers are grounded in the maker\'s own manuals via Gemini retrieval; anything unsolved becomes a ticket.',
    tech: ['React 19', 'Express 5', 'Gemini', 'RAG', 'React Query'],
  },
  {
    file: 'vocalise', name: 'Vocalise AI', kind: 'VOICE AI', status: 'live',
    tagline: 'Real-time AI interview simulator',
    desc: 'Practise interviews out loud: Vapi handles the speech, Gemini plays the interviewer, and Next.js API routes plus Firebase keep it all serverless.',
    tech: ['Next.js', 'Vapi', 'Gemini', 'Firebase', 'Tailwind'],
  },
  {
    file: 'artcase', name: 'ArtCase', kind: 'E-COMMERCE', status: 'private',
    tagline: 'Premium digital art marketplace',
    desc: 'Gallery-grade storefront with Razorpay checkout, auto-generated PDF invoices, custom commission requests, a full admin panel and AI-powered artwork tagging.',
    tech: ['React', 'TypeScript', 'Express', 'MongoDB', 'Razorpay', 'Cloudinary'],
  },
  {
    file: 'endgame', name: 'The Endgame', kind: 'REAL-TIME · TEAM BUILD', status: 'live',
    tagline: 'Real-time multiplayer game platform',
    desc: 'Built with the Akatsuki Coding Club team for a live coding event: Socket.io keeps game state in sync across many concurrent players with low-latency play.',
    tech: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind'],
  },
  {
    file: 'secureqgen', name: 'SecureQGen', kind: 'WEB3 · TEAM BUILD', status: 'live',
    tagline: 'Leak-proof exam paper generation',
    desc: 'Blockchain, IPFS and cryptography keep question papers sealed until exam time, and make every step of the process transparent and auditable.',
    tech: ['Next.js', 'TypeScript', 'Ethers.js', 'IPFS', 'Zustand'],
  },
];
function projectCards() {
  PROJECTS.forEach((p, idx) => {
    const W = 480, H = 280;
    const live = p.status === 'live';
    const pill = live
      ? `<g transform="translate(${W - 98},26)"><rect width="74" height="26" rx="13" fill="#4ade801f" stroke="#4ade8066"/><circle cx="16" cy="13" r="4.5" fill="${C.green}" class="pulse"/><circle cx="16" cy="13" r="4.5" fill="${C.green}"/><text x="27" y="18" class="s" font-size="12.5" font-weight="700" letter-spacing="1.5" fill="${C.green}">LIVE</text></g>`
      : `<g transform="translate(${W - 118},26)"><rect width="94" height="26" rx="13" fill="#9fb3c81a" stroke="#9fb3c855"/><rect x="12" y="11" width="11" height="9" rx="2" fill="${C.muted}"/><path d="M14,11 v-3 a3.5,3.5 0 0 1 7,0 v3" stroke="${C.muted}" stroke-width="1.8" fill="none"/><text x="29" y="18" class="s" font-size="12.5" font-weight="700" letter-spacing="1.5" fill="${C.muted}">PRIVATE</text></g>`;
    const desc = wrap(p.desc, 60).slice(0, 4).map((l, i) => `<text x="28" y="${140 + i * 20}" class="s" font-size="14" fill="${C.muted}">${esc(l)}</text>`).join('');
    let cx = 28, chips = '';
    for (const t of p.tech) {
      const c = chip(cx, 228, t, { size: 12 });
      if (cx + c.w > W - 24) break;
      chips += c.svg; cx += c.w + 7;
    }
    const css = `.pulse{animation:pulse 1.8s ease-out infinite;transform-origin:center;transform-box:fill-box;}
@keyframes pulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.4);opacity:0}}
.sh{animation:sh 7s ease-in-out infinite;}@keyframes sh{0%,70%,100%{transform:translateX(-200px)}85%{transform:translateX(700px)}}`;
    const body = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>
  <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="cl"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18"/></clipPath>
</defs>
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="url(#bg)"/>
<g clip-path="url(#cl)">
  <g transform="translate(${W - 70},${H - 72}) scale(.9)" opacity=".07">${jollyRoger({ skull: C.gold, bone: C.gold, dark: C.deep, hat: C.gold, band: C.deep })}</g>
  <rect class="sh" x="0" y="0" width="160" height="${H}" fill="url(#shine)" transform="skewX(-20)"/>
</g>
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="none" stroke="${C.gold}" stroke-opacity=".5" stroke-width="2"/>
<text x="28" y="44" class="s" font-size="12" font-weight="700" letter-spacing="2.5" fill="${C.red}">PROJECT ${String(idx + 1).padStart(2, '0')} · ${esc(p.kind)}</text>
${pill}
<text x="26" y="88" class="p" font-size="40" fill="${C.gold}">${esc(p.name)}</text>
<text x="28" y="114" class="s" font-size="15.5" font-weight="600" fill="${C.text}">${esc(p.tagline)}</text>
${desc}
${chips}`;
    save(`projects/${p.file}.svg`, svgDoc({ w: W, h: H, title: `${p.name} — ${p.tagline}`, css, body }));
  });
}

// ---------------------------------------------------------------------------
// ACHIEVEMENTS
// ---------------------------------------------------------------------------
function battles() {
  const items = [
    ['gold', '2× Avishkar Winner', '2nd prize · Jalgaon region, 2025', 'among 100+ research projects'],
    ['gold', 'SIH Internal Winner', 'Smart India Hackathon 2024', 'RCPIT selection rounds'],
    ['red', '4× National Finalist', 'Innovo · SunHacks · Yugantar', '20–30 hour build sprints'],
    ['silver', 'AnimeVerse 2nd Prize', 'RCPIT Shirpur, 2025', 'teamwork & creative solving'],
    ['teal', '150+ LeetCode', 'Java DSA practice', 'consistent problem solving'],
    ['straw', 'SDE Intern', 'Nullclass · Jul–Aug 2025', 'shipped the "Twiller" MERN app'],
  ];
  const colors = { gold: [C.gold, C.goldDeep], silver: ['#dfe6ee', '#8a9bb0'], red: ['#ef5b5b', C.redDeep], teal: ['#5fc4d4', C.teal], straw: [C.straw, '#a8842f'] };
  const W = 960, TW = 304, TH = 132, G = 24;
  let body = '';
  items.forEach(([col, title, l1, l2], i) => {
    const x = (i % 3) * (TW + G), y = Math.floor(i / 3) * (TH + G);
    const [c1, c2] = colors[col];
    body += `<g transform="translate(${x},${y})">
<rect x="1" y="1" width="${TW - 2}" height="${TH - 2}" rx="16" fill="${C.deep}" stroke="${c1}" stroke-opacity=".45" stroke-width="2"/>
<g transform="translate(50,66)">
  <path d="M-14,-44 L-6,-14 L6,-14 L14,-44 Z" fill="${C.red}"/><path d="M-4,-44 L0,-14 L4,-44 Z" fill="#fff" opacity=".4"/>
  <g class="medal" style="animation-delay:${(i * 0.4).toFixed(1)}s">
    <circle r="24" fill="${c2}"/><circle r="19" fill="${c1}"/>
    <path d="M0,-10 L3,-3 L10,-3 L4.5,1.5 L6.5,9 L0,4.5 L-6.5,9 L-4.5,1.5 L-10,-3 L-3,-3 Z" fill="${c2}"/>
  </g>
</g>
<text x="92" y="50" class="p" font-size="25" fill="${c1}">${esc(title)}</text>
<text x="93" y="78" class="s" font-size="14" font-weight="600" fill="${C.text}">${esc(l1)}</text>
<text x="93" y="100" class="s" font-size="13.5" fill="${C.muted}">${esc(l2)}</text>
</g>`;
  });
  const css = `.medal{animation:medal 4s ease-in-out infinite;}@keyframes medal{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}`;
  save('achievements.svg', svgDoc({ w: W, h: TH * 2 + G, title: 'Achievements: 2× Avishkar winner, SIH internal winner, 4× national hackathon finalist, AnimeVerse 2nd prize, 150+ LeetCode, Nullclass SDE intern', css, body }));
}

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------
function footer() {
  const W = 960, H = 210;
  const css = `${waveCss('f1', 180, 10)}${waveCss('f2', 130, 7, true)}
.sail{animation:sail 24s linear -9s infinite;}@keyframes sail{from{transform:translateX(-140px)}to{transform:translateX(1100px)}}
.bob{animation:bob 3.5s ease-in-out infinite;}@keyframes bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(4px) rotate(2deg)}}
.flag{}`;
  const body = `
<defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="#1c3557"/></linearGradient>
<clipPath id="fc"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="url(#fg)"/>
  <text x="${W / 2}" y="64" text-anchor="middle" class="p" font-size="44" fill="${C.gold}">Thanks for visiting!</text>
  <text x="${W / 2}" y="96" text-anchor="middle" class="s" font-size="17" fill="${C.muted}">Ideas, collaborations and pull requests are always welcome. Let's build something great.</text>
  ${waveBand({ w: W, y: 160, amp: 8, period: 180, fill: '#23507a', cls: 'f1' })}
  <g class="sail"><g transform="translate(0,168) scale(.34)"><g class="bob">${ship()}</g></g></g>
  ${waveBand({ w: W, y: 176, amp: 6, period: 130, fill: '#10294a', cls: 'f2' })}
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="21" fill="none" stroke="${C.gold}" stroke-opacity=".45" stroke-width="3"/>`;
  save('footer.svg', svgDoc({ w: W, h: H, title: 'Thanks for visiting!', css, body }));
}

console.log('Building artwork…');
hero();
buttons();
headers();
about();
await arsenal();
projectCards();
battles();
footer();
console.log('Done.');
