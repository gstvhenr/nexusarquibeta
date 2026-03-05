import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import type { BudgetSection, BudgetItem } from '@/types';
import OrcamentosPage from './OrcamentosPage';

// Mock child component to simplify event triggering
vi.mock('@/components/orcamentos', () => ({
  BudgetSectionComponent: ({
    section,
    onItemChange,
    onSectionChange,
    onAddItem,
    onRemoveItem,
    onRemoveSection
  }: {
    section: BudgetSection;
    onItemChange: (sectionId: number, itemId: number, field: string, value: unknown) => void;
    onSectionChange: (sectionId: number, field: string, value: string | number) => void;
    onAddItem: (sectionId: number) => void;
    onRemoveItem: (sectionId: number, itemId: number) => void;
    onRemoveSection: (sectionId: number) => void;
  }) => (
    <div data-testid={`budget-section-${section.id}`}>
      <span>{section.title}</span>
      <button onClick={() => onSectionChange(section.id, 'title', 'Title Changed')}>Change Title</button>
      <button onClick={() => onSectionChange(section.id, 'unit', 'm2')}>Change Unit</button>
      <button onClick={() => onSectionChange(section.id, 'billingMethod', 'fixed')}>Change Method</button>
      <button onClick={() => onSectionChange(section.id, 'billingValue', '50')}>Change Value</button>

      <button onClick={() => onAddItem(section.id)}>Add Item</button>
      <button onClick={() => onRemoveSection(section.id)}>Remove Section</button>

      {section.items.map((item: BudgetItem) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span>{item.description}</span>
          <button onClick={() => onItemChange(section.id, item.id, 'quantity', 5)}>Change Qty</button>
          <button onClick={() => onItemChange(section.id, item.id, 'unitPrice', 10)}>Change Price</button>
          <button onClick={() => onItemChange(section.id, item.id, 'estimatedHours', 2)}>Change Hours</button>
          <button onClick={() => onItemChange(section.id, item.id, 'included', !item.included)}>Toggle Included</button>

          <button onClick={() => onRemoveItem(section.id, item.id)}>Remove Item</button>
        </div>
      ))}
    </div>
  )
}));

