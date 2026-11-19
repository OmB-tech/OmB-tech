// Regenerates the live "Ship's Log" cards:
//   assets/generated/voyage.svg     contribution sea-chart + streaks
//   assets/generated/languages.svg  language breakdown ("Haki mastery")
//
// Runs daily from .github/workflows/ships-log.yml. No third-party services:
// data comes straight from GitHub (public contribution calendar + REST API).
//
// Env:
//   GH_USER   GitHub username (default OmB-tech)
//   GH_TOKEN  optional. A personal access token with read access to your repos
//             lets the language card include private repositories. Without it
//             only public repos are counted (and an earlier private-inclusive
//             card is kept rather than downgraded).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ASSETS, C, esc, svgDoc, save, ship, waveBand, waveCss } from './lib.mjs';

const USER = process.env.GH_USER || 'OmB-tech';
const TOKEN = process.env.GH_TOKEN || '';
const STATE_FILE = join(ASSETS, 'generated', 'stats.json');

async function api(path, { auth = true } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'ships-log-readme' };
  if (auth && TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------- contributions
async function contributions() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, { headers: { 'User-Agent': 'ships-log-readme' } });
  if (!res.ok) throw new Error(`contributions → ${res.status}`);
  const html = await res.text();
  const days = new Map(); // id -> {date, level}
  for (const m of html.matchAll(/<td[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?id="([^"]+)"[^>]*?data-level="(\d)"/g)) {
    days.set(m[2], { date: m[1], level: +m[3], count: 0 });
  }
  for (const m of html.matchAll(/<tool-tip[^>]*?for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const d = days.get(m[1]);
    if (!d) continue;
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    d.count = n ? +n[1].replace(/,/g, '') : 0;
  }
  const list = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  if (list.length < 300) throw new Error(`contribution calendar looks wrong (${list.length} days)`);
  return list;
}

function streaks(days) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1, current = 0;
  if (days[i].count === 0) i--; // today not counted yet doesn't break the streak
  for (; i >= 0 && days[i].count > 0; i--) current++;
  const total = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const best = days.reduce((b, d) => (d.count > b.count ? d : b), days[0]);
  return { longest, current, total, activeDays, best };
}

// ---------------------------------------------------------------- repos / langs
async function repoStats() {
  let repos = null, includesPrivate = false;
  if (TOKEN) {
    try {
      const me = await api('/user');
      if (me.login?.toLowerCase() === USER.toLowerCase()) {
        repos = [];
        for (let page = 1; page < 10; page++) {
          const batch = await api(`/user/repos?per_page=100&page=${page}&affiliation=owner`);
          repos.push(...batch);
          if (batch.length < 100) break;
        }
        includesPrivate = true;
      }
    } catch { /* token can't read /user (e.g. the Actions GITHUB_TOKEN) */ }
  }
  if (!repos) repos = await api(`/users/${USER}/repos?per_page=100&type=owner`);
  repos = repos.filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== USER.toLowerCase());
  const langs = {};
  for (const r of repos) {
    try {
      const l = await api(`/repos/${r.full_name}/languages`);
      for (const [k, v] of Object.entries(l)) langs[k] = (langs[k] || 0) + v;
    } catch { /* skip */ }
  }
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  return { includesPrivate, repoCount: repos.length, stars, langs };
}

