import React, { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../src/components/Modal';

// Parent qui se re-rend en permanence (comme App avec le minuteur) et qui recrée
// une nouvelle fonction onClose à chaque rendu.
function Harness({ onCloseSpy }) {
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);
  Harness.tick = () => setTick(t => t + 1);
  return (
    <div>
      <button onClick={() => setOpen(true)}>ouvrir</button>
      {open && (
        <Modal title="TEST" titleId="t" onClose={() => { onCloseSpy(); setOpen(false); }}>
          <button>un</button>
          <button>deux</button>
          <button>trois</button>
        </Modal>
      )}
    </div>
  );
}

describe('Modal', () => {
  test('le focus ne bouge pas quand le parent se re-rend avec un nouvel onClose', async () => {
    const user = userEvent.setup();
    render(<Harness onCloseSpy={jest.fn()} />);
    await user.click(screen.getByText('ouvrir'));
    expect(screen.getByText('un')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('deux')).toHaveFocus();
    for (let i = 0; i < 5; i++) act(() => Harness.tick());
    expect(screen.getByText('deux')).toHaveFocus();
  });

  test('les gestionnaires clavier ne sont installés qu’une fois, malgré les re-rendus', async () => {
    const user = userEvent.setup();
    const add = jest.spyOn(document, 'addEventListener');
    const remove = jest.spyOn(document, 'removeEventListener');
    render(<Harness onCloseSpy={jest.fn()} />);
    await user.click(screen.getByText('ouvrir'));
    const keydownAdds = () => add.mock.calls.filter(c => c[0] === 'keydown').length;
    const before = keydownAdds();
    for (let i = 0; i < 10; i++) act(() => Harness.tick());
    expect(keydownAdds()).toBe(before);
    expect(remove.mock.calls.filter(c => c[0] === 'keydown').length).toBe(0);
    add.mockRestore(); remove.mockRestore();
  });

  test('Échap appelle la dernière fonction onClose et rend le focus au bouton d’ouverture', async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    render(<Harness onCloseSpy={spy} />);
    const opener = screen.getByText('ouvrir');
    await user.click(opener);
    for (let i = 0; i < 3; i++) act(() => Harness.tick());
    await user.keyboard('{Escape}');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  test('Tab / Maj+Tab bouclent dans la fenêtre', async () => {
    const user = userEvent.setup();
    render(<Harness onCloseSpy={jest.fn()} />);
    await user.click(screen.getByText('ouvrir'));
    await user.tab(); await user.tab();
    expect(screen.getByText('trois')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('un')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByText('trois')).toHaveFocus();
  });

  test('un clic sur le fond ferme, un clic dans la fenêtre non', async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    render(<Harness onCloseSpy={spy} />);
    await user.click(screen.getByText('ouvrir'));
    await user.click(screen.getByText('un'));
    expect(spy).not.toHaveBeenCalled();
    await user.click(document.querySelector('.modal-back'));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
