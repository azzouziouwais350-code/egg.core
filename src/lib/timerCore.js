// Logique pure du compte à rebours, sans React ni DOM : facile à tester.
//
// Principe : on ne décrémente jamais un compteur. Quand le minuteur tourne, on
// mémorise l'instant de fin (endAt, basé sur Date.now()). Le temps restant est
// toujours recalculé comme endAt - now : il reste exact même si l'onglet passe en
// arrière-plan et que les timers du navigateur sont ralentis.
//
// status : 'idle' | 'running' | 'paused' | 'done'

export const clampMs = (ms, min = 0, max = Infinity) => Math.min(max, Math.max(min, ms));

export function createTimer(durationMs) {
  return { status: 'idle', durationMs, remainingMs: durationMs, endAt: null };
}

export function start(timer, now) {
  if (timer.status === 'running') return timer; // jamais deux minuteries
  const base = timer.status === 'done' || timer.remainingMs <= 0 ? timer.durationMs : timer.remainingMs;
  return { ...timer, status: 'running', remainingMs: base, endAt: now + base };
}

export function pause(timer, now) {
  if (timer.status !== 'running') return timer;
  return { ...timer, status: 'paused', remainingMs: clampMs(timer.endAt - now), endAt: null };
}

export const resume = start; // reprise = redémarrage depuis le temps restant

export function reset(timer, durationMs = timer.durationMs) {
  return createTimer(durationMs);
}

// Change la durée initiale. Autorisé uniquement à l'arrêt (idle/done) : on ne
// modifie jamais silencieusement une cuisson en cours ou en pause.
export function setDuration(timer, durationMs) {
  if (timer.status === 'running' || timer.status === 'paused') return timer;
  return createTimer(durationMs);
}

// Met à jour le temps restant à l'instant `now`. Renvoie le même objet si rien
// ne change (utile pour éviter des rendus inutiles).
export function tick(timer, now) {
  if (timer.status !== 'running') return timer;
  const remainingMs = timer.endAt - now;
  if (remainingMs <= 0) return { ...timer, status: 'done', remainingMs: 0, endAt: null };
  if (remainingMs === timer.remainingMs) return timer;
  return { ...timer, remainingMs };
}

export const progressOf = timer =>
  timer.durationMs <= 0 ? 0 : clampMs(1 - timer.remainingMs / timer.durationMs, 0, 1);

// Affichage : on arrondit à la seconde supérieure pour que "00:00" n'apparaisse
// qu'à la toute fin.
export function formatMs(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function formatSpoken(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  const parts = [];
  if (m) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
  if (s || !m) parts.push(`${s} seconde${s > 1 ? 's' : ''}`);
  return parts.join(' ');
}

// Phase visuelle dérivée de l'état et de la progression.
export const ALMOST_THRESHOLD = 0.85;
export function phaseOf(timer, selected = true) {
  if (timer.status === 'done') return 'done';
  if (timer.status === 'running' || timer.status === 'paused') {
    return progressOf(timer) >= ALMOST_THRESHOLD ? 'almost' : 'cooking';
  }
  return selected ? 'selected' : 'idle';
}
