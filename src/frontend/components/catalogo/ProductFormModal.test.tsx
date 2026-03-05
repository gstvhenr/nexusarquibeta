import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product, Supplier } from '../../types';
import { ProductFormModal } from './ProductFormModal';

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup-1',
  name: 'Fornecedor Alpha',
  logo: '',
  categories: ['Marcenaria'],
  mainContact: {
    name: 'Contato Alpha',
    phone: '(11) 99999-0000',
    hasWhatsApp: true,
  },
  archived: false,
  ...overrides,
});

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Painel Ripado',
  unit: 'un',
  category: 'Marcenaria',
  description: 'Descrição inicial',
  archived: false,
  ...overrides,
});

describe('ProductFormModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById('modal-root')?.remove();
  });

  it('renderiza null quando está fechado', () => {
    const { container } = render(
      <ProductFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialProduct={null}
        suppliers={[]}
        existingRelations={[]}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('mostra aviso quando não há fornecedores e permite voltar', () => {
    const onClose = vi.fn();

    render(
      <ProductFormModal
        isOpen={true}
        onClose={onClose}
        onSave={vi.fn()}
        initialProduct={null}
        suppliers={[]}
        existingRelations={[]}
      />,
    );

    expect(screen.getByText('Nenhum fornecedor cadastrado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar e cadastrar fornecedores' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('alerta quando tenta salvar sem nome/categoria', () => {
    const onSave = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        initialProduct={null}
        suppliers={[makeSupplier()]}
        existingRelations={[]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(alertSpy).toHaveBeenCalledWith('Nome e Categoria são obrigatórios.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('cria produto novo com fornecedores vinculados, filtro e ordenação', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000123);
    const onSave = vi.fn();
    const suppliers = [
      makeSupplier({ id: 'sup-z', name: 'Zulu Supplier' }),
      makeSupplier({ id: 'sup-hidden', name: 'Hidden Supplier', archived: true }),
      makeSupplier({ id: 'sup-a', name: 'Alpha Supplier' }),
    ];

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        initialProduct={null}
        suppliers={suppliers}
        existingRelations={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome do Produto'), { target: { value: 'Produto Novo' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Marcenaria' } });
    fireEvent.change(screen.getByLabelText('Descrição do Produto'), {
      target: { value: 'Descrição de teste' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Vincular Fornecedores/i }));

    expect(screen.queryByText('Hidden Supplier')).not.toBeInTheDocument();
    const alphaNode = screen.getByText('Alpha Supplier');
    const zuluNode = screen.getByText('Zulu Supplier');
    expect(alphaNode.compareDocumentPosition(zuluNode) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Buscar fornecedor...'), { target: { value: 'zulu' } });
    expect(screen.queryByText('Alpha Supplier')).not.toBeInTheDocument();
    expect(screen.getByText('Zulu Supplier')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Zulu Supplier'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'prod_1700000000123',
        name: 'Produto Novo',
        category: 'Marcenaria',
        description: 'Descrição de teste',
        unit: 'un',
      }),
      ['sup-z'],
    );

    await waitFor(() => {
      expect(screen.getByText('1 selecionado(s)')).toBeInTheDocument();
    });
  });

  it('renderiza estado vazio de busca de fornecedores', () => {
    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialProduct={null}
        suppliers={[makeSupplier()]}
        existingRelations={[]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Vincular Fornecedores/i }));
    fireEvent.change(screen.getByPlaceholderText('Buscar fornecedor...'), {
      target: { value: 'nao-existe' },
    });

    expect(screen.getByText('Nenhum fornecedor encontrado.')).toBeInTheDocument();
  });

  it('em modo edição usa id existente e permite remover vínculo', () => {
    const onSave = vi.fn();
    const initialProduct = makeProduct({
      id: 'prod-existing',
      name: 'Produto Existente',
      unit: 'm²',
      category: 'Iluminação',
    });
    const suppliers = [
      makeSupplier({ id: 'sup-a', name: 'Alpha Supplier' }),
      makeSupplier({ id: 'sup-b', name: 'Beta Supplier' }),
    ];

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        initialProduct={initialProduct}
        suppliers={suppliers}
        existingRelations={['sup-a']}
      />,
    );

    expect(screen.getByText('Editar Produto')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Produto Existente')).toBeInTheDocument();
    expect(screen.getByText('1 selecionado(s)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Vincular Fornecedores/i }));
    expect(screen.getByLabelText('Alpha Supplier')).toBeChecked();

    fireEvent.click(screen.getByLabelText('Alpha Supplier'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'prod-existing' }), []);
  });

  it('reseta estado local ao fechar e reabrir', () => {
    const suppliers = [
      makeSupplier({ id: 'sup-a', name: 'Alpha Supplier' }),
      makeSupplier({ id: 'sup-b', name: 'Beta Supplier' }),
    ];
    const { rerender } = render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialProduct={null}
        suppliers={suppliers}
        existingRelations={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome do Produto'), {
      target: { value: 'Produto Temporário' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Vincular Fornecedores/i }));
    fireEvent.change(screen.getByPlaceholderText('Buscar fornecedor...'), { target: { value: 'beta' } });

    rerender(
      <ProductFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialProduct={null}
        suppliers={suppliers}
        existingRelations={[]}
      />,
    );

    rerender(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialProduct={null}
        suppliers={suppliers}
        existingRelations={[]}
      />,
    );

    expect(screen.getByLabelText('Nome do Produto')).toHaveValue('');
    expect(screen.queryByPlaceholderText('Buscar fornecedor...')).not.toBeInTheDocument();
    expect(screen.queryByText('1 selecionado(s)')).not.toBeInTheDocument();
  });
});
