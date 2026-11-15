// lancé par le test « local » de NeoDex : la vérification interne, l'écran titre, une partie à la manette (bouger, bombe), la musique et les sons,
// la pause au clavier, le vaisseau amiral, la fin de partie, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('shCanvas').__sh, sh = T.st(); ${code} })()`);
  const key = (k, up) => pj(`document.dispatchEvent(new KeyboardEvent('${up ? 'keyup' : 'keydown'}', {key: '${k}', bubbles: true})), 0`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('shCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'meteores-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  const keep = await C('return JSON.stringify({music: T.shs.music, sound: T.shs.sound});');
  await C('T.shs.music = true; T.shs.sound = true; return 0;');
  await pj(`document.getElementById('gNew').click(), 0`); await sleep(1100); await shot('0-titre');
  if (await C('return sh.mode;') !== 'ready') throw new Error('la partie devait attendre sur l\'écran titre');
  // la manette : A lance la partie, le stick pousse le vaisseau à droite, B lâche une bombe
  await pj(`(() => { const pad = {axes: [0, 0, 0, 0], buttons: Array.from({length: 17}, () => ({pressed: false}))}; window.__pad = pad; navigator.getGamepads = () => [pad]; return 0; })()`);
  const tap = async i => { await pj(`(__pad.buttons[${i}].pressed = true, 0)`); await sleep(130); await pj(`(__pad.buttons[${i}].pressed = false, 0)`); await sleep(130); };
  await tap(0); if (await C('return sh.mode;') !== 'play') throw new Error('A devait lancer la partie');
  await C('sh.inv = 1e9; return 0;');  // invincible pendant le test
  const x0 = await C('return sh.x;'); await pj(`(__pad.axes[0] = 1, 0)`); await sleep(600); await pj(`(__pad.axes[0] = 0, 0)`);
  const x1 = await C('return sh.x;'); if (!(x1 > x0 + 30)) throw new Error('le stick devait pousser le vaisseau : ' + x0 + ' → ' + x1);
  const b0 = await C('return sh.bombs;'); await tap(1); if (await C('return sh.bombs;') !== b0 - 1) throw new Error('B devait lâcher une bombe');
  await sleep(1200); await shot('1-partie');
  const mus = await C('return T.mus.notes + "|" + T.played();').then(s => s.split('|').map(Number));
  if (!(mus[0] > 8)) throw new Error('la musique devait jouer : ' + mus[0] + ' notes');
  if (!(mus[1] > 5)) throw new Error('les sons devaient jouer : ' + mus[1]);
  // la pause au clavier, puis Espace pour reprendre ; la musique se tait en pause
  await key('p'); await sleep(200); if (await C('return sh.mode;') !== 'pause') throw new Error('P devait mettre en pause');
  const n0 = await C('return T.mus.notes;'); await sleep(600); const n1 = await C('return T.mus.notes;'); if (n1 > n0 + 3) throw new Error('la musique devait se taire en pause');
  await shot('2-pause'); await key(' '); await key(' ', true); await sleep(100); if (await C('return sh.mode;') !== 'play') throw new Error('Espace devait reprendre');
  // le vaisseau amiral : vague 5 (alerte, musique du combat)
  await C('sh.wave = 4; sh.queue = []; sh.rocks = []; sh.foes = []; T.next(); return 0;'); await sleep(700); await shot('3-alerte');
  await sleep(2400);
  const boss = await C('return !!sh.boss + "|" + T.mus.song;'); if (boss !== 'true|boss') throw new Error('le vaisseau amiral et sa musique devaient arriver : ' + boss);
  await shot('4-amiral');
  // la fin : plus de vie, un tir ennemi sur le cockpit
  await C('sh.inv = 0; sh.shield = 0; sh.lives = 1; sh.bullets.push({x: sh.x, y: sh.y, vx: 0, vy: 0}); return 0;'); await sleep(400);
  if (await C('return sh.mode;') !== 'over') throw new Error('la partie devait être finie'); await sleep(300); await shot('5-fin');
  const stats = await pj(`document.getElementById('gStats').textContent`); if (!/Parties\s*\d/.test(stats)) throw new Error('les records devaient s\'afficher : ' + stats);
  await pj(`navigator.getGamepads = () => [], 0`);
  await C(`Object.assign(T.shs, ${keep}); return 0;`);
  await pj(`document.getElementById('gNew').click(), 0`);
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  // plein écran, et la zone de jeu qui tient dans la fenêtre
  await pj(`document.getElementById('gFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('shCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('shCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('shCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  return 'vérification ok · écran titre · manette (A, stick, B) · musique ' + mus[0] + ' notes · sons · pause · vaisseau amiral · fin · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
