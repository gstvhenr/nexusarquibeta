import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title, description, icon and action when provided', () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">I</span>}
        title="Sem dados"
        description="Nenhum item cadastrado."
        action={<button type="button">Criar item</button>}
      />,
    );

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Nenhum item cadastrado.')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar item' })).toBeInTheDocument();
  });

  it('renders only required content when optional props are missing', () => {
    render(<EmptyState title="Vazio" className="extra-spacing" />);

    expect(screen.getByText('Vazio')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    expect(screen.getByText('Vazio').closest('div')).toBeInTheDocument();
  });
});
