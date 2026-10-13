import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ title, children, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <Modal title={title} titleId="confirm-title" role="alertdialog" onClose={onCancel}>
      <p className="modal-text">{children}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-primary" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="btn btn-ghost" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
