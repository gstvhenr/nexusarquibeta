import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionTitle } from './SectionTitle';

describe('SectionTitle', () => {
  it('renders title content', () => {
    render(<SectionTitle>Fluxo de caixa</SectionTitle>);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Fluxo de caixa',
      }),
    ).toBeInTheDocument();
  });

  it('renders trailing content when provided', () => {
    render(
      <SectionTitle trailing={<button type="button">Atualizar</button>}>KPIs</SectionTitle>,
    );

    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });
});
