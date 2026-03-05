import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OriginBadge } from './OriginBadge';

describe('OriginBadge', () => {
  it('renders professional origin with primary style', () => {
    render(<OriginBadge origin="Profissional" />);

    expect(screen.getByText('Profissional')).toHaveClass('text-primary');
  });

  it('renders personal origin with accent style', () => {
    render(<OriginBadge origin="Pessoal" />);

    expect(screen.getByText('Pessoal')).toHaveClass('text-accent');
  });
});
