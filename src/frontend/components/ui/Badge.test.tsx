import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with default variant and size', () => {
    render(<Badge>Novo</Badge>);

    const badge = screen.getByText('Novo');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('bg-background');
    expect(badge).toHaveClass('text-xs');
  });

  it('applies variant and size classes', () => {
    render(
      <Badge variant="success" size="sm">
        Ativo
      </Badge>,
    );

    const badge = screen.getByText('Ativo');
    expect(badge).toHaveClass('bg-success/10');
    expect(badge).toHaveClass('text-success');
    expect(badge).toHaveClass('text-[10px]');
  });

  it('forwards custom attributes and className', () => {
    render(
      <Badge data-testid="badge" className="custom-badge">
        Auditoria
      </Badge>,
    );

    expect(screen.getByTestId('badge')).toHaveClass('custom-badge');
  });
});
