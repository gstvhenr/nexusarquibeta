import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '@/types';
import { SaveProposalModal } from './SaveProposalModal';

const buildClient = (overrides: Partial<Client>): Client => ({
  id: 'client-default',
  name: 'Cliente Default',
  contacts: [],
  status: 'Cliente Ativo',
  serviceInterests: [],
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
  },
  isFavorite: false,
  registrationDate: '2026-01-01',
  lastContactDate: '2026-01-01',
  pipelineStatus: 'Contato Inicial',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
  ...overrides,
});

describe('SaveProposalModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
  });

  it('selects first eligible client and submits linked proposal', () => {
    const onSave = vi.fn();

    render(
      <SaveProposalModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        isSaving={false}
        clients={[
          buildClient({ id: 'archived', name: 'Arquivado', archived: true }),
          buildClient({ id: 'active-1', name: 'Cliente Elegível 1' }),
          buildClient({ id: 'active-2', name: 'Cliente Elegível 2', status: 'Potencial Cliente' }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ name: 'Cliente Elegível 1', id: 'active-1' });
  });

  it('requires manual name when saving without client link', () => {
    const onSave = vi.fn();

    render(
      <SaveProposalModal isOpen onClose={vi.fn()} onSave={onSave} isSaving={false} clients={[]} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));

    expect(screen.getByText('O nome do cliente é obrigatório.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('Ex: Cotação para Obra XYZ'), {
      target: { value: '  Proposta avulsa  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));

    expect(onSave).toHaveBeenCalledWith({ name: 'Proposta avulsa' });
  });

  it('handles switching to unlinked proposal and back', () => {
    const onSave = vi.fn();
    render(
      <SaveProposalModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        isSaving={false}
        clients={[buildClient({ id: 'client-1', name: 'Cliente 1' })]}
      />,
    );

    const checkbox = screen.getByLabelText('Salvar Proposta Sem Vínculo');
    expect(checkbox).not.toBeChecked();

    // Switch to unlinked
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByPlaceholderText('Ex: Cotação para Obra XYZ')).toBeInTheDocument();

    // Switch back
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByPlaceholderText('Ex: Cotação para Obra XYZ')).not.toBeInTheDocument();

    // Save to ensure client 1 is preserved
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));
    expect(onSave).toHaveBeenCalledWith({ name: 'Cliente 1', id: 'client-1' });
  });

  it('returns an error if the selected client is invalid somehow', () => {
    const onSave = vi.fn();
    render(
      <SaveProposalModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        isSaving={false}
        clients={[buildClient({ id: 'client-1', name: 'Cliente 1' })]}
      />,
    );

    // Manipulate the select to a non-existent value
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'invalid-client-id' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));
    expect(screen.getByText('Cliente selecionado inválido.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('toggles saving state correctly', () => {
    render(
      <SaveProposalModal isOpen onClose={vi.fn()} onSave={vi.fn()} isSaving={true} clients={[]} />,
    );

    const saveBtn = screen.getByRole('button', { name: '' });
    expect(saveBtn).toBeDisabled();
    expect(saveBtn.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('cancels correctly', () => {
    const onClose = vi.fn();
    render(
      <SaveProposalModal isOpen onClose={onClose} onSave={vi.fn()} isSaving={false} clients={[]} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
