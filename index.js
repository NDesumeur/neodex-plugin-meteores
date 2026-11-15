// Météores : un jeu de tir spatial vertical. Ton vaisseau tire tout seul ; des météores qui se divisent, des drones et un vaisseau amiral toutes les 5 vagues.
// Jeu NeoDex en pixel art (police bitmap, sons et musique faits en direct). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Pluie de météores</span><span class="hint" id="shInfo"></span></div>
  <div class="gMain"><div class="gameBox"><canvas id="shCanvas" width="240" height="320" role="img" aria-label="Météores"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="gStats"></div></div>
      <div class="row"><button class="btn main" id="gNew">NOUVELLE PARTIE</button><button class="btn" id="gFs">PLEIN ÉCRAN</button></div>
      <div class="row"><button class="btn" id="shMus">MUSIQUE : OUI</button><button class="btn" id="shSnd">SONS : OUI</button></div>
      <div class="hint">Flèches, ZQSD ou souris : bouger · le vaisseau tire tout seul · espace ou clic droit : bombe (une par vague) · P ou Échap : pause. Seul le cockpit (le point blanc) peut être touché. Des météores, des drones, et un vaisseau amiral toutes les 5 vagues. Bonus : arme plus forte, bouclier, vie.</div>
      <div class="hint">Manette : stick ou croix pour bouger, A pour jouer, B ou X : bombe, Start : pause.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:2 1 420px;min-width:min(100%,420px);position:relative}