// ---------------------------------------------------------------- rendering
const LEVEL = ['#223a5c', '#1f6f8b', '#2fa3a8', '#c99a2e', '#f7cd5d'];
const fmt = (n) => n.toLocaleString('en-US');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function contributionsSvg(days, s, repoCount) {
  const W = 960, H = 360, cell = 13, gap = 3, step = cell + gap;
  const first = new Date(days[0].date + 'T00:00:00Z');
  const offset = first.getUTCDay(); // calendar columns start on Sunday
  const cols = Math.ceil((days.length + offset) / 7);
  const gx = Math.round((W - cols * step) / 2) + 14, gy = 150;
  let cells = '', months = '', lastMonth = -1;
  days.forEach((d, i) => {
    const idx = i + offset, col = Math.floor(idx / 7), row = idx % 7;
    const x = gx + col * step, y = gy + row * step;
    cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${LEVEL[d.level]}" class="c" style="animation-delay:${(col * 0.025).toFixed(3)}s"><title>${d.count} on ${d.date}</title></rect>`;
    const m = +d.date.slice(5, 7) - 1;
    if (row === 0 && m !== lastMonth && col < cols - 1) {
      if (lastMonth !== -1 || +d.date.slice(8) <= 7) months += `<text x="${x}" y="${gy - 10}" class="s" font-size="12" fill="${C.muted}">${MONTHS[m]}</text>`;
      lastMonth = m;
    }
  });
  const dayLabels = [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']].map(([r, t]) => `<text x="${gx - 8}" y="${gy + r * step + 10}" text-anchor="end" class="s" font-size="11" fill="${C.muted}">${t}</text>`).join('');
  const stats = [
    [fmt(s.total), 'contributions · last 12 months'],
    [`${s.current}`, s.current === 1 ? 'day · current streak' : 'days · current streak'],
    [`${s.longest}`, 'days · longest streak'],
    [`${repoCount}`, 'repositories'],
  ];
  const statSvg = stats.map(([n, l], i) => {
    const x = 40 + i * 225;
    return `<g transform="translate(${x},0)">
      ${i ? `<line x1="-14" y1="40" x2="-14" y2="98" stroke="${C.gold}" stroke-opacity=".2"/>` : ''}
      <text x="0" y="80" class="p" font-size="50" fill="${C.gold}">${esc(n)}</text>
      <text x="2" y="104" class="s" font-size="13" fill="${C.muted}">${esc(l)}</text></g>`;
  }).join('');
  const legend = LEVEL.map((c, i) => `<rect x="${W - 196 + i * 17}" y="${H - 50}" width="13" height="13" rx="3" fill="${c}"/>`).join('');
  const css = `.c{animation:in .5s ease-out both;}@keyframes in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
${waveCss('vw', 120, 6)}
.sail{animation:sail 30s linear -12s infinite;}@keyframes sail{from{transform:translateX(-80px)}to{transform:translateX(1040px)}}
.bob{animation:bob 3s ease-in-out infinite;}@keyframes bob{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}`;
  const updated = new Date().toISOString().slice(0, 10);
  const body = `
<defs><linearGradient id="vg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>
<clipPath id="vc"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>
<g clip-path="url(#vc)">
<rect width="${W}" height="${H}" fill="url(#vg)"/>
${statSvg}
${months}${dayLabels}${cells}
<text x="${W - 206}" y="${H - 39}" text-anchor="end" class="s" font-size="12" fill="${C.muted}">Less</text>${legend}
<text x="${W - 106}" y="${H - 39}" class="s" font-size="12" fill="${C.gold}">More</text>
<text x="40" y="${H - 39}" class="s" font-size="12" fill="${C.muted}">${s.activeDays} active days · best day ${s.best.count} on ${s.best.date} · updated ${updated}</text>
${waveBand({ w: W, y: H - 14, amp: 4, period: 120, fill: '#1d4466', cls: 'vw', h: 40 })}
<g class="sail"><g transform="translate(0,${H - 14}) scale(.17)"><g class="bob">${ship()}</g></g></g>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="21" fill="none" stroke="${C.gold}" stroke-opacity=".45" stroke-width="3"/>`;
  return svgDoc({ w: W, h: H, title: `${fmt(s.total)} contributions in the last year · current streak ${s.current} days · longest streak ${s.longest} days`, css, body });
}

const LANG_COLOR = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#a86bd8', Python: '#3572a5', Java: '#b07219',
  Shell: '#89e051', Dockerfile: '#4a90c8', SCSS: '#c6538c', Solidity: '#aa6746', EJS: '#a91e50',
};
function languagesSvg(langs, repoCount, includesPrivate) {
  const W = 960, H = 200;
  const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
  if (rest) top.push(['Other', rest]);
  const barX = 36, barW = W - 72, barY = 84;
  let x = barX, bar = '', legend = '';
  top.forEach(([name, v], i) => {
    const w = (v / total) * barW;
    const color = LANG_COLOR[name] || '#7d8da1';
    bar += `<rect x="${x.toFixed(1)}" y="${barY}" width="${Math.max(w, 2).toFixed(1)}" height="18" fill="${color}"/>`;
    x += w;
    const lx = 40 + (i % 3) * 300, ly = 140 + Math.floor(i / 3) * 30;
    legend += `<circle cx="${lx + 6}" cy="${ly - 5}" r="6" fill="${color}"/><text x="${lx + 20}" y="${ly}" class="s" font-size="15" font-weight="600" fill="${C.text}">${esc(name)}</text><text x="${lx + 250}" y="${ly}" text-anchor="end" class="s" font-size="15" fill="${C.muted}">${((v / total) * 100).toFixed(1)}%</text>`;
  });
  const css = `.bar{animation:grow 1.4s cubic-bezier(.2,.8,.2,1) both;transform-origin:${barX}px 0;}@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`;
  const body = `
<defs><linearGradient id="lgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>
<clipPath id="bc"><rect x="${barX}" y="${barY}" width="${barW}" height="18" rx="9"/></clipPath></defs>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="21" fill="url(#lgb)" stroke="${C.gold}" stroke-opacity=".45" stroke-width="3"/>
<text x="36" y="56" class="p" font-size="36" fill="${C.gold}">Most Used Languages</text>
<text x="${W - 36}" y="54" text-anchor="end" class="s" font-size="14" fill="${C.muted}">languages by code volume across ${repoCount} ${includesPrivate ? 'public &amp; private ' : 'public '}repositories</text>
<g clip-path="url(#bc)"><rect x="${barX}" y="${barY}" width="${barW}" height="18" fill="#16263d"/><g class="bar">${bar}</g></g>
${legend}`;
  return svgDoc({ w: W, h: H, title: `Top languages: ${top.map(([n, v]) => `${n} ${((v / total) * 100).toFixed(0)}%`).join(', ')}`, css, body, fonts: {} });
}

// ---------------------------------------------------------------- main
const prev = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : null;
const days = await contributions();
const s = streaks(days);
let repo = await repoStats();
if (!repo.includesPrivate && prev?.includesPrivate) {
  console.log('No private-repo access this run; keeping the previous private-inclusive language card.');
  repo = { includesPrivate: true, repoCount: prev.repoCount, stars: prev.stars, langs: prev.langs };
}
save('generated/contributions.svg', contributionsSvg(days, s, repo.repoCount));
save('generated/languages.svg', languagesSvg(repo.langs, repo.repoCount, repo.includesPrivate));
save('generated/stats.json', JSON.stringify({ ...repo, contributions: s.total, currentStreak: s.current, longestStreak: s.longest }, null, 2) + '\n');
console.log(`total=${s.total} current=${s.current} longest=${s.longest} repos=${repo.repoCount} private=${repo.includesPrivate}`);
