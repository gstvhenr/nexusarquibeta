import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import { Freelancer, FreelancerProject } from '../types';
import { FREELANCER_SPECIALTIES, NAV_LINKS } from '../constants';
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  LinkIcon,
  UserCircleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CashIcon,
  ArchiveIcon,
  UnarchiveIcon,
} from '../components/ui';
import { formatCurrency, getInitials, formatDate, formatPhone } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

// --- Sub-components for this page ---

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({
  title,
  value,
  icon,
}) => (
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

const FreelancerSummaryPanel: React.FC<{ freelancers: Freelancer[]; hiredServices: any[] }> = ({
  freelancers,
  hiredServices,
}) => {
  const { activeCount, totalDelegated, totalCost } = useMemo(() => {
    const active = freelancers.filter((f) => !f.archived);
    // Calculate based on the HiredServices global state for accuracy across the system
    const activeServices = hiredServices.filter((s) => !s.archived);
    const totalCost = activeServices.reduce((sum, s) => sum + s.cost, 0);

    return {
      activeCount: active.length,
      totalDelegated: activeServices.length,
      totalCost: totalCost,
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
        title="Serviços Contratados"
        value={totalDelegated}
        icon={<ClipboardDocumentListIcon className="w-8 h-8" />}
      />
      <SummaryCard
        title="Custo Total"
        value={formatCurrency(totalCost)}
        icon={<CashIcon className="w-8 h-8" />}
      />
    </div>
  );
};

const FreelancerCard: React.FC<{ freelancer: Freelancer; onClick: () => void }> = ({
  freelancer,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="bg-surface rounded-xl shadow-soft p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:ring-2 hover:ring-primary/50 group"
  >
    <div className="w-24 h-24 bg-background rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-border-color mb-3 group-hover:border-primary/30 transition-colors">
      {freelancer.photo ? (
        <img src={freelancer.photo} alt={freelancer.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl font-bold text-secondary">{getInitials(freelancer.name)}</span>
      )}
    </div>
    <h4 className="font-bold text-text-primary text-lg mb-1 group-hover:text-primary transition-colors">
      {freelancer.name}
    </h4>
    <p className="text-xs text-text-secondary h-8 line-clamp-2 px-2">
      {freelancer.specialties.join(', ')}
    </p>
  </div>
);

const PrestadoresFreelancersPage: React.FC = () => {
  const { freelancers, setFreelancers, hiredServices } = useData();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [currentFreelancer, setCurrentFreelancer] = useState<Freelancer | null>(null);

  const freelancersToDisplay = useMemo(() => {
    return freelancers
      .filter((f) => {
        const matchesSearch = search
          ? f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()))
          : true;
        const matchesArchived = f.archived === showArchived;
        return matchesSearch && matchesArchived;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [freelancers, search, showArchived]);

  const handleSaveFreelancer = useCallback(
    (freelancerToSave: Freelancer) => {
      setFreelancers((prev) => {
        const exists = prev.some((f) => f.id === freelancerToSave.id);
        if (exists) {
          return prev.map((f) => (f.id === freelancerToSave.id ? freelancerToSave : f));
        }
        return [...prev, { ...freelancerToSave, id: freelancerToSave.id || uuidv4() }];
      });
      setDetailModalOpen(false);
    },
    [setFreelancers],
  );

  const handleArchiveFreelancer = useCallback(
    (id: string, archive: boolean) => {
      setFreelancers((prev) => prev.map((f) => (f.id === id ? { ...f, archived: archive } : f)));
      setDetailModalOpen(false);
    },
    [setFreelancers],
  );

  const handleDeleteRequest = (freelancer: Freelancer) => {
    setCurrentFreelancer(freelancer);
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = useCallback(() => {
    if (currentFreelancer)
      setFreelancers((prev) => prev.filter((f) => f.id !== currentFreelancer.id));
    setDeleteModalOpen(false);
    setCurrentFreelancer(null);
    setDetailModalOpen(false);
  }, [currentFreelancer, setFreelancers]);

  const openDetailModal = (freelancer: Freelancer | null) => {
    setCurrentFreelancer(freelancer);
    setDetailModalOpen(true);
  };

  const subcontratacaoLink = NAV_LINKS.find((link) => link.label === 'Subcontratação');
  const pageIcon = subcontratacaoLink?.children?.find((c) => c.label === 'Freelancers')?.icon || (
    <UsersIcon />
  );

  return (
    <div className="animate-fade-in-up h-full flex flex-col p-6">
      <PageHeader title="Freelancers" icon={pageIcon}>
        <button
          type="button"
          onClick={() => setShowArchived(!showArchived)}
          className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-background border border-border-color hover:bg-border-color/50 transition-colors text-sm flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
        </button>
        <button
          type="button"
          onClick={() => openDetailModal(null)}
          className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center transition-colors text-sm gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Adicionar Freelancer
        </button>
      </PageHeader>

      <div className="flex flex-col flex-1 min-h-0 space-y-6">
        {!showArchived && (
          <FreelancerSummaryPanel freelancers={freelancers} hiredServices={hiredServices} />
        )}
        <div className="p-4 bg-surface rounded-xl shadow-soft flex flex-wrap items-center justify-between gap-4 shrink-0 border border-border-color/50">
          <input
            type="search"
            placeholder="Buscar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-background p-2 rounded-md border border-border-color focus:border-accent"
            aria-label="Buscar freelancer"
          />
        </div>
        <div className="flex-1 overflow-y-auto -mx-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2">
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
                  {showArchived
                    ? 'Não há freelancers arquivados.'
                    : 'Tente ajustar a busca ou adicione um novo freelancer.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <FreelancerDetailFormModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onSave={handleSaveFreelancer}
        onDelete={handleDeleteRequest}
        onArchive={handleArchiveFreelancer}
        initialFreelancer={currentFreelancer}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentFreelancer?.name || ''}
        itemType="Freelancer"
      />
    </div>
  );
};

const getInitialFreelancer = (): Freelancer => ({
  id: '',
  name: '',
  email: '',
  phone: '',
  specialties: [],
  projects: [],
  archived: false,
  photo: '',
  notes: '',
  portfolioLink: '',
});

const FreelancerDetailFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (f: Freelancer) => void;
  onDelete: (f: Freelancer) => void;
  onArchive: (id: string, archive: boolean) => void;
  initialFreelancer: Freelancer | null;
}> = ({ isOpen, onClose, onSave, onDelete, onArchive, initialFreelancer }) => {
  const [freelancer, setFreelancer] = useState<Freelancer>(
    initialFreelancer || getInitialFreelancer(),
  );
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const data = initialFreelancer
        ? JSON.parse(JSON.stringify(initialFreelancer))
        : getInitialFreelancer();
      setFreelancer(data);
      setPhotoPreview(data.photo || null);
      setMode(initialFreelancer ? 'view' : 'add');
    }
  }, [initialFreelancer, isOpen]);

  const isReadOnly = mode === 'view';
  const handleChange = (field: keyof Freelancer, value: any) =>
    setFreelancer((f) => ({ ...f, [field]: value }));
  const handleSpecialtyChange = (specialty: string, checked: boolean) =>
    handleChange(
      'specialties',
      checked
        ? [...freelancer.specialties, specialty]
        : freelancer.specialties.filter((s) => s !== specialty),
    );
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        handleChange('photo', result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const handleSave = () => {
    if (freelancer.name.trim()) onSave(freelancer);
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color disabled:opacity-70 disabled:cursor-not-allowed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Novo Freelancer' : freelancer.name}
      size="2xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 -mr-4 p-1 custom-scrollbar">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2 w-24">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center overflow-hidden border-2 border-border-color text-text-secondary">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-secondary/20" />
              )}
            </div>
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {photoPreview ? 'Alterar' : 'Adicionar Foto'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Selecionar foto do freelancer"
                />
              </>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-1">Nome</label>
            <input
              type="text"
              value={freelancer.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isReadOnly}
              className={inputClass}
              aria-label="Nome"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={freelancer.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isReadOnly}
            className={inputClass}
            aria-label="Email"
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={freelancer.phone}
            onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
            disabled={isReadOnly}
            className={inputClass}
            aria-label="Telefone"
          />
        </div>
        <input
          type="url"
          placeholder="Link do Portfólio"
          value={freelancer.portfolioLink || ''}
          onChange={(e) => handleChange('portfolioLink', e.target.value)}
          disabled={isReadOnly}
          className={inputClass}
          aria-label="Link do portfólio"
        />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Especialidades
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-background/30 p-2 rounded-lg border border-border-color/50">
            {FREELANCER_SPECIALTIES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={freelancer.specialties.includes(s)}
                  onChange={(e) => handleSpecialtyChange(s, e.target.checked)}
                  disabled={isReadOnly}
                  className="h-4 w-4 rounded accent-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Observações</label>
          <textarea
            value={freelancer.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={isReadOnly}
            rows={3}
            className={inputClass}
            aria-label="Observações"
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {mode !== 'add' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onArchive(freelancer.id, !freelancer.archived)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-secondary hover:bg-secondary/10 flex items-center gap-2 transition-colors"
              >
                {freelancer.archived ? (
                  <UnarchiveIcon className="w-4 h-4" />
                ) : (
                  <ArchiveIcon className="w-4 h-4" />
                )}{' '}
                {freelancer.archived ? 'Reativar' : 'Arquivar'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(freelancer)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-error hover:bg-error/10 flex items-center gap-2 transition-colors"
              >
                <TrashIcon className="w-4 h-4" /> Excluir
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          {mode === 'view' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-semibold bg-border-color/50 hover:bg-border-color transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
              >
                Editar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-semibold bg-border-color/50 hover:bg-border-color transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
              >
                Salvar
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrestadoresFreelancersPage;
