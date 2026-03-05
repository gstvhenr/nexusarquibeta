import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Freelancer } from '@/types';
import { FreelancerDetailFormModal } from './FreelancerDetailFormModal';

const buildFreelancer = (overrides: Partial<Freelancer>): Freelancer => ({
  id: 'freela-1',
  name: 'Freelancer Um',
  email: 'freela@example.com',
  phone: '(11) 98888-0000',
  specialties: ['3D'],
  projects: [],
  archived: false,
  ...overrides,
});

describe('FreelancerDetailFormModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    vi.restoreAllMocks();
  });

  it('does not render when modal is closed', () => {
    render(
      <FreelancerDetailFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onArchive={vi.fn()}
        initialFreelancer={buildFreelancer({})}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports edit flow and archive/delete actions in view mode', () => {
    const onArchive = vi.fn();
    const onDelete = vi.fn();
    const onSave = vi.fn();

    render(
      <FreelancerDetailFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        onDelete={onDelete}
        onArchive={onArchive}
        initialFreelancer={buildFreelancer({})}
      />,
    );

    expect(screen.getByLabelText('Nome')).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Arquivar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));

    expect(onArchive).toHaveBeenCalledWith('freela-1', true);
    expect(onDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    const nameInput = screen.getByLabelText('Nome');
    expect(nameInput).not.toBeDisabled();
    fireEvent.change(nameInput, { target: { value: 'Freelancer Editado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Freelancer Editado' }));
  });

  it('keeps save guarded by required name and formats phone before saving', () => {
    const onSave = vi.fn();

    render(
      <FreelancerDetailFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onArchive={vi.fn()}
        initialFreelancer={null}
      />,
    );

    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11987654321' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novo Freelancer' } });
    fireEvent.click(screen.getByLabelText('Modelagem 3D'));
    fireEvent.change(screen.getByLabelText('Link do portfólio'), {
      target: { value: 'https://portfolio.test' },
    });
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Especialista BIM' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Novo Freelancer',
      phone: '(11) 98765-4321',
      portfolioLink: 'https://portfolio.test',
      notes: 'Especialista BIM',
      specialties: ['Modelagem 3D'],
    });
  });

  it('renders reactivation action for archived freelancer', () => {
    const onArchive = vi.fn();

    render(
      <FreelancerDetailFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onArchive={onArchive}
        initialFreelancer={buildFreelancer({ archived: true })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Reativar/i }));

    expect(onArchive).toHaveBeenCalledWith('freela-1', false);
  });

  it('loads preview photo using FileReader and persists image on save', async () => {
    const onSave = vi.fn();
    const originalFileReader = window.FileReader;

    class FileReaderMock {
      public result: string | ArrayBuffer | null = null;
      public onloadend: null | (() => void) = null;

      public readAsDataURL() {
        this.result = 'data:image/png;base64,mocked';
        if (this.onloadend) {
          this.onloadend();
        }
      }
    }

    // Override browser API to hit the image upload branch deterministically.
    Object.defineProperty(window, 'FileReader', {
      configurable: true,
      writable: true,
      value: FileReaderMock,
    });

    render(
      <FreelancerDetailFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onArchive={vi.fn()}
        initialFreelancer={null}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Freelancer com Foto' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Foto/i }));

    const fileInput = screen.getByLabelText('Selecionar foto do freelancer');
    const file = new File(['binary'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Foto' })).toHaveAttribute(
        'src',
        'data:image/png;base64,mocked',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ photo: 'data:image/png;base64,mocked' }),
    );

    Object.defineProperty(window, 'FileReader', {
      configurable: true,
      writable: true,
      value: originalFileReader,
    });
  });
});
