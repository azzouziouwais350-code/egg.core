// Dessin des sprites d'œufs : 7 types x 5 états (idle, selected, cooking, almost, done).
// Chaque œuf a sa propre construction (forme, contenu, présentation) : ce ne sont pas
// des recolorations. Les états ajoutent des détails propres à chaque œuf.

const { Raster, rng } = require('./lib/raster');

const W = 32;
const H = 32;

const C = {
  out: '#1B1030',       // contour violet très sombre
  shell: '#F2DDFB',     // blanc lunaire
  shellHi: '#FFFFFF',
  shellSh: '#CDB8E6',
  shellDk: '#A98FD0',
  white: '#FFF7FF',     // blanc d'œuf
  whiteSh: '#E6D6F2',
  yolk: '#FFBE62',
  yolkHi: '#FFE8A8',
  yolkDk: '#E8923A',
  cream: '#FFD98A',
  creamHi: '#FFF0C2',
  pink: '#FF6EC7',
  pinkSoft: '#FFB3E0',
  cyan: '#00E5FF',
  cyanSoft: '#9AF4FF',
  lav: '#B9A0FF',
  lavDk: '#7A5FD0',
  violet: '#5B3FA0',
  chrome: '#D5DEFA',
  chromeSh: '#8FA2D9',
  chromeDk: '#5A6BA8',
  blue: '#8FD3FF',
  blueSh: '#5FA8E8',
  gold: '#FFD36B',
  orange: '#FF9F4A',
  steam: '#EAF4FF',
};

const LEVEL = { idle: 0, selected: 1, cooking: 1, almost: 2, done: 3 };

// Place `layer` sous le dessin existant (uniquement sur les pixels vides).
function under(g, layer) {
  for (let i = 0; i < g.d.length; i++) if (!g.d[i] && layer.d[i]) g.d[i] = layer.d[i];
}

// Étincelles « sélectionné / presque / terminé », communes à tous les œufs.
function sparkles(g, state, spots, color) {
  const n = state === 'selected' ? 2 : state === 'almost' ? 3 : state === 'done' ? spots.length : 0;
  for (let i = 0; i < n; i++) {
    const [x, y, big] = spots[i];
    g.sparkle(x, y, i % 2 ? C.cyanSoft : color, state === 'done' && big);
  }
}

// ---------------------------------------------------------------- 1. À LA COQUE
function coque(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  // Œuf (coque ouverte) : ellipse, calotte retirée, bord déchiré.
  g.ellipse(16, 15, 7.5, 9, (x, y) => (x < 13 && y > 11 ? C.shell : x > 19 ? C.shellSh : C.shell));
  for (let x = 0; x < W; x++) for (let y = 0; y < 10; y++) g.px(x, y, null);
  const jag = [10, 9, 10, 11, 10, 9, 10, 11, 10, 9, 10, 10, 9, 10, 11, 10];
  for (let x = 8; x < 24; x++) for (let y = 7; y < jag[x - 8]; y++) g.px(x, y, null);
  // Intérieur : blanc + jaune qui déborde.
  g.rect(10, 10, 12, 2, C.white);
  const yy = state === 'done' ? C.yolkHi : lvl >= 2 ? C.yolk : C.yolk;
  g.ellipse(16, 10, 5, 3.2, yy);
  g.px(14, 9, C.yolkHi).px(15, 8, C.yolkHi).px(13, 10, C.yolkHi);
  g.rect(12, 12, 8, 1, C.yolkDk);
  // Coulure de jaune : plus longue quand c'est prêt.
  const drip = state === 'idle' ? 1 : state === 'selected' ? 2 : state === 'cooking' ? 2 : state === 'almost' ? 4 : 5;
  for (let i = 0; i < drip; i++) g.px(20, 12 + i, i < drip - 1 ? C.yolk : C.yolkHi);
  g.px(20, 12 + drip, C.yolkDk);
  // Reflets de coquille.
  g.px(11, 15, C.shellHi).px(11, 16, C.shellHi).px(12, 14, C.shellHi);
  // Coquetier : coupe + pied.
  g.rect(10, 20, 12, 1, C.chrome);
  g.rect(11, 21, 10, 3, C.lav);
  g.rect(12, 24, 8, 1, C.lavDk);
  g.rect(14, 25, 4, 2, C.chrome);
  g.rect(9, 27, 14, 2, C.chromeSh);
  g.rect(10, 27, 12, 1, C.chrome);
  g.px(11, 22, C.shellHi).px(12, 22, C.shellHi);
  g.rect(10, 20, 12, 1, C.pink);
  g.outline(C.out);
  // Effets
  if (state === 'cooking' || state === 'almost') {
    const r = rng(7);
    for (let i = 0; i < (state === 'almost' ? 7 : 4); i++) g.px(9 + Math.floor(r() * 14), 2 + Math.floor(r() * 5), i % 2 ? C.gold : C.yolkHi);
  }
  sparkles(g, state, [[5, 6], [27, 8], [6, 19], [26, 20, true], [16, 3, true]], C.gold);
  if (state === 'done') for (let i = 0; i < 5; i++) g.px(12 + i * 2, 6 + (i % 2), C.yolkHi);
  return g;
}

