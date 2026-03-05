import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReminderEmptyState } from './ReminderEmptyState';

describe('ReminderEmptyState', () => {
  it('renderiza estado vazio com copy principal e auxiliar', () => {
    const { container } = render(<ReminderEmptyState />);

    expect(screen.getByText('Nenhum lembrete ainda')).toBeInTheDocument();
    expect(
      screen.getByText('Clique em "Novo Lembrete" para fixar o primeiro no quadro'),
    ).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });
});
