// Éléments du paysage Dreamcore / gothique / liminal, dessinés en pixel art.
// Chaque pièce est un SVG indépendant, composé ensuite par src/scenes/scenes.js.

const { Raster, rng } = require('./lib/raster');

const T = {
  pink:  { main: '#FFC2E8', mid: '#F08CCB', dk: '#C86AA8' },
  blue:  { main: '#CFEBFF', mid: '#9FCDF5', dk: '#6FA2D8' },
  lav:   { main: '#E4D8FF', mid: '#B9A0FF', dk: '#8B72D6' },
  white: { main: '#FBF1FF', mid: '#DCC9F0', dk: '#B7A0D6' },
};

function cloud(w, h, t, seed) {
  const g = new Raster(w, h);
  const r = rng(seed);
  const bumps = Math.max(3, Math.floor(w / 12));
  const base = h - 4;
  g.rect(3, base - 3, w - 6, 5, t.main);
  for (let i = 0; i < bumps; i++) {
    const cx = 6 + ((w - 12) * (i + 0.5)) / bumps + (r() - 0.5) * 3;
    const ry = 4 + r() * (h * 0.38);
    const rx = 5 + r() * 5;
    g.ellipse(cx, base - 3 - ry * 0.3, rx, ry, t.main);
  }
  // Ombre inférieure et bord arrondi
  for (let x = 0; x < w; x++) {
    for (let y = base - 1; y < h; y++) {
      if (g.get(x, y)) g.px(x, y, y >= base ? t.dk : t.mid);
    }
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (y > base + 1) g.px(x, y, null);
  }
  return g;
}

function moon(size, c) {
  const g = new Raster(size, size);
  const r = size / 2;
  g.ellipse(r, r, r, r, c.mid);
  g.ellipse(r - size * 0.06, r - size * 0.06, r * 0.88, r * 0.88, c.main);
  // cratères
  const rnd = rng(size + 5);
  for (let i = 0; i < 7; i++) {
    const cx = r + (rnd() - 0.5) * r * 1.2, cy = r + (rnd() - 0.5) * r * 1.2;
    const cr = 1.5 + rnd() * size * 0.07;
    if (Math.hypot(cx - r, cy - r) + cr < r * 0.9) g.ellipse(cx, cy, cr, cr * 0.85, c.mid);
  }
  // croissant d'ombre
  g.ring(r, r, r, r, 0.93, c.dk);
  return g;
}

function castle() {
  const w = 120, h = 72;
  const g = new Raster(w, h);
  const A = '#241A3D', B = '#2F2250', GL = '#FF6EC7', GC = '#B9A0FF';
  const tower = (x, top, tw, spire) => {
    g.rect(x, top, tw, h - top, A);
    // créneaux
    for (let i = 0; i < tw; i += 3) g.rect(x + i, top - 2, 2, 2, A);
    if (spire) g.spire(x + Math.floor(tw / 2), top - spire - 2, top - 2, Math.ceil(tw / 2) + 1, B);
  };
  g.rect(0, 52, w, h - 52, A); // mur de base
  for (let i = 0; i < w; i += 4) g.rect(i, 50, 2, 2, A); // créneaux du mur
  tower(8, 36, 12, 16);
  tower(34, 22, 14, 22);
  tower(54, 30, 12, 0);
  tower(76, 14, 16, 30);
  tower(100, 34, 12, 14);
  g.rect(44, 40, 8, 32, B);       // donjon bas
  g.rect(66, 44, 10, 28, B);
  // fenêtres lumineuses (vitraux) : arche pointue
  const win = (x, y, c) => { g.rect(x, y + 2, 2, 3, c); g.px(x, y + 1, c); g.px(x + 1, y + 1, c); };
  win(13, 44, GL); win(40, 32, GC); win(40, 46, GL); win(59, 40, GC);
  win(83, 28, GL); win(83, 44, GC); win(105, 44, GL); win(14, 58, GC); win(88, 58, GL);
  // grande porte en arche
  g.rect(54, 56, 12, 16, '#120B22');
  g.ellipse(60, 56, 6, 5, '#120B22');
  g.rect(58, 60, 4, 12, '#1E1438');
  // contour de lumière sommital
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
    if (g.get(x, y) === B && !g.get(x, y - 1)) g.px(x, y, '#4A3578');
  }
  return g;
}

