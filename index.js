// Météores : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Pluie de météores</span><span class=\"hint\" id=\"shInfo\"></span></div>\n      <div class=\"gameBox tall\"><canvas id=\"shCanvas\" width=\"240\" height=\"320\"></canvas></div>\n      <div class=\"hint\">Flèches, ZQSD ou souris : bouger · le vaisseau tire tout seul · espace ou clic droit : bombe (une par vague) · P ou Échap : pause. Seul le cockpit (le point blanc) peut être touché. Des météores, des drones, et un vaisseau amiral toutes les 5 vagues. Bonus : arme plus forte, bouclier, vie.</div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;box-shadow:0 0 0 3px var(--line2)}
.gameBox canvas{width:min(100%,1152px);aspect-ratio:384/144;image-rendering:pixelated;cursor:var(--cp,pointer)}
.gameBox.tall canvas{width:auto;height:min(720px,72vh);aspect-ratio:240/320}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "shooterApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  const LEGACY_GAMES = {"top":[],"best":"^shooter"};
  let games = await doc('games');
  if (games == null) {  // première ouverture : tu retrouves tes records et tes parties d'avant
    const old = legacy.api ? await legacy.api('games').catch(() => null) : null; games = { best: {} };
    if (old) { const re = new RegExp(LEGACY_GAMES.best); for (const [k, v] of Object.entries(old.best || {})) if (re.test(k)) games.best[k] = v; for (const k of LEGACY_GAMES.top) if (old[k] !== undefined) games[k] = old[k]; await folder.write('games', games); }
  }
  games = { best: {}, ...games };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v, higher = true) => { const b = games.best[k]; if (b == null || (higher ? v > b : v < b)) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);  // la section d'un jeu
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // centred pixel-font lines over a dark band
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  g.textAlign = 'center';
  lines.forEach(([text, color, size], i) => { g.fillStyle = color; g.font = (size || 8) + 'px "Press Start 2P", monospace'; g.fillText(text, w / 2, y0 + i * 14); });
  g.textAlign = 'left';
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
  // ---- ton code d'origine ----
/* ---------- jeu "Météores": a vertical shoot'em up. The ship moves everywhere; meteors that split, enemy ships (zigzag shooters,
   in waves) and a boss every 5 waves; the ship fires on its own, one bomb per wave clears the screen; bonuses: weapon power
   from 1 to 5, shield, life; a combo multiplier. Best score and best wave are kept in games.json (synced). ---------- */
