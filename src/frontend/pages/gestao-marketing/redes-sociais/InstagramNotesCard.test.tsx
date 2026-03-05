import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstagramNotesCard } from './InstagramNotesCard';

describe('InstagramNotesCard', () => {
  it('renders empty state and starts editing', () => {
    const onStartEdit = vi.fn();
    render(
      <InstagramNotesCard
        notes={undefined}
        isEditing={false}
        notesValue=""
        onStartEdit={onStartEdit}
        onCancelEdit={vi.fn()}
        onSave={vi.fn()}
        onNotesChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByText('Nenhuma informação breve cadastrada.')).toBeInTheDocument();
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });

  it('renders existing notes and edit action', () => {
    render(
      <InstagramNotesCard
        notes="Observação de campanha."
        isEditing={false}
        notesValue="Observação de campanha."
        onStartEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onSave={vi.fn()}
        onNotesChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Observação de campanha.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('supports editing, cancel and save actions', () => {
    const onNotesChange = vi.fn();
    const onCancelEdit = vi.fn();
    const onSave = vi.fn();

    render(
      <InstagramNotesCard
        notes="Anterior"
        isEditing={true}
        notesValue="Novo texto"
        onStartEdit={vi.fn()}
        onCancelEdit={onCancelEdit}
        onSave={onSave}
        onNotesChange={onNotesChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Observação breve sobre o perfil.'), {
      target: { value: 'Texto atualizado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onNotesChange).toHaveBeenCalledWith('Texto atualizado');
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
