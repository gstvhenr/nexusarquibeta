import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders as button by default and triggers click', () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Salvar</Button>);
    const button = screen.getByRole('button', { name: 'Salvar' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bg-primary');

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="danger" size="lg">
        Excluir
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Excluir' });
    expect(button).toHaveClass('bg-error');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
  });

  it('shows loading spinner and disables button while loading', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading={true} onClick={onClick}>
        Salvar
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).not.toBeNull();

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('honors explicit type and disabled prop', () => {
    render(
      <Button type="submit" disabled={true}>
        Enviar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Enviar' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });
});
