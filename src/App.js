import React, { useCallback, useEffect, useRef, useState } from 'react';
import Landscape from './components/Landscape';
import Particles from './components/Particles';
import TimerDial from './components/TimerDial';
import Controls from './components/Controls';
import DurationEditor from './components/DurationEditor';
import EggGrid from './components/EggGrid';
import SettingsPanel from './components/SettingsPanel';
import ConfirmDialog from './components/ConfirmDialog';
import DonePanel from './components/DonePanel';
import EggSprite from './components/EggSprite';
import useCountdown from './hooks/useCountdown';
import usePrefs from './hooks/usePrefs';
import { EGG_BY_ID } from './data/eggTypes';
import { formatMs, formatSpoken, phaseOf, progressOf } from './lib/timerCore';
import { playChime, unlockAudio } from './lib/audio';

const STATUS_CHIP = { idle: 'PRÊT', running: 'EN COURS', paused: 'EN PAUSE', done: 'TERMINÉ' };

export default function App() {
  const [prefs, update] = usePrefs();
  const egg = EGG_BY_ID[prefs.eggId];
  const seconds = prefs.durations[egg.id] || egg.defaultSeconds;

  const [showSettings, setShowSettings] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [pendingEgg, setPendingEgg] = useState(null);
  const [burstKey, setBurstKey] = useState(0);
  const [notifyError, setNotifyError] = useState('');
  const [announce, setAnnounce] = useState('');
  const dialRef = useRef(null);
  const gridRef = useRef(null);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const eggRef = useRef(egg);
  eggRef.current = egg;

  const handleDone = useCallback(() => {
    const p = prefsRef.current;
    const e = eggRef.current;
    if (p.sound) playChime();
    setBurstKey(k => k + 1);
    setShowDone(true);
    if (p.notify && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('EggTimer — Dreamcore Pixel Fusion', { body: `${e.name} : c’est prêt !` }); } catch (err) { /* ignoré */ }
    }
  }, []);

  const cd = useCountdown(seconds * 1000, handleDone);
  const { timer } = cd;
  const phase = phaseOf(timer, true);
  const progress = progressOf(timer);
  const active = timer.status === 'running' || timer.status === 'paused';

  // Titre d'onglet : temps restant visible même en arrière-plan.
  useEffect(() => {
    if (timer.status === 'running' || timer.status === 'paused') document.title = `${formatMs(timer.remainingMs)} · ${egg.short} — EggTimer`;
    else if (timer.status === 'done') document.title = '✔ Prêt ! — EggTimer';
    else document.title = 'EggTimer — Dreamcore Pixel Fusion';
  }, [timer.status, timer.remainingMs, egg.short]);

  // Annonces pour lecteurs d'écran (changements d'état uniquement).
  useEffect(() => {
    const map = {
      running: `Cuisson démarrée : ${egg.name}, ${formatSpoken(timer.remainingMs)} restantes.`,
      paused: `Minuteur en pause à ${formatSpoken(timer.remainingMs)}.`,
      done: `${egg.name} : cuisson terminée.`,
      idle: '',
    };
    setAnnounce(map[timer.status]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.status, egg.id]);

  const applyEgg = id => {
    const e = EGG_BY_ID[id];
    update({ eggId: id });
    cd.reset((prefs.durations[id] || e.defaultSeconds) * 1000);
    setShowDone(false);
  };
  const selectEgg = id => {
    if (id === egg.id) return;
    if (active) { setPendingEgg(id); return; } // jamais de changement silencieux
    applyEgg(id);
  };

  const onStart = () => { unlockAudio(); setShowDone(false); cd.start(); };
  const onReset = () => { cd.reset(seconds * 1000); setShowDone(false); };
  const onRestart = () => { unlockAudio(); setShowDone(false); cd.reset(seconds * 1000); cd.start(); };
  const onChoose = () => {
    setShowDone(false);
    cd.reset(seconds * 1000);
    setTimeout(() => { const b = gridRef.current && gridRef.current.querySelector('.is-selected'); if (b) b.focus(); }, 0);
  };

  const onDuration = secs => {
    const durations = { ...prefs.durations };
    if (secs === egg.defaultSeconds) delete durations[egg.id]; else durations[egg.id] = secs;
    update({ durations });
    cd.setDuration(secs * 1000);
  };

  const toggleNotify = patch => {
    setNotifyError('');
    if (patch.notify) {
      if (!('Notification' in window)) { setNotifyError('Ce navigateur ne gère pas les notifications système.'); return; }
      Notification.requestPermission().then(r => {
        if (r === 'granted') update({ notify: true });
        else setNotifyError('Autorisation refusée : la notification dans la page reste active.');
      });
      return;
    }
    update(patch);
  };
  const updatePrefs = patch => ('notify' in patch ? toggleNotify(patch) : update(patch));

  const canReset = timer.status !== 'idle' || timer.remainingMs !== timer.durationMs;
  const spriteState = phase === 'idle' ? 'selected' : phase;

  return (
    <div className={`app phase-${phase}`} data-anim={prefs.animations ? 'on' : 'off'} data-crt={prefs.crt ? 'on' : 'off'}>
      <Landscape scene={egg.scene} phase={phase} progress={progress} />
      <Particles kind={egg.particles} phase={phase} enabled={prefs.animations} burstKey={burstKey} anchorRef={dialRef} />
      <div className="crt" aria-hidden="true" />

      <header className="top">
        <div className="brand">
          <EggSprite egg="coque" state="selected" className="brand-egg" />
          <div>
            <h1 className="logo">Egg<span>Timer</span></h1>
            <p className="subtitle">Un peu de patience, beaucoup de rêves.</p>
          </div>
        </div>
        <div className="top-right">
          <span className={`chip s-${timer.status}`}><i aria-hidden="true" />{STATUS_CHIP[timer.status]}</span>
          <button type="button" className="btn btn-sq" onClick={() => setShowSettings(true)} aria-haspopup="dialog">⚙ Réglages</button>
        </div>
      </header>

      <main className="main">
        <section className="stage">
          <TimerDial ref={dialRef} egg={egg} timer={timer} phase={phase === 'idle' ? 'selected' : phase} />
          <Controls status={timer.status} canReset={canReset} onStart={onStart} onPause={cd.pause} onResume={cd.start} onReset={onReset} />
          <div className="win cfg-win">
            <header className="win-bar"><h2>CONFIG_DURÉE</h2><span className="win-dots" aria-hidden="true"><i /><i /><i /></span></header>
            <DurationEditor seconds={seconds} defaultSeconds={egg.defaultSeconds} locked={active} onChange={onDuration} />
          </div>
        </section>
        <EggGrid ref={gridRef} selectedId={egg.id} spriteState={spriteState} durations={prefs.durations} onSelect={selectEgg} />
        <p className="foot-note">Durées indicatives : elles varient selon la taille de l’œuf, sa température de départ et la méthode. * = durée personnalisée.</p>
      </main>

      <div className="sr-only" role="status" aria-live="polite">{announce}</div>

      {showSettings && (
        <SettingsPanel
          prefs={prefs}
          update={updatePrefs}
          notifyError={notifyError}
          onResetDurations={() => { update({ durations: {} }); if (!active) cd.setDuration(egg.defaultSeconds * 1000); }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {pendingEgg && (
        <ConfirmDialog
          title="CHANGER_D’ŒUF ?"
          confirmLabel="Arrêter et changer"
          cancelLabel="Continuer la cuisson"
          onCancel={() => setPendingEgg(null)}
          onConfirm={() => { const id = pendingEgg; setPendingEgg(null); applyEgg(id); }}
        >
          Une cuisson est en cours ({egg.name}, {formatMs(timer.remainingMs)} restantes). Changer d’œuf l’arrêtera.
        </ConfirmDialog>
      )}
      {showDone && timer.status === 'done' && <DonePanel egg={egg} onRestart={onRestart} onChoose={onChoose} />}
    </div>
  );
}
