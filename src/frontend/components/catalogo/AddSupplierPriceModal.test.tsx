import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../../types';
import { AddSupplierPriceModal } from './AddSupplierPriceModal';

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

describe('AddSupplierPriceModal', () => {
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
      <AddSupplierPriceModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        suppliers={[]}
        productName="Produto X"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('pré-seleciona o primeiro fornecedor ao abrir', async () => {
    const suppliers = [
      makeSupplier({ id: 'sup-1', name: 'Fornecedor Alpha' }),
      makeSupplier({ id: 'sup-2', name: 'Fornecedor Beta' }),
    ];

    render(
      <AddSupplierPriceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        suppliers={suppliers}
        productName="Painel Ripado"
      />,
    );

    expect(screen.getByText('Adicionar Preço para "Painel Ripado"')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('Fornecedor')).toHaveValue('sup-1');
    });
  });

  it('chama onClose ao clicar em Cancelar', () => {
    const onClose = vi.fn();

    render(
      <AddSupplierPriceModal
        isOpen={true}
        onClose={onClose}
        onSave={vi.fn()}
        suppliers={[makeSupplier()]}
        productName="Produto X"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('alerta e bloqueia save quando preço é inválido', async () => {
    const onSave = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <AddSupplierPriceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        suppliers={[makeSupplier()]}
        productName="Produto X"
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Fornecedor')).toHaveValue('sup-1');
    });

    fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Preço' }));

    expect(alertSpy).toHaveBeenCalledWith('Selecione um fornecedor e insira um preço válido.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('alerta quando não há fornecedor selecionável', () => {
    const onSave = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <AddSupplierPriceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        suppliers={[]}
        productName="Produto X"
      />,
    );

    fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '120.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Preço' }));

    expect(alertSpy).toHaveBeenCalledWith('Selecione um fornecedor e insira um preço válido.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('salva fornecedor, preço e data ao confirmar com dados válidos', async () => {
    const onSave = vi.fn();
    const suppliers = [
      makeSupplier({ id: 'sup-1', name: 'Fornecedor Alpha' }),
      makeSupplier({ id: 'sup-2', name: 'Fornecedor Beta' }),
    ];

    render(
      <AddSupplierPriceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        suppliers={suppliers}
        productName="Produto X"
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Fornecedor')).toHaveValue('sup-1');
    });

    fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: 'sup-2' } });
    fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '245.9' } });
    fireEvent.change(screen.getByLabelText('Data do preço'), { target: { value: '2026-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Preço' }));

    expect(onSave).toHaveBeenCalledWith('sup-2', 245.9, '2026-03-01');
  });
});
