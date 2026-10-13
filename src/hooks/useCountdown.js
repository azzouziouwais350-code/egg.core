import { useCallback, useEffect, useReducer, useRef } from 'react';
import { createTimer, start, pause, reset, setDuration, tick } from '../lib/timerCore';

// Hook React autour de timerCore. Une seule minuterie (un seul intervalle) existe à
// la fois, l'affichage est rafraîchi à intervalle régulier mais le temps restant est
// toujours recalculé depuis l'horloge (Date.now) : indépendant des animations et
// exact au retour d'un onglet en arrière-plan.

const TICK_MS = 200;

function reducer(timer, action) {
  const now = Date.now();
  switch (action.type) {
    case 'start': return start(timer, now);
    case 'pause': return pause(timer, now);
    case 'reset': return reset(timer, action.durationMs);
    case 'setDuration': return setDuration(timer, action.durationMs);
    case 'tick': return tick(timer, now);
    default: return timer;
  }
}

export default function useCountdown(initialMs, onDone) {
  const [timer, dispatch] = useReducer(reducer, initialMs, createTimer);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const doneFired = useRef(false);

  // Intervalle actif seulement pendant l'exécution ; nettoyé à la pause / fin / démontage.
  const running = timer.status === 'running';
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick' }), TICK_MS);
    const onVisible = () => { if (!document.hidden) dispatch({ type: 'tick' }); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    window.addEventListener('pageshow', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('pageshow', onVisible);
    };
  }, [running]);

  // Notification de fin : une seule fois par cuisson.
  useEffect(() => {
    if (timer.status === 'done' && !doneFired.current) {
      doneFired.current = true;
      if (onDoneRef.current) onDoneRef.current();
    }
    if (timer.status !== 'done') doneFired.current = false;
  }, [timer.status]);

  return {
    timer,
    start: useCallback(() => dispatch({ type: 'start' }), []),
    pause: useCallback(() => dispatch({ type: 'pause' }), []),
    reset: useCallback(durationMs => dispatch({ type: 'reset', durationMs }), []),
    setDuration: useCallback(durationMs => dispatch({ type: 'setDuration', durationMs }), []),
  };
}
