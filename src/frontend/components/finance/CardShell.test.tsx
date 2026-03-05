import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardShell } from './CardShell';

describe('components/finance/CardShell', () => {
  it('renders children and default glow class', () => {
    render(<CardShell>Resumo</CardShell>);

    const card = screen.getByText('Resumo');
    expect(card).toHaveClass('hover:ring-border-color/20');
  });

  it('forwards glow and className props to ui CardShell', () => {
    render(
      <CardShell glow="error" className="custom-shell">
        Conteudo
      </CardShell>,
    );

    const card = screen.getByText('Conteudo');
    expect(card).toHaveClass('hover:ring-error/20');
    expect(card).toHaveClass('custom-shell');
  });
});
