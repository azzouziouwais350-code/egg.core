// Paysages Dreamcore : une scène par type d'œuf. Les éléments communs (étoiles,
// grande lune, nuages) varient de teinte ; l'architecture lointaine change.
// Champs d'un élément : a = fichier de scenery/, x/y = position en % (centre),
// w = largeur d'origine en pixels, s = échelle (multiplicateur de l'unité --u),
// z = profondeur (0 lointain → 3 proche), anim = classe d'animation.

export const SCENES = {
  'moon-clouds': {
    sky: ['#120A2A', '#3A1B54', '#8A3C86'], horizon: '#FF6EC7',
    items: [
      { a: 'moon-lav', x: 74, y: 24, w: 48, s: 2.2, z: 0, anim: 'pulse' },
      { a: 'platform', x: 18, y: 56, w: 56, s: 1.2, z: 2, anim: 'float' },
      { a: 'island-a', x: 86, y: 62, w: 72, s: 1, z: 1, anim: 'float-slow' },
      { a: 'cloud-pink-b', x: 20, y: 30, w: 80, s: 1.2, z: 1, anim: 'drift' },
      { a: 'cloud-pink-a', x: 60, y: 46, w: 56, s: 1.4, z: 2, anim: 'drift-rev' },
      { a: 'cloud-lav-b', x: 40, y: 82, w: 80, s: 2, z: 3, anim: 'drift' },
      { a: 'cloud-pink-b', x: 90, y: 86, w: 80, s: 1.6, z: 3, anim: 'drift-rev' },
    ],
  },
  'portal-arches': {
    sky: ['#0B0820', '#201654', '#4B3A9A'], horizon: '#B9A0FF',
    items: [
      { a: 'moon-lav', x: 18, y: 18, w: 48, s: 1.2, z: 0, anim: 'pulse' },
      { a: 'portal', x: 50, y: 40, w: 56, s: 2.4, z: 1, anim: 'portal' },
      { a: 'arches', x: 12, y: 58, w: 56, s: 1.8, z: 1, anim: 'float-slow' },
      { a: 'arches', x: 90, y: 54, w: 56, s: 1.6, z: 1, anim: 'float', flip: true },
      { a: 'cloud-blue-b', x: 22, y: 78, w: 80, s: 1.6, z: 2, anim: 'drift' },
      { a: 'cloud-blue-a', x: 78, y: 28, w: 56, s: 1.4, z: 2, anim: 'drift-rev' },
      { a: 'cloud-blue-b', x: 60, y: 90, w: 80, s: 2, z: 3, anim: 'drift-rev' },
    ],
  },
  'cyan-platform': {
    sky: ['#06142A', '#0E3A5E', '#2C7FA8'], horizon: '#00E5FF',
    items: [
      { a: 'moon-blue', x: 22, y: 22, w: 48, s: 1.6, z: 0, anim: 'pulse' },
      { a: 'ring', x: 78, y: 28, w: 48, s: 2.4, z: 1, anim: 'spin' },
      { a: 'platform', x: 82, y: 66, w: 56, s: 1.4, z: 2, anim: 'float' },
      { a: 'island-b', x: 12, y: 60, w: 72, s: 0.9, z: 1, anim: 'float-slow' },
      { a: 'cloud-blue-b', x: 30, y: 40, w: 80, s: 1.4, z: 1, anim: 'drift' },
      { a: 'cloud-white-a', x: 66, y: 50, w: 56, s: 1.6, z: 2, anim: 'drift-rev' },
      { a: 'cloud-blue-b', x: 50, y: 88, w: 80, s: 2, z: 3, anim: 'drift' },
    ],
  },
  'golden-kitchen': {
    sky: ['#1E0F2A', '#5A2A4A', '#C0644A'], horizon: '#FFBE62',
    items: [
      { a: 'moon-gold', x: 80, y: 20, w: 48, s: 1.6, z: 0, anim: 'pulse' },
      { a: 'kitchen', x: 16, y: 52, w: 64, s: 2.2, z: 2, anim: 'float' },
      { a: 'island-a', x: 88, y: 66, w: 72, s: 0.9, z: 1, anim: 'float-slow' },
      { a: 'cloud-pink-b', x: 38, y: 28, w: 80, s: 1.4, z: 1, anim: 'drift' },
      { a: 'cloud-pink-a', x: 68, y: 44, w: 56, s: 1.4, z: 2, anim: 'drift-rev' },
      { a: 'cloud-pink-b', x: 40, y: 88, w: 80, s: 2, z: 3, anim: 'drift-rev' },
    ],
  },
  'mist-liminal': {
    sky: ['#0A1024', '#1B2D5C', '#5C86B8'], horizon: '#8FD3FF',
    items: [
      { a: 'moon-blue', x: 50, y: 24, w: 48, s: 3, z: 0, anim: 'pulse' },
      { a: 'tower', x: 14, y: 52, w: 32, s: 1.8, z: 1, anim: 'none' },
      { a: 'tower', x: 86, y: 56, w: 32, s: 1.4, z: 1, anim: 'none' },
      { a: 'corridor', x: 50, y: 66, w: 96, s: 1.8, z: 2, anim: 'float-slow' },
      { a: 'cloud-white-b', x: 24, y: 40, w: 80, s: 2, z: 1, anim: 'drift' },
      { a: 'cloud-white-b', x: 76, y: 50, w: 80, s: 2, z: 2, anim: 'drift-rev' },
      { a: 'cloud-white-b', x: 50, y: 90, w: 80, s: 2.6, z: 3, anim: 'drift' },
    ],
  },
  'gothic-castle': {
    sky: ['#0A0510', '#2A0F3A', '#7A2A6A'], horizon: '#FF6EC7',
    items: [
      { a: 'moon-pink', x: 70, y: 22, w: 48, s: 2.4, z: 0, anim: 'pulse' },
      { a: 'castle', x: 30, y: 62, w: 120, s: 2.2, z: 1, anim: 'none' },
      { a: 'island-b', x: 88, y: 66, w: 72, s: 1, z: 1, anim: 'float-slow' },
      { a: 'arches', x: 62, y: 74, w: 56, s: 1.2, z: 2, anim: 'float' },
      { a: 'cloud-lav-b', x: 20, y: 36, w: 80, s: 1.4, z: 1, anim: 'drift' },
      { a: 'cloud-pink-a', x: 58, y: 48, w: 56, s: 1.2, z: 2, anim: 'drift-rev' },
      { a: 'cloud-lav-b', x: 60, y: 90, w: 80, s: 2, z: 3, anim: 'drift' },
    ],
  },
  'celestial-temple': {
    sky: ['#140B30', '#42307A', '#C79BD8'], horizon: '#FFE08A',
    items: [
      { a: 'moon-gold', x: 20, y: 18, w: 48, s: 1.4, z: 0, anim: 'pulse' },
      { a: 'temple', x: 50, y: 58, w: 120, s: 2.4, z: 1, anim: 'float-slow' },
      { a: 'ring', x: 50, y: 40, w: 48, s: 5, z: 0, anim: 'spin' },
      { a: 'stairs', x: 88, y: 56, w: 56, s: 1.6, z: 2, anim: 'float' },
      { a: 'cloud-white-b', x: 22, y: 50, w: 80, s: 1.8, z: 2, anim: 'drift' },
      { a: 'cloud-lav-b', x: 80, y: 30, w: 80, s: 1.4, z: 1, anim: 'drift-rev' },
      { a: 'cloud-white-b', x: 50, y: 90, w: 80, s: 2.4, z: 3, anim: 'drift' },
    ],
  },
};

// Étoiles déterministes (pas d'aléatoire au rendu → pas de saut visuel).
export const STARS = Array.from({ length: 36 }, (_, i) => {
  const r = n => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 100, y: r(2) * 62, big: r(3) > 0.82, d: (r(4) * 4).toFixed(2), tone: Math.floor(r(5) * 3) };
});
