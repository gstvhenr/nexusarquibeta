import { Input, Select } from '../ui';
import type { Supplier } from '../../types';
import { getInitials } from '../../utils/supplierHelpers';

type SuppliersSidebarProps = {
  filter: string;
  onFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  allCategories: string[];
  filteredSuppliers: Supplier[];
  selectedSupplierId: string | null;
  onSelectSupplier: (supplierId: string) => void;
};

export function SuppliersSidebar({
  filter,
  onFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  allCategories,
  filteredSuppliers,
  selectedSupplierId,
  onSelectSupplier,
}: SuppliersSidebarProps): JSX.Element {
  return (
    <div className="w-full lg:w-80 bg-surface rounded-2xl shadow-soft flex flex-col overflow-hidden border border-border-color/60 shrink-0">
      <div className="p-4 border-b border-border-color shrink-0 bg-background/30 flex flex-col gap-3">
        <div className="relative">
          <Input
            id="supplier-search"
            type="search"
            placeholder="Buscar fornecedor..."
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            className="pl-9"
            aria-label="Buscar fornecedor"
          />
          <svg
            className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="w-full text-sm"
          aria-label="Filtrar por categoria"
          options={[
            { value: 'Todos', label: 'Todas as Categorias' },
            ...allCategories.map((cat) => ({ value: cat, label: cat })),
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            onClick={() => onSelectSupplier(supplier.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (() => onSelectSupplier(supplier.id))();
              }
            }}
            role="button"
            tabIndex={0}
            className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 ${selectedSupplierId === supplier.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-transparent hover:bg-background/80 hover:border-border-color'}`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border ${selectedSupplierId === supplier.id ? 'border-primary/30' : 'border-border-color'} bg-surface`}
            >
              {supplier.logo ? (
                <img
                  src={supplier.logo}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-secondary text-sm">
                  {getInitials(supplier.name)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-sm truncate ${selectedSupplierId === supplier.id ? 'text-primary' : 'text-text-primary'}`}
              >
                {supplier.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs text-text-secondary truncate">
                  {supplier.categories[0] || 'Geral'}
                </p>
                {supplier.categories.length > 1 && (
                  <span className="text-[10px] text-text-secondary bg-background px-1 rounded-sm">
                    +{supplier.categories.length - 1}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <p className="text-center text-sm text-text-secondary py-10">
            Nenhum fornecedor encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
