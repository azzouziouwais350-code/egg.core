import React, { useMemo } from 'react';
import { SCENES, STARS } from '../scenes/scenes';
import { sceneryUrl } from '../assets';

// Décor Dreamcore en arrière-plan : ciel dégradé, étoiles, lune, architecture
// lointaine, plateformes, nuages à plusieurs profondeurs. Purement décoratif.
// La progression (--p) éclaire peu à peu le portail / l'horizon.
function Landscape({ scene, phase, progress }) {
  const def = SCENES[scene] || SCENES['moon-clouds'];
  const style = {
    '--sky-top': def.sky[0], '--sky-mid': def.sky[1], '--sky-low': def.sky[2],
    '--horizon': def.horizon,
    '--p': progress.toFixed(2),
  };
  const items = useMemo(() => def.items.map((it, i) => (
    <img
      key={scene + i}
      src={sceneryUrl(it.a)}
      alt=""
      draggable="false"
      className={`sc sc-z${it.z} anim-${it.anim}${it.flip ? ' flip' : ''}`}
      style={{ left: `${it.x}%`, top: `${it.y}%`, width: `calc(var(--u) * ${it.w * it.s})`, animationDelay: `${-(i * 3.1)}s` }}
    />
  )), [def, scene]);

  return (
    <div className={`landscape phase-${phase}`} style={style} aria-hidden="true" data-scene={scene}>
      <div className="sky" />
      <div className="stars">
        {STARS.map((s, i) => (
          <i key={i} className={`star t${s.tone}${s.big ? ' big' : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />
        ))}
      </div>
      <div className="horizon-glow" />
      {items}
      <div className="mist" />
    </div>
  );
}

export default React.memo(Landscape);
