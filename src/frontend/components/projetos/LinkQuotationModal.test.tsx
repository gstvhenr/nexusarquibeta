import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import * as context from '../../context';
import { LinkQuotationModal } from './LinkQuotationModal';

function setupModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

const project: Project = {
  id: 'project-1',
  code: 'PRJ-001',
  name: 'Projeto 1',
  clientName: 'Cliente',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 1000,
  description: '',
  sections: [],
  linkedQuotationIds: ['q-4'],
  financials: { paymentType: 'vista' },
};

const createSupplyChainData = (
  overrides: Partial<ReturnType<typeof context.useSupplyChainData>> = {},
): ReturnType<typeof context.useSupplyChainData> => ({
  suppliers: [],
  products: [],
  supplierProductPrices: [],
  quotations: [],
  freelancers: [],
  setSuppliers: vi.fn(),
  setProducts: vi.fn(),
  setSupplierProductPrices: vi.fn(),
  setQuotations: vi.fn(),
  setFreelancers: vi.fn(),
  ...overrides,
});

const createCoreData = (
  overrides: Partial<ReturnType<typeof context.useCoreData>> = {},
): ReturnType<typeof context.useCoreData> => ({
  projects: [],
  proposals: [],
  clients: [],
  setProjects: vi.fn(),
  setProposals: vi.fn(),
  setClients: vi.fn(),
  ...overrides,
});

describe('LinkQuotationModal', () => {
  beforeEach(() => {
    setupModalRoot();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.getElementById('modal-root')?.remove();
    vi.restoreAllMocks();
  });

  it('renders only available quotations and saves selected ids', () => {
    vi.spyOn(context, 'useSupplyChainData').mockReturnValue(
      createSupplyChainData({
        quotations: [
          { id: 'q-1', name: 'Cotação 1', date: '2026-03-01', status: 'Em Aberto', items: [] },
          { id: 'q-2', name: 'Cotação 2', date: '2026-03-01', status: 'Finalizada', items: [], archived: true },
          { id: 'q-3', name: 'Cotação 3', date: '2026-03-01', status: 'Em Aberto', items: [] },
          { id: 'q-4', name: 'Cotação 4', date: '2026-03-01', status: 'Finalizada', items: [] },
        ],
      }),
    );
    vi.spyOn(context, 'useCoreData').mockReturnValue(
      createCoreData({
        projects: [
          project,
          { ...project, id: 'project-2', code: 'PRJ-002', name: 'Projeto 2', linkedQuotationIds: ['q-3'] },
        ],
      }),
    );

    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <LinkQuotationModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        project={project}
      />,
    );

    expect(screen.getByText('Cotação 1')).toBeInTheDocument();
    expect(screen.getByText('Cotação 4')).toBeInTheDocument();
    expect(screen.queryByText('Cotação 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Cotação 3')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Selecionar cotação Cotação 4'));
    fireEvent.click(screen.getByLabelText('Selecionar cotação Cotação 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Seleção' }));

    expect(onSave).toHaveBeenCalledWith(['q-1']);
  });

  it('shows empty state when there are no available quotations', () => {
    vi.spyOn(context, 'useSupplyChainData').mockReturnValue(
      createSupplyChainData({
        quotations: [
          {
            id: 'q-archived',
            name: 'Cotação Arquivada',
            date: '2026-03-01',
            status: 'Finalizada',
            items: [],
            archived: true,
          },
        ],
      }),
    );
    vi.spyOn(context, 'useCoreData').mockReturnValue(createCoreData());

    render(
      <LinkQuotationModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} project={project} />,
    );

    expect(screen.getByText('Nenhuma cotação disponível para vínculo.')).toBeInTheDocument();
  });
});
