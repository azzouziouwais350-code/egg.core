import React, { useEffect, useRef } from 'react';

// Boîte de dialogue accessible : focus piégé, Échap pour fermer, focus rendu à l'élément
// qui avait le focus à l'ouverture.
//
// App se re-rend plusieurs fois par seconde (minuteur) et recrée onClose à chaque rendu :
// on garde donc la dernière fonction dans une référence, et les gestionnaires clavier et
// le piège de focus ne sont installés qu'une seule fois, à l'ouverture (dépendances []).
export default function Modal({ title, titleId, role = 'dialog', onClose, children, className = '' }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.activeElement;
    const root = ref.current;
    if (!root) return undefined;
    // Inclut tous les contrôles clavier usuels et ignore les éléments désactivés
    // ou explicitement masqués de l'accessibilité.
    const focusables = () => Array.from(root.querySelectorAll(
      'a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, object, embed, audio[controls], video[controls], summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.getAttribute('aria-hidden') !== 'true' && el.tabIndex >= 0);
    const first = focusables()[0];
    if (first) first.focus();
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) { e.preventDefault(); root.focus(); return; }
      const a = f[0], z = f[f.length - 1];
      // Si le focus a quitté la modale, le prochain Tab le ramène à l'intérieur.
      if (!root.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); }
      else if (e.shiftKey && (document.activeElement === a || document.activeElement === root)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && prev.focus && document.contains(prev)) prev.focus();
    };
  }, []);
  return (
    <div className="modal-back" onMouseDown={e => { if (e.target === e.currentTarget) onCloseRef.current(); }}>
      <div className={`win modal ${className}`} role={role} aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <header className="win-bar"><h2 id={titleId}>{title}</h2><span className="win-dots" aria-hidden="true"><i /><i /><i /></span></header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
