import { useCallback, useEffect, useState } from 'react';
import { EGG_TYPES, DEFAULT_EGG_ID } from '../data/eggTypes';

const KEY = 'eggtimer.dreamcore.v1';

const systemReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
};

const defaults = () => ({
  sound: true,
  animations: !systemReducedMotion(), // suit la préférence système par défaut
  crt: true,
  notify: false,            // notification système : seulement si l'utilisateur l'active
  eggId: DEFAULT_EGG_ID,
  durations: {},            // durées personnalisées (secondes) par type d'œuf
});

function load() {
  const base = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      const durations = {};
      EGG_TYPES.forEach(e => {
        const v = raw.durations && raw.durations[e.id];
        if (Number.isFinite(v) && v > 0) durations[e.id] = v;
      });
      return {
        ...base,
        sound: raw.sound !== false,
        animations: typeof raw.animations === 'boolean' ? raw.animations : base.animations,
        crt: raw.crt !== false,
        notify: raw.notify === true,
        eggId: EGG_TYPES.some(e => e.id === raw.eggId) ? raw.eggId : base.eggId,
        durations,
      };
    }
  } catch (e) { /* stockage indisponible : valeurs par défaut */ }
  return base;
}

export default function usePrefs() {
  const [prefs, setPrefs] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* ignoré */ }
  }, [prefs]);
  const update = useCallback(patch => setPrefs(p => ({ ...p, ...patch })), []);
  return [prefs, update];
}
