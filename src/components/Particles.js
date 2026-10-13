import React, { useEffect, useRef } from 'react';

// Particules pixel sur <canvas> : plafonnées (MAX), limitées à ~30 images/s,
// arrêtées quand l'onglet est caché ou quand les animations sont désactivées.
const MAX = 40;
const PX = 3;
const PAL = {
  gold: ['#FFBE62', '#FFE8A8', '#FFD36B'],
  lav: ['#B9A0FF', '#E4D8FF', '#8B72D6'],
  cyan: ['#00E5FF', '#9AF4FF', '#FFFFFF'],
  steam: ['#EAF4FF', '#CFEBFF', '#9AF4FF'],
  dark: ['#5B3FA0', '#7A5FD0', '#FF6EC7'],
};

const KINDS = {
  'gold-sparkle': { pal: 'gold', spawn: (w, h, c) => ({ x: c.x + (Math.random() - 0.5) * 220, y: c.y + 60, vx: 0, vy: -0.4 - Math.random() * 0.5, life: 110 }) },
  orbit: { pal: 'lav', orbit: true },
  bubbles: { pal: 'cyan', spawn: (w, h, c) => ({ x: c.x + (Math.random() - 0.5) * 260, y: c.y + 100, vx: 0, vy: -0.5 - Math.random() * 0.6, life: 140, wob: Math.random() * 6 }) },
  'steam-gold': { pal: 'gold', spawn: (w, h, c) => ({ x: c.x + (Math.random() - 0.5) * 120, y: c.y + 40, vx: 0, vy: -0.5 - Math.random() * 0.4, life: 120, wob: Math.random() * 6 }) },
  steam: { pal: 'steam', spawn: (w, h, c) => ({ x: c.x + (Math.random() - 0.5) * 200, y: c.y + 80, vx: 0, vy: -0.35 - Math.random() * 0.4, life: 170, wob: Math.random() * 6, big: true }) },
  'dark-motes': { pal: 'dark', spawn: (w, h) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: -0.1 - Math.random() * 0.2, life: 200 }) },
  'halo-gold': { pal: 'gold', radial: true },
};

const DENSITY = { idle: 0.25, selected: 0.4, cooking: 0.65, almost: 1, done: 0.6 };

export default function Particles({ kind, phase, enabled, burstKey, anchorRef }) {
  const canvasRef = useRef(null);
  const state = useRef({ list: [], burst: [], kind, phase });
  state.current.kind = kind;
  state.current.phase = phase;

  // Éclat de pixels à la fin du compte à rebours.
  useEffect(() => {
    if (!burstKey || !enabled) return;
    const c = canvasRef.current;
    if (!c) return;
    const a = anchorRef && anchorRef.current ? anchorRef.current.getBoundingClientRect() : null;
    const cx = a ? a.left + a.width / 2 : c.width / 2;
    const cy = a ? a.top + a.height / 2 : c.height / 3;
    const pal = [...PAL.gold, ...PAL.cyan, '#FF6EC7'];
    state.current.burst = Array.from({ length: 56 }, () => {
      const ang = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 4.5;
      return { x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.5, life: 70 + Math.random() * 40, col: pal[Math.floor(Math.random() * pal.length)] };
    });
  }, [burstKey, enabled, anchorRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) {
      if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      return undefined;
    }
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = 0;
    let frame = 0;
    let center = { x: 0, y: 0 };
    let stopped = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = t => {
      if (stopped) return;
      raf = requestAnimationFrame(loop);
      if (document.hidden || t - last < 33) return;
      last = t;
      frame++;
      const w = canvas.width, h = canvas.height;
      if (frame % 20 === 1) {
        const a = anchorRef && anchorRef.current ? anchorRef.current.getBoundingClientRect() : null;
        center = a ? { x: a.left + a.width / 2, y: a.top + a.height / 2 } : { x: w / 2, y: h / 3 };
      }
      const s = state.current;
      const def = KINDS[s.kind] || KINDS['gold-sparkle'];
      const pal = PAL[def.pal];
      const target = Math.round(MAX * (DENSITY[s.phase] || 0.3));
      ctx.clearRect(0, 0, w, h);

      // apparition
      if (!def.orbit && !def.radial && s.list.length < target && Math.random() < 0.5) {
        s.list.push({ ...def.spawn(w, h, center), col: pal[Math.floor(Math.random() * pal.length)], age: 0 });
      }
      if ((def.orbit || def.radial) && s.list.length < target) {
        s.list.push({ a: Math.random() * Math.PI * 2, r: 60 + Math.random() * 40, sp: 0.02 + Math.random() * 0.02, age: 0, life: 160, col: pal[Math.floor(Math.random() * pal.length)] });
      }

      for (let i = s.list.length - 1; i >= 0; i--) {
        const p = s.list[i];
        p.age++;
        let x, y;
        if (def.orbit) { p.a += p.sp; x = center.x + Math.cos(p.a) * (p.r + 70); y = center.y + Math.sin(p.a) * (p.r * 0.45 + 30); }
        else if (def.radial) { p.r += 0.5; x = center.x + Math.cos(p.a) * (p.r + 60); y = center.y + Math.sin(p.a) * (p.r + 60); }
        else { p.x += p.vx + (p.wob !== undefined ? Math.sin((p.age + p.wob * 10) / 14) * 0.5 : 0); p.y += p.vy; x = p.x; y = p.y; }
        if (p.age > p.life || s.list.length > target + 6 && i % 2 === 0) { s.list.splice(i, 1); continue; }
        const k = p.age / p.life;
        ctx.globalAlpha = k < 0.15 ? k / 0.15 : k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1;
        ctx.fillStyle = p.col;
        const size = def.pal === 'steam' ? PX * 2 : PX;
        ctx.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, size, size);
      }
      // éclats de réussite
      for (let i = s.burst.length - 1; i >= 0; i--) {
        const p = s.burst[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.vx *= 0.99; p.life--;
        if (p.life <= 0) { s.burst.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, p.life / 25);
        ctx.fillStyle = p.col;
        ctx.fillRect(Math.round(p.x / PX) * PX, Math.round(p.y / PX) * PX, PX, PX);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [enabled, anchorRef]);

  // Au changement d'œuf, on repart de zéro (pas de reste de l'ancienne ambiance).
  useEffect(() => { state.current.list = []; }, [kind]);

  return <canvas ref={canvasRef} className="particles" aria-hidden="true" />;
}
