import { ClientTableRow } from '../../components/clientes';
import {
  ArchiveIcon,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  IconButton,
  Input,
  Select,
  TrashIcon,
  UnarchiveIcon,
} from '../../components/ui';
import { clientStatuses, paymentStatuses } from '../../types';
import type { Client, PaymentStatus } from '../../types';
import type { ClientesFilterState } from './types';

const CLIENT_STATUS_OPTIONS = [
  { value: 'Todos', label: 'Status' },
  ...clientStatuses.map((s) => ({ value: s, label: s })),
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'Todos', label: 'Situação Financeira' },
  ...paymentStatuses.map((s) => ({ value: s, label: s })),
];

interface ClientesTablePanelProps {
  showArchived: boolean;
  filter: ClientesFilterState;
  onFilterChange: (updater: (prev: ClientesFilterState) => ClientesFilterState) => void;
  selectedClientIds: Set<string>;
  filteredClients: Client[];
  totalActiveClients: number;
  totalArchivedClients: number;
  paymentStatusByClientId: Map<string, PaymentStatus>;
  clientDeadlines: Map<string, Date | null>;
  onSelectAll: () => void;
  onSelectClient: (id: string) => void;
  onToggleUrgent: (id: string) => void;
  onViewClient: (client: Client) => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFilteredCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const ClientesTablePanel = ({
  showArchived,
  filter,
  onFilterChange,
  selectedClientIds,
  filteredClients,
  totalActiveClients,
  totalArchivedClients,
  paymentStatusByClientId,
  clientDeadlines,
  onSelectAll,
  onSelectClient,
  onToggleUrgent,
  onViewClient,
  onBulkArchive,
  onBulkDelete,
  currentPage,
  totalPages,
  pageSize,
  totalFilteredCount,
  onPageChange,
  onPageSizeChange,
}: ClientesTablePanelProps) => (
  <>
    <div className="mb-6 p-4 bg-surface rounded-xl shadow-soft flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-4 flex-grow max-w-4xl">
        <Input
          type="text"
          placeholder="Busca por nome ou CPF/CNPJ"
          value={filter.search}
          onChange={(e) => onFilterChange((prev) => ({ ...prev, search: e.target.value }))}
          className="w-full sm:w-64"
          aria-label="Buscar cliente"
        />

        {!showArchived && (
          <>
            <Select
              value={filter.status}
              onChange={(e) => onFilterChange((prev) => ({ ...prev, status: e.target.value }))}
              options={CLIENT_STATUS_OPTIONS}
              aria-label="Filtrar por status"
            />
            <Select
              value={filter.paymentStatus}
              onChange={(e) =>
                onFilterChange((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value as PaymentStatus | 'Todos',
                }))
              }
              options={PAYMENT_STATUS_OPTIONS}
              aria-label="Filtrar por situação financeira"
            />
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        {selectedClientIds.size > 0 && (
          <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border-color animate-fade-in-up">
            <span className="text-sm font-bold text-primary px-3 py-1.5 bg-primary/10 rounded-md">
              {selectedClientIds.size} selecionado(s)
            </span>
            <IconButton
              variant="primary"
              onClick={onBulkArchive}
              aria-label={
                showArchived
                  ? 'Desarquivar clientes selecionados'
                  : 'Arquivar clientes selecionados'
              }
              title={showArchived ? 'Desarquivar Selecionados' : 'Arquivar Selecionados'}
            >
              {showArchived ? (
                <UnarchiveIcon className="w-5 h-5" />
              ) : (
                <ArchiveIcon className="w-5 h-5" />
              )}
            </IconButton>
            <IconButton
              variant="danger"
              onClick={onBulkDelete}
              aria-label="Excluir clientes selecionados"
              title="Excluir Selecionados"
            >
              <TrashIcon className="w-5 h-5" />
            </IconButton>
          </div>
        )}

        <div className="text-sm font-medium text-text-secondary bg-background/50 px-4 py-2 rounded-lg border border-border-color/50">
          Total:{' '}
          <span className="text-text-primary font-bold">
            {showArchived ? totalArchivedClients : totalActiveClients}
          </span>
        </div>
      </div>
    </div>

    <div className="bg-surface rounded-xl shadow-soft overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-background/50 text-xs text-text-secondary uppercase tracking-wider">
          <tr>
            <th scope="col" className="p-4 w-10 text-center">
              <input
                type="checkbox"
                checked={
                  filteredClients.length > 0 && selectedClientIds.size === filteredClients.length
                }
                onChange={onSelectAll}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
                aria-label="Selecionar todos os clientes"
              />
            </th>
            <th scope="col" className="p-4 w-12 text-center"></th>
            <th scope="col" className="px-6 py-3">
              Cliente
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3">
              Situação Financeira
            </th>
            <th scope="col" className="px-6 py-3">
              Contato
            </th>
            <th scope="col" className="px-6 py-3">
              Localização
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Próximo Prazo
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <ClientTableRow
                key={client.id}
                client={client}
                paymentStatus={paymentStatusByClientId.get(client.id) || 'Em dia'}
                isSelected={selectedClientIds.has(client.id)}
                onSelect={onSelectClient}
                onToggleUrgent={() => onToggleUrgent(client.id)}
                onView={onViewClient}
                nextDeadline={clientDeadlines.get(client.id)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={8}>
                <div className="p-10 text-center text-text-secondary">
                  <h3 className="mt-2 text-lg font-medium text-text-primary">
                    {showArchived ? 'Nenhum cliente arquivado' : 'Nenhum cliente encontrado'}
                  </h3>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {totalFilteredCount > 0 && (
      <div className="mt-4 p-3 bg-surface rounded-xl shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Exibir</span>
          {[10, 30, 50].map((size) => (
            <Button
              key={size}
              variant={pageSize === size ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPageSizeChange(size)}
              aria-label={`Exibir ${size} por página`}
            >
              {size}
            </Button>
          ))}
          <span className="text-sm text-text-secondary">por página</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalFilteredCount)} de{' '}
            <span className="font-semibold text-text-primary">{totalFilteredCount}</span>
          </span>
          <div className="flex items-center gap-1">
            <IconButton
              variant="default"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </IconButton>
            <span className="text-sm font-medium text-text-primary px-2">
              {currentPage} / {totalPages}
            </span>
            <IconButton
              variant="default"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Próxima página"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
    )}
  </>
);