// ---------------------------------------------------------------- 2. MOLLET
function mollet(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  // Coque du bas, vue en coupe : bord de coquille épais, blanc visible.
  g.ellipse(15, 20, 10, 10, C.shell);
  for (let y = 0; y < 15; y++) for (let x = 0; x < W; x++) g.px(x, y, null);
  g.ellipse(15, 20, 8, 8.2, (x, y) => (y >= 15 ? C.white : null));
  g.rect(8, 15, 14, 1, C.whiteSh);
  // Jaune crémeux au centre.
  const yc = lvl >= 2 ? C.cream : C.cream;
  g.ellipse(15, 20, 5, 5, yc);
  g.ellipse(15, 21, 4, 3.5, state === 'done' ? C.creamHi : C.yolk);
  g.px(13, 18, C.creamHi).px(14, 17, C.creamHi).px(12, 19, C.creamHi);
  g.px(17, 24, C.yolkDk).px(18, 23, C.yolkDk);
  // Coquille : ombres + reflets.
  for (let y = 15; y < 30; y++) { g.px(5, y, g.get(5, y) ? C.shell : null); }
  g.px(6, 20, C.shellHi).px(6, 21, C.shellHi);
  g.px(24, 22, C.shellDk).px(24, 23, C.shellDk).px(23, 25, C.shellDk);
  // Calotte retirée, posée de travers en haut à droite.
  const cap = new Raster(W, H);
  cap.ellipse(25, 8, 5, 4, C.shell);
  for (let y = 9; y < H; y++) for (let x = 0; x < W; x++) cap.px(x, y, null);
  for (let x = 20; x <= 30; x++) cap.px(x, 9, (x % 2) ? C.white : C.shellSh);
  cap.px(23, 5, C.shellHi).px(24, 5, C.shellHi);
  for (let i = 0; i < cap.d.length; i++) if (cap.d[i]) g.d[i] = cap.d[i];
  // Entaille décorative sur la coque.
  g.px(7, 14, null).px(9, 14, null).px(11, 14, null).px(18, 14, null).px(20, 14, null).px(22, 14, null);
  g.outline(C.out);
  // Effets : particules en orbite (plus nombreuses en cuisson).
  if (state === 'cooking' || state === 'almost' || state === 'done') {
    const n = state === 'cooking' ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.px(15 + Math.cos(a) * 13, 15 + Math.sin(a) * 4 - 1, i % 2 ? C.lav : C.cyanSoft);
    }
  }
  sparkles(g, state, [[4, 6], [28, 20], [3, 28], [16, 5, true], [28, 28, true]], C.lav);
  return g;
}

