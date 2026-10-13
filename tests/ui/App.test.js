import React from 'react';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { playChime, unlockAudio } from '../../src/lib/audio';

// Canvas et audio : hors sujet pour ces tests (jsdom n'a pas de canvas, ni de Web Audio).
jest.mock('../../src/components/Particles', () => () => null);
jest.mock('../../src/lib/audio', () => ({ playChime: jest.fn(), unlockAudio: jest.fn(), playClick: jest.fn() }));

const KEY = 'eggtimer.dreamcore.v1';
const setup = () => {
  const user = userEvent.setup({ advanceTimers: ms => jest.advanceTimersByTime(ms) });
  const utils = render(<App />);
  return { user, ...utils };
};
const time = () => document.querySelector('.lcd-time').textContent;
const status = () => document.querySelector('.lcd-status').textContent;
const advance = ms => act(() => { jest.advanceTimersByTime(ms); });
const card = id => document.querySelector(`.egg-card[data-egg="${id}"]`);
const stored = () => JSON.parse(localStorage.getItem(KEY));

let notifications;
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  localStorage.clear();
  playChime.mockClear(); unlockAudio.mockClear();
  notifications = [];
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
  window.Notification = jest.fn(function (title, opts) { notifications.push({ title, opts }); });
  window.Notification.permission = 'default';
  window.Notification.requestPermission = jest.fn(() => { window.Notification.permission = 'granted'; return Promise.resolve('granted'); });
});
afterEach(() => { jest.useRealTimers(); });

describe('sélection et minuteur', () => {
  test('7 types d’œufs avec leurs durées préréglées', () => {
    setup();
    const exp = { coque: '03:00', mollet: '05:00', poche: '06:00', brouille: '04:00', vapeur: '07:00', dur: '09:00', parfait: '10:00' };
    expect(document.querySelectorAll('.egg-card')).toHaveLength(7);
    Object.entries(exp).forEach(([id, t]) => expect(card(id).querySelector('.card-time')).toHaveTextContent(t));
  });

  test('démarrer, pause, reprendre, réinitialiser', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(10000);
    expect(time()).toBe('02:50');
    await user.click(screen.getByRole('button', { name: /Pause/ }));
    advance(5000);
    expect(time()).toBe('02:50');
    await user.click(screen.getByRole('button', { name: /Reprendre/ }));
    advance(5000);
    expect(time()).toBe('02:45');
    await user.click(screen.getByRole('button', { name: /Réinitialiser/ }));
    expect(time()).toBe('03:00');
    expect(status()).toBe('PRÊT');
  });
});

