import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardShell } from './CardShell';

describe('CardShell', () => {
  it('renders children with default glow style', () => {
    render(<CardShell>Conteúdo</CardShell>);

    const card = screen.getByText('Conteúdo');
    expect(card).toHaveClass('hover:ring-border-color/20');
  });

  it('applies selected glow variation and className', () => {
    render(
      <CardShell glow="success" className="custom-card">
        Card
      </CardShell>,
    );

    const card = screen.getByText('Card');
    expect(card).toHaveClass('hover:ring-success/20');
    expect(card).toHaveClass('custom-card');
  });
});
