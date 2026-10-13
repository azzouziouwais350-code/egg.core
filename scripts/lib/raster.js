// Mini-boîte à outils de pixel art : on dessine sur une grille de pixels
// (formes simples), puis on exporte en SVG net (shape-rendering: crispEdges).
// Les illustrations sont ainsi des fichiers indépendants, remplaçables à la main.

const fs = require('fs');
const path = require('path');

class Raster {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Array(w * h).fill(null);
  }
  inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.inb(x, y) ? this.d[y * this.w + x] : null; }
  px(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (this.inb(x, y)) this.d[y * this.w + x] = c;
    return this;
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
    return this;
  }
  // Ellipse pleine centrée sur (cx, cy) ; c peut être une fonction (x, y) => couleur|null.
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) {
          const col = typeof c === 'function' ? c(x, y) : c;
          if (col) this.px(x, y, col);
        }
      }
    }
    return this;
  }
  // Anneau (entre deux rayons normalisés).
  ring(cx, cy, rx, ry, inner, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d <= 1 && d >= inner * inner) {
          const col = typeof c === 'function' ? c(x, y) : c;
          if (col) this.px(x, y, col);
        }
      }
    }
    return this;
  }
  line(x0, y0, x1, y1, c) {
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }
  // Triangle isocèle plein (pointe en haut) : base de largeur w centrée sur cx.
  spire(cx, topY, baseY, halfBase, c) {
    for (let y = topY; y <= baseY; y++) {
      const t = (y - topY) / Math.max(1, baseY - topY);
      const half = Math.round(t * halfBase);
      for (let x = cx - half; x <= cx + half; x++) this.px(x, y, c);
    }
    return this;
  }
  // Contour automatique (4-voisinage) autour des pixels déjà dessinés.
  outline(c) {
    const add = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
      }
    }
    add.forEach(([x, y]) => this.px(x, y, c));
    return this;
  }
  // Étoile à quatre branches (scintillement).
  sparkle(x, y, c, big = false) {
    this.px(x, y, c).px(x - 1, y, c).px(x + 1, y, c).px(x, y - 1, c).px(x, y + 1, c);
    if (big) this.px(x, y - 2, c).px(x, y + 2, c).px(x - 2, y, c).px(x + 2, y, c);
    return this;
  }
  count() { return this.d.filter(Boolean).length; }

  toSVG(extra = '') {
    const rects = [];
    for (let y = 0; y < this.h; y++) {
      let x = 0;
      while (x < this.w) {
        const c = this.d[y * this.w + x];
        if (!c) { x++; continue; }
        let run = 1;
        while (x + run < this.w && this.d[y * this.w + x + run] === c) run++;
        rects.push(`<rect x="${x}" y="${y}" width="${run}" height="1" fill="${c}"/>`);
        x += run;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" shape-rendering="crispEdges"${extra}>${rects.join('')}</svg>\n`;
  }
  save(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, this.toSVG());
  }
}

// Générateur pseudo-aléatoire déterministe : les sprites sont reproductibles.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

module.exports = { Raster, rng };
