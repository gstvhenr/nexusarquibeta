import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NewSnapshotModal } from './NewSnapshotModal';

describe('NewSnapshotModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    vi.restoreAllMocks();
  });

  it('does not render when closed', () => {
    render(<NewSnapshotModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.queryByText('Novo Registro — Instagram')).not.toBeInTheDocument();
  });

  it('saves snapshot with typed values and closes modal', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    render(<NewSnapshotModal isOpen={true} onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByPlaceholderText('Ex: 118'), { target: { value: '120' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: 6859'), { target: { value: '7000' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: 946'), { target: { value: '910' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar registro' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'snap_1700000000000',
        posts: 120,
        followers: 7000,
        following: 910,
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