describe('changement d’œuf pendant une cuisson', () => {
  test('confirmation obligatoire, annuler conserve la cuisson', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(30000);
    await user.click(card('dur'));
    const dlg = screen.getByRole('alertdialog');
    expect(dlg).toBeInTheDocument();
    expect(card('coque')).toHaveAttribute('aria-pressed', 'true');
    expect(time()).toBe('02:30');
    await user.click(within(dlg).getByRole('button', { name: /Continuer la cuisson/ }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(status()).toBe('EN COURS');
    advance(1000);
    expect(time()).toBe('02:29');
  });

  test('Échap équivaut à annuler, et le focus revient sur la carte cliquée', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    const dur = card('dur');
    await user.click(dur);
    // le minuteur continue de rafraîchir l'application pendant que la confirmation est ouverte
    advance(3000);
    expect(within(screen.getByRole('alertdialog')).getByRole('button', { name: /Continuer/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(status()).toBe('EN COURS');
    expect(dur).toHaveFocus();
  });

  test('la confirmation garde le focus choisi au clavier pendant que le minuteur tourne', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    await user.click(card('dur'));
    await user.tab();
    const second = document.activeElement;
    expect(second).toHaveTextContent(/Arrêter et changer/);
    advance(4000);
    expect(document.activeElement).toBe(second);
    await user.tab();
    expect(within(screen.getByRole('alertdialog')).getByRole('button', { name: /Continuer/ })).toHaveFocus();
  });

  test('confirmer arrête la cuisson et charge le nouvel œuf', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(20000);
    await user.click(card('mollet'));
    await user.click(screen.getByRole('button', { name: /Arrêter et changer/ }));
    expect(card('mollet')).toHaveAttribute('aria-pressed', 'true');
    expect(time()).toBe('05:00');
    expect(status()).toBe('PRÊT');
    expect(stored().eggId).toBe('mollet');
  });

  test('hors cuisson, le changement est immédiat (sans confirmation)', async () => {
    const { user } = setup();
    await user.click(card('poche'));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(time()).toBe('06:00');
  });
});

describe('durées personnalisées et préréglages', () => {
  const setDuration = async (user, min, sec) => {
    const m = screen.getByLabelText('Minutes'), s = screen.getByLabelText('Secondes');
    await user.clear(m); await user.type(m, String(min));
    await user.clear(s); await user.type(s, String(sec));
    await user.keyboard('{Enter}');
  };

  test('réglage manuel, marqueur « * » et persistance', async () => {
    const { user } = setup();
    await setDuration(user, 2, 30);
    expect(time()).toBe('02:30');
    expect(card('coque').querySelector('.card-time')).toHaveTextContent('02:30 *');
    expect(stored().durations.coque).toBe(150);
  });

  test('+30s / −30s et bouton Préréglage', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Ajouter 30 secondes' }));
    expect(time()).toBe('03:30');
    await user.click(screen.getByRole('button', { name: 'Retirer 30 secondes' }));
    await user.click(screen.getByRole('button', { name: 'Retirer 30 secondes' }));
    expect(time()).toBe('02:30');
    await user.click(screen.getByRole('button', { name: 'Préréglage' }));
    expect(time()).toBe('03:00');
    expect(stored().durations.coque).toBeUndefined();
    expect(card('coque').querySelector('.card-time')).not.toHaveTextContent('*');
  });

  test('la durée est verrouillée pendant une cuisson', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    expect(screen.getByLabelText('Minutes')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Ajouter 30 secondes' })).toBeDisabled();
  });

  test('une durée personnalisée est conservée au changement d’œuf et d’aller-retour', async () => {
    const { user } = setup();
    await setDuration(user, 1, 0);
    await user.click(card('dur'));
    expect(time()).toBe('09:00');
    await user.click(card('coque'));
    expect(time()).toBe('01:00');
  });

  test('« Rétablir les durées » dans les réglages remet tous les préréglages', async () => {
    const { user } = setup();
    await setDuration(user, 1, 0);
    await user.click(card('dur'));
    await setDuration(user, 8, 0);
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    const reset = screen.getByRole('button', { name: /Rétablir les durées/ });
    expect(reset).toBeEnabled();
    await user.click(reset);
    expect(stored().durations).toEqual({});
    expect(time()).toBe('09:00');
    expect(card('coque').querySelector('.card-time')).toHaveTextContent('03:00');
    expect(screen.getByRole('button', { name: /Rétablir les durées/ })).toBeDisabled();
  });
});