function island(seed) {
  const w = 72, h = 76;
  const g = new Raster(w, h);
  const rnd = rng(seed);
  const top = 28; // ligne de surface
  // dessous rocheux en pointe
  for (let y = top + 4; y < h; y++) {
    const t = (y - top - 4) / (h - top - 4);
    const half = Math.round((1 - t) * 30 + Math.sin(y * 1.7) * 1.2);
    for (let x = 36 - half; x <= 36 + half; x++) g.px(x, y, (x + y) % 5 === 0 ? '#2B1F47' : '#3A2A5E');
  }
  // surface
  g.rect(4, top, 64, 6, '#4A3A78');
  g.rect(4, top, 64, 2, '#7C66C0');
  for (let x = 4; x < 68; x += 2) if (rnd() > 0.5) g.px(x, top - 1, '#9D86E6');
  // ruines : colonnes de hauteurs variées + arche brisée
  const col = (x, y, hgt) => {
    g.rect(x, y, 4, hgt, '#B7A0D6');
    g.rect(x + 3, y, 1, hgt, '#8E78B8');
    g.rect(x - 1, y, 6, 2, '#D8C7EE');
    g.rect(x - 1, y + hgt - 1, 6, 1, '#8E78B8');
  };
  col(12, top - 22, 22);
  col(32, top - 12, 12);
  col(50, top - 28, 28);
  // arche reliant deux colonnes (brisée au milieu)
  for (let x = 16; x < 32; x++) {
    const dy = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((x - 24) / 8, 2))) * 5);
    if (x < 21 || x > 27) { g.px(x, top - 22 - dy + 2, '#B7A0D6'); g.px(x, top - 22 - dy + 3, '#8E78B8'); }
  }
  g.rect(40, top - 3, 4, 3, '#8E78B8'); g.rect(58, top - 2, 3, 2, '#B7A0D6');
  // plantes pendantes
  for (let i = 0; i < 6; i++) {
    const x = 10 + Math.floor(rnd() * 52);
    for (let y = top + 6; y < top + 9 + Math.floor(rnd() * 5); y++) g.px(x, y, '#7C66C0');
  }
  return g;
}

function platform() {
  const w = 56, h = 20;
  const g = new Raster(w, h);
  g.rect(2, 2, 52, 4, '#5B4A94');
  g.rect(2, 2, 52, 1, '#9D86E6');
  for (let y = 6; y < h; y++) {
    const half = Math.round(26 * (1 - (y - 6) / (h - 6)));
    for (let x = 28 - half; x <= 28 + half; x++) g.px(x, y, (x + y) % 4 ? '#3A2A5E' : '#2B1F47');
  }
  return g;
}

function door() {
  const w = 28, h = 48;
  const g = new Raster(w, h);
  // cadre de pierre
  g.rect(0, 6, 28, 42, '#B7A0D6');
  g.ellipse(14, 10, 14, 10, '#B7A0D6');
  g.rect(0, 46, 28, 2, '#8E78B8');
  // ouverture lumineuse : dégradé par bandes
  const bands = ['#FFB3E0', '#FF8CD2', '#D58CFF', '#9F8CFF', '#6FA8FF', '#3FD0FF', '#00E5FF'];
  const open = new Raster(w, h);
  open.rect(4, 10, 20, 36, '#fff');
  open.ellipse(14, 12, 10, 9, '#fff');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (open.get(x, y)) {
      const idx = Math.min(bands.length - 1, Math.floor(((y - 3) / 43) * bands.length));
      g.px(x, y, bands[Math.max(0, idx)]);
    }
  }
  g.px(20, 28, '#FFF7FF').px(20, 29, '#FFF7FF');
  g.rect(13, 14, 2, 30, '#FFF7FF'); // rayon de lumière
  g.rect(13, 14, 2, 30, null);
  for (let y = 16; y < 44; y += 3) g.px(14, y, '#FFFFFF');
  // reflets
  g.px(2, 14, '#E4D8FF').px(2, 15, '#E4D8FF').px(2, 30, '#E4D8FF');
  g.outline('#2F2250');
  return g;
}

function stairs() {
  const w = 56, h = 44;
  const g = new Raster(w, h);
  const steps = 9;
  for (let i = 0; i < steps; i++) {
    const x = i * 5;
    const y = h - 6 - i * 4;
    const op = i / steps;
    const top = ['#E4D8FF', '#D8C7FF', '#CDB8F5', '#C2ABEE', '#B7A0E6', '#AC96DD', '#A18CD3', '#9680C9', '#8B75BF'][i];
    g.rect(x, y, 8, 3, top);
    g.rect(x, y + 3, 8, 3, '#6B558E');
    if (i % 2) g.px(x, y, '#FFFFFF');
    void op;
  }
  // rambarde fantôme
  for (let i = 0; i < steps; i++) g.px(i * 5 + 6, h - 14 - i * 4, '#E4D8FF');
  return g;
}

