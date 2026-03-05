import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketingProfessional } from '../../types';
import ProfessionalFormModal from './ProfessionalFormModal';

const existingProfessional: MarketingProfessional = {
  id: 'professional-1',
  name: 'Studio ADS',
  email: 'studio@ads.com',
  phone: '(11) 95555-0000',
  photo: 'data:image/png;base64,old-photo',
  billingFormat: 'Mensal',
  cost: 1500,
  notes: 'Escopo mensal',
};

const renderModal = (
  overrides: Partial<ComponentProps<typeof ProfessionalFormModal>> = {},
) =>
  render(
    <ProfessionalFormModal
      isOpen={true}
      onClose={vi.fn()}
      onSave={vi.fn()}
      onDelete={vi.fn()}
      initialProfessional={null}
      {...overrides}
    />,
  );

describe('ProfessionalFormModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.getElementById('modal-root')?.remove();
  });

  it('returns null when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('blocks save when name is empty', () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates a new professional with normalized defaults', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000456);
    const onSave = vi.fn();

    renderModal({ onSave });

    fireEvent.change(screen.getByLabelText('Nome do profissional'), {
      target: { value: 'Novo Prestador' },
    });
    fireEvent.change(screen.getByLabelText('Valor do profissional'), {
      target: { value: '980.5' },
    });
    fireEvent.change(screen.getByLabelText('Formato de cobrança'), {
      target: { value: 'Por Pacote' },
    });
    fireEvent.change(screen.getByLabelText('Notas do profissional'), {
      target: { value: 'Disponível para campanhas trimestrais' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'prof_1700000000456',
        name: 'Novo Prestador',
        email: '',
        phone: '',
        cost: 980.5,
        billingFormat: 'Por Pacote',
        notes: 'Disponível para campanhas trimestrais',
      }),
    );
  });

  it('supports edit mode save and delete flows', () => {
    const onSave = vi.fn();
    const onDelete = vi.fn();

    renderModal({
      initialProfessional: existingProfessional,
      onSave,
      onDelete,
    });

    expect(screen.getByDisplayValue('Studio ADS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome do profissional'), {
      target: { value: 'Studio ADS Prime' },
    });
    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '(11) 98888-2222' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'professional-1',
        name: 'Studio ADS Prime',
        phone: '(11) 98888-2222',
      }),
    );
    expect(onDelete).toHaveBeenCalledWith('professional-1');
  });

  it('uploads photo preview with FileReader and persists photo in save payload', () => {
    class FileReaderMock {
      public result: string | ArrayBuffer | null = null;
      public onloadend: (() => void) | null = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,new-photo';
        this.onloadend?.();
      }
    }

    vi.stubGlobal('FileReader', FileReaderMock as unknown as typeof FileReader);
    const onSave = vi.fn();
    renderModal({ onSave });

    const fileInput = screen.getByLabelText('Selecionar foto do profissional');
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['binary'], 'avatar.png', { type: 'image/png' })],
      },
    });

    expect(screen.getByRole('img', { name: 'Foto' })).toHaveAttribute(
      'src',
      'data:image/png;base64,new-photo',
    );

    fireEvent.change(screen.getByLabelText('Nome do profissional'), {
      target: { value: 'Profissional com foto' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Profissional com foto',
        photo: 'data:image/png;base64,new-photo',
      }),
    );
  });
});
