import React from 'react';

export default function Controls({ status, canReset, onStart, onPause, onResume, onReset }) {
  const idleLike = status === 'idle' || status === 'done';
  return (
    <div className="controls" role="group" aria-label="Commandes du minuteur">
      <button className="btn btn-primary" type="button" onClick={onStart} disabled={!idleLike}>
        <span className="ico">▶</span> Démarrer
      </button>
      {status === 'paused' ? (
        <button className="btn" type="button" onClick={onResume}>
          <span className="ico">⏵</span> Reprendre
        </button>
      ) : (
        <button className="btn" type="button" onClick={onPause} disabled={status !== 'running'}>
          <span className="ico">⏸</span> Pause
        </button>
      )}
      <button className="btn btn-ghost" type="button" onClick={onReset} disabled={!canReset}>
        <span className="ico">↺</span> Réinitialiser
      </button>
    </div>
  );
}
