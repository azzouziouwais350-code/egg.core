import React, { useEffect, useState } from 'react';
import { MIN_SECONDS, MAX_SECONDS } from '../data/eggTypes';

const clamp = n => Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, n));

// Réglage manuel minutes + secondes. Désactivé pendant une cuisson (on ne modifie
// jamais silencieusement un minuteur actif).
export default function DurationEditor({ seconds, defaultSeconds, locked, onChange }) {
  const [min, setMin] = useState(String(Math.floor(seconds / 60)));
  const [sec, setSec] = useState(String(seconds % 60).padStart(2, '0'));
  useEffect(() => {
    setMin(String(Math.floor(seconds / 60)));
    setSec(String(seconds % 60).padStart(2, '0'));
  }, [seconds]);

  const draftTotal = () => clamp((parseInt(min, 10) || 0) * 60 + (parseInt(sec, 10) || 0));
  const commit = () => {
    const total = draftTotal();
    onChange(total);
    setMin(String(Math.floor(total / 60)));
    setSec(String(total % 60).padStart(2, '0'));
  };
  const onKey = e => { if (e.key === 'Enter') commit(); };
  const step = d => onChange(clamp(draftTotal() + d));
  const digits = setter => e => setter(e.target.value.replace(/\D/g, '').slice(0, 2));

  return (
    <fieldset className="duration" disabled={locked} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) commit(); }}>
      <legend>Durée</legend>
      <button type="button" className="btn btn-sq" onClick={() => step(-30)} aria-label="Retirer 30 secondes">−30s</button>
      <label className="field">
        <span className="sr-only">Minutes</span>
        <input inputMode="numeric" value={min} onChange={digits(setMin)} onKeyDown={onKey} aria-label="Minutes" />
        <b>min</b>
      </label>
      <label className="field">
        <span className="sr-only">Secondes</span>
        <input inputMode="numeric" value={sec} onChange={digits(setSec)} onKeyDown={onKey} aria-label="Secondes" />
        <b>s</b>
      </label>
      <button type="button" className="btn btn-sq" onClick={() => step(30)} aria-label="Ajouter 30 secondes">+30s</button>
      <button type="button" className="btn btn-sq btn-wide" onClick={() => onChange(defaultSeconds)} disabled={seconds === defaultSeconds}>
        Préréglage
      </button>
      {locked && <p className="hint">Réglage disponible à l’arrêt : réinitialise pour modifier.</p>}
    </fieldset>
  );
}
