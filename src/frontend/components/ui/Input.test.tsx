import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default styles and supports onChange', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Nome" placeholder="Digite" onChange={onChange} />);

    const input = screen.getByLabelText('Nome');
    expect(input).toHaveClass('bg-background');
    expect(input).not.toHaveAttribute('aria-invalid');

    fireEvent.change(input, { target: { value: 'Ana' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders error state and aria-invalid', () => {
    render(<Input aria-label="Email" error="Obrigatório" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('border-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports icons and applies padding helpers', () => {
    const { container } = render(
      <Input
        aria-label="Busca"
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      />,
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();

    const input = screen.getByLabelText('Busca');
    expect(input).toHaveClass('pl-9');
    expect(input).toHaveClass('pr-9');
    expect(container.querySelectorAll('span').length).toBeGreaterThanOrEqual(2);
  });

  it('honors variant size and disabled state', () => {
    render(<Input aria-label="Telefone" variant="filled" size="sm" disabled={true} />);

    const input = screen.getByLabelText('Telefone');
    expect(input).toHaveClass('bg-surface');
    expect(input).toHaveClass('text-xs');
    expect(input).toBeDisabled();
  });
});
