import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProspectFormModal } from './ProspectFormModal';

describe('ProspectFormModal', () => {
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

  it('validates required name before saving', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <ProspectFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialProspect={null}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(alertSpy).toHaveBeenCalledWith('Nome é obrigatório.');
  });

  it('clamps follow-up days and saves normalized contact fallback', () => {
    const onSave = vi.fn();

    render(
      <ProspectFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        initialProspect={null}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Prospect Novo' } });
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11988887777' } });
    fireEvent.change(screen.getByLabelText('Dias de radar'), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Prospect Novo',
      followUpDays: 90,
      contact: '(11) 98888-7777',
    });
  });
});
