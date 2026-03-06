import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionModal } from './ConversionModal';
import type { ProjectAddress } from '../../types';

vi.mock('../../utils/formatters', () => ({
  formatCEP: vi.fn((val: string) => val.toUpperCase()), // Mock formatCEP for simplicity
}));

const mockClientAddress: ProjectAddress = {
  street: 'Rua das Palmeiras',
  number: '123',
  neighborhood: 'Centro',
  city: 'Campinas',
  state: 'SP',
  zip: '13000-000',
  complement: 'Apt 42',
};

describe('ConversionModal', () => {
  beforeEach(() => {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
    }
  });

  afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      document.body.removeChild(modalRoot);
    }
  });

  it('renders null when not open', () => {
    const { container } = render(
      <ConversionModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders Step 1 with client address initially', () => {
    render(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    expect(screen.getByText('Converter para Projeto')).toBeInTheDocument();
    expect(screen.getByText(/Endereço da Obra/)).toBeInTheDocument();
    expect(screen.getByText(/Rua das Palmeiras, 123 - Centro, Campinas\/SP/)).toBeInTheDocument();
    expect(screen.getByText('Sim, é o mesmo endereço')).toBeInTheDocument();
    expect(screen.getByText('Não, é outro local')).toBeInTheDocument();
  });

  it('calls onConfirm with false when selecting same address', () => {
    const handleConfirm = vi.fn();
    render(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        clientAddress={mockClientAddress}
      />,
    );

    fireEvent.click(screen.getByText('Sim, é o mesmo endereço').closest('button')!);
    expect(handleConfirm).toHaveBeenCalledWith(false);
  });

  it('progresses to Step 2 when selecting different address', () => {
    render(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    fireEvent.click(screen.getByText('Não, é outro local').closest('button')!);

    // Step 2 content
    expect(screen.getByText('Novo Endereço da Obra')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rua')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CEP')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Conversão')).toBeInTheDocument();
  });

  it('allows filling the new address form and confirming', () => {
    const handleConfirm = vi.fn();
    render(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        clientAddress={mockClientAddress}
      />,
    );

    // Go to step 2
    fireEvent.click(screen.getByText('Não, é outro local').closest('button')!);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('CEP'), { target: { value: '12345-678' } });
    fireEvent.change(screen.getByPlaceholderText('Rua'), { target: { value: 'Avenida Nova' } });
    fireEvent.change(screen.getByPlaceholderText('Número'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Bairro'), { target: { value: 'Novo Bairro' } });
    fireEvent.change(screen.getByPlaceholderText('Cidade'), { target: { value: 'São Paulo' } });

    // Confirm
    fireEvent.click(screen.getByText('Confirmar Conversão'));

    expect(handleConfirm).toHaveBeenCalledWith(true, {
      street: 'Avenida Nova',
      number: '100',
      neighborhood: 'Novo Bairro',
      city: 'São Paulo',
      state: 'SP',
      zip: '12345-678',
      complement: '',
    });
  });

  it('can navigate back from Step 2 to Step 1', () => {
    render(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    // Go to step 2
    fireEvent.click(screen.getByText('Não, é outro local').closest('button')!);
    expect(screen.getByText('Novo Endereço da Obra')).toBeInTheDocument();

    // Go back
    fireEvent.click(screen.getByText('Voltar'));
    expect(screen.getByText('Sim, é o mesmo endereço')).toBeInTheDocument();
  });

  it('calls onClose when clicking Cancelar in Step 1', () => {
    const handleClose = vi.fn();
    render(
      <ConversionModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('resets state when reopened', () => {
    const { rerender } = render(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    // Go to step 2
    fireEvent.click(screen.getByText('Não, é outro local').closest('button')!);
    expect(screen.getByText('Novo Endereço da Obra')).toBeInTheDocument();

    // Close
    rerender(
      <ConversionModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    // Reopen
    rerender(
      <ConversionModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        clientAddress={mockClientAddress}
      />,
    );

    // Should be back to step 1
    expect(screen.queryByText('Novo Endereço da Obra')).not.toBeInTheDocument();
    expect(screen.getByText('Sim, é o mesmo endereço')).toBeInTheDocument();
  });
});
