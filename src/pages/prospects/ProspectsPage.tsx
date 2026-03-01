import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/layout';
import {
  ArchiveIcon,
  Button,
  DeleteConfirmationModal,
  EmptyState,
  PlusIcon,
  RadarIcon,
  Select,
  UnarchiveIcon,
} from '../../components/ui';
import { NAV_LINKS } from '../../constants';
import { useMarketingData } from '../../context/DataContext';
import type { Prospect } from '../../types';
import { ProspectCard } from './ProspectCard';
import { ProspectFormModal } from './ProspectFormModal';
import { sortProspectsForRadar } from './prospectUtils';
import type { ProspectAction, ProspectStatusFilter } from './types';

function ProspectsPage(): JSX.Element {
  const { prospects, setProspects } = useMarketingData();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProspectStatusFilter>('Todos');

  const handleSave = (newProspect: Prospect) => {
    setProspects((previous) => {
      const exists = previous.some((prospect) => prospect.id === newProspect.id);
      if (exists) {
        return previous.map((prospect) =>
          prospect.id === newProspect.id ? newProspect : prospect,
        );
      }
      return [newProspect, ...previous];
    });
    setFormOpen(false);
  };

  const handleDeleteRequest = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProspect) {
      setProspects((previous) =>
        previous.filter((prospect) => prospect.id !== selectedProspect.id),
      );
    }
    setDeleteOpen(false);
    setSelectedProspect(null);
  };

  const handleAction = (id: string, action: ProspectAction) => {
    setProspects((previous) =>
      previous.map((prospect) => {
        if (prospect.id !== id) return prospect;

        if (action === 'renew') {
          return { ...prospect, followUpDays: Math.min(90, prospect.followUpDays + 15) };
        }
        if (action === 'convert') {
          return { ...prospect, status: 'Convertido', archived: true };
        }
        if (action === 'lost') {
          return { ...prospect, status: 'Perdido', archived: true };
        }
        if (action === 'archive') {
          return { ...prospect, archived: !prospect.archived };
        }

        return prospect;
      }),
    );
  };

  const openEdit = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setFormOpen(true);
  };

  const openAdd = () => {
    setSelectedProspect(null);
    setFormOpen(true);
  };

  const filteredProspects = useMemo(
    () =>
      prospects
        .filter((prospect) => (prospect.archived || false) === showArchived)
        .filter((prospect) => filterStatus === 'Todos' || prospect.status === filterStatus)
        .sort(sortProspectsForRadar),
    [prospects, showArchived, filterStatus],
  );

  const pageIcon = NAV_LINKS.find((link) => link.label === 'Comercial')?.children?.find(
    (child) => child.path === '/prospects',
  )?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Prospects" icon={pageIcon}>
        <div className="flex gap-2">
          <Select
            id="prospects-filter-status"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as ProspectStatusFilter)}
            options={[
              { value: 'Todos', label: 'Todos os Status' },
              { value: 'Em Aberto', label: 'Em Aberto' },
              { value: 'Convertido', label: 'Convertidos' },
              { value: 'Perdido', label: 'Perdidos' },
            ]}
            aria-label="Filtrar prospects por status"
          />
          <Button variant="secondary" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? (
              <UnarchiveIcon className="w-4 h-4" />
            ) : (
              <ArchiveIcon className="w-4 h-4" />
            )}
            {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
          </Button>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon className="w-5 h-5" /> Adicionar Prospect
        </Button>
      </PageHeader>

      {filteredProspects.length > 0 ? (
        <div className="space-y-3">
          {filteredProspects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              onEdit={openEdit}
              onDelete={handleDeleteRequest}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<RadarIcon className="w-14 h-14" />}
          title="Nenhum prospect encontrado"
          description="Ajuste os filtros ou adicione um novo prospect."
        />
      )}

      <ProspectFormModal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialProspect={selectedProspect}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedProspect?.name || ''}
        itemType="Prospect"
      />
    </div>
  );
}

export default ProspectsPage;
