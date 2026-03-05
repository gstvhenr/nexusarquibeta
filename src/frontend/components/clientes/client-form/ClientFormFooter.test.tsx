import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientFormFooter } from './ClientFormFooter';

describe('ClientFormFooter', () => {
  const defaultProps = {
    isReadOnly: false,
    onClose: vi.fn(),
    onSwitchToEdit: vi.fn(),
    onSave: vi.fn(),
  };

  it('should render Close and Edit buttons when isReadOnly is true', () => {
    render(<ClientFormFooter {...defaultProps} isReadOnly={true} />);

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Cliente' })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();
  });

  it('should render Cancel and Save buttons when isReadOnly is false', () => {
    render(<ClientFormFooter {...defaultProps} isReadOnly={false} />);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar Cliente' })).not.toBeInTheDocument();
  });

  it('should call onClose when Fechar is clicked', () => {
    render(<ClientFormFooter {...defaultProps} isReadOnly={true} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onSwitchToEdit when Editar Cliente is clicked', () => {
    render(<ClientFormFooter {...defaultProps} isReadOnly={true} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar Cliente' }));
    expect(defaultProps.onSwitchToEdit).toHaveBeenCalled();
  });

  it('should call onClose when Cancelar is clicked', () => {
    render(<ClientFormFooter {...defaultProps} isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onSave when Salvar Alterações is clicked', () => {
    render(<ClientFormFooter {...defaultProps} isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
    expect(defaultProps.onSave).toHaveBeenCalled();
  });
});
