import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTimer, start, pause, resume, reset, setDuration, tick,
  progressOf, formatMs, phaseOf,
} from '../src/lib/timerCore.js';

const D = 180000; // 3 min

test('démarrage : endAt = now + durée', () => {
  const t = start(createTimer(D), 1000);
  assert.equal(t.status, 'running');
  assert.equal(t.endAt, 1000 + D);
});

test('le temps restant vient de l’horloge, pas d’un compteur (onglet en arrière-plan)', () => {
  let t = start(createTimer(D), 0);
  t = tick(t, 120000); // un seul tick, 2 min plus tard
  assert.equal(t.remainingMs, 60000);
  assert.equal(t.status, 'running');
});

test('pause puis reprise conservent le temps restant', () => {
  let t = start(createTimer(D), 0);
  t = pause(t, 50000);
  assert.equal(t.status, 'paused');
  assert.equal(t.remainingMs, D - 50000);
  t = tick(t, 999999); // inactif en pause
  assert.equal(t.remainingMs, D - 50000);
  t = resume(t, 100000);
  assert.equal(t.endAt, 100000 + D - 50000);
});

test('start sur un minuteur déjà actif ne crée pas de second compte à rebours', () => {
  const t1 = start(createTimer(D), 0);
  assert.equal(start(t1, 5000), t1);
});

test('arrivée à zéro : done, endAt nul, plus de mises à jour', () => {
  let t = start(createTimer(D), 0);
  t = tick(t, D + 5);
  assert.equal(t.status, 'done');
  assert.equal(t.remainingMs, 0);
  assert.equal(t.endAt, null);
  assert.equal(tick(t, D + 10000), t);
});

test('redémarrage après la fin repart de la durée initiale', () => {
  let t = tick(start(createTimer(D), 0), D);
  t = start(t, 10);
  assert.equal(t.status, 'running');
  assert.equal(t.remainingMs, D);
});

test('réinitialisation restaure la durée', () => {
  let t = pause(start(createTimer(D), 0), 1000);
  t = reset(t);
  assert.deepEqual(t, createTimer(D));
});

test('la durée ne change pas en cours ou en pause, seulement à l’arrêt', () => {
  const running = start(createTimer(D), 0);
  assert.equal(setDuration(running, 1000), running);
  const paused = pause(running, 10);
  assert.equal(setDuration(paused, 1000), paused);
  assert.equal(setDuration(createTimer(D), 60000).remainingMs, 60000);
});

test('formatMs arrondit à la seconde supérieure', () => {
  assert.equal(formatMs(180000), '03:00');
  assert.equal(formatMs(179001), '03:00');
  assert.equal(formatMs(1), '00:01');
  assert.equal(formatMs(0), '00:00');
  assert.equal(formatMs(61000), '01:01');
});

test('progression et phases visuelles', () => {
  let t = start(createTimer(D), 0);
  t = tick(t, D / 2);
  assert.equal(progressOf(t), 0.5);
  assert.equal(phaseOf(t), 'cooking');
  t = tick(t, D * 0.9);
  assert.equal(phaseOf(t), 'almost');
  assert.equal(phaseOf(createTimer(D), true), 'selected');
  assert.equal(phaseOf(createTimer(D), false), 'idle');
  assert.equal(phaseOf(tick(t, D)), 'done');
});