function portal() {
  const w = 56, h = 72;
  const g = new Raster(w, h);
  // arche gothique pointue : intérieur dégradé, cadre de pierre, détails de vitrail
  const arch = (cx, baseY, halfW, top) => {
    const r = new Raster(w, h);
    for (let y = top; y <= baseY; y++) {
      const t = (y - top) / (baseY - top);
      const half = Math.round(halfW * Math.min(1, Math.pow(t * 1.4, 0.7)));
      for (let x = cx - half; x <= cx + half; x++) r.px(x, y, '#fff');
    }
    return r;
  };
  const outer = arch(28, 70, 24, 2);
  const inner = arch(28, 68, 19, 8);
  const bands = ['#FFB3E0', '#FF6EC7', '#C77DFF', '#8F7BFF', '#5B9BFF', '#00B8FF', '#00E5FF'];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (outer.get(x, y)) g.px(x, y, (x + y) % 7 === 0 ? '#9D86E6' : '#C8B4F0');
    if (inner.get(x, y)) {
      const idx = Math.min(bands.length - 1, Math.floor(((y - 8) / 60) * bands.length));
      g.px(x, y, bands[idx]);
    }
  }
  // meneaux de vitrail
  for (let y = 12; y < 68; y++) g.px(28, y, '#2F2250');
  for (let x = 12; x < 45; x++) g.px(x, 40, '#2F2250');
  for (let i = 0; i < 6; i++) { g.px(22 + i, 20 + (i < 3 ? i : 5 - i), '#2F2250'); }
  // pointe + ornements
  g.sparkle(28, 3, '#FFF7FF');
  g.outline('#1B1030');
  return g;
}

function arches() {
  const w = 56, h = 52;
  const g = new Raster(w, h);
  const A = '#8C78B8', B = '#B7A0D6', D = '#5B4A8A';
  const pillar = (x, top) => { g.rect(x, top, 5, h - top, B); g.rect(x + 4, top, 1, h - top, D); g.rect(x - 1, top, 7, 2, '#D8C7EE'); };
  pillar(2, 14); pillar(25, 6); pillar(48, 18);
  // arches en pierre, brisées
  const arc = (x0, x1, y) => {
    const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2;
    for (let x = x0; x <= x1; x++) {
      const dy = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2))) * 8);
      g.px(x, y - dy, A); g.px(x, y - dy - 1, B);
    }
  };
  arc(5, 25, 14); arc(28, 48, 10);
  // débris flottants
  g.rect(14, 30, 3, 2, B); g.rect(38, 34, 4, 2, A); g.rect(22, 42, 2, 2, B);
  g.outline('#1B1030');
  return g;
}

function temple() {
  const w = 120, h = 68;
  const g = new Raster(w, h);
  const S = '#F2E6FF', M = '#CDB8F0', D = '#9A82CC', GOLD = '#FFD36B';
  // marches
  g.rect(8, 60, 104, 4, M); g.rect(14, 56, 92, 4, S); g.rect(20, 52, 80, 4, M);
  g.rect(8, 63, 104, 1, D);
  // colonnes
  for (let i = 0; i < 6; i++) {
    const x = 26 + i * 14;
    g.rect(x, 22, 6, 30, S); g.rect(x + 5, 22, 1, 30, M);
    g.rect(x - 1, 20, 8, 2, M); g.rect(x - 1, 51, 8, 2, M);
    for (let y = 26; y < 50; y += 4) g.px(x + 2, y, M);
  }
  // fronton triangulaire
  g.rect(20, 16, 80, 4, S);
  g.rect(20, 19, 80, 1, D);
  g.spire(60, 0, 15, 40, M);
  g.spire(60, 3, 15, 34, S);
  g.ellipse(60, 12, 5, 5, GOLD);
  g.ellipse(60, 12, 3, 3, '#FFF3C4');
  // rayons dorés
  for (let i = 0; i < 6; i++) g.px(10 + i * 20, 8 + (i % 2) * 4, GOLD);
  g.outline('#2A1E45');
  return g;
}

function tower() {
  const w = 32, h = 96;
  const g = new Raster(w, h);
  g.rect(8, 8, 16, 88, '#5E4F8F');
  g.rect(20, 8, 4, 88, '#43366E');
  g.rect(6, 4, 20, 4, '#7C6BB0');
  g.rect(12, 0, 8, 4, '#7C6BB0');
  for (let y = 16; y < 88; y += 12) { g.rect(13, y, 3, 6, '#E4D8FF'); g.rect(13, y, 3, 1, '#FFFFFF'); }
  g.outline('#1B1030');
  return g;
}

