import React from 'react';
import EggSprite from './EggSprite';
import { EGG_TYPES } from '../data/eggTypes';
import { formatMs } from '../lib/timerCore';

// Grille des sept œufs : sélection = bordure lavande + halo + pastille « ACTIF ».
const EggGrid = React.forwardRef(function EggGrid({ selectedId, spriteState, durations, onSelect }, ref) {
  return (
    <section className="win grid-win" aria-labelledby="grid-title">
      <header className="win-bar"><h2 id="grid-title">COLLECTION_ŒUFS</h2><span className="win-dots" aria-hidden="true"><i /><i /><i /></span></header>
      <div className="egg-grid" role="group" aria-label="Choisir un type d’œuf" ref={ref}>
        {EGG_TYPES.map(e => {
          const sel = e.id === selectedId;
          const secs = durations[e.id] || e.defaultSeconds;
          return (
            <button
              key={e.id}
              type="button"
              className={`egg-card${sel ? ' is-selected' : ''}`}
              aria-pressed={sel}
              data-egg={e.id}
              style={{ '--accent': e.accent }}
              onClick={() => onSelect(e.id)}
            >
              <span className="card-tag">{sel ? '◆ ACTIF' : ' '}</span>
              <EggSprite egg={e.id} state={sel ? spriteState : 'idle'} className="card-sprite" />
              <span className="card-name">{e.name}</span>
              <span className="card-time">{formatMs(secs * 1000)}{durations[e.id] ? ' *' : ''}</span>
              <span className="card-desc">{e.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default EggGrid;
