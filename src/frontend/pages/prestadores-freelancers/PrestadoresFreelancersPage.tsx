import React, { useState, useMemo, useCallback } from 'react';
import { useDisclosure } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { DeleteConfirmationModal } from '@/components/ui';
import { useSupplyChainData, useSystemData } from '@/context/DataContext';
import type { Freelancer, HiredService } from '@/types';
import { NAV_LINKS, SUBCONTRATACAO_LABEL } from '@/constants';
import {
  Button,
  PlusIcon,
  UserCircleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArchiveIcon,
  UnarchiveIcon,
} from '@/components/ui';
import { getInitials } from '@/utils/supplierHelpers';
import { v4 as uuidv4 } from 'uuid';
import { FreelancerDetailFormModal } from './FreelancerDetailFormModal';

const SummaryCard: (props: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => React.ReactNode = ({ title, value, icon }) => (
  <div className="bg-surface rounded-xl shadow-soft p-5 flex items-center gap-4 border border-border-color/50">
    <div className="bg-background p-3 rounded-full text-primary border border-border-color">
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold font-sans text-text-primary">{value}</p>
      <p className="font-semibold text-text-secondary text-sm uppercase tracking-wide">{title}</p>
    </div>
  </div>
);

const FreelancerSummaryPanel: (props: {
  freelancers: Freelancer[];
  hiredServices: HiredService[];
}) => React.ReactNode = ({ freelancers, hiredServices }) => {
  const { activeCount, inProgressCount, totalDelegated } = useMemo(() => {
    const active = freelancers.filter((f) => !f.archived);
    const activeServices = hiredServices.filter((s) => !s.archived);
    const inProgressServices = activeServices.filter((s) => s.status === 'Em Andamento');

    return {
      activeCount: active.length,
      inProgressCount: inProgressServices.length,
      totalDelegated: activeServices.length,
    };
  }, [freelancers, hiredServices]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
      <SummaryCard
        title="Freelancers Ativos"
        value={activeCount}
        icon={<UserCircleIcon className="w-8 h-8" />}
      />
      <SummaryCard
        title="Serviços em Andamento"
        value={inProgressCount}
        icon={<ClipboardDocumentListIcon className="w-8 h-8" />}
      />
      <SummaryCard
        title="Total de Serviços Terceirizados"
        value={totalDelegated}
        icon={<ClipboardDocumentListIcon className="w-8 h-8" />}
      />
    </div>
  );
};

const FreelancerCard: (props: {
  freelancer: Freelancer;
  onClick: () => void;
}) => React.ReactNode = ({ freelancer, onClick }) => (
  <div
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    role="button"
    tabIndex={0}
    className="bg-surface rounded-xl shadow-soft p-4 flex flex-row items-center gap-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/50 group"
  >
    <div className="w-12 h-12 bg-background rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-border-color group-hover:border-primary/30 transition-colors">
      {freelancer.photo ? (
        <img src={freelancer.photo} alt={freelancer.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg font-bold text-secondary">{getInitials(freelancer.name)}</span>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-text-primary text-base truncate group-hover:text-primary transition-colors">
        {freelancer.name}
      </h4>
      <div className="text-sm text-text-secondary truncate mt-0.5">
        {freelancer.location ? (
          freelancer.location
        ) : (
          <span className="opacity-50">Local não informado</span>
        )}
      </div>
    </div>

    <div className="hidden sm:flex flex-1 min-w-0 flex-col justify-center text-right">
      <span className="text-sm text-text-primary font-medium truncate">
        {freelancer.email || <span className="opacity-50 font-normal">S/ E-mail</span>}
      </span>
      <span className="text-xs text-text-secondary truncate mt-0.5">
        {freelancer.phone || <span className="opacity-50">S/ Telefone</span>}
      </span>
    </div>
  </div>
);

const PrestadoresFreelancersPage: () => React.ReactNode = () => {
  const { freelancers, setFreelancers } = useSupplyChainData();
  const { hiredServices } = useSystemData();
  const [showArchived, setShowArchived] = useState(false);

  const detailDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();

  const [currentFreelancer, setCurrentFreelancer] = useState<Freelancer | null>(null);

  const freelancersToDisplay = useMemo(() => {
    return freelancers
      .filter((f) => {
        const matchesArchived = f.archived === showArchived;
        return matchesArchived;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [freelancers, showArchived]);

  const handleSaveFreelancer = useCallback(
    (freelancerToSave: Freelancer) => {
      setFreelancers((prev) => {
        const exists = prev.some((f) => f.id === freelancerToSave.id);
        if (exists) {
          return prev.map((f) => (f.id === freelancerToSave.id ? freelancerToSave : f));
        }
        return [...prev, { ...freelancerToSave, id: freelancerToSave.id || uuidv4() }];
      });
      detailDisclosure.close();
    },
    [setFreelancers, detailDisclosure],
  );

  const handleArchiveFreelancer = useCallback(
    (id: string, archive: boolean) => {
      setFreelancers((prev) => prev.map((f) => (f.id === id ? { ...f, archived: archive } : f)));
      detailDisclosure.close();
    },
    [setFreelancers, detailDisclosure],
  );

  const handleDeleteRequest = (freelancer: Freelancer) => {
    setCurrentFreelancer(freelancer);
    deleteDisclosure.open();
  };
  const handleDeleteConfirm = useCallback(() => {
    if (currentFreelancer)
      setFreelancers((prev) => prev.filter((f) => f.id !== currentFreelancer.id));
    deleteDisclosure.close();
    setCurrentFreelancer(null);
    detailDisclosure.close();
  }, [currentFreelancer, setFreelancers, deleteDisclosure, detailDisclosure]);

  const openDetailModal = (freelancer: Freelancer | null) => {
    setCurrentFreelancer(freelancer);
    detailDisclosure.open();
  };

  const subcontratacaoLink = NAV_LINKS.find((link) => link.label === SUBCONTRATACAO_LABEL);
  const pageIcon = subcontratacaoLink?.children?.find((c) => c.label === 'Freelancers')?.icon || (
    <UsersIcon />
  );

  return (
    <div className="animate-fade-in-up h-full flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6">
      <PageHeader title="Freelancers" icon={pageIcon}>
        <Button variant="secondary" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
        </Button>
        <Button onClick={() => openDetailModal(null)}>
          <PlusIcon className="w-5 h-5" /> Adicionar Freelancer
        </Button>
      </PageHeader>

      <div className="flex flex-col flex-1 min-h-0 space-y-6">
        {!showArchived && (
          <FreelancerSummaryPanel freelancers={freelancers} hiredServices={hiredServices} />
        )}
        <div className="flex-1 overflow-y-auto -mx-2 custom-scrollbar">
          <div className="flex flex-col space-y-3 p-2">
            {freelancersToDisplay.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} onClick={() => openDetailModal(f)} />
            ))}
          </div>
          {freelancersToDisplay.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-text-secondary pb-20">
              <div>
                <UserCircleIcon className="w-24 h-24 mx-auto text-border-color opacity-50" />
                <h3 className="mt-4 text-lg font-medium text-text-primary">
                  Nenhum freelancer encontrado
                </h3>
                <p className="mt-1 text-sm">
                  {showArchived ? 'Não há freelancers arquivados.' : 'Adicione um novo freelancer.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <FreelancerDetailFormModal
        isOpen={detailDisclosure.isOpen}
        onClose={detailDisclosure.close}
        onSave={handleSaveFreelancer}
        onDelete={handleDeleteRequest}
        onArchive={handleArchiveFreelancer}
        initialFreelancer={currentFreelancer}
      />
      <DeleteConfirmationModal
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.close}
        onConfirm={handleDeleteConfirm}
        itemName={currentFreelancer?.name || ''}
        itemType="Freelancer"
      />
    </div>
  );
};

export default PrestadoresFreelancersPage;
