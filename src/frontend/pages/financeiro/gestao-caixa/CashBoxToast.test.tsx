import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CashBoxToast } from './CashBoxToast';

describe('CashBoxToast', () => {
  it('does not render when message is null', () => {
    const { container } = render(<CashBoxToast message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the success message when provided', () => {
    render(<CashBoxToast message="Entrada registrada com sucesso" />);

    expect(screen.getByText('Entrada registrada com sucesso')).toBeInTheDocument();
  });
});
