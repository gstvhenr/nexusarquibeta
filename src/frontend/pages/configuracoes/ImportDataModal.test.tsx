import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportDataModal } from './ImportDataModal';

describe('ImportDataModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.getElementById('modal-root')?.remove();
  });

  it('does not render when closed', () => {
    render(<ImportDataModal isOpen={false} onClose={vi.fn()} onImportData={vi.fn()} />);

    expect(screen.queryByRole('heading', { name: 'Importar Dados' })).not.toBeInTheDocument();
  });

  it('renders modal content when open and handles file selection', () => {
    const onImportData = vi.fn();

    render(<ImportDataModal isOpen={true} onClose={vi.fn()} onImportData={onImportData} />);

    expect(screen.getByRole('heading', { name: 'Importar Dados' })).toBeInTheDocument();

    const input = screen.getByLabelText('Selecionar arquivo de backup para importação');
    expect(input).toHaveAttribute('accept', '.json');

    const file = new File(['{"projects":[]}'], 'backup.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onImportData).toHaveBeenCalledTimes(1);
  });

  it('closes through modal close button', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<ImportDataModal isOpen={true} onClose={onClose} onImportData={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