const SH = {W: 240, H: 320,
  ship: ['....oo....', '...owwo...', '...opco...', '..oppppo..', '.oppppppo.', 'oppoppoppo', 'opo.oo.opo', 'oo..yy..oo', '....yy....'],
  pal: {o: '#3e1f80', p: '#ff5ad9', w: '#ffffff', c: '#7fe0ee', y: '#ffd07a', r: '#ff4f6d', g: '#8ee8a0', k: '#1c1238', b: '#5e4d85', d: '#2a1d52', l: '#c9bdf0'},
  sizes: {3: {r: 11, hp: 4, pts: 20}, 2: {r: 7, hp: 2, pts: 40}, 1: {r: 4, hp: 1, pts: 80}},
  foes: {
    drone: {hp: 3, pts: 60, r: 6, rows: ['.k....k.', 'krk..krk', 'krrrrrrk', '.krwwrk.', '..krrk..', '...kk...']},
    kamikaze: {hp: 2, pts: 80, r: 5, rows: ['..kk..', '.kyyk.', 'kyrryk', 'kyrryk', '.kyyk.', '..kk..']},
    turret: {hp: 10, pts: 150, r: 8, rows: ['..kkkkkk..', '.kbbbbbbk.', 'kbllccllbk', 'kbllccllbk', 'kbbbbbbbbk', '.kbbkkbbk.', '..kk..kk..']},
    boss: {hp: 420, pts: 3000, r: 22, rows: [
      '......kkkkkkkkkkkk......', '....kkrrrrrrrrrrrrkk....', '..kkrrppppppppppppprrk..', '.krrpppwwppppppwwppprrk.', 'krrpppwccwppppwccwppprrk',
      'krppppwccwppppwccwpppprk', 'krpppppwwppyyppwwpppppk.', '.krpppppppyyyypppppprk..', '..krrpppppyyyyppppprk...', 'k..krrrppppyypppprrk..k', 'kk...krrrrrrrrrrrk...kk', '.kk.....kkkkkkkk....kk.']},
  },
  items: {P: ['#7fe0ee', 'Arme +1'], B: ['#ff9a3c', 'Bombe'], S: ['#8ee8a0', 'Bouclier'], L: ['#ff4f6d', 'Vie'], M: ['#b46aee', 'Aimant'], G: ['#ffd07a', '']},
};
const shDisc = {};  // pixel discs drawn once per radius
function shRock(r) {
  if (shDisc[r]) return shDisc[r];
  const c = document.createElement('canvas'); c.width = c.height = r * 2 + 2; const g = c.getContext('2d');
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x, y); if (d <= r + .3) { const lit = (x + y) / r; g.fillStyle = d > r - 1.2 ? '#3a2a6e' : lit < -.5 ? '#c9bdf0' : lit < .4 ? '#8f7bb8' : '#5e4d85'; g.fillRect(x + r + 1, y + r + 1, 1, 1); } }
  for (let k = 0; k < Math.max(1, r / 3); k++) { const a = k * 2.4, d = r * .45; g.fillStyle = '#4a3c86'; g.fillRect(Math.round(r + 1 + Math.cos(a) * d), Math.round(r + 1 + Math.sin(a) * d), Math.max(1, r / 4 | 0) + 1, Math.max(1, r / 4 | 0) + 1); }
  return (shDisc[r] = c);
}
let sh = null;
function shStart() {
  sh = sh || {raf: 0};
  Object.assign(sh, {g: $('shCanvas').getContext('2d'), mode: 'ready', tick: 0, t: 0, x: SH.W / 2, y: SH.H - 34, vx: 0, vy: 0, target: null, shots: [], bullets: [], rocks: [], foes: [], items: [], parts: [], score: 0, lives: 3,
    inv: 0, cool: 0, power: 1, bombs: 1, flashB: 0, shield: 0, magnet: 0, mult: 1, multT: 0, kills: 0, wave: 0, queue: [], spawnT: 0, banner: 0, dry: 0, boss: null, shake: 0, keys: {}, firing: false, overAt: 0,
    stars: Array.from({length: 90}, () => [Math.random() * SH.W, Math.random() * SH.H, Math.random()])});
  shNextWave();
  $('shInfo').textContent = 'Record : ' + (games?.best.shooter ?? 0) + ' · meilleure vague ' + (games?.best.shooterWave ?? 0);
  gameLoop(sh, 'neodex:shooter', shUpdate, shDraw);
}
function shNextWave() {  // what the wave sends, one after the other; every 5th wave is a boss
  sh.wave++; sh.banner = 120; if (sh.bombs < 1) sh.bombs = 1; sh.queue = []; sh.spawnT = 90;
  const w = sh.wave;
  if (w % 5 === 0) { sh.queue.push({kind: 'boss', at: 60}); return; }
  let at = 0;
  const add = (kind, n, gap, extra = {}) => { for (let i = 0; i < n; i++) { sh.queue.push({kind, at, i, n, ...extra}); at += gap; } at += 40; };
  add('rock', Math.min(4 + w, 16), Math.max(20, 44 - w * 2));
  if (w >= 2) add('drone', Math.min(3 + Math.floor(w / 2), 9), 22, {lane: Math.random() < .5 ? -1 : 1});
  if (w >= 6) add('drone', Math.min(4 + Math.floor(w / 3), 10), 18, {lane: 0});
  sh.queue.sort((a, b) => a.at - b.at);
}
function shSpawn(q) {
  const w = sh.wave, hpK = 1 + Math.min(w, 25) * .07  /* la solidité des ennemis cesse de monter à la vague 25 */;
  if (q.kind === 'rock') { const sz = Math.random() < .25 + w * .03 ? 3 : Math.random() < .6 ? 2 : 1, r = SH.sizes[sz].r; sh.rocks.push({x: r + Math.random() * (SH.W - 2 * r), y: -r - 2, vx: (Math.random() - .5) * .5, vy: .5 + Math.random() * .35 + Math.min(w, 16) * .05, sz, hp: SH.sizes[sz].hp, flash: 0}); return; }
  if (q.kind === 'boss') { const hp = Math.round(SH.foes.boss.hp * (w / 5) ** .9); sh.boss = {x: SH.W / 2, y: -30, hp, max: hp, t: 0, flash: 0, phase: 0}; sh.banner = 150; sfx('launch'); return; }
  const d = SH.foes[q.kind], x = q.kind === 'drone' ? (q.lane === 0 ? 30 + (q.i % 6) * 36 : SH.W / 2 + q.lane * 60) : 20 + Math.random() * (SH.W - 40);
  sh.foes.push({kind: q.kind, x, y: -10, x0: x, t: 0, hp: Math.ceil(d.hp * hpK), flash: 0, vx: 0, vy: q.kind === 'turret' ? .35 : 1.1, cool: 60 + Math.random() * 60, phase: Math.random() * 6});
}
function shPress() {
  if (!sh) return;
  if (sh.mode === 'ready' || sh.mode === 'pause') { sh.mode = 'play'; return true; }
  if (sh.mode === 'over') { if (Date.now() - sh.overAt > 700) { shStart(); sh.mode = 'play'; } return true; }
}
function shBoom(x, y, n, colors, speed = 1.8) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, s = Math.random() * speed + .4; sh.parts.push({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 18 + Math.random() * 14, c: colors[k % colors.length]}); } }
function shDrop(x, y, chance) {
  chance += Math.min(.2, sh.dry * .01);  // la chance monte tant que rien ne tombe
  if (Math.random() < chance) {
    sh.dry = 0;
    // arme +1 plus fréquente quand tu es faible, bouclier quand il te reste une vie, vie surtout quand tu en as peu
    const wts = {P: sh.power <= 2 ? .5 : .35, S: sh.lives <= 1 ? .35 : .2, L: sh.lives < 3 ? .15 : sh.lives < 5 ? .06 : 0};
    let r = Math.random() * Object.values(wts).reduce((s, v) => s + v, 0), kind = 'P';
    for (const [k, v] of Object.entries(wts)) if ((r -= v) < 0) { kind = k; break; }
    sh.items.push({x, y, kind, vy: .6});
  } else sh.dry++;
}
function shAim(x, y, speed, spread = 0, n = 1) {  // enemy bullets toward the ship
  const a0 = Math.atan2(sh.y - y, sh.x - x);
  for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * spread; sh.bullets.push({x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed}); }
}
function shRing(x, y, n, speed, rot = 0) { for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; sh.bullets.push({x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed}); } }
function shKill(x, y, pts, colors) {
  sh.kills++; sh.mult = Math.min(8, 1 + Math.floor(sh.kills / 10) * .5); sh.multT = 240;  // the multiplier grows every 10 kills without being hit
  sh.score += Math.round(pts * sh.mult); shBoom(x, y, 14, colors); sfx('click');
}
function shBomb() {
  if (!sh.bombs || sh.mode !== 'play') return;
  sh.bombs--; sh.flashB = 24; sh.shake = 14; sh.bullets = []; sfx('launch');
  for (const r of sh.rocks) r.hp -= 6;
  for (const f of sh.foes) f.hp -= 12;
  if (sh.boss) { sh.boss.hp -= 40; sh.boss.flash = 6; }
}
function shHurt() {
  if (sh.inv > 0) return;
  if (sh.shield > 0) { sh.shield = 0; sh.inv = 60; sfx('click'); shBoom(sh.x, sh.y, 10, ['#8ee8a0', '#ffffff']); return; }
  sh.lives--; if (sh.lives === 1 && sh.bombs < 1) sh.bombs = 1; sh.inv = 140; sh.shake = 12; sh.power = Math.max(1, sh.power - 1); sh.mult = 1; sh.kills = Math.floor(sh.kills / 2); sh.bullets = [];
  shBoom(sh.x, sh.y, 24, ['#ff5ad9', '#ffffff', '#ffd07a'], 2.4); sfx('error');
  if (sh.lives <= 0) {
    sh.mode = 'over'; sh.overAt = Date.now();
    const rec = best('shooter', sh.score); best('shooterWave', sh.wave); saveGames();
    $('shInfo').textContent = 'Score ' + sh.score + ' · vague ' + sh.wave + (rec ? ' · NOUVEAU RECORD !' : ' · record ' + games.best.shooter);
  }
}
function shFire() {
  const p = sh.power, y = sh.y - 8, s = (x, vx, vy = -5.5, dmg = 1, homing = false) => sh.shots.push({x: sh.x + x, y, vx, vy, dmg, homing});
  if (p === 1) s(0, 0);
  if (p === 2) { s(-3, 0); s(3, 0); }
  if (p >= 3) { s(0, 0, -5.8, 1.2); s(-3, -.7); s(3, .7); }
  if (p >= 4) { s(-5, -1.4, -5); s(5, 1.4, -5); }
  if (p >= 5 && sh.t % 3 === 0) { s(-6, -1.5, -3, 2, true); s(6, 1.5, -3, 2, true); }
  sh.cool = p >= 4 ? 8 : 10; sfx('type');
}
function shUpdate() {
  sh.t++;
  // ship: both axes, keyboard (arrows, ZQSD / WASD) or glides toward the mouse
  const K = sh.keys, left = K.ArrowLeft || K.q || K.a, right = K.ArrowRight || K.d, up = K.ArrowUp || K.z || K.w, down = K.ArrowDown || K.s;
  if (left || right || up || down) { sh.target = null; sh.vx += (right ? .5 : 0) - (left ? .5 : 0); sh.vy += (down ? .5 : 0) - (up ? .5 : 0); }
  else if (sh.target) { sh.vx += Math.max(-.5, Math.min(.5, (sh.target[0] - sh.x) * .09)); sh.vy += Math.max(-.5, Math.min(.5, (sh.target[1] - sh.y) * .09)); }
  sh.vx = Math.max(-3, Math.min(3, sh.vx * .84)); sh.vy = Math.max(-3, Math.min(3, sh.vy * .84));
  sh.x = Math.max(6, Math.min(SH.W - 6, sh.x + sh.vx)); sh.y = Math.max(40, Math.min(SH.H - 10, sh.y + sh.vy));
  if (--sh.cool <= 0) shFire();  // le vaisseau tire tout seul
  for (const k of ['inv', 'shield', 'magnet', 'banner', 'flashB']) if (sh[k] > 0) sh[k]--;
  if (sh.multT > 0 && --sh.multT === 0) { sh.mult = 1; sh.kills = 0; }
  // the wave
  sh.spawnT++;
  while (sh.queue.length && sh.queue[0].at <= sh.spawnT - 90) shSpawn(sh.queue.shift());
  if (!sh.queue.length && !sh.rocks.length && !sh.foes.length && !sh.boss) { sh.score += 200 * sh.wave; shNextWave(); sfx('notify'); }
  // player shots (the homing ones turn toward the nearest target)
  const targets = () => [...sh.foes, ...sh.rocks, ...(sh.boss ? [sh.boss] : [])];
  for (const s of sh.shots) {
    if (s.homing) { const t = targets().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0]; if (t) { const a = Math.atan2(t.y - s.y, t.x - s.x); s.vx += Math.cos(a) * .35; s.vy += Math.sin(a) * .35; const v = Math.hypot(s.vx, s.vy); s.vx *= 4.5 / v; s.vy *= 4.5 / v; } }
    s.x += s.vx; s.y += s.vy;
  }
  // meteors
  for (const r of sh.rocks) { r.x += r.vx; r.y += r.vy; if (r.x < SH.sizes[r.sz].r || r.x > SH.W - SH.sizes[r.sz].r) r.vx *= -1; if (r.flash) r.flash--; }
  // enemy ships: drones sway down and shoot, kamikazes dive at the ship, turrets stop and fire spreads
  for (const f of sh.foes) {
    f.t++; if (f.flash) f.flash--;
    if (f.kind === 'drone') { f.y += f.vy; f.x = f.x0 + Math.sin(f.t / 30 + f.phase) * 26; if (--f.cool <= 0 && f.y > 10 && f.y < SH.H * .6) { shAim(f.x, f.y + 4, 1.7); f.cool = Math.max(50, 120 - sh.wave * 6); } }
    if (f.kind === 'kamikaze') { if (f.t < 50) f.y += 1; else { const a = Math.atan2(sh.y - f.y, sh.x - f.x); f.vx += Math.cos(a) * .12; f.vy += Math.sin(a) * .12; const v = Math.hypot(f.vx, f.vy), m = Math.min(2.5, 2 + sh.wave * .04); if (v > m) { f.vx *= m / v; f.vy *= m / v; } f.x += f.vx; f.y += f.vy; } }
    if (f.kind === 'turret') { if (f.y < 60) f.y += f.vy; else { f.x += Math.sin(f.t / 50) * .4; if (--f.cool <= 0) { shAim(f.x, f.y + 6, 1.5, .28, 3 + (sh.wave >= 8 ? 2 : 0)); f.cool = 110; } } if (f.t > 900) f.y += .8; }
    if (f.y > SH.H + 20 || f.x < -30 || f.x > SH.W + 30) f.gone = true;
  }
  // the boss: comes down, sways, three attack patterns in turn
  const B = sh.boss;
  if (B) {
    B.t++; if (B.flash) B.flash--;
    if (B.y < 50) B.y += .6; else {
      B.x = SH.W / 2 + Math.sin(B.t / 90) * 70;
      const ph = Math.floor(B.t / 240) % 3, k = B.t % 240, rage = B.hp < B.max * .4;
      if (ph === 0 && k % (rage ? 30 : 45) === 0) shRing(B.x, B.y + 8, rage ? 18 : 12, 1.4, B.t / 20);
      if (ph === 1 && k % 20 === 0 && k % 80 < 60) shAim(B.x, B.y + 10, 2.1, .16, rage ? 5 : 3);
      if (ph === 2 && k % 5 === 0) { const a = B.t / 9; sh.bullets.push({x: B.x, y: B.y + 8, vx: Math.cos(a) * 1.6, vy: Math.abs(Math.sin(a)) * 1.6 + .4}); }
    }
  }
  for (const b of sh.bullets) { b.x += b.vx; b.y += b.vy; }
  // hits on rocks, ships and the boss
  for (const s of sh.shots) {
    if (s.hit) continue;
    for (const r of sh.rocks) { const R = SH.sizes[r.sz].r; if (!r.dead && Math.abs(s.x - r.x) < R + 1 && Math.abs(s.y - r.y) < R + 2) { s.hit = true; r.flash = 3; r.hp -= s.dmg; break; } }
    if (s.hit) continue;
    for (const f of sh.foes) { const R = SH.foes[f.kind].r; if (!f.dead && Math.abs(s.x - f.x) < R && Math.abs(s.y - f.y) < R) { s.hit = true; f.flash = 3; f.hp -= s.dmg; break; } }
    if (s.hit || !B) continue;
    if (Math.abs(s.x - B.x) < 22 && Math.abs(s.y - B.y) < 12) { s.hit = true; B.flash = 2; B.hp -= s.dmg; sh.score += 2; }
  }
  for (const r of sh.rocks) if (!r.dead && r.hp <= 0) {
    r.dead = true; shKill(r.x, r.y, SH.sizes[r.sz].pts, ['#c9bdf0', '#8f7bb8', '#ffd07a']);
    if (r.sz > 1) for (const d of [-1, 1]) sh.rocks.push({x: r.x + d * 3, y: r.y, vx: d * (.5 + Math.random() * .4), vy: r.vy * .9, sz: r.sz - 1, hp: SH.sizes[r.sz - 1].hp, flash: 0});  // splits in two
    shDrop(r.x, r.y, .05);
  }
  for (const f of sh.foes) if (!f.dead && f.hp <= 0) { f.dead = true; shKill(f.x, f.y, SH.foes[f.kind].pts, ['#ff4f6d', '#ffd07a', '#ffffff']); shDrop(f.x, f.y, f.kind === 'turret' ? .6 : .12); }
  if (B && B.hp <= 0) {
    shKill(B.x, B.y, SH.foes.boss.pts * (sh.wave / 5), ['#ff5ad9', '#ffd07a', '#ffffff', '#7fe0ee']); shBoom(B.x, B.y, 60, ['#ff5ad9', '#ffd07a', '#ffffff'], 3);
    for (const k of ['P', 'B', 'S', 'L']) sh.items.push({x: B.x + (Math.random() - .5) * 40, y: B.y, kind: k, vy: .6});
    sh.boss = null; sh.shake = 20; sh.bullets = [];
  }
  sh.shots = sh.shots.filter(s => !s.hit && s.y > -8 && s.y < SH.H + 8 && s.x > -8 && s.x < SH.W + 8);
  // items: fall, pulled by the magnet
  for (const it of sh.items) {
    if (sh.magnet > 0 || it.kind === 'G' && Math.hypot(it.x - sh.x, it.y - sh.y) < 30) { const a = Math.atan2(sh.y - it.y, sh.x - it.x); it.x += Math.cos(a) * 2.6; it.y += Math.sin(a) * 2.6; } else it.y += it.vy;
    if (!it.got && Math.abs(it.x - sh.x) < 9 && Math.abs(it.y - sh.y) < 9) {
      it.got = true; sfx('notify');
      if (it.kind === 'P') { if (sh.power < 5) sh.power++; else sh.score += 500; } if (it.kind === 'B') sh.bombs = Math.min(5, sh.bombs + 1);
      if (it.kind === 'S') sh.shield = 900; if (it.kind === 'L') sh.lives = Math.min(6, sh.lives + 1); if (it.kind === 'M') sh.magnet = 600; if (it.kind === 'G') sh.score += Math.round(50 * sh.mult);
    }
  }
  sh.items = sh.items.filter(it => !it.got && it.y < SH.H + 8);
  // the ship is hit by meteors, ships, bullets (its hitbox is the cockpit only)
  if (sh.mode === 'play') {
    for (const r of sh.rocks) if (!r.dead && Math.hypot(r.x - sh.x, r.y - sh.y) < SH.sizes[r.sz].r * .8 + 2) { r.dead = true; shBoom(r.x, r.y, 10, ['#c9bdf0', '#8f7bb8']); shHurt(); }
    for (const f of sh.foes) if (!f.dead && Math.hypot(f.x - sh.x, f.y - sh.y) < SH.foes[f.kind].r * .8 + 1) { f.dead = true; shBoom(f.x, f.y, 12, ['#ff4f6d', '#ffd07a']); shHurt(); }
    for (const b of sh.bullets) if (!b.hit && Math.hypot(b.x - sh.x, b.y - sh.y) < 3) { b.hit = true; shHurt(); }
    if (B && Math.abs(B.x - sh.x) < 18 && Math.abs(B.y - sh.y) < 8) shHurt();
  }
  sh.rocks = sh.rocks.filter(r => !r.dead && r.y < SH.H + 14);
  sh.foes = sh.foes.filter(f => !f.dead && !f.gone);
  sh.bullets = sh.bullets.filter(b => !b.hit && b.y > -8 && b.y < SH.H + 8 && b.x > -8 && b.x < SH.W + 8);
  for (const p of sh.parts) { p.x += p.vx; p.y += p.vy; p.vx *= .96; p.vy *= .96; p.life--; }
  sh.parts = sh.parts.filter(p => p.life > 0);
}
function shDraw() {
  const g = sh.g, W = SH.W, H = SH.H, k = sh.shake > 0 ? (sh.shake--, (Math.random() - .5) * 4) : 0;
  g.save(); g.translate(Math.round(k), Math.round(k / 2));
  const neb = ['#07021a', '#0a0420', '#06081e', '#0c0318'][Math.floor((sh.wave - 1) / 5) % 4];  // the sky changes after each boss
  px(g, neb, -4, -4, W + 8, H + 8);
  for (const s of sh.stars) { if (sh.mode === 'play') s[1] = (s[1] + .2 + s[2] * 1.2) % H; px(g, s[2] > .85 ? '#ffffff' : s[2] > .5 ? '#8f7bb8' : '#3a2a6e', s[0], s[1], 1, s[2] > .9 ? 3 : 1); }
  for (const r of sh.rocks) { const R = SH.sizes[r.sz].r; g.drawImage(shRock(R), Math.round(r.x - R - 1), Math.round(r.y - R - 1)); if (r.flash) { g.globalAlpha = .6; px(g, '#ffffff', r.x - R + 1, r.y - R + 1, R * 2 - 2, R * 2 - 2); g.globalAlpha = 1; } }
  for (const f of sh.foes) { const d = SH.foes[f.kind], w = d.rows[0].length; sprite(g, d.rows, Math.round(f.x - w / 2), Math.round(f.y - d.rows.length / 2), f.flash ? {k: '#ffffff', r: '#ffffff', y: '#ffffff', w: '#ffffff', b: '#ffffff', l: '#ffffff', c: '#ffffff'} : SH.pal); }
  const B = sh.boss;
  if (B) {
    const d = SH.foes.boss; g.save(); g.translate(Math.round(B.x - 24), Math.round(B.y - 12)); g.scale(2, 2); sprite(g, d.rows, 0, 0, B.flash ? {k: '#ffffff', r: '#ffffff', p: '#ffffff', w: '#ffffff', c: '#ffffff', y: '#ffffff'} : SH.pal); g.restore();
    px(g, '#05010b', 20, 30, W - 40, 5); px(g, '#2a1d52', 21, 31, W - 42, 3); px(g, B.hp < B.max * .4 ? '#ff4f6d' : '#ff5ad9', 21, 31, (W - 42) * Math.max(0, B.hp / B.max), 3);
  }
  for (const it of sh.items) {
    const [c] = SH.items[it.kind];
    if (it.kind === 'G') { px(g, c, it.x - 2, it.y - 2, 4, 4); px(g, '#ffffff', it.x - 1, it.y - 2, 1, 1); continue; }
    px(g, '#130a20', it.x - 6, it.y - 6, 12, 12); px(g, c, it.x - 5, it.y - 5, 10, 10); g.font = '6px "Press Start 2P", monospace'; g.fillStyle = '#130a20'; g.textAlign = 'center'; g.fillText(it.kind, it.x + .5, it.y + 3); g.textAlign = 'left';
  }
  for (const s of sh.shots) { if (s.homing) { px(g, '#ffd07a', s.x - 1, s.y - 1, 2, 3); continue; } px(g, '#e0ffff', s.x, s.y, 1, 4); px(g, '#7fe0ee', s.x, s.y + 4, 1, 2); }
  for (const b of sh.bullets) { px(g, '#ff4f6d', b.x - 1.5, b.y - 1.5, 3, 3); px(g, '#ffd0d8', b.x - .5, b.y - .5, 1, 1); }
  if (sh.mode !== 'over' && (sh.inv === 0 || (sh.tick >> 2) % 2)) {
    sprite(g, SH.ship, sh.x - 5, sh.y - 4, SH.pal);
    if ((sh.tick >> 2) % 2) px(g, '#ff9a3c', sh.x - 1, sh.y + 5, 2, 2 + (sh.vy < 0 ? 2 : 0));  // engine flicker
    px(g, '#ffffff', sh.x - .5, sh.y - .5, 1, 1);  // the hitbox
    if (sh.shield > 0) { g.strokeStyle = sh.shield < 120 && (sh.tick >> 3) % 2 ? 'rgba(142,232,160,.3)' : 'rgba(142,232,160,.8)'; g.strokeRect(sh.x - 9.5, sh.y - 9.5, 19, 19); }
    if (sh.magnet > 0 && (sh.tick >> 3) % 2) { g.strokeStyle = 'rgba(180,106,238,.5)'; g.strokeRect(sh.x - 13.5, sh.y - 13.5, 27, 27); }
  }
  for (const p of sh.parts) px(g, p.c, p.x, p.y, p.life > 10 ? 2 : 1, p.life > 10 ? 2 : 1);
  if (sh.flashB) { g.fillStyle = `rgba(255,240,220,${sh.flashB / 30})`; g.fillRect(-4, -4, W + 8, H + 8); }
  g.restore();
  // interface
  px(g, 'rgba(11,3,28,.7)', 0, 0, W, 26);
  g.font = '8px "Press Start 2P", monospace'; g.fillStyle = '#ffffff'; g.fillText(String(sh.score).padStart(7, '0'), 5, 11);
  g.font = '6px "Press Start 2P", monospace'; g.fillStyle = '#8f7bb8'; g.fillText('VAGUE ' + sh.wave + (sh.mult > 1 ? '' : ''), 5, 22);
  if (sh.mult > 1) { g.fillStyle = '#ffd07a'; g.fillText('×' + sh.mult, 62, 22); px(g, '#ffd07a', 84, 18, 30 * sh.multT / 240, 2); }
  for (let i = 0; i < sh.lives; i++) { const x = W - 10 - i * 9; px(g, '#ff4f6d', x, 4, 3, 2); px(g, '#ff4f6d', x + 4, 4, 3, 2); px(g, '#ff4f6d', x, 6, 7, 2); px(g, '#ff4f6d', x + 1, 8, 5, 1); px(g, '#ff4f6d', x + 2, 9, 3, 1); }
  for (let i = 0; i < 5; i++) px(g, i < sh.power ? '#7fe0ee' : '#2a1d52', W - 50 + i * 6, 16, 5, 3);
  for (let i = 0; i < sh.bombs; i++) { px(g, '#ff9a3c', W - 50 + i * 6, 21, 4, 4); px(g, '#ffd07a', W - 49 + i * 6, 21, 1, 1); }
  if (sh.mode === 'play' && sh.banner > 0) gameText(g, W, sh.wave % 5 === 0 ? [['ALERTE !', '#ff4f6d', 10], ['VAISSEAU AMIRAL', '#ff5ad9']] : [['VAGUE ' + sh.wave, '#ff5ad9', 10]], 120);
  if (sh.mode === 'ready') gameText(g, W, [['MÉTÉORES', '#ff5ad9', 10], ['FLÈCHES / ZQSD / SOURIS', '#d9c6ff'], ['LE VAISSEAU TIRE TOUT SEUL', '#d9c6ff'], ['ESPACE : BOMBE (UNE PAR VAGUE)', '#d9c6ff'], ['P ARME · S BOUCLIER · L VIE', '#8f7bb8'], ['APPUIE POUR JOUER', '#ffffff']], 100);
  if (sh.mode === 'pause') gameText(g, W, [['PAUSE', '#ff5ad9', 10], ['ESPACE POUR REPRENDRE', '#ffffff']], 140);
  if (sh.mode === 'over') gameText(g, W, [['PERDU', '#ff5ad9', 10], ['SCORE ' + sh.score, '#ffffff'], ['VAGUE ' + sh.wave, '#d9c6ff'], ['RECORD ' + (games?.best.shooter ?? 0), '#ffd07a'], ['ESPACE POUR REJOUER', '#d9c6ff']], 120);
}
$('shCanvas').onpointermove = e => { if (!sh) return; const r = e.currentTarget.getBoundingClientRect(); sh.target = [(e.clientX - r.left) / r.width * SH.W, (e.clientY - r.top) / r.height * SH.H - 14]; };
$('shCanvas').onpointerdown = e => { if (!sh) return; if (e.button === 2) return shBomb(); shPress(); };
$('shCanvas').oncontextmenu = e => e.preventDefault();
$('shCanvas').onpointerup = $('shCanvas').onpointerleave = () => { if (sh) sh.firing = false; };  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
document.addEventListener('keydown', e => {  // le cœur ne transmet plus les touches : le plugin les écoute lui-même
  if (!view.classList.contains('on') || !sh || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) e.preventDefault();
  if (k === ' ' && !e.repeat && shPress()) return;
  if ((k === 'b' || k === 'x' || (k === ' ' && sh.mode === 'play')) && !e.repeat) return shBomb();
  if ((k === 'p' || k === 'Escape') && sh.mode === 'play') sh.mode = 'pause';
  sh.keys[k] = true;
});
document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (sh) sh.keys[k] = false; });
  // ---- fin ----
  ctx.onOpen(() => { sh ? gameLoop(sh, 'neodex:shooter', shUpdate, shDraw) : shStart(); });
}
