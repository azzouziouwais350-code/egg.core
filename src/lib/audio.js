// Sons synthétisés (Web Audio) : aucun fichier, aucune dépendance. Carillon doux
// en arpège pentatonique, discret. Le contexte est créé/repris lors d'un geste
// utilisateur (bouton Démarrer) pour respecter les règles d'autoplay.

let ctx = null;

export function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* audio indisponible */ }
}

export function playChime() {
  try {
    unlockAudio();
    if (!ctx) return false;
    const t0 = ctx.currentTime + 0.02;
    const notes = [659.25, 783.99, 987.77, 1318.51, 987.77, 1318.51, 1567.98]; // E5 G5 B5 E6 …
    notes.forEach((f, i) => {
      const t = t0 + i * 0.16;
      [[f, 'sine', 0.12], [f * 2, 'triangle', 0.035]].forEach(([freq, type, vol]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.95);
      });
    });
    return true;
  } catch (e) { return false; }
}

export function playClick() {
  try {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.06);
  } catch (e) { /* ignoré */ }
}
