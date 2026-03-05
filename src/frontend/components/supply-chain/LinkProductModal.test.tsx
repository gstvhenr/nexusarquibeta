import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LinkProductModal from './LinkProductModal';
import type { Product } from '../../types';

// ── Factories ──────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Bancada de Mármore',
  unit: 'm²',
  category: 'Marmoraria',
  archived: false,
  ...overrides,
});

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('LinkProductModal', () => {
  const onClose = vi.fn();
  const onSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
  });

  // ── Visibility ───────────────────────────────────────────────────────────────

  it('renders nothing when isOpen=false', () => {
    const { container } = render(
      <LinkProductModal
        isOpen={false}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="Pedra Fina"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal title with supplier name', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="Pedra Fina"
      />,
    );
    expect(screen.getByText('Vincular Produto a Pedra Fina')).toBeInTheDocument();
  });

  // ── Product Select ───────────────────────────────────────────────────────────

  it('renders product options sorted alphabetically', () => {
    const products = [
      makeProduct({ id: 'b', name: 'Zzz Produto', unit: 'un' }),
      makeProduct({ id: 'a', name: 'Aaa Produto', unit: 'pç' }),
    ];
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={products}
        supplierName="X"
      />,
    );
    const options = screen.getAllByRole('option');
    expect(options[1].textContent).toContain('Aaa Produto');
    expect(options[2].textContent).toContain('Zzz Produto');
  });

  it('renders product unit next to name in options', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[makeProduct({ name: 'Piso', unit: 'm²' })]}
        supplierName="X"
      />,
    );
    const options = screen.getAllByRole('option');
    expect(options[1].textContent).toContain('(m²)');
  });

  it('renders placeholder option "Selecione um produto..."', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="X"
      />,
    );
    expect(screen.getByText('Selecione um produto...')).toBeInTheDocument();
  });

  // ── Info Text ────────────────────────────────────────────────────────────────

  it('renders explanatory info text about linking', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="X"
      />,
    );
    expect(screen.getByText(/preço base praticado/)).toBeInTheDocument();
  });

  // ── Cancel ───────────────────────────────────────────────────────────────────

  it('calls onClose when Cancelar is clicked', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="X"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  it('alerts when saving without selecting product', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="X"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));
    expect(alertSpy).toHaveBeenCalledWith('Selecione um produto e informe um preço válido.');
    expect(onSave).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('alerts when price is zero', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const product = makeProduct();
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));
    expect(alertSpy).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('alerts when price is negative', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const product = makeProduct();
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    fireEvent.change(screen.getByLabelText('Preço atual'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));
    expect(alertSpy).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // ── Successful Save ──────────────────────────────────────────────────────────

  it('calls onSave with correct args when product and price filled', () => {
    const product = makeProduct();
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    fireEvent.change(screen.getByLabelText('Preço atual'), { target: { value: '350' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));
    expect(onSave).toHaveBeenCalledWith('prod-1', 350);
  });

  it('parses float values correctly for price', () => {
    const product = makeProduct();
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    fireEvent.change(screen.getByLabelText('Preço atual'), { target: { value: '123.45' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));
    expect(onSave).toHaveBeenCalledWith('prod-1', 123.45);
  });

  // ── State Reset on Reopen ────────────────────────────────────────────────────

  it('resets state when modal reopens', async () => {
    const product = makeProduct();
    const { rerender } = render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    rerender(
      <LinkProductModal
        isOpen={false}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    rerender(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    await waitFor(() => {
      const select = screen.getByLabelText('Produto do catálogo') as HTMLSelectElement;
      expect(select.value).toBe('');
    });
  });

  // ── Labels & Accessibility ───────────────────────────────────────────────────

  it('renders field labels for product and price', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="X"
      />,
    );
    expect(screen.getByText('Produto do Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Preço Atual (R$)')).toBeInTheDocument();
  });

  it('renders aria-labels for inputs', () => {
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[]}
        supplierName="X"
      />,
    );
    expect(screen.getByLabelText('Produto do catálogo')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço atual')).toBeInTheDocument();
  });

  it('handles non-numeric price input gracefully', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const product = makeProduct();
    render(
      <LinkProductModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        products={[product]}
        supplierName="X"
      />,
    );
    fireEvent.change(screen.getByLabelText('Produto do catálogo'), {
      target: { value: 'prod-1' },
    });
    fireEvent.change(screen.getByLabelText('Preço atual'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Vínculo/i }));
    expect(alertSpy).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
