import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectNotesTab } from './ProjectNotesTab';

describe('ProjectNotesTab', () => {
  it('renders notes content and dispatches change events', () => {
    const onChange = vi.fn();
    render(<ProjectNotesTab notes="Nota inicial" onChange={onChange} />);

    expect(screen.getByText('Caderno de Anotações')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Anotações do projeto'), {
      target: { value: 'Nota atualizada' },
    });

    expect(onChange).toHaveBeenCalledWith('Nota atualizada');
  });
});