.gameBox canvas{image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{width:min(100%,max(240px,calc((100vh - 190px) * 240 / 320)));height:auto;aspect-ratio:240/320}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 240 / 320))}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "MÉTÉORES", T: {"k": "#08040e", "k2": "#120a1e", "fill": "#1c1238", "fillOn": "#281a4a", "hl": "#3a2a6e", "line": "#5e4d85", "acc": "#ff5ad9", "accL": "#ffd0f4", "accS": "#b0288c", "accD": "#3a0a30", "rivet": "#ffd0f4", "btn": "#3a2a6e", "btnHi": "#6a5aa0", "btnLo": "#120a1e", "btnHov": "#4a3886", "btnHovHi": "#8a7bc0", "text": "#f6f0ff", "muted": "#c9bdf0", "acc2": "#7fe0ee", "gold": "#ffd07a", "orange": "#ff9a3c", "red": "#ff4f6d", "green": "#8ee8a0", "green2": "#2f8a3a", "bg": "#07021a", "bgDot": "#1c1238", "bgDot2": "#120a1e", "spark": "#3a2a6e", "spark2": "#ffffff",
    "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
    emblem: [".....kk.....", "....kwwk....", "....kbbk....", "...kaaaak...", "..kaaaaaak..", ".kaakaakaak.", "kaak.kk.kaak", "kk...gg...kk", ".....gg.....", "....g..g....", "............", "............"],
    icons: [[/^NOUVELLE/, "play"], [/^RECORDS/, "crown"]] });
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
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };
function gameText(g, w, lines, yc) {  // des lignes en police pixel, centrées autour de yc sur une bande sombre (taille 8 : x1, 16 : x2, 24 : x3)
  const hs = lines.map(([, , size]) => 11 * PXK.scale(size) + 3), tot = hs.reduce((a, v) => a + v, 0);
  let y = Math.round(yc - tot / 2); g.fillStyle = 'rgba(11,3,28,.8)'; g.fillRect(0, y - 8, w, tot + 14);
  lines.forEach(([text, color, size], i) => { pxFont(g, text, w / 2, y + 9 * PXK.scale(size), color, size, 'center'); y += hs[i]; });
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
const shs = gstore('meteores', {music: true, sound: true, games: 0});
let shac = null;
const shAudio = () => { try { return shac ??= new AudioContext(); } catch { return null; } };
function shTone(f, d, type = 'square', slide = 0, vol = .05, at = 0) {
  const a = shAudio(); if (!a) return; const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
}
function shNoise(d, vol = .08, freq = 1200, at = 0, slide = 0, type = 'lowpass') {  // un souffle filtré : explosions, bombe, charleston
  const a = shAudio(); if (!a) return; const t = a.currentTime + Math.max(0, at), n = a.createBufferSource(), buf = a.createBuffer(1, Math.ceil(a.sampleRate * d), a.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length) ** 2;
  const f = a.createBiquadFilter(), g = a.createGain(); f.type = type; f.frequency.setValueAtTime(freq, t); if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.value = vol; n.buffer = buf; n.connect(f).connect(g).connect(a.destination); n.start(t);
}
const SFX = new Proxy({
  shot: () => shTone(1500, .04, 'square', 700, .01),
  boom: big => { shNoise(big ? .7 : .22, big ? .18 : .08, big ? 900 : 1800, 0, 120); shTone(big ? 90 : 150, big ? .5 : .15, 'triangle', 40, .07); },
  hurt: () => { shTone(440, .4, 'sawtooth', 70, .06); shNoise(.3, .1, 1400, 0, 200); },
  shield: () => shTone(880, .25, 'triangle', 330, .05),
  item: () => [660, 880, 1320].forEach((f, i) => shTone(f, .08, 'square', 0, .03, i * .05)),
  coin: () => { shTone(1320, .05, 'square', 0, .02); shTone(1760, .08, 'square', 0, .02, .05); },
  bomb: () => { shNoise(1.1, .2, 3000, 0, 80); shTone(220, .9, 'sawtooth', 30, .07); },
  alarm: () => { for (let i = 0; i < 4; i++) { shTone(660, .18, 'square', 0, .035, i * .4); shTone(440, .18, 'square', 0, .035, i * .4 + .2); } },
  wave: () => [523, 659, 784, 1047].forEach((f, i) => shTone(f, .12, 'triangle', 0, .05, i * .08)),
  over: () => [392, 330, 262, 196].forEach((f, i) => shTone(f, .28, 'triangle', 0, .06, i * .2)),
  start: () => shTone(300, .25, 'square', 1200, .04),
}, {get: (o, k) => (...a) => { if (shs.sound) { shPlayed++; o[k](...a); } }});
let shPlayed = 0;
// la musique : une boucle de 4 mesures (basse en octaves, batterie, mélodie de deux phrases tirées à chaque partie), plus rapide et plus sombre face au vaisseau amiral
const SH_SONG = {
  normal: {bpm: 136, root: 110, chords: [0, -4, 3, -2], lead: [0, 3, 5, 7, 10, 12], bass: 'square', vol: .028},
  boss: {bpm: 160, root: 98, chords: [0, 1, 0, -2], lead: [0, 1, 3, 6, 7, 10], bass: 'sawtooth', vol: .024},
};
const shMus = {on: false, song: '', step: 0, next: 0, notes: 0, riff: null,
  tick() {
    const want = shs.music && sh?.mode === 'play' && view.classList.contains('on');
    if (!want) { this.on = false; return; }
    const a = shAudio(); if (!a) return;
    const name = sh.boss || sh.wave % 5 === 0 ? 'boss' : 'normal', S = SH_SONG[name], st = 60 / S.bpm / 2;  // une croche
    if (!this.on || this.song !== name) {
      this.on = true; this.song = name; this.step = 0; this.next = a.currentTime + .05;
      this.riff = [0, 1].map(() => Array.from({length: 16}, (_, i) => i % 4 === 3 || Math.random() < .3 ? -1 : S.lead[Math.floor(Math.random() * S.lead.length)]));
    }
    if (this.next < a.currentTime - .5) this.next = a.currentTime + .05;  // l'onglet a dormi : on reprend sans rattraper
    while (this.next < a.currentTime + .2) {
      const at = this.next, i = this.step % 16, bar = Math.floor(this.step / 16) % 4, r = S.root * 2 ** (S.chords[bar] / 12);
      this.note(r / 2 * (i % 2 ? 2 : 1), st * .9, S.bass, S.vol, at);
      const n = this.riff[bar % 2][i]; if (n >= 0) this.note(r * 2 * 2 ** (n / 12), st * 1.6, 'square', S.vol * .5, at);
      if (i % 4 === 0) this.kick(at);
      if (i % 2) shNoise(.03, .02, 7000, at - a.currentTime, 0, 'highpass');
      this.step++; this.next += st;
    }
  },
  note(f, d, type, vol, at) { const o = shac.createOscillator(), g = shac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(.0001, at + d); o.connect(g).connect(shac.destination); o.start(at); o.stop(at + d + .02); this.notes++; },
  kick(at) { const o = shac.createOscillator(), g = shac.createGain(); o.frequency.setValueAtTime(140, at); o.frequency.exponentialRampToValueAtTime(40, at + .12); g.gain.setValueAtTime(.08, at); g.gain.exponentialRampToValueAtTime(.0001, at + .14); o.connect(g).connect(shac.destination); o.start(at); o.stop(at + .16); },
};
setInterval(() => shMus.tick(), 60);
function shStart() {
  sh = sh || {raf: 0};
  Object.assign(sh, {g: $('shCanvas').getContext('2d'), mode: 'ready', tick: 0, t: 0, x: SH.W / 2, y: SH.H - 34, vx: 0, vy: 0, target: null, shots: [], bullets: [], rocks: [], foes: [], items: [], parts: [], score: 0, lives: 3,
    inv: 0, cool: 0, power: 1, bombs: 1, flashB: 0, shield: 0, magnet: 0, mult: 1, multT: 0, kills: 0, wave: 0, queue: [], spawnT: 0, banner: 0, dry: 0, boss: null, shake: 0, keys: {}, firing: false, overAt: 0,
    stars: Array.from({length: 90}, () => [Math.random() * SH.W, Math.random() * SH.H, Math.random()])});
  shNextWave();
  $('shInfo').textContent = 'Record : ' + (games?.best.shooter ?? 0) + ' · meilleure vague ' + (games?.best.shooterWave ?? 0); shStats();
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
  if (q.kind === 'boss') { const hp = Math.round(SH.foes.boss.hp * (w / 5) ** .9); sh.boss = {x: SH.W / 2, y: -30, hp, max: hp, t: 0, flash: 0, phase: 0}; sh.banner = 150; SFX.alarm(); return; }
  const d = SH.foes[q.kind], x = q.kind === 'drone' ? (q.lane === 0 ? 30 + (q.i % 6) * 36 : SH.W / 2 + q.lane * 60) : 20 + Math.random() * (SH.W - 40);
  sh.foes.push({kind: q.kind, x, y: -10, x0: x, t: 0, hp: Math.ceil(d.hp * hpK), flash: 0, vx: 0, vy: q.kind === 'turret' ? .35 : 1.1, cool: 60 + Math.random() * 60, phase: Math.random() * 6});
}
function shPress() {
  if (!sh) return;
  if (sh.mode === 'ready' || sh.mode === 'pause') { if (sh.mode === 'ready') SFX.start(); sh.mode = 'play'; return true; }
  if (sh.mode === 'over') { if (Date.now() - sh.overAt > 700) { shStart(); sh.mode = 'play'; SFX.start(); } return true; }
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
  sh.score += Math.round(pts * sh.mult); shBoom(x, y, 14, colors); SFX.boom(pts >= 1000);
}
function shBomb() {
  if (!sh.bombs || sh.mode !== 'play') return;
  sh.bombs--; sh.flashB = 24; sh.shake = 14; sh.bullets = []; SFX.bomb();
  for (const r of sh.rocks) r.hp -= 6;
  for (const f of sh.foes) f.hp -= 12;
  if (sh.boss) { sh.boss.hp -= 40; sh.boss.flash = 6; }
}
function shHurt() {
  if (sh.inv > 0) return;
  if (sh.shield > 0) { sh.shield = 0; sh.inv = 60; SFX.shield(); shBoom(sh.x, sh.y, 10, ['#8ee8a0', '#ffffff']); return; }
  sh.lives--; if (sh.lives === 1 && sh.bombs < 1) sh.bombs = 1; sh.inv = 140; sh.shake = 12; sh.power = Math.max(1, sh.power - 1); sh.mult = 1; sh.kills = Math.floor(sh.kills / 2); sh.bullets = [];
  shBoom(sh.x, sh.y, 24, ['#ff5ad9', '#ffffff', '#ffd07a'], 2.4); if (sh.lives > 0) SFX.hurt();
  if (sh.lives <= 0) {
    sh.mode = 'over'; sh.overAt = Date.now(); SFX.over(); shs.games++;
    const rec = best('shooter', sh.score); best('shooterWave', sh.wave); saveGames(); sh.rec = rec; shStats();
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
  sh.cool = p >= 4 ? 8 : 10; SFX.shot();
}
function shUpdate() {
  sh.t++;
  // ship: both axes, keyboard (arrows, ZQSD / WASD) or glides toward the mouse
  const K = sh.keys, left = K.ArrowLeft || K.q || K.a, right = K.ArrowRight || K.d, up = K.ArrowUp || K.z || K.w, down = K.ArrowDown || K.s;
  if (sh.pad && (Math.abs(sh.pad[0]) > .2 || Math.abs(sh.pad[1]) > .2)) { sh.target = null; sh.vx += sh.pad[0] * .5; sh.vy += sh.pad[1] * .5; }
  else if (left || right || up || down) { sh.target = null; sh.vx += (right ? .5 : 0) - (left ? .5 : 0); sh.vy += (down ? .5 : 0) - (up ? .5 : 0); }
  else if (sh.target) { sh.vx += Math.max(-.5, Math.min(.5, (sh.target[0] - sh.x) * .09)); sh.vy += Math.max(-.5, Math.min(.5, (sh.target[1] - sh.y) * .09)); }
  sh.vx = Math.max(-3, Math.min(3, sh.vx * .84)); sh.vy = Math.max(-3, Math.min(3, sh.vy * .84));
  sh.x = Math.max(6, Math.min(SH.W - 6, sh.x + sh.vx)); sh.y = Math.max(40, Math.min(SH.H - 10, sh.y + sh.vy));
  if (--sh.cool <= 0) shFire();  // le vaisseau tire tout seul
  for (const k of ['inv', 'shield', 'magnet', 'banner', 'flashB']) if (sh[k] > 0) sh[k]--;
  if (sh.multT > 0 && --sh.multT === 0) { sh.mult = 1; sh.kills = 0; }
  // the wave
  sh.spawnT++;
  while (sh.queue.length && sh.queue[0].at <= sh.spawnT - 90) shSpawn(sh.queue.shift());
  if (!sh.queue.length && !sh.rocks.length && !sh.foes.length && !sh.boss) { sh.score += 200 * sh.wave; shNextWave(); if (sh.wave % 5) SFX.wave(); }
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
      it.got = true; it.kind === 'G' ? SFX.coin() : SFX.item();
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
    px(g, '#05010b', 20, 38, W - 40, 5); px(g, '#2a1d52', 21, 39, W - 42, 3); px(g, B.hp < B.max * .4 ? '#ff4f6d' : '#ff5ad9', 21, 39, (W - 42) * Math.max(0, B.hp / B.max), 3);
  }
  for (const it of sh.items) {
    const [c] = SH.items[it.kind];
    if (it.kind === 'G') { px(g, c, it.x - 2, it.y - 2, 4, 4); px(g, '#ffffff', it.x - 1, it.y - 2, 1, 1); continue; }
    px(g, '#130a20', it.x - 6, it.y - 6, 12, 12); px(g, c, it.x - 5, it.y - 5, 10, 10); PXK.fill(g, it.kind === 'M' ? 'A' : it.kind, it.x + 1, it.y + 3, '#130a20', 1, 'center');
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
  px(g, 'rgba(11,3,28,.75)', 0, 0, W, 34);
  pxFont(g, String(sh.score).padStart(7, '0'), 4, 18, '#ffffff', 16);
  pxFont(g, 'VAGUE ' + sh.wave, 4, 31, '#c9bdf0');
  if (sh.mult > 1) { pxFont(g, '×' + sh.mult, 60, 31, '#ffd07a'); px(g, '#ffd07a', 90, 27, 30 * sh.multT / 240, 2); }
  for (let i = 0; i < sh.lives; i++) { const x = W - 10 - i * 9; px(g, '#ff4f6d', x, 4, 3, 2); px(g, '#ff4f6d', x + 4, 4, 3, 2); px(g, '#ff4f6d', x, 6, 7, 2); px(g, '#ff4f6d', x + 1, 8, 5, 1); px(g, '#ff4f6d', x + 2, 9, 3, 1); }
  for (let i = 0; i < 5; i++) px(g, i < sh.power ? '#7fe0ee' : '#2a1d52', W - 50 + i * 6, 17, 5, 4);
  for (let i = 0; i < sh.bombs; i++) { px(g, '#ff9a3c', W - 50 + i * 6, 25, 5, 5); px(g, '#ffd07a', W - 49 + i * 6, 25, 1, 1); }
  const msg = shScreen(); if (msg) gameText(g, W, msg, sh.mode === 'play' ? 130 : sh.mode === 'ready' ? 156 : 170);
}
function shScreen(m = sh.mode) {  // les textes par-dessus le jeu : écran titre, vague, pause, fin
  if (m === 'play') return sh.banner > 0 && (sh.wave % 5 === 0 ? [['ALERTE !', '#ff4f6d', 24], ['VAISSEAU AMIRAL', '#ff5ad9', 16]] : [['VAGUE ' + sh.wave, '#ff5ad9', 24]]);
  if (m === 'ready') return [['MÉTÉORES', '#ff5ad9', 24], ['', '', 8], ['TIR AUTOMATIQUE', '#d9c6ff', 16], ['FLÈCHES OU ZQSD', '#d9c6ff', 16], ['OU LA SOURIS', '#d9c6ff', 16], ['ESPACE : BOMBE', '#ffd07a', 16], ['', '', 8],
    ['P ARME · S BOUCLIER · L VIE', '#c9bdf0'], ['B BOMBE · A AIMANT', '#c9bdf0'], ['', '', 8], [(sh.tick >> 5) % 2 ? 'APPUIE POUR JOUER' : '', '#ffffff', 16]];
  if (m === 'pause') return [['PAUSE', '#ff5ad9', 24], ['ESPACE : REPRENDRE', '#ffffff', 16]];
  if (m === 'over') return [['PERDU', '#ff5ad9', 24], ['SCORE ' + sh.score, '#ffffff', 16], ['VAGUE ' + sh.wave, '#d9c6ff', 16], sh.rec ? ['NOUVEAU RECORD !', '#ffd07a', 16] : ['RECORD ' + (games?.best.shooter ?? 0), '#ffd07a', 16], ['', '', 8], ['ESPACE : REJOUER', '#d9c6ff', 16]];
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
function shStats() { $('gStats').replaceChildren(...[['Meilleur score', games.best.shooter ?? 0], ['Meilleure vague', games.best.shooterWave ?? 0], ['Parties', shs.games]].flatMap(([a, v]) => [el('span', '', a), el('b', '', String(v))])); }
{  // la manette : stick gauche ou croix pour bouger, A pour jouer, B ou X : bombe, Start : pause ; un appui = une action
  let prev = [];
  const loop = () => {
    requestAnimationFrame(loop);
    const p = [...(navigator.getGamepads?.() || [])].find(Boolean);
    if (!p || !sh || !view.classList.contains('on')) { prev = []; if (sh) sh.pad = null; return; }
    const now = p.buttons.map(x => x.pressed), was = prev, hit = i => now[i] && !was[i]; prev = now;
    const dx = (now[15] ? 1 : 0) - (now[14] ? 1 : 0) || (Math.abs(p.axes[0] || 0) > .2 ? p.axes[0] : 0), dy = (now[13] ? 1 : 0) - (now[12] ? 1 : 0) || (Math.abs(p.axes[1] || 0) > .2 ? p.axes[1] : 0);
    sh.pad = [dx, dy];
    if (hit(0) && shPress()) return;
    if (hit(1) || hit(2)) shBomb();
    if (hit(9)) { if (sh.mode === 'play') sh.mode = 'pause'; else shPress(); }
  };
  requestAnimationFrame(loop);
}
const shSndBtn = () => { $('shMus').textContent = 'MUSIQUE : ' + (shs.music ? 'OUI' : 'NON'); $('shSnd').textContent = 'SONS : ' + (shs.sound ? 'OUI' : 'NON'); };
$('shMus').onclick = () => { shs.music = !shs.music; saveGames(); shSndBtn(); $('shMus').blur(); };
$('shSnd').onclick = () => { shs.sound = !shs.sound; saveGames(); shSndBtn(); $('shSnd').blur(); }; shSndBtn();
$('gNew').onclick = () => { $('gNew').blur(); shStart(); };
$('gFs').onclick = () => { $('gFs').blur(); try { if (document.fullscreenElement) document.exitFullscreen(); else $('shCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
function shCheck() {  // vérification : chaque texte tient dans l'écran du jeu, la musique a ses 4 mesures, chaque bonus a sa lettre
  const bad = [], keep = sh;
  sh = {mode: 'ready', tick: 0, wave: 5, banner: 1, score: 9999999, rec: false};
  for (const m of ['ready', 'play', 'pause', 'over']) for (const tick of [0, 32]) { sh.tick = tick; for (const [t, , size] of shScreen(m) || []) if (PXK.layout(t).w * PXK.scale(size) > SH.W - 6) bad.push(m + ' : ' + t); }
  sh.wave = 4; for (const [t, , size] of shScreen('play')) if (PXK.layout(t).w * PXK.scale(size) > SH.W - 6) bad.push(t);
  sh = keep;
  if (PXK.layout('0000000').w * 2 + 4 > SH.W - 60) bad.push('score');
  for (const [k, S] of Object.entries(SH_SONG)) if (S.chords.length !== 4 || !S.lead.length) bad.push('musique ' + k);
  for (const k of Object.keys(SH.items)) if (k !== 'G' && !PXK.layout(k === 'M' ? 'A' : k).w) bad.push('bonus ' + k);
  return bad.length ? [...new Set(bad)].join(', ') : 'ok';
}
console.assert(shCheck() === 'ok', 'météores', shCheck());
$('shCanvas').__sh = {st: () => sh, check: shCheck, mus: shMus, shs, played: () => shPlayed, screen: shScreen, next: () => shNextWave()};
  // ---- fin ----
  ctx.onOpen(() => { sh ? gameLoop(sh, 'neodex:shooter', shUpdate, shDraw) : shStart(); });
}
