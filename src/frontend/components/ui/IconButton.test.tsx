import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders with default type and variant classes', () => {
    render(
      <IconButton aria-label="Editar">
        <span>✎</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Editar' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('hover:bg-surface');
    expect(button).toHaveClass('p-2');
  });

  it('applies explicit variant and size', () => {
    render(
      <IconButton aria-label="Excluir" variant="danger" size="sm">
        <span>🗑</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Excluir' });
    expect(button).toHaveClass('hover:text-error');
    expect(button).toHaveClass('p-1');
  });

  it('forwards click handlers and disabled state', () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Ação" disabled={true} onClick={onClick}>
        <span>!</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Ação' });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
