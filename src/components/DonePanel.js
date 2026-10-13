import React from 'react';
import Modal from './Modal';
import EggSprite from './EggSprite';

// Écran de fin : animation propre au type d'œuf (classe fx-<id>) + message explicite.
export default function DonePanel({ egg, onRestart, onChoose }) {
  return (
    <Modal title="CUISSON_TERMINÉE.EXE" titleId="done-title" onClose={onChoose} className={`done-panel fx-${egg.id}`}>
      <div className="done-stage" aria-hidden="true">
        <i className="fx-ring r1" /><i className="fx-ring r2" /><i className="fx-ring r3" />
        <EggSprite egg={egg.id} state="done" className="done-egg" />
      </div>
      <p className="done-title">{egg.name} : c’est prêt !</p>
      <p className="modal-text" role="status">{egg.doneMessage}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-primary" onClick={onRestart}>↺ Recommencer</button>
        <button type="button" className="btn" onClick={onChoose}>Choisir un autre œuf</button>
      </div>
    </Modal>
  );
}