describe('modale des réglages', () => {
  test('ouverture, focus, Échap et retour du focus sur le bouton Réglages', async () => {
    const { user } = setup();
    const opener = screen.getByRole('button', { name: /Réglages/ });
    await user.click(opener);
    const dlg = screen.getByRole('dialog');
    expect(dlg).toBeInTheDocument();
    expect(dlg).toContainElement(document.activeElement);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  test('le focus reste stable pendant que le minuteur tourne derrière la modale', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    await user.tab();
    const focused = document.activeElement;
    advance(5000); // ~25 rafraîchissements de l'application
    expect(document.activeElement).toBe(focused);
    expect(screen.getByRole('dialog')).toContainElement(focused);
  });

  test('Fermer ferme la fenêtre ; Tab reste piégé à l’intérieur', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    const dlg = screen.getByRole('dialog');
    for (let i = 0; i < 12; i++) { await user.tab(); expect(dlg).toContainElement(document.activeElement); }
    for (let i = 0; i < 12; i++) { await user.tab({ shift: true }); expect(dlg).toContainElement(document.activeElement); }
    await user.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('fin de cuisson', () => {
  const finish = async user => {
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(180000 + 500);
  };

  test('panneau de fin, son, statut, et une seule notification', async () => {
    const { user } = setup();
    await finish(user);
    expect(status()).toBe('TERMINÉ');
    expect(time()).toBe('00:00');
    expect(screen.getByRole('dialog')).toHaveTextContent(/c’est prêt/);
    expect(playChime).toHaveBeenCalledTimes(1);
    advance(10000);
    expect(playChime).toHaveBeenCalledTimes(1);
  });

  test('le focus reste dans le panneau de fin malgré les rafraîchissements, Échap = choisir un autre œuf', async () => {
    const { user } = setup();
    await finish(user);
    const dlg = screen.getByRole('dialog');
    const focused = document.activeElement;
    expect(dlg).toContainElement(focused);
    advance(3000);
    expect(document.activeElement).toBe(focused);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(status()).toBe('PRÊT');
    expect(time()).toBe('03:00');
    advance(0);
    expect(card('coque')).toHaveFocus();
  });

  test('« Recommencer » relance une cuisson complète', async () => {
    const { user } = setup();
    await finish(user);
    await user.click(screen.getByRole('button', { name: /Recommencer/ }));
    expect(status()).toBe('EN COURS');
    advance(2000);
    expect(time()).toBe('02:58');
  });

  test('son désactivé : aucun carillon', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    await user.click(screen.getByLabelText(/Son de fin/));
    await user.click(screen.getByRole('button', { name: 'Fermer' }));
    await finish(user);
    expect(status()).toBe('TERMINÉ');
    expect(playChime).not.toHaveBeenCalled();
  });
});

describe('préférences persistantes', () => {
  test('les réglages sont enregistrés puis restaurés après rechargement', async () => {
    const first = setup();
    await first.user.click(card('dur'));
    await first.user.click(screen.getByRole('button', { name: /Réglages/ }));
    await first.user.click(screen.getByLabelText(/Animations/));
    await first.user.click(screen.getByLabelText(/Effet CRT/));
    await first.user.click(screen.getByLabelText(/Son de fin/));
    await first.user.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(stored()).toMatchObject({ eggId: 'dur', animations: false, crt: false, sound: false });
    first.unmount();

    setup();
    expect(card('dur')).toHaveAttribute('aria-pressed', 'true');
    expect(time()).toBe('09:00');
    const app = document.querySelector('.app');
    expect(app).toHaveAttribute('data-anim', 'off');
    expect(app).toHaveAttribute('data-crt', 'off');
  });

  test('valeurs corrompues ou inconnues : retour aux valeurs par défaut', () => {
    localStorage.setItem(KEY, JSON.stringify({ eggId: 'inconnu', durations: { coque: -5, dur: 'x', mollet: 120 }, sound: 'oui' }));
    setup();
    expect(card('coque')).toHaveAttribute('aria-pressed', 'true');
    expect(card('coque').querySelector('.card-time')).toHaveTextContent('03:00');
    expect(card('mollet').querySelector('.card-time')).toHaveTextContent('02:00 *');
    localStorage.setItem(KEY, '{pas du json');
    document.body.innerHTML = '';
    expect(() => render(<App />)).not.toThrow();
  });

  test('la préférence système « réduire les animations » désactive les animations par défaut', () => {
    window.matchMedia = jest.fn(q => ({ matches: /reduce/.test(q), addListener() {}, removeListener() {} }));
    setup();
    expect(document.querySelector('.app')).toHaveAttribute('data-anim', 'off');
  });
});

describe('notifications du système', () => {
  const enable = async user => {
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    await user.click(screen.getByLabelText(/Notification du système/));
    await user.click(screen.getByRole('button', { name: 'Fermer' }));
  };

  test('aucune demande d’autorisation tant que l’utilisateur ne l’active pas', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(181000);
    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
    expect(notifications).toHaveLength(0);
  });

  test('activée : l’autorisation est demandée, une notification part à la fin', async () => {
    const { user } = setup();
    await enable(user);
    expect(window.Notification.requestPermission).toHaveBeenCalledTimes(1);
    expect(stored().notify).toBe(true);
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(181000);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].opts.body).toMatch(/À la coque|Œuf à la coque/i);
  });

  test('autorisation refusée : réglage non activé et message affiché', async () => {
    window.Notification.requestPermission = jest.fn(() => Promise.resolve('denied'));
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    await user.click(screen.getByLabelText(/Notification du système/));
    expect(await screen.findByText(/Autorisation refusée/)).toBeInTheDocument();
    expect(stored().notify).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Fermer' }));
    await user.click(screen.getByRole('button', { name: /Démarrer/ }));
    advance(181000);
    expect(notifications).toHaveLength(0);
  });

  test('navigateur sans API Notification : message, pas d’erreur', async () => {
    delete window.Notification;
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Réglages/ }));
    await user.click(screen.getByLabelText(/Notification du système/));
    expect(await screen.findByText(/ne gère pas les notifications/)).toBeInTheDocument();
  });
});