describe('OrcamentosPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    vi.spyOn(api, 'reserveGlobalIdentifier').mockResolvedValue(1002);
    vi.spyOn(window, 'alert').mockImplementation(() => { });

    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      clients: [
        {
          id: 'client-1',
          name: 'Cliente Um',
          contacts: [],
          status: 'Cliente Ativo',
          serviceInterests: [],
          address: {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zip: '',
          },
          isFavorite: false,
          registrationDate: '2026-01-01',
          lastContactDate: '2026-01-01',
          pipelineStatus: 'Contato Inicial',
          meetings: [],
          behavioralProfile: { notes: '' },
          archived: false,
        },
      ],
      customBudgetTemplate: [
        {
          id: 1,
          title: 'Seção Base',
          unit: 'un',
          billing: { method: 'percentage_on_top', value: 20 },
          items: [
            {
              id: 10,
              description: 'Servico Base',
              quantity: 1,
              unitPrice: 100,
              estimatedHours: 1,
            }
          ]
        }
      ]
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
    vi.clearAllMocks();
  });

  it('renders and interacts with sections and items', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <OrcamentosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Seção Base')).toBeInTheDocument();

    // Add section
    fireEvent.click(screen.getByRole('button', { name: '+ Adicionar Nova Seção' }));
    expect(screen.getByText('Nova Seção')).toBeInTheDocument();

    // Modify section
    fireEvent.click(screen.getAllByText('Change Title')[0]);
    expect(screen.getByText('Title Changed')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Change Unit')[0]);
    fireEvent.click(screen.getAllByText('Change Method')[0]);
    fireEvent.click(screen.getAllByText('Change Value')[0]);

    // Modify item
    expect(screen.getByText('Servico Base')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Change Qty'));
    fireEvent.click(screen.getByText('Change Price'));
    fireEvent.click(screen.getByText('Change Hours'));
    fireEvent.click(screen.getByText('Toggle Included'));

    // Add item
    fireEvent.click(screen.getAllByText('Add Item')[0]);
    expect(screen.getByText('Novo Serviço/Item')).toBeInTheDocument();

    // Remove item
    fireEvent.click(screen.getAllByText('Remove Item')[0]);
    expect(screen.queryByText('Servico Base')).not.toBeInTheDocument();

    // Remove section
    fireEvent.click(screen.getAllByText('Remove Section')[0]);
    expect(screen.queryByText('Title Changed')).not.toBeInTheDocument();
  });

  it('applies numeric discount correctly', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <OrcamentosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    const discountInput = screen.getByLabelText('Desconto (%)');
    fireEvent.change(discountInput, { target: { value: '10' } });
    expect((discountInput as HTMLInputElement).value).toBe('10');
  });

  it('saves defaults via alert', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });

    render(
      <MemoryRouter>
        <DataProvider>
          <OrcamentosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(alertMock).toHaveBeenCalledWith('Padrões de orçamento salvos com sucesso!');
    alertMock.mockRestore();
  });

  it('clears budget via clear confirmation modal', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <OrcamentosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Limpar Orçamento' }));
    expect(screen.getByText('Confirmar Limpeza')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.queryByText('Seção Base')).not.toBeInTheDocument(); // CLEARED
  });

  it('cancels clear budget via confirmation modal', () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <OrcamentosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Limpar Orçamento' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Confirmar Limpeza')).not.toBeInTheDocument();
    expect(screen.getByText('Seção Base')).toBeInTheDocument(); // NOT CLEARED
  });

  it('prevents saving proposal if no items are selected', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <OrcamentosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    // Open Save Modal
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));

    // ✨ WAIT for Modal to appear
    const dialog = await screen.findByRole('dialog');

    // Wait for the modal and DataProvider default selection to settle
    // Find the save button INSIDE the dialog
    const modalSaveBtn = within(dialog).getByRole('button', { name: 'Salvar Proposta' });
    fireEvent.click(modalSaveBtn);

    // If it works, it should alert without needing to fill any unlinked text
    expect(window.alert).toHaveBeenCalledWith('Selecione ao menos um item para salvar a proposta.');
  });

  it('successfully saves proposal and navigates', async () => {
    // We do not expect an alert here, just navigation!
    render(
      <MemoryRouter initialEntries={['/']}>
        <DataProvider>
          <Routes>
            <Route path="/" element={<OrcamentosPage />} />
            <Route path="/propostas" element={<div data-testid="propostas-page">Propostas Page</div>} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    // Include the first item
    const toggleIncludeBtns = screen.getAllByRole('button', { name: 'Toggle Included' });
    fireEvent.click(toggleIncludeBtns[0]);

    // Open save modal
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));

    // Wait for Modal to appear
    const dialog = await screen.findByRole('dialog');
    const modalSaveBtn = within(dialog).getByRole('button', { name: 'Salvar Proposta' });

    // Submit save
    fireEvent.click(modalSaveBtn);

    // Expect to navigate to '/propostas' and render its element
    await waitFor(() => {
      expect(screen.getByTestId('propostas-page')).toBeInTheDocument();
    });
  });

  it('handles double click on save proposal safely', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DataProvider>
          <Routes>
            <Route path="/" element={<OrcamentosPage />} />
            <Route path="/propostas" element={<div data-testid="propostas-page">Propostas Page</div>} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    // Ensure at least one item is selected
    const toggleIncludeBtns = screen.getAllByRole('button', { name: 'Toggle Included' });
    fireEvent.click(toggleIncludeBtns[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Proposta' }));

    // ✨ WAIT for Modal to appear
    const dialog = await screen.findByRole('dialog');

    const modalSaveBtn = within(dialog).getByRole('button', { name: 'Salvar Proposta' });

    // Double fire
    fireEvent.click(modalSaveBtn);
    fireEvent.click(modalSaveBtn);

    // Expect to navigate to '/propostas'
    await waitFor(() => {
      expect(screen.getByTestId('propostas-page')).toBeInTheDocument();
    });
  });
});