// ---------------------------------------------------------------- 3. POCHÉ
function poche(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  // Petite assiette flottante.
  g.ellipse(16, 22, 14, 4.5, C.chrome);
  g.ellipse(16, 22, 11, 3, C.white);
  g.ellipse(16, 23, 14, 3.5, (x, y) => (y > 24 ? C.chromeSh : null));
  g.ring(16, 22, 14, 4.5, 0.85, C.lav);
  // Blanc irrégulier, arrondi.
  const blob = (cx, cy, rx, ry) => g.ellipse(cx, cy, rx, ry, C.white);
  blob(13, 19, 7, 4.2); blob(20, 19.5, 6, 3.6); blob(16, 16.5, 5.5, 3.4); blob(10, 20, 3, 2); blob(23, 20.5, 2.5, 1.8);
  g.px(9, 22, C.whiteSh).px(10, 22, C.whiteSh).px(21, 22, C.whiteSh).px(22, 22, C.whiteSh).px(15, 22, C.whiteSh).px(16, 22, C.whiteSh);
  g.px(20, 17, C.whiteSh).px(21, 18, C.whiteSh).px(8, 19, C.whiteSh);
  // Jaune au centre, texture douce.
  g.ellipse(16, 17, 3.6, 3, state === 'done' ? C.yolkHi : C.yolk);
  g.px(15, 16, C.yolkHi).px(14, 17, C.yolkHi).px(17, 19, C.yolkDk).px(18, 18, C.yolkDk);
  g.outline(C.out);
  // Effets : ondulations cyan sous l'assiette, bulles qui remontent.
  if (state !== 'idle') {
    const wave = state === 'selected' ? 1 : state === 'cooking' ? 2 : 3;
    for (let i = 0; i < wave; i++) {
      const y = 28 + (i % 2);
      for (let x = 4 + i * 2; x < 28 - i * 2; x += 2) g.px(x, y + Math.floor(i / 2), (x + i) % 4 ? C.cyan : C.cyanSoft);
    }
  }
  if (lvl >= 1 && state !== 'selected') {
    const r = rng(11);
    for (let i = 0; i < (state === 'cooking' ? 4 : 6); i++) g.px(6 + Math.floor(r() * 20), 6 + Math.floor(r() * 7), C.cyanSoft);
  }
  if (state === 'done') {
    // Halo céleste : arc de lumière au-dessus.
    for (let a = 0; a <= 12; a++) {
      const t = (a / 12) * Math.PI;
      g.px(16 - Math.cos(t) * 12, 12 - Math.sin(t) * 7, a % 2 ? C.cyanSoft : C.gold);
    }
  }
  sparkles(g, state, [[5, 8], [27, 9], [4, 26], [28, 26, true], [16, 3, true]], C.cyanSoft);
  return g;
}

// ---------------------------------------------------------------- 4. BROUILLÉ
function brouille(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  const r = rng(23);
  // Assiette.
  g.ellipse(16, 23, 14, 5, C.chrome);
  g.ellipse(16, 22.5, 11, 3.6, C.white);
  g.ring(16, 23, 14, 5, 0.86, C.pinkSoft);
  // Monticule de morceaux : plusieurs couleurs et textures.
  const tones = [C.yolk, C.cream, C.orange, C.yolkHi];
  const bits = [
    [10, 21, 4, 2.4], [15, 20, 5, 2.8], [21, 21, 4.4, 2.5], [13, 17.5, 4, 2.3],
    [19, 17.8, 4.2, 2.4], [16, 14.8, 3.6, 2.2], [24, 22, 2.4, 1.6], [8, 22.5, 2.2, 1.4],
  ];
  bits.forEach(([cx, cy, rx, ry], i) => g.ellipse(cx, cy, rx, ry, tones[(i + (lvl >= 2 ? 1 : 0)) % 4]));
  // Texture irrégulière.
  for (let i = 0; i < 36; i++) {
    const x = 7 + Math.floor(r() * 18), y = 13 + Math.floor(r() * 10);
    const cur = g.get(x, y);
    if (cur && cur !== C.white && cur !== C.chrome) g.px(x, y, r() > 0.5 ? C.yolkDk : C.yolkHi);
  }
  g.outline(C.out);
  // Vapeur pixelisée (cuisson) et reflets chauds (fin).
  const steam = state === 'cooking' ? 2 : state === 'almost' ? 3 : state === 'done' ? 1 : 0;
  for (let k = 0; k < steam; k++) {
    const x0 = 9 + k * 6;
    for (let y = 2; y < 11; y++) g.px(x0 + Math.round(Math.sin((y + k) * 0.9) * 1.5), y, y % 3 ? C.steam : C.pinkSoft);
  }
  if (state === 'done') for (let i = 0; i < 8; i++) g.px(8 + Math.floor(r() * 16), 5 + Math.floor(r() * 8), C.gold);
  sparkles(g, state, [[4, 9], [28, 12], [5, 27], [27, 27, true], [17, 5, true]], C.gold);
  return g;
}

