import React from 'react';
import EggSprite from './EggSprite';
import { formatMs, formatSpoken, progressOf } from '../lib/timerCore';

const STATUS_LABEL = { idle: 'PRÊT', running: 'EN COURS', paused: 'EN PAUSE', done: 'TERMINÉ' };
const SEGMENTS = 60;

// Minuteur circulaire : anneau segmenté (progression = temps réellement écoulé),
// reflets chromés Y2K, sprite de l'œuf au centre, affichage LCD monospace.
const TimerDial = React.forwardRef(function TimerDial({ egg, timer, phase }, ref) {
  const p = progressOf(timer);
  const dash = 100 / SEGMENTS;
  return (
    <section className={`dial phase-${phase} status-${timer.status}`} ref={ref} aria-label="Minuteur">
      <div className="dial-chrome" aria-hidden="true" />
      <svg className="dial-ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00E5FF" />
            <stop offset="0.55" stopColor="#B9A0FF" />
            <stop offset="1" stopColor="#FF6EC7" />
          </linearGradient>
          <mask id="segMask">
            <circle cx="100" cy="100" r="86" fill="none" stroke="#fff" strokeWidth="11" pathLength="100"
              strokeDasharray={`${dash * 0.72} ${dash * 0.28}`} transform="rotate(-90 100 100)" />
          </mask>
        </defs>
        <g mask="url(#segMask)">
          <circle cx="100" cy="100" r="86" fill="none" stroke="#2A2145" strokeWidth="12" />
          <circle className="ring-progress" cx="100" cy="100" r="86" fill="none" stroke="url(#ringGrad)"
            strokeWidth="12" pathLength="100" strokeDasharray={`${(p * 100).toFixed(3)} 100`}
            transform="rotate(-90 100 100)" />
        </g>
        <circle cx="100" cy="100" r="76" fill="none" stroke="#B9A0FF" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
      </svg>
      <div className="dial-core">
        <EggSprite egg={egg.id} state={phase} className="dial-egg" />
      </div>
      <div className="lcd">
        <div className="lcd-top">
          <span className="lcd-egg">{egg.short}</span>
          <span className={`lcd-status s-${timer.status}`}>{STATUS_LABEL[timer.status]}</span>
        </div>
        <div className="lcd-time" role="timer" aria-label={`Temps restant : ${formatSpoken(timer.remainingMs)}`}>
          {formatMs(timer.remainingMs)}
        </div>
        <div className="lcd-bottom">
          <span>INIT {formatMs(timer.durationMs)}</span>
          <span>{Math.round(p * 100)}%</span>
        </div>
        <div className="bar" aria-hidden="true"><i style={{ width: `${(p * 100).toFixed(1)}%` }} /></div>
      </div>
    </section>
  );
});

export default TimerDial;
