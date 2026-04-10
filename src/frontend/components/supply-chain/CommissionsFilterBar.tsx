import React from 'react';
import { commissionStatuses } from '@/types';
import type { CommissionStatus, Supplier } from '@/types';
import { Select } from '@/components/ui';
import type { CommissionFilters } from './types';

type CommissionsFilterBarProps = {
  filters: CommissionFilters;
  suppliers: Supplier[];
  onFilterChange: (next: CommissionFilters) => void;
};

export const CommissionsFilterBar: (props: CommissionsFilterBarProps) => React.ReactNode = ({
  filters,
  suppliers,
  onFilterChange,
}) => {
  const statusOptions = [
    { value: 'Todos', label: 'Todos os Status' },
    ...commissionStatuses.map((status) => ({ value: status, label: status })),
  ];

  const supplierOptions = [
    { value: 'Todos', label: 'Todos os Fornecedores' },
    ...suppliers
      .filter((supplier) => !supplier.archived)
      .map((supplier) => ({ value: supplier.id, label: supplier.name })),
  ];

  return (
    <div className="my-6 p-4 bg-surface rounded-xl shadow-soft flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-grow">
        <Select
          value={filters.status}
          onChange={(event) =>
            onFilterChange({
              ...filters,
              status: event.target.value as CommissionStatus | 'Todos',
            })
          }
          options={statusOptions}
          aria-label="Filtrar por status"
        />
        <Select
          value={filters.supplierId}
          onChange={(event) =>
            onFilterChange({
              ...filters,
              supplierId: event.target.value,
            })
          }
          options={supplierOptions}
          aria-label="Filtrar por fornecedor"
        />
      </div>
    </div>
  );
};