// ---------------------------------------------------------------- 5. VAPEUR
function vapeur(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  // Socle flottant : panier vapeur (lattes) sur disque lavande.
  g.ellipse(16, 27, 12, 3.2, C.lav);
  g.ellipse(16, 26, 12, 3.2, C.chrome);
  g.ellipse(16, 25.5, 9.5, 2.2, C.chromeSh);
  for (let x = 6; x < 27; x += 3) g.px(x, 27, C.lavDk).px(x, 28, C.lavDk);
  // Œuf entier, coquille blanche aux reflets bleus.
  g.ellipse(16, 17, 7, 9, (x, y) => (x > 18 && y > 16 ? C.blue : x > 20 ? C.shellSh : C.shell));
  g.px(12, 12, C.shellHi).px(12, 13, C.shellHi).px(13, 11, C.shellHi).px(11, 14, C.shellHi);
  g.px(21, 19, C.blueSh).px(21, 20, C.blueSh).px(20, 22, C.blueSh);
  g.px(14, 23, C.blue).px(15, 24, C.blue);
  g.outline(C.out);
  // Volutes de vapeur autour de l'œuf (cuisson) ; elles se dissipent à la fin.
  const wisps = state === 'idle' ? 0 : state === 'selected' ? 1 : state === 'cooking' ? 3 : state === 'almost' ? 4 : 2;
  const xs = [6, 25, 10, 22];
  for (let k = 0; k < wisps; k++) {
    const x0 = xs[k];
    const top = state === 'done' ? 5 : 1 + k;
    for (let y = top; y < 22; y++) {
      const x = x0 + Math.round(Math.sin(y * 0.6 + k * 2) * 2);
      if (!g.get(x, y)) g.px(x, y, (y + k) % 4 === 0 ? null : (y % 2 ? C.steam : C.cyanSoft));
    }
  }
  if (state === 'done') {
    g.ring(16, 17, 13, 14, 0.9, C.cyanSoft);
  }
  sparkles(g, state, [[4, 5], [28, 6], [3, 20], [29, 22, true], [16, 2, true]], C.cyanSoft);
  return g;
}

// ---------------------------------------------------------------- 6. DUR
function dur(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  // Halo violet circulaire derrière l'œuf (anneau pointillé qui s'illumine).
  const halo = new Raster(W, H);
  const haloColor = state === 'done' ? C.pinkSoft : lvl >= 2 ? C.pink : C.lav;
  const density = lvl === 0 ? 3 : lvl === 1 ? 2 : 1;
  halo.ring(16, 16, 15, 15.5, 0.78, (x, y) => ((x + y) % density === 0 ? haloColor : null));
  if (state === 'done') halo.ring(16, 16, 12.5, 13.5, 0.9, (x, y) => ((x + y) % 2 === 0 ? C.violet : null));
  // Œuf entier, silhouette nette.
  g.ellipse(16, 16, 7.5, 9.5, (x, y) => (x > 18 && y > 14 ? C.shellSh : x > 21 ? C.shellDk : C.shell));
  g.px(12, 10, C.shellHi).px(12, 11, C.shellHi).px(13, 9, C.shellHi).px(11, 12, C.shellHi).px(11, 13, C.shellHi);
  g.px(21, 17, C.shellDk).px(21, 18, C.shellDk).px(20, 21, C.shellDk).px(19, 22, C.shellDk);
  // Fissures décoratives UNIQUEMENT quand l'œuf est terminé.
  if (state === 'done') {
    const crack = [[16, 7], [17, 8], [16, 9], [17, 10], [18, 11], [17, 12], [16, 13], [14, 14]];
    crack.forEach(([x, y]) => g.px(x, y, C.shellDk));
    g.px(18, 12, C.shellDk).px(19, 13, C.shellDk);
  }
  g.outline(C.out);
  under(g, halo);
  // Particules sombres en cuisson.
  if (state === 'cooking' || state === 'almost') {
    const r = rng(31);
    for (let i = 0; i < (state === 'cooking' ? 5 : 8); i++) {
      const a = r() * Math.PI * 2, d = 12 + r() * 3;
      g.px(16 + Math.cos(a) * d, 16 + Math.sin(a) * d, i % 2 ? C.violet : C.lavDk);
    }
  }
  sparkles(g, state, [[4, 5], [28, 6], [3, 26], [29, 26, true], [16, 1, true]], C.pinkSoft);
  return g;
}

