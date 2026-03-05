import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CommissionFilters } from './types';
import { CommissionsFilterBar } from './CommissionsFilterBar';

describe('CommissionsFilterBar', () => {
  it('shows only active suppliers and emits filter changes', () => {
    const onFilterChange = vi.fn();
    const filters: CommissionFilters = { status: 'Todos', supplierId: 'Todos' };

    render(
      <CommissionsFilterBar
        filters={filters}
        suppliers={[
          {
            id: 's1',
            name: 'Fornecedor Ativo',
            logo: '',
            categories: [],
            mainContact: { name: 'A', phone: '1', hasWhatsApp: false },
            archived: false,
          },
          {
            id: 's2',
            name: 'Fornecedor Arquivado',
            logo: '',
            categories: [],
            mainContact: { name: 'B', phone: '2', hasWhatsApp: false },
            archived: true,
          },
        ]}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Filtrar por status'), {
      target: { value: 'Recebido' },
    });
    fireEvent.change(screen.getByLabelText('Filtrar por fornecedor'), {
      target: { value: 's1' },
    });

    expect(screen.getByText('Fornecedor Ativo')).toBeInTheDocument();
    expect(screen.queryByText('Fornecedor Arquivado')).not.toBeInTheDocument();
    expect(onFilterChange).toHaveBeenNthCalledWith(1, { status: 'Recebido', supplierId: 'Todos' });
    expect(onFilterChange).toHaveBeenNthCalledWith(2, { status: 'Todos', supplierId: 's1' });
  });
});
