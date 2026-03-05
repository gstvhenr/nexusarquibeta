import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from './Section';

describe('Section', () => {
  it('renders title, description and child content', () => {
    render(
      <Section title="Aparência" description="Descrição da seção">
        <button type="button">Ação</button>
      </Section>,
    );

    expect(screen.getByText('Aparência')).toBeInTheDocument();
    expect(screen.getByText('Descrição da seção')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });
});

