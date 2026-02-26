import React from 'react';
import { commissionStatuses } from '../../types';
import type { CommissionStatus, Supplier } from '../../types';
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
  return (
    <div className="my-6 p-4 bg-surface rounded-xl shadow-soft flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-grow">
        <select
          value={filters.status}
          onChange={(event) =>
            onFilterChange({
              ...filters,
              status: event.target.value as CommissionStatus | 'Todos',
            })
          }
          className="bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
          aria-label="Filtrar por status"
        >
          <option value="Todos">Todos os Status</option>
          {commissionStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={filters.supplierId}
          onChange={(event) =>
            onFilterChange({
              ...filters,
              supplierId: event.target.value,
            })
          }
          className="bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
          aria-label="Filtrar por fornecedor"
        >
          <option value="Todos">Todos os Fornecedores</option>
          {suppliers
            .filter((supplier) => !supplier.archived)
            .map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};
