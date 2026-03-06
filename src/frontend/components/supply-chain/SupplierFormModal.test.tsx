import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../../types';
import SupplierFormModal from './SupplierFormModal';

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup-1',
  name: 'Fornecedor Base',
  logo: '',
  categories: ['Marcenaria'],
  cnpj: '12.345.678/0001-90',
  address: 'Rua Central, 100',
  site: 'https://fornecedor.example.com',
  mainContact: {
    name: 'Contato Base',
    role: 'Compras',
    phone: '(11) 99999-9999',
    email: 'contato@base.com',
    hasWhatsApp: true,
  },
  paymentTerms: '',
  shippingPolicy: '',
  commissionPercentage: 10,
  notes: 'Observações iniciais',
  archived: false,
  ...overrides,
});

describe('SupplierFormModal', () => {
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
      <SupplierFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        initialSupplier={null}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders create mode without archive/delete actions', () => {
    render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        initialSupplier={null}
      />,
    );

    expect(screen.getByText('Adicionar Fornecedor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Arquivar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Excluir/i })).not.toBeInTheDocument();
  });

  it('validates required supplier name before saving', () => {
    const onSave = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        initialSupplier={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Fornecedor' }));

    expect(alertSpy).toHaveBeenCalledWith('O nome do fornecedor é obrigatório.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves create mode with generated id and current form state', () => {
    const onSave = vi.fn();
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        initialSupplier={null}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: Marmoraria Pedra Fina'), {
      target: { value: 'Novo Fornecedor' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Fornecedor' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sup_1700000000000',
        name: 'Novo Fornecedor',
      }),
    );
  });

  it('supports archive/unarchive actions in edit mode', () => {
    const onArchive = vi.fn();

    const { rerender } = render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        onArchive={onArchive}
        onDelete={vi.fn()}
        initialSupplier={makeSupplier({ archived: false })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Arquivar/i }));
    expect(onArchive).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sup-1', archived: false }),
    );

    rerender(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        onArchive={onArchive}
        onDelete={vi.fn()}
        initialSupplier={makeSupplier({ archived: true })}
      />,
    );

    expect(screen.getByRole('button', { name: /Reativar/i })).toBeInTheDocument();
  });

  it('deletes supplier when confirmation is accepted', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        onArchive={vi.fn()}
        onDelete={onDelete}
        initialSupplier={makeSupplier({ id: 'sup-delete', name: 'Fornecedor Delete' })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));

    expect(onDelete).toHaveBeenCalledWith('sup-delete');
  });

  it('does not delete supplier when confirmation is cancelled', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        onArchive={vi.fn()}
        onDelete={onDelete}
        initialSupplier={makeSupplier({ id: 'sup-delete' })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('uploads logo with FileReader and persists value on save', async () => {
    const onSave = vi.fn();
    const originalFileReader = window.FileReader;

    class FileReaderMock {
      public result: string | ArrayBuffer | null = null;
      public onloadend: null | (() => void) = null;

      public readAsDataURL() {
        this.result = 'data:image/png;base64,mocked-logo';
        if (this.onloadend) {
          this.onloadend();
        }
      }
    }

    Object.defineProperty(window, 'FileReader', {
      configurable: true,
      writable: true,
      value: FileReaderMock,
    });

    render(
      <SupplierFormModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        initialSupplier={null}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: Marmoraria Pedra Fina'), {
      target: { value: 'Fornecedor com Logo' },
    });

    fireEvent.click(screen.getByText('Upload Logo'));

    const fileInput = screen.getByLabelText('Selecionar logo do fornecedor');
    fireEvent.change(fileInput, {
      target: { files: [new File(['binary'], 'logo.png', { type: 'image/png' })] },
    });

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
        'src',
        'data:image/png;base64,mocked-logo',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Fornecedor' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ logo: 'data:image/png;base64,mocked-logo' }),
    );

    Object.defineProperty(window, 'FileReader', {
      configurable: true,
      writable: true,
      value: originalFileReader,
    });
  });

  it('calls onClose when Cancelar is clicked', () => {
    const onClose = vi.fn();

    render(
      <SupplierFormModal
        isOpen
        onClose={onClose}
        onSave={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        initialSupplier={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
