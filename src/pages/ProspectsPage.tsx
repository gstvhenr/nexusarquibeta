import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import type { Prospect, ProspectPriority, ProspectStatus } from '../types';
import { PROSPECT_ORIGIN_OPTIONS, PROSPECT_INTEREST_OPTIONS, NAV_LINKS } from '../constants';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  RadarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArchiveIcon,
  UnarchiveIcon,
} from '../components/ui';
import { formatDate, formatPhone } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

// --- HELPER FUNCTIONS ---

const getDaysRemaining = (startDate: string, daysToFollow: number): number => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + daysToFollow);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getPriorityColor = (priority: ProspectPriority) => {
  switch (priority) {
    case 'Alta':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'Média':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'Baixa':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (status: ProspectStatus) => {
  switch (status) {
    case 'Em Aberto':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
    case 'Convertido':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Perdido':
      return 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-gray-100';
  }
};

// --- COMPONENTS ---

const ProspectFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (prospect: Prospect) => void;
  initialProspect: Prospect | null;
}> = ({ isOpen, onClose, onSave, initialProspect }) => {
  const getInitial = useCallback(
    (): Prospect =>
      initialProspect
        ? { ...initialProspect }
        : {
            id: '',
            name: '',
            phone: '',
            hasWhatsApp: false,
            email: '',
            social: '',
            contact: '',
            origin: PROSPECT_ORIGIN_OPTIONS[0],
            interest: PROSPECT_INTEREST_OPTIONS[0],
            priority: 'Média',
            status: 'Em Aberto',
            createdAt: new Date().toISOString(),
            startDate: new Date().toISOString().split('T')[0],
            followUpDays: 15,
            notes: '',
            archived: false,
          },
    [initialProspect],
  );

  const [prospect, setProspect] = useState<Prospect>(getInitial());

  useEffect(() => {
    if (isOpen) setProspect(getInitial());
  }, [isOpen, getInitial]);

  const handleChange = (field: keyof Prospect, value: any) => {
    setProspect((prev) => {
      let newVal = value;
      if (field === 'followUpDays') {
        newVal = Math.min(90, Math.max(1, parseInt(value) || 0)); // Limit between 1 and 90
      }
      return { ...prev, [field]: newVal };
    });
  };

  const handleSave = () => {
    if (!prospect.name.trim()) {
      alert('Nome é obrigatório.');
      return;
    }
    // Ensure legacy contact field is populated if empty, for backward compatibility with list view if needed
    const updatedProspect = { ...prospect, id: prospect.id || `prospect_${uuidv4()}` };
    if (!updatedProspect.contact) {
      updatedProspect.contact =
        updatedProspect.phone || updatedProspect.email || updatedProspect.social || '';
    }
    onSave(updatedProspect);
  };

  if (!isOpen) return null;
  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent transition text-sm';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProspect ? 'Editar Prospect' : 'Adicionar ao Radar'}
      size="2xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Nome / Interessado
          </label>
          <input
            type="text"
            value={prospect.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`${inputClass} font-semibold`}
            aria-label="Nome"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Telefone</label>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={prospect.phone || ''}
                onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                maxLength={15}
                className={inputClass}
                aria-label="Telefone"
              />
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={prospect.hasWhatsApp || false}
                  onChange={(e) => handleChange('hasWhatsApp', e.target.checked)}
                  className="rounded accent-primary"
                  aria-label="Telefone possui WhatsApp"
                />
                WhatsApp
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={prospect.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className={inputClass}
              aria-label="Email"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Rede Social</label>
          <input
            type="text"
            value={prospect.social || ''}
            onChange={(e) => handleChange('social', e.target.value)}
            className={inputClass}
            aria-label="Rede social"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Origem</label>
            <select
              value={prospect.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              className={inputClass}
              aria-label="Origem"
            >
              {PROSPECT_ORIGIN_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Interesse</label>
            <select
              value={prospect.interest}
              onChange={(e) => handleChange('interest', e.target.value)}
              className={inputClass}
              aria-label="Interesse"
            >
              {PROSPECT_INTEREST_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
              <RadarIcon className="w-3 h-3" /> Configuração de Radar (Dias)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={prospect.followUpDays}
              onChange={(e) => handleChange('followUpDays', e.target.value)}
              className={inputClass}
              aria-label="Dias de radar"
            />
            <p className="text-[10px] text-text-secondary mt-1">
              * Ativo até{' '}
              {new Date(
                new Date(prospect.startDate).getTime() +
                  prospect.followUpDays * 24 * 60 * 60 * 1000,
              ).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Prioridade</label>
            <select
              value={prospect.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className={inputClass}
              aria-label="Prioridade"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Anotações</label>
          <textarea
            value={prospect.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Detalhes da conversa, necessidades específicas..."
            aria-label="Anotações"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
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
      </div>
    </Modal>
  );
};

const ProspectCard: React.FC<{
  prospect: Prospect;
  onEdit: (p: Prospect) => void;
  onDelete: (p: Prospect) => void;
  onAction: (id: string, action: 'renew' | 'convert' | 'lost' | 'archive') => void;
}> = ({ prospect, onEdit, onDelete, onAction }) => {
  const daysRemaining = getDaysRemaining(prospect.startDate, prospect.followUpDays);
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / prospect.followUpDays) * 100));

  // Determine color based on urgency
  let progressFillClass = 'progress-fill-success';
  if (daysRemaining <= 3) progressFillClass = 'progress-fill-error';
  else if (daysRemaining <= 7) progressFillClass = 'progress-fill-warning';

  const isExpired = daysRemaining < 0;

  return (
    <div
      className={`bg-surface rounded-xl shadow-soft p-4 border-l-4 transition-all duration-300 hover:shadow-lg ${prospect.status === 'Convertido' ? 'border-success opacity-75' : prospect.status === 'Perdido' ? 'border-gray-400 opacity-60' : isExpired ? 'border-error' : 'border-primary'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-text-primary truncate max-w-[180px]">
              {prospect.name}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPriorityColor(prospect.priority)}`}
            >
              {prospect.priority}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {prospect.origin} &bull; {prospect.interest}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(prospect)}
            className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-background"
            aria-label="Editar prospecto"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(prospect)}
            className="p-1.5 text-text-secondary hover:text-error rounded-full hover:bg-background"
            aria-label="Excluir prospecto"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {prospect.notes && (
        <p className="text-xs text-text-secondary bg-background/50 p-2 rounded mb-3 line-clamp-2 italic">
          "{prospect.notes}"
        </p>
      )}

      <div className="mt-3">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
            <RadarIcon className="w-3 h-3" /> Radar
          </span>
          <span className={`text-xs font-bold ${isExpired ? 'text-error' : 'text-primary'}`}>
            {prospect.status === 'Em Aberto'
              ? isExpired
                ? `Expirou há ${Math.abs(daysRemaining)} dias`
                : `${daysRemaining} dias restantes`
              : prospect.status}
          </span>
        </div>
        {prospect.status === 'Em Aberto' && (
          <progress
            className={`progress-bar progress-track-background ${progressFillClass} h-1.5 w-full rounded-full`}
            value={progressPercent}
            max={100}
          />
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-border-color">
        {prospect.status === 'Em Aberto' ? (
          <>
            <button
              onClick={() => onAction(prospect.id, 'renew')}
              className="flex-1 py-1.5 text-xs font-semibold bg-background hover:bg-border-color text-text-primary rounded transition-colors flex items-center justify-center gap-1"
            >
              <ClockIcon className="w-3 h-3" /> +15 Dias
            </button>
            <button
              onClick={() => onAction(prospect.id, 'convert')}
              className="flex-1 py-1.5 text-xs font-semibold bg-success/10 hover:bg-success/20 text-success rounded transition-colors flex items-center justify-center gap-1"
              title="Marcar como Convertido"
            >
              <CheckCircleIcon className="w-3 h-3" /> Cliente
            </button>
            <button
              onClick={() => onAction(prospect.id, 'lost')}
              className="py-1.5 px-2 text-xs font-semibold bg-background hover:bg-error/10 text-text-secondary hover:text-error rounded transition-colors"
              title="Marcar como Perdido"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex justify-between items-center">
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(prospect.status)}`}
            >
              {prospect.status}
            </span>
            <button
              onClick={() => onAction(prospect.id, 'archive')}
              className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1"
            >
              {prospect.archived ? (
                <UnarchiveIcon className="w-3 h-3" />
              ) : (
                <ArchiveIcon className="w-3 h-3" />
              )}{' '}
              {prospect.archived ? 'Desarquivar' : 'Arquivar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const ProspectsPage: React.FC = () => {
  const { prospects, setProspects } = useData();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | 'Todos'>('Todos');

  const handleSave = (newProspect: Prospect) => {
    setProspects((prev) => {
      const exists = prev.some((p) => p.id === newProspect.id);
      if (exists) return prev.map((p) => (p.id === newProspect.id ? newProspect : p));
      return [newProspect, ...prev];
    });
    setFormOpen(false);
  };

  const handleDeleteRequest = (p: Prospect) => {
    setSelectedProspect(p);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProspect) setProspects((prev) => prev.filter((p) => p.id !== selectedProspect.id));
    setDeleteOpen(false);
    setSelectedProspect(null);
  };

  const handleAction = (id: string, action: 'renew' | 'convert' | 'lost' | 'archive') => {
    setProspects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        if (action === 'renew') {
          return { ...p, followUpDays: Math.min(90, p.followUpDays + 15) };
        }
        if (action === 'convert') {
          return { ...p, status: 'Convertido', archived: true };
        }
        if (action === 'lost') {
          return { ...p, status: 'Perdido', archived: true };
        }
        if (action === 'archive') {
          return { ...p, archived: !p.archived };
        }
        return p;
      }),
    );
  };

  const openEdit = (p: Prospect) => {
    setSelectedProspect(p);
    setFormOpen(true);
  };
  const openAdd = () => {
    setSelectedProspect(null);
    setFormOpen(true);
  };

  const filteredProspects = useMemo(() => {
    return prospects
      .filter((p) => (p.archived || false) === showArchived)
      .filter((p) => filterStatus === 'Todos' || p.status === filterStatus)
      .sort((a, b) => {
        // Sort by priority (Alta > Média > Baixa) then by days remaining
        const priorityWeight = { Alta: 3, Média: 2, Baixa: 1 };
        const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (weightDiff !== 0) return weightDiff;

        const daysA = getDaysRemaining(a.startDate, a.followUpDays);
        const daysB = getDaysRemaining(b.startDate, b.followUpDays);
        return daysA - daysB;
      });
  }, [prospects, showArchived, filterStatus]);

  const pageIcon = NAV_LINKS.find((link) => link.label === 'Comercial')?.children?.find(
    (c) => c.path === '/prospects',
  )?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Prospects" icon={pageIcon}>
        <div className="flex gap-2">
          <label htmlFor="prospects-filter-status" className="sr-only">
            Filtrar prospects por status
          </label>
          <select
            id="prospects-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-surface p-2 rounded-lg border border-border-color text-sm focus:border-accent"
            aria-label="Filtrar prospects por status"
            title="Filtrar prospects por status"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Em Aberto">Em Aberto</option>
            <option value="Convertido">Convertidos</option>
            <option value="Perdido">Perdidos</option>
          </select>
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background transition-colors text-sm flex items-center gap-2"
          >
            {showArchived ? (
              <UnarchiveIcon className="w-4 h-4" />
            ) : (
              <ArchiveIcon className="w-4 h-4" />
            )}
            {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
          </button>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" /> Adicionar Prospect
        </button>
      </PageHeader>

      <div className="bg-surface/30 backdrop-blur-sm border border-border-color/40 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProspects.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              onEdit={openEdit}
              onDelete={handleDeleteRequest}
              onAction={handleAction}
            />
          ))}
        </div>

        {filteredProspects.length === 0 && (
          <div className="text-center py-20 text-text-secondary">
            <RadarIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p>Nenhum prospect encontrado neste filtro.</p>
          </div>
        )}
      </div>

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
};

export default ProspectsPage;
