import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import { CommissionFormModal } from './CommissionFormModal';

describe('CommissionFormModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      suppliers: [
        {
          id: 'sup-1',
          name: 'Fornecedor A',
          logo: '',
          categories: [],
          mainContact: { name: 'Contato', phone: '11999999999', hasWhatsApp: true },
          commissionPercentage: 10,
          archived: false,
        },
      ],
      clients: [
        {
          id: 'cli-1',
          name: 'Cliente A',
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
          pipelineStatus: '',
          meetings: [],
          behavioralProfile: { notes: '' },
          archived: false,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
    vi.restoreAllMocks();
  });

  it('validates required fields before saving', () => {
    const onSave = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <DataProvider>
        <CommissionFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={onSave}
          initialCommission={null}
        />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(alertSpy).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves commission with calculated value', () => {
    const onSave = vi.fn();
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    render(
      <DataProvider>
        <CommissionFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={onSave}
          initialCommission={null}
        />
      </DataProvider>,
    );

    fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: 'sup-1' } });
    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: 'cli-1' } });
    fireEvent.change(screen.getByLabelText('Valor da Venda'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'comm_1700000000000',
        supplierId: 'sup-1',
        supplierName: 'Fornecedor A',
        clientId: 'cli-1',
        clientName: 'Cliente A',
        commissionPercentage: 10,
        commissionValue: 100,
      }),
    );
  });
});
