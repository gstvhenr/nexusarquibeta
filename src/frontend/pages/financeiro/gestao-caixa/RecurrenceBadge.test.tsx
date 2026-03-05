import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecurrenceBadge } from './RecurrenceBadge';

describe('RecurrenceBadge', () => {
  it('renders "Única" recurrence as info badge', () => {
    render(<RecurrenceBadge recurrence="Única" />);

    expect(screen.getByText('Única')).toHaveClass('text-info');
  });

  it('renders installment recurrence with progress', () => {
    render(<RecurrenceBadge recurrence="Parcelada" installmentNumber={2} installmentTotal={6} />);

    expect(screen.getByText('2/6')).toBeInTheDocument();
    expect(screen.getByText('2/6')).toHaveClass('text-accent');
  });

  it('renders indeterminate recurrence as warning badge', () => {
    render(<RecurrenceBadge recurrence="Indeterminada" />);

    expect(screen.getByText('Indeterminada')).toHaveClass('text-warning');
  });
});
