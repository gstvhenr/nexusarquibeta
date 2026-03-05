import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstagramTopBar } from './InstagramTopBar';

describe('InstagramTopBar', () => {
  it('renders invested amount and opens credential action', () => {
    const onOpenCredentials = vi.fn();

    render(<InstagramTopBar totalInvested={1234.56} onOpenCredentials={onOpenCredentials} />);

    fireEvent.click(screen.getByRole('button', { name: 'Acessos' }));

    expect(screen.getByText(/Total investido em marketing/)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('1.234,56'))).toBeInTheDocument();
    expect(onOpenCredentials).toHaveBeenCalledTimes(1);
  });
});
