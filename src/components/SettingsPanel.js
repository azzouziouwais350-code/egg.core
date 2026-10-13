import React from 'react';
import Modal from './Modal';
import { playChime, unlockAudio } from '../lib/audio';

function Toggle({ id, label, hint, checked, onChange }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true"><i /></span>
      <span className="toggle-text"><b>{label}</b><small>{hint}</small></span>
    </label>
  );
}

export default function SettingsPanel({ prefs, update, onClose, onResetDurations, notifyError }) {
  const hasCustom = Object.keys(prefs.durations).length > 0;
  return (
    <Modal title="RÉGLAGES.CFG" titleId="settings-title" onClose={onClose}>
      <Toggle id="set-sound" label="Son de fin" hint="Petit carillon quand la cuisson est terminée." checked={prefs.sound} onChange={v => { if (v) unlockAudio(); update({ sound: v }); }} />
      <Toggle id="set-anim" label="Animations" hint="Nuages, particules, halos. Désactivé = décor fixe, infos conservées." checked={prefs.animations} onChange={v => update({ animations: v })} />
      <Toggle id="set-crt" label="Effet CRT discret" hint="Fines lignes d’écran rétro." checked={prefs.crt} onChange={v => update({ crt: v })} />
      <Toggle id="set-notify" label="Notification du système" hint="Demande l’autorisation du navigateur seulement quand tu l’actives." checked={prefs.notify} onChange={v => update({ notify: v })} />
      {notifyError && <p className="hint warn" role="status">{notifyError}</p>}
      <div className="modal-actions">
        <button type="button" className="btn" onClick={() => { unlockAudio(); playChime(); }}>♪ Tester le son</button>
        <button type="button" className="btn btn-ghost" onClick={onResetDurations} disabled={!hasCustom}>Rétablir les durées</button>
        <button type="button" className="btn btn-primary" onClick={onClose}>Fermer</button>
      </div>
    </Modal>
  );
}