// ---------------------------------------------------------------- 7. PARFAIT
function parfait(state) {
  const g = new Raster(W, H);
  const lvl = LEVEL[state];
  // Socle élégant en chrome : piédestal à trois niveaux.
  g.rect(13, 22, 6, 4, C.chrome);
  g.rect(14, 22, 1, 4, C.shellHi);
  g.rect(17, 22, 2, 4, C.chromeSh);
  g.rect(9, 26, 14, 2, C.chrome);
  g.rect(9, 27, 14, 1, C.chromeSh);
  g.rect(7, 28, 18, 2, C.chromeSh);
  g.rect(7, 28, 18, 1, C.chrome);
  g.px(12, 26, C.shellHi).px(13, 26, C.shellHi);
  // Coupelle d'argent, bord irisé.
  g.ellipse(16, 21, 12, 3.4, C.chrome);
  g.ellipse(16, 21, 12, 3.4, (x, y) => (y >= 23 ? C.chromeSh : null));
  g.ellipse(16, 20.4, 10, 2.5, C.white);
  // Œuf : blanc délicat en dôme + jaune crémeux.
  g.ellipse(16, 17, 8, 5, (x, y) => (y > 18 ? C.whiteSh : C.white));
  g.ellipse(16, 15.5, 4.2, 3.6, state === 'done' ? C.creamHi : C.cream);
  g.ellipse(16, 16.5, 3.6, 2.4, (x, y) => (y > 16 ? (lvl >= 2 ? C.yolk : C.yolkDk) : null));
  g.px(14, 14, C.creamHi).px(15, 13, C.creamHi).px(13, 15, C.creamHi);
  g.outline(C.out);
  // Anneaux irisés autour : alternance rose / cyan / lavande.
  const rings = new Raster(W, H);
  const iri = [C.pink, C.cyan, C.lav];
  rings.ring(16, 17, 15.5, 6.5, 0.9, (x, y) => iri[(x + y + (state === 'cooking' ? 1 : 0)) % 3]);
  if (lvl >= 1) rings.ring(16, 17, 11.5, 12, 0.93, (x, y) => ((x + y) % 2 ? iri[(x + 2 * y) % 3] : null));
  if (lvl >= 2) rings.ring(16, 12, 13, 12, 0.95, (x, y) => ((x * 3 + y) % 5 === 0 ? C.gold : null));
  under(g, rings);
  // Halo doré progressif.
  const halo = new Raster(W, H);
  const hr = lvl === 0 ? 0 : lvl === 1 ? 10 : lvl === 2 ? 12 : 14;
  if (hr) halo.ring(16, 15, hr + 2, hr + 0.5, 0.82, (x, y) => ((x + y) % 2 === 0 ? C.gold : null));
  under(g, halo);
  // Particules lumineuses.
  if (state === 'cooking' || state === 'almost') {
    const r = rng(41);
    for (let i = 0; i < 6; i++) g.px(5 + Math.floor(r() * 22), 3 + Math.floor(r() * 10), i % 2 ? C.gold : C.lav);
  }
  sparkles(g, state, [[4, 6], [28, 7], [4, 24], [28, 24, true], [16, 3, true]], C.gold);
  return g;
}

const BUILDERS = { coque, mollet, poche, brouille, vapeur, dur, parfait };
const STATES = ['idle', 'selected', 'cooking', 'almost', 'done'];

module.exports = { BUILDERS, STATES, W, H };
