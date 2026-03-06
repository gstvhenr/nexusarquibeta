import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstagramDetailHeader } from './InstagramDetailHeader';

describe('InstagramDetailHeader', () => {
  it('renders title, icon and triggers back action', () => {
    const onBack = vi.fn();

    render(
      <InstagramDetailHeader name="Instagram" icon={<span data-testid="icon" />} onBack={onBack} />,
    );

    fireEvent.click(screen.getByTitle('Voltar para Redes Sociais'));

    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
