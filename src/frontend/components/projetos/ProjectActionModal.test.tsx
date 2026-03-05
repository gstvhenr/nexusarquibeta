import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectActionModal } from './ProjectActionModal';

function setupModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

describe('ProjectActionModal', () => {
  beforeEach(() => {
    setupModalRoot();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
    vi.restoreAllMocks();
  });

  it('does not render when closed', () => {
    render(
      <ProjectActionModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        projectName="Projeto Teste"
        actionType="delete"
      />,
    );

    expect(screen.queryByText('Excluir Projeto')).not.toBeInTheDocument();
  });

  it('validates refund before confirming', () => {
    const onConfirm = vi.fn();
    render(
      <ProjectActionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        projectName="Projeto Teste"
        actionType="inactivate"
      />,
    );

    fireEvent.click(screen.getByLabelText('Existe valor de reembolso'));
    fireEvent.click(screen.getByRole('button', { name: 'Inativar' }));

    expect(window.alert).toHaveBeenCalledWith('Informe um valor de reembolso válido.');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms with refund data when valid', () => {
    const onConfirm = vi.fn();

    render(
      <ProjectActionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        projectName="Projeto Teste"
        actionType="finalize"
      />,
    );

    fireEvent.click(screen.getByLabelText('Existe valor de reembolso'));
    fireEvent.change(screen.getByLabelText('Valor do reembolso'), { target: { value: '150.5' } });
    fireEvent.change(screen.getByLabelText('Data do reembolso'), { target: { value: '2026-06-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }));

    expect(onConfirm).toHaveBeenCalledWith(150.5, '2026-06-20');
  });
});
