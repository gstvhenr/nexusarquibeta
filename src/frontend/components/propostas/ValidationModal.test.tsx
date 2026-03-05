import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationModal } from './ValidationModal';

describe('ValidationModal', () => {
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
      <ValidationModal
        isOpen={false}
        onClose={vi.fn()}
        onRedirect={vi.fn()}
        errors={['Erro 1']}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when open', () => {
    const errors = ['Falta CPF', 'Falta Endereço'];
    render(
      <ValidationModal
        isOpen={true}
        onClose={vi.fn()}
        onRedirect={vi.fn()}
        errors={errors}
      />
    );

    expect(screen.getByText('Cadastro Incompleto')).toBeInTheDocument();
    expect(screen.getByText(/Para converter esta proposta/)).toBeInTheDocument();
    expect(screen.getByText('Falta CPF')).toBeInTheDocument();
    expect(screen.getByText('Falta Endereço')).toBeInTheDocument();
  });

  it('calls onClose when clicking Cancel button', () => {
    const handleClose = vi.fn();
    render(
      <ValidationModal
        isOpen={true}
        onClose={handleClose}
        onRedirect={vi.fn()}
        errors={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('calls onRedirect when clicking Correct button', () => {
    const handleRedirect = vi.fn();
    render(
      <ValidationModal
        isOpen={true}
        onClose={vi.fn()}
        onRedirect={handleRedirect}
        errors={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Corrigir Cadastro' }));
    expect(handleRedirect).toHaveBeenCalledOnce();
  });
});
