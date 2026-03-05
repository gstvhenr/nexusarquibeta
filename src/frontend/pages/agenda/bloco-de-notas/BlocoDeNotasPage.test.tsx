import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BlocoDeNotasPage from './BlocoDeNotasPage';

vi.mock('@/hooks/useLocalStorage', () => {
  const useLocalStorageMock = <T,>(_key: string, initialValue: T) =>
    React.useState(initialValue);
  return {
    default: useLocalStorageMock,
  };
});

vi.mock('@/hooks/useAutoReset', () => ({
  useAutoReset: <T,>(initialValue: T) => React.useState(initialValue),
}));

vi.mock('@/components/layout', () => ({
  PageHeader: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }): JSX.Element => (
    <header>
      <h1>{title}</h1>
      <div>{children}</div>
    </header>
  ),
}));

vi.mock('@/constants', () => ({
  NAV_LINKS: [
    {
      label: 'Agenda',
      children: [{ label: 'Bloco de Notas', icon: null }],
    },
  ],
}));

vi.mock('@/components/ui', () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-icon" />,
  XIcon: () => <svg data-testid="x-icon" />,
  EditIcon: () => <svg data-testid="edit-icon" />,
}));

describe('BlocoDeNotasPage', () => {
  afterEach(() => {
    cleanup();
  });

  describe('initial state', () => {
    it('renders the page title "Bloco de Notas"', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert
      expect(screen.getByText('Bloco de Notas')).toBeInTheDocument();
    });

    it('renders the initial default tab with title "Sem título"', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert
      expect(screen.getByText('Sem título')).toBeInTheDocument();
    });

    it('renders the textarea with correct placeholder', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert
      expect(screen.getByPlaceholderText('Comece a escrever aqui...')).toBeInTheDocument();
    });

    it('shows "0 caracteres" as initial character count', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert
      expect(screen.getByText(/0\s+caracteres/i)).toBeInTheDocument();
    });

    it('renders exactly one tab initially', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(1);
    });

    it('renders Save and Clear action buttons', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert
      expect(screen.getByText('Salvar')).toBeInTheDocument();
      expect(screen.getByText('Limpar')).toBeInTheDocument();
    });
  });

  describe('tab management', () => {
    it('adds a new tab when clicking "Nova aba"', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      expect(screen.getAllByRole('tab')).toHaveLength(1);

      // Act
      fireEvent.click(screen.getByLabelText('Nova aba'));

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    it('new tab starts with "Sem título" as default name', () => {
      // Arrange
      render(<BlocoDeNotasPage />);

      // Act
      fireEvent.click(screen.getByLabelText('Nova aba'));

      // Assert — both visible (initial + new)
      expect(screen.getAllByText('Sem título')).toHaveLength(2);
    });

    it('closes a tab when the close button is clicked (only visible when >1 tabs)', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      fireEvent.click(screen.getByLabelText('Nova aba'));
      expect(screen.getAllByRole('tab')).toHaveLength(2);

      // Act — close the first tab
      const tabs = screen.getAllByRole('tab');
      const closeBtn = tabs[0].querySelector('[aria-label*="Fechar aba"]') as HTMLElement;
      fireEvent.click(closeBtn);

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(1);
    });

    it('does not render close buttons when there is only one tab', () => {
      // Arrange / Act
      render(<BlocoDeNotasPage />);

      // Assert — no "Fechar aba" buttons when only 1 tab exists
      expect(screen.queryByLabelText(/Fechar aba/i)).not.toBeInTheDocument();
    });

    it('switches active tab when another tab is clicked', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      fireEvent.click(screen.getByLabelText('Nova aba'));

      const [firstTab, secondTab] = screen.getAllByRole('tab');

      // Act — focus the second tab
      fireEvent.click(secondTab);

      // Assert — second tab is selected
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(firstTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('tab renaming', () => {
    it('opens inline title editor when rename button is clicked', () => {
      // Arrange
      render(<BlocoDeNotasPage />);

      // Act
      fireEvent.click(screen.getByLabelText(/Renomear aba/i));

      // Assert — title input appears
      expect(screen.getByDisplayValue('Sem título')).toBeInTheDocument();
    });

    it('persists new title after blur from input', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      fireEvent.click(screen.getByLabelText(/Renomear aba/i));
      const input = screen.getByDisplayValue('Sem título');

      // Act
      fireEvent.change(input, { target: { value: 'Planejamento Q2' } });
      fireEvent.blur(input);

      // Assert
      expect(screen.getByText('Planejamento Q2')).toBeInTheDocument();
    });

    it('persists new title on Enter keydown', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      fireEvent.click(screen.getByLabelText(/Renomear aba/i));
      const input = screen.getByDisplayValue('Sem título');

      // Act
      fireEvent.change(input, { target: { value: 'Sprint Notas' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Assert
      expect(screen.getByText('Sprint Notas')).toBeInTheDocument();
    });

    it('cancels editing on Escape keydown without changing the title', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      fireEvent.click(screen.getByLabelText(/Renomear aba/i));
      const input = screen.getByDisplayValue('Sem título');

      // Act
      fireEvent.change(input, { target: { value: 'Nome Novo' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      // Assert — original title preserved
      expect(screen.getByText('Sem título')).toBeInTheDocument();
      expect(screen.queryByText('Nome Novo')).not.toBeInTheDocument();
    });
  });

  describe('note content', () => {
    it('updates character count as user types', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      const textarea = screen.getByPlaceholderText('Comece a escrever aqui...');

      // Act
      fireEvent.change(textarea, { target: { value: 'Olá mundo' } });

      // Assert — 9 characters
      expect(screen.getByText(/9\s+caracteres/i)).toBeInTheDocument();
    });

    it('clears note content when "Limpar" is clicked', () => {
      // Arrange
      render(<BlocoDeNotasPage />);
      const textarea = screen.getByPlaceholderText('Comece a escrever aqui...');
      fireEvent.change(textarea, { target: { value: 'Conteúdo a limpar' } });

      // Act
      fireEvent.click(screen.getByText('Limpar'));

      // Assert
      expect(screen.getByText(/0\s+caracteres/i)).toBeInTheDocument();
    });

    it('shows "Salvo!" flash feedback when Save button is clicked', () => {
      // Arrange
      render(<BlocoDeNotasPage />);

      // Act
      fireEvent.click(screen.getByText('Salvar'));

      // Assert — label changes to Salvo!
      expect(screen.getByText('Salvo!')).toBeInTheDocument();
    });
  });
});
