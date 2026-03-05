import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders as switch and toggles callback with inverse state', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Toggle enabled={false} onChange={onChange} label="Alternar tema" />,
    );

    const switchButton = screen.getByRole('switch', { name: 'Alternar tema' });
    expect(switchButton).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchButton);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<Toggle enabled={true} onChange={onChange} label="Alternar tema" />);
    expect(switchButton).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(switchButton);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('uses default aria-label when label is not provided', () => {
    const onChange = vi.fn();

    render(<Toggle enabled={true} onChange={onChange} />);

    const switchButton = screen.getByRole('switch', { name: 'Alternar' });
    fireEvent.click(switchButton);

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