function corridor() {
  const w = 96, h = 24;
  const g = new Raster(w, h);
  g.rect(0, 0, w, 3, '#8F7BC8');
  g.rect(0, 3, w, 2, '#5B4A94');
  g.rect(0, 20, w, 3, '#8F7BC8');
  g.rect(0, 17, w, 3, '#43366E');
  for (let x = 6; x < w - 4; x += 12) { g.rect(x, 5, 3, 12, '#2B1F47'); g.rect(x, 5, 1, 12, '#B9A0FF'); }
  g.outline('#1B1030');
  return g;
}

function kitchen() {
  const w = 64, h = 52;
  const g = new Raster(w, h);
  // étagère flottante
  g.rect(4, 40, 56, 3, '#B7A0D6'); g.rect(4, 43, 56, 2, '#6B558E');
  for (let y = 45; y < h; y++) { const half = Math.round(26 * (1 - (y - 45) / (h - 45))); for (let x = 32 - half; x <= 32 + half; x++) g.px(x, y, '#3A2A5E'); }
  // casserole
  g.rect(8, 30, 18, 10, '#D5DEFA'); g.rect(8, 37, 18, 3, '#8FA2D9'); g.rect(26, 32, 8, 2, '#8FA2D9');
  g.rect(8, 30, 18, 2, '#FFFFFF');
  // tasse
  g.rect(40, 32, 10, 8, '#FFC2E8'); g.rect(50, 34, 3, 4, '#FFC2E8'); g.rect(41, 33, 8, 2, '#FFE8F6');
  // lampe suspendue dorée
  for (let y = 0; y < 8; y++) g.px(32, y, '#8E78B8');
  g.ellipse(32, 12, 7, 5, '#FFBE62'); for (let y = 12; y < 14; y++) for (let x = 25; x <= 39; x++) g.px(x, y, null);
  g.ellipse(32, 12, 7, 5, (x, y) => (y < 12 ? '#FFD98A' : null));
  g.rect(28, 12, 9, 2, '#FFF0C2');
  // petites étoiles/étincelles
  g.sparkle(12, 18, '#FFE8A8'); g.sparkle(52, 22, '#FFE8A8');
  g.outline('#1B1030');
  return g;
}

function ring(size) {
  // anneau chromé / irisé Y2K (utilisé derrière le minuteur et dans le décor)
  const g = new Raster(size, size);
  const cols = ['#FF6EC7', '#C77DFF', '#00E5FF', '#9AF4FF', '#B9A0FF', '#FFB3E0'];
  g.ring(size / 2, size / 2, size / 2, size / 2, 0.9, (x, y) => cols[(Math.floor((x + y) / 2)) % cols.length]);
  return g;
}

function glow(size) {
  // halo pixelisé en dithering (pas de flou coûteux) : cercles concentriques tramés
  const g = new Raster(size, size);
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const f = 1 - i / steps;
    g.ellipse(size / 2, size / 2, (size / 2) * f, (size / 2) * f, (x, y) => ((x + y + i) % (i + 2) === 0 ? '#ffffff' : null));
  }
  return g;
}

function assets() {
  const out = {};
  out['cloud-pink-a'] = cloud(56, 20, T.pink, 1);
  out['cloud-pink-b'] = cloud(80, 24, T.pink, 2);
  out['cloud-blue-a'] = cloud(56, 20, T.blue, 3);
  out['cloud-blue-b'] = cloud(80, 24, T.blue, 4);
  out['cloud-lav-a'] = cloud(56, 20, T.lav, 5);
  out['cloud-lav-b'] = cloud(80, 24, T.lav, 6);
  out['cloud-white-a'] = cloud(56, 20, T.white, 7);
  out['cloud-white-b'] = cloud(80, 24, T.white, 8);
  out['moon-lav'] = moon(48, { main: '#E4D8FF', mid: '#B9A0FF', dk: '#8B72D6' });
  out['moon-pink'] = moon(48, { main: '#FFB3E0', mid: '#E066B0', dk: '#A8407F' });
  out['moon-blue'] = moon(48, { main: '#CFEBFF', mid: '#8FC4F5', dk: '#5C8FD0' });
  out['moon-gold'] = moon(48, { main: '#FFF0C2', mid: '#FFD36B', dk: '#E8A94A' });
  out['castle'] = castle();
  out['island-a'] = island(11);
  out['island-b'] = island(29);
  out['platform'] = platform();
  out['door'] = door();
  out['stairs'] = stairs();
  out['portal'] = portal();
  out['arches'] = arches();
  out['temple'] = temple();
  out['tower'] = tower();
  out['corridor'] = corridor();
  out['kitchen'] = kitchen();
  out['ring'] = ring(48);
  out['glow'] = glow(48);
  return out;
}

module.exports = { assets };
