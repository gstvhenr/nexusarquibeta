import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import type {
  MarketingProfessional,
  MarketingActivity,
  MarketingIdea,
  MarketingActivityStatus,
  Project,
  MarketingContentType,
  MarketingBillingFormat,
  Client,
} from '../types';
import {
  marketingActivityStatuses,
  marketingContentTypes,
  marketingBillingFormats,
} from '../types';
import {
  formatCurrency,
  formatDate,
  formatDateWithTime,
  getDeadlineInfo,
} from '../utils/formatters';
import { IDEA_COLORS, NAV_LINKS } from '../constants';
import {
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  XIcon as XSocialIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../components/ui';

// --- Helper Functions ---
const getResponsibleName = (id: string, professionals: MarketingProfessional[]): string => {
  if (id === 'architect') return 'Eu (Arquiteto)';
  return professionals.find((p) => p.id === id)?.name || 'Desconhecido';
};

// ... [Keep existing Charts and Sub-components] ...
// LeadSourceChart, ConversionRateChart, ProfessionalCard, ContentTypeIcon, IdeaCard, ProfessionalFormModal (Unchanged)

const LeadSourceChart: React.FC<{ clients: Client[] }> = ({ clients }) => {
  const sourceData = useMemo(() => {
    const counts = clients.reduce((acc: Record<string, number>, client) => {
      const source = client.leadSource || 'Não informado';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]: [string, number]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [clients]);

  if (sourceData.length === 0) {
    return (
      <div className="p-4 bg-background rounded-lg text-center text-sm text-text-secondary">
        Nenhum dado de origem de lead para exibir.
      </div>
    );
  }

  const maxCount = Math.max(...sourceData.map((item) => item.count), 0);

  return (
    <div className="space-y-3">
      {sourceData.map((item, index) => (
        <div key={index} className="flex items-center gap-4 text-sm">
          <div className="w-40 font-semibold text-text-primary truncate">{item.name}</div>
          <progress
            className="progress-bar progress-track-background progress-fill-primary-50 h-4 flex-1 rounded-full"
            value={maxCount > 0 ? (item.count / maxCount) * 100 : 0}
            max={100}
          />
          <div className="w-10 text-right font-bold text-secondary">{item.count}</div>
        </div>
      ))}
    </div>
  );
};

const ConversionRateChart: React.FC<{ clients: Client[] }> = ({ clients }) => {
  const conversionData = useMemo(() => {
    const sourceGroups = clients.reduce(
      (acc: Record<string, { leads: number; converted: number }>, client: Client) => {
        const source = client.leadSource || 'Não informado';
        if (!acc[source]) {
          acc[source] = { leads: 0, converted: 0 };
        }
        acc[source].leads++;
        if (client.projectLinks && client.projectLinks.length > 0) {
          acc[source].converted++;
        }
        return acc;
      },
      {},
    );

    return Object.entries(sourceGroups)
      .map(([name, data]: [string, { leads: number; converted: number }]) => ({
        name,
        rate: data.leads > 0 ? (data.converted / data.leads) * 100 : 0,
        label: `${data.converted}/${data.leads}`,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [clients]);

  if (conversionData.length === 0) {
    return (
      <div className="p-4 bg-background rounded-lg text-center text-sm text-text-secondary">
        Nenhum dado de conversão para exibir.
      </div>
    );
  }

  const maxRate = Math.max(...conversionData.map((d) => d.rate), 0);

  return (
    <div className="space-y-3">
      {conversionData.map((item, index) => (
        <div key={index} className="flex items-center gap-4 text-sm">
          <div className="w-40 font-semibold text-text-primary truncate">{item.name}</div>
          <div className="flex-1 relative">
            <progress
              className="progress-bar progress-track-background progress-fill-secondary-50 h-4 w-full rounded-full"
              value={maxRate > 0 ? (item.rate / maxRate) * 100 : 0}
              max={100}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] pointer-events-none">
              {item.rate.toFixed(0)}%
            </span>
          </div>
          <div className="w-16 text-right font-bold text-secondary">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

const ProfessionalCard: React.FC<{ professional: MarketingProfessional; onEdit: () => void }> = ({
  professional,
  onEdit,
}) => (
  <div
    onClick={onEdit}
    className="relative group bg-surface rounded-xl shadow-soft p-4 flex-shrink-0 w-64 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-accent transition-all"
  >
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 bg-background rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-border-color">
        {professional.photo ? (
          <img
            src={professional.photo}
            alt={professional.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserCircleIcon className="text-secondary/20 w-12 h-12" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text-primary break-words">{professional.name}</h4>
        <p className="text-xs text-text-secondary truncate">{professional.email}</p>
      </div>
    </div>
    <div className="text-right mt-2">
      {professional.billingFormat && (
        <p className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
          {professional.billingFormat}
        </p>
      )}
      <p className="font-semibold text-secondary mt-1">{formatCurrency(professional.cost)}</p>
    </div>
  </div>
);

const ContentTypeIcon: React.FC<{ type: MarketingContentType; className?: string }> = ({
  type,
  className = 'w-5 h-5',
}) => {
  const lcType = type.toLowerCase();
  if (lcType.includes('instagram')) return <InstagramIcon className={className} />;
  if (lcType.includes('facebook')) return <FacebookIcon className={className} />;
  if (lcType.includes('tik tok')) return <TikTokIcon className={className} />;
  if (lcType.includes(' x')) return <XSocialIcon className={className} />;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M15.903 5.238a.75.75 0 0 1 .84 1.22l-7.5 11.25a.75.75 0 0 1-1.286-.54V5a.75.75 0 0 1 .75-.75h.25a.75.75 0 0 1 .75.75v7.44l5.197-7.795Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const IdeaCard: React.FC<{
  idea: MarketingIdea;
  onEdit: () => void;
  onToggleFavorite: () => void;
}> = ({ idea, onEdit, onToggleFavorite }) => {
  const colorClasses = IDEA_COLORS[idea.color || 'yellow'] || IDEA_COLORS.yellow;
  return (
    <div
      onClick={onEdit}
      className={`relative group p-4 rounded-lg shadow-soft flex flex-col h-48 cursor-pointer transform hover:-rotate-2 transition-all duration-200 ease-in-out ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-2 right-2 p-1 rounded-full text-amber-300 hover:text-amber-400 transition-colors z-10"
        aria-label={idea.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <StarIcon solid={!!idea.isFavorite} className="w-6 h-6" />
      </button>
      {idea.title && (
        <h4 className="font-serif font-bold text-text-primary mb-2 pr-8">{idea.title}</h4>
      )}
      <p
        className={`flex-grow text-text-primary whitespace-pre-wrap font-sans text-sm ${idea.title ? '' : 'pt-4'}`}
      >
        {idea.content}
      </p>
      <span className="text-xs text-text-secondary/70 mt-2">{formatDate(idea.date)}</span>
    </div>
  );
};

// --- Modal Forms ---
const ProfessionalFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (professional: MarketingProfessional) => void;
  onDelete: (id: string) => void;
  initialProfessional: MarketingProfessional | null;
}> = ({ isOpen, onClose, onSave, onDelete, initialProfessional }) => {
  const [professional, setProfessional] = useState<Partial<MarketingProfessional>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      setProfessional(initialProfessional || {});
      setPhotoPreview(initialProfessional?.photo || null);
    }
  }, [isOpen, initialProfessional]);
  const handleChange = (field: keyof Omit<MarketingProfessional, 'id'>, value: string | number) => {
    setProfessional((p) => ({ ...p, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        // Update the state for the visual preview
        setPhotoPreview(imageDataUrl);
        // Update the professional object state that will be saved
        setProfessional((p) => ({ ...p, photo: imageDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!professional.name) return;
    const id = professional.id || `prof_${Date.now()}`;
    onSave({
      ...professional,
      id,
      name: professional.name,
      email: professional.email || '',
      phone: professional.phone || '',
    });
  };
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProfessional ? 'Editar Prestador' : 'Adicionar Prestador'}
      size="2xl"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-6 p-4 bg-background/50 rounded-lg">
          <div className="flex flex-col items-center gap-2 w-32">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center overflow-hidden border-2 border-border-color text-text-secondary">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-20 h-20 text-secondary/20" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {photoPreview ? 'Alterar' : 'Adicionar Foto'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              aria-label="Selecionar foto do profissional"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
              <input
                type="text"
                value={professional.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-background p-2 rounded-md border border-border-color"
                aria-label="Nome do profissional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Valor</label>
              <input
                type="number"
                value={professional.cost || ''}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                className="w-full bg-background p-2 rounded-md border border-border-color"
                placeholder="0.00"
                aria-label="Valor do profissional"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={professional.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color"
              aria-label="Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
            <input
              type="tel"
              value={professional.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color"
              aria-label="Telefone"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="professional-billing-format"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Formato de Cobrança
          </label>
          <select
            id="professional-billing-format"
            value={professional.billingFormat || ''}
            onChange={(e) =>
              setProfessional((p) => ({
                ...p,
                billingFormat: e.target.value as MarketingBillingFormat,
              }))
            }
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Formato de cobrança"
            title="Formato de cobrança"
          >
            <option value="">Selecione...</option>
            {marketingBillingFormats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="professional-notes"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Notas
          </label>
          <textarea
            id="professional-notes"
            value={professional.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Notas do profissional"
            title="Notas do profissional"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialProfessional && (
            <button
              type="button"
              onClick={() => onDelete(initialProfessional.id)}
              className="px-4 py-2 rounded-lg font-semibold text-error hover:bg-error/10 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ActivityFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: MarketingActivity) => void;
  onDelete: (id: string) => void;
  initialActivity: MarketingActivity | null;
  professionals: MarketingProfessional[];
  projects: Project[];
  readOnly: boolean;
}> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialActivity,
  professionals,
  projects,
  readOnly,
}) => {
  // Helper to extract time from ISO string or default
  const extractTime = (isoString: string | null) => {
    if (!isoString) return '09:00';
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitialState = useCallback(() => {
    if (initialActivity) {
      return {
        ...initialActivity,
        // Ensure date is YYYY-MM-DD for input
        datePart: initialActivity.dueDate ? initialActivity.dueDate.split('T')[0] : '',
        timePart: extractTime(initialActivity.dueDate),
      };
    }
    const now = new Date();
    return {
      id: `act_${Date.now()}`,
      title: '',
      status: 'Pendente',
      contentType: 'Post (Instagram)',
      dueDate: null,
      datePart: now.toISOString().split('T')[0],
      timePart: '09:00',
      responsibleId: 'architect',
      description: '',
      linkedProjectId: '',
      linkedProjectName: '',
      notes: '',
      cost: 0,
    } as MarketingActivity & { datePart: string; timePart: string };
  }, [initialActivity]);

  const [activity, setActivity] = useState(getInitialState());

  useEffect(() => {
    setActivity(getInitialState());
  }, [isOpen, getInitialState]);

  const handleChange = (field: string, value: string | number | null) => {
    setActivity((p) => ({ ...p, [field]: value }));
  };
  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    setActivity((p) => ({
      ...p,
      linkedProjectId: projectId,
      linkedProjectName: project ? `${project.code} - ${project.name}` : '',
    }));
  };

  const handleSave = () => {
    if (!activity.title || !activity.datePart) return;

    // Combine Date and Time
    const dateTimeString = `${activity.datePart}T${activity.timePart}:00`;
    // Create clean activity object removing temporary fields
    const { datePart, timePart, ...cleanActivity } = activity;
    const finalActivity = {
      ...cleanActivity,
      dueDate: dateTimeString,
    };

    onSave(finalActivity);
  };

  if (!isOpen) return null;
  const inputClass = 'w-full bg-background p-2 rounded-md border border-border-color';
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        readOnly ? 'Detalhes do Conteúdo' : initialActivity ? 'Editar Conteúdo' : 'Novo Conteúdo'
      }
      size="2xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Título / Tema
          </label>
          <input
            type="text"
            value={activity.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={inputClass}
            disabled={readOnly}
            placeholder="Ex: Reels Obra Residência Silva"
            aria-label="Título ou tema"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Data</label>
            <input
              type="date"
              value={activity.datePart}
              onChange={(e) => handleChange('datePart', e.target.value)}
              className={inputClass}
              disabled={readOnly}
              aria-label="Data"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Horário</label>
            <input
              type="time"
              value={activity.timePart}
              onChange={(e) => handleChange('timePart', e.target.value)}
              className={inputClass}
              disabled={readOnly}
              aria-label="Hora"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={activity.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={inputClass}
              disabled={readOnly}
              aria-label="Status"
            >
              {marketingActivityStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Plataforma / Tipo
            </label>
            <select
              value={activity.contentType}
              onChange={(e) => handleChange('contentType', e.target.value)}
              className={inputClass}
              disabled={readOnly}
              aria-label="Plataforma ou tipo"
            >
              {marketingContentTypes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Responsável
            </label>
            <select
              value={activity.responsibleId}
              onChange={(e) => handleChange('responsibleId', e.target.value)}
              className={inputClass}
              disabled={readOnly}
              aria-label="Responsável"
            >
              <option value="architect">Eu (Arquiteto)</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Custo Adicional (R$)
            </label>
            <input
              type="number"
              value={activity.cost || ''}
              onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={inputClass}
              disabled={readOnly}
              aria-label="Custo adicional"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Projeto Vinculado
          </label>
          <select
            value={activity.linkedProjectId || ''}
            onChange={(e) => handleProjectChange(e.target.value)}
            className={inputClass}
            disabled={readOnly}
            aria-label="Projeto vinculado"
          >
            <option value="">Nenhum</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
          <textarea
            value={activity.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={inputClass}
            disabled={readOnly}
            placeholder="Detalhes do post, legenda, links..."
            aria-label="Descrição"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Notas Internas
          </label>
          <textarea
            value={activity.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className={inputClass}
            disabled={readOnly}
            placeholder="Observações para equipe..."
            aria-label="Notas internas"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {!readOnly && initialActivity && (
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              className="px-4 py-2 rounded-lg font-semibold text-error hover:bg-error/10 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            {readOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
            >
              Salvar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

const IdeaFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: MarketingIdea) => void;
  onDelete: (id: string) => void;
  initialIdea: MarketingIdea | null;
}> = ({ isOpen, onClose, onSave, onDelete, initialIdea }) => {
  const [idea, setIdea] = useState<Partial<MarketingIdea>>({});
  useEffect(() => {
    if (isOpen) {
      setIdea(initialIdea || { color: 'yellow' });
    }
  }, [isOpen, initialIdea]);
  const handleSave = () => {
    if (!idea.content?.trim()) return;
    const finalIdea: MarketingIdea = {
      id: idea.id || `idea_${Date.now()}`,
      date: idea.date || new Date().toISOString(),
      title: idea.title || '',
      content: idea.content,
      color: idea.color || 'yellow',
      isFavorite: idea.isFavorite || false,
    };
    onSave(finalIdea);
  };
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialIdea ? 'Editar Ideia' : 'Nova Ideia'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Título (Opcional)
          </label>
          <input
            type="text"
            value={idea.title || ''}
            onChange={(e) => setIdea((i) => ({ ...i, title: e.target.value }))}
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Título da ideia"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Ideia</label>
          <textarea
            value={idea.content || ''}
            onChange={(e) => setIdea((i) => ({ ...i, content: e.target.value }))}
            rows={5}
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Conteúdo da ideia"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Cor da Nota</label>
          <div className="flex items-center gap-3">
            {Object.keys(IDEA_COLORS).map((colorKey) => (
              <button
                key={colorKey}
                type="button"
                onClick={() => setIdea((i) => ({ ...i, color: colorKey }))}
                className={`w-8 h-8 rounded-full ${IDEA_COLORS[colorKey].bg} ${IDEA_COLORS[colorKey].border} transition-transform hover:scale-110 ${idea.color === colorKey ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                aria-label={`Selecionar cor ${colorKey}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialIdea && (
            <button
              type="button"
              onClick={() => onDelete(initialIdea.id)}
              className="px-4 py-2 rounded-lg font-semibold text-error hover:bg-error/10 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

// --- MAIN PAGE ---
const GestaoMarketingPage: React.FC = () => {
  const {
    marketingProfessionals: professionals,
    setMarketingProfessionals: setProfessionals,
    marketingActivities: activities,
    setMarketingActivities: setActivities,
    marketingIdeas: ideas,
    setMarketingIdeas: setIdeas,
    projects,
    clients,
  } = useData();
  const location = useLocation();

  const activeView = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/conteudos')) return 'content';
    if (path.endsWith('/banco-de-ideias')) return 'ideas';
    return 'dashboard';
  }, [location.pathname]);

  const [isProfessionalModalOpen, setProfessionalModalOpen] = useState(false);
  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [itemToInteract, setItemToInteract] = useState<
    MarketingActivity | MarketingProfessional | MarketingIdea | null
  >(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState<
    'professional' | 'activity' | 'idea' | null
  >(null);
  const [activityModalMode, setActivityModalMode] = useState<'view' | 'edit'>('edit');

  const handleSaveProfessional = (prof: MarketingProfessional) => {
    setProfessionals((prev) => {
      const exists = prev.some((p) => p.id === prof.id);
      if (exists) {
        return prev.map((p) => (p.id === prof.id ? prof : p));
      }
      return [...prev, prof];
    });
    setProfessionalModalOpen(false);
  };
  const handleDeleteProfessional = (id: string) => {
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
  };
  const handleSaveActivity = (activity: MarketingActivity) => {
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === activity.id);
      if (exists) {
        return prev.map((a) => (a.id === activity.id ? activity : a));
      }
      return [...prev, activity];
    });
    setActivityModalOpen(false);
  };
  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };
  const handleSaveIdea = (idea: MarketingIdea) => {
    setIdeas((prev) => {
      const exists = prev.some((i) => i.id === idea.id);
      if (exists) {
        return prev.map((i) => (i.id === idea.id ? idea : i));
      }
      return [idea, ...prev];
    });
    setIdeaModalOpen(false);
  };
  const handleDeleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };
  const handleToggleFavoriteIdea = (id: string) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i)));
  };
  const handleToggleActivityStatus = (id: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'Concluído' ? 'Pendente' : 'Concluído',
              completionDate: a.status === 'Pendente' ? new Date().toISOString() : undefined,
            }
          : a,
      ),
    );
  };

  const openProfessionalModal = (prof: MarketingProfessional | null) => {
    setItemToInteract(prof);
    setProfessionalModalOpen(true);
  };
  const openActivityModal = (
    activity: MarketingActivity | null,
    mode: 'view' | 'edit' = 'edit',
  ) => {
    setItemToInteract(activity);
    setActivityModalMode(mode);
    setActivityModalOpen(true);
  };
  const openIdeaModal = (idea: MarketingIdea | null) => {
    setItemToInteract(idea);
    setIdeaModalOpen(true);
  };

  const handleDeleteRequest = (
    item: MarketingProfessional | MarketingActivity | MarketingIdea,
    type: 'professional' | 'activity' | 'idea',
  ) => {
    setItemToInteract(item);
    setItemTypeToDelete(type);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToInteract || !itemTypeToDelete) return;
    if (itemTypeToDelete === 'professional') handleDeleteProfessional(itemToInteract.id);
    if (itemTypeToDelete === 'activity') handleDeleteActivity(itemToInteract.id);
    if (itemTypeToDelete === 'idea') handleDeleteIdea(itemToInteract.id);
    setDeleteModalOpen(false);
    setItemToInteract(null);
    setItemTypeToDelete(null);
  };

  const PainelView: React.FC = () => {
    const kpiData = useMemo(() => {
      const pendingActivities = activities.filter((a) => a.status === 'Pendente');
      const totalCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
      return {
        professionals: professionals.length,
        pendingActivities: pendingActivities.length,
        totalCost: formatCurrency(totalCost),
        ideas: ideas.length,
      };
    }, [professionals, activities, ideas]);

    return (
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
            <p className="text-4xl font-bold text-secondary">{kpiData.professionals}</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">Prestadores</p>
          </div>
          <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
            <p className="text-4xl font-bold text-secondary">{kpiData.pendingActivities}</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">Conteúdos Pendentes</p>
          </div>
          <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
            <p className="text-4xl font-bold text-secondary">{kpiData.totalCost}</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">Custo Total</p>
          </div>
          <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
            <p className="text-4xl font-bold text-secondary">{kpiData.ideas}</p>
            <p className="text-sm font-semibold text-text-secondary mt-1">Ideias no Banco</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl font-bold text-secondary">Prestadores de Serviço</h3>
          </div>
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {professionals.map((p) => (
              <ProfessionalCard
                key={p.id}
                professional={p}
                onEdit={() => openProfessionalModal(p)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-secondary mb-4">
              Origem de Leads (Clientes Convertidos)
            </h3>
            <LeadSourceChart clients={clients} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-secondary mb-4">
              Taxa de Conversão por Origem
            </h3>
            <ConversionRateChart clients={clients} />
          </div>
        </div>
      </div>
    );
  };

  const ConteudosListView: React.FC = () => {
    // Sort activities by date descending (newest/future first)
    const sortedActivities = useMemo(() => {
      return [...activities].sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateB - dateA;
      });
    }, [activities]);

    return (
      <div className="p-6">
        <div className="bg-surface rounded-xl shadow-soft overflow-hidden border border-border-color/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/50 text-xs font-semibold text-text-secondary uppercase border-b border-border-color">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">Status</th>
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4">Conteúdo</th>
                  <th className="px-6 py-4">Custo</th>
                  <th className="px-6 py-4">Observações</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/50">
                {sortedActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className={`hover:bg-background/30 transition-colors ${activity.status === 'Concluído' ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActivityStatus(activity.id)}
                        className={`p-1 rounded-full border-2 transition-all ${activity.status === 'Concluído' ? 'bg-success border-success text-white' : 'bg-transparent border-border-color text-transparent hover:border-success'}`}
                        title={
                          activity.status === 'Concluído'
                            ? 'Marcar como Pendente'
                            : 'Confirmar Realização'
                        }
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary flex items-center gap-2">
                        {formatDate(activity.dueDate)}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {activity.dueDate
                          ? new Date(activity.dueDate).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '--:--'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ContentTypeIcon
                          type={activity.contentType}
                          className="w-4 h-4 text-secondary"
                        />
                        <span className="font-bold text-text-primary">{activity.title}</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {activity.contentType}{' '}
                        {activity.linkedProjectName ? `• ${activity.linkedProjectName}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-text-primary">
                      {activity.cost && activity.cost > 0 ? formatCurrency(activity.cost) : '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p
                        className="text-xs text-text-secondary truncate"
                        title={activity.notes || activity.description}
                      >
                        {activity.notes || activity.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openActivityModal(activity, 'edit')}
                          className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(activity, 'activity')}
                          className="p-1.5 text-text-secondary hover:text-error rounded-full hover:bg-error/10 transition-colors"
                          title="Excluir"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedActivities.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                      Nenhum conteúdo agendado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const BancoDeIdeiasView: React.FC = () => {
    const sortedIdeas = useMemo(
      () =>
        [...ideas].sort(
          (a, b) =>
            (b.isFavorite ? 1 : -1) - (a.isFavorite ? 1 : -1) ||
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      [ideas],
    );
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={() => openIdeaModal(idea)}
              onToggleFavorite={() => handleToggleFavoriteIdea(idea.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  const marketingIcon = NAV_LINKS.find((link) => link.label === 'Marketing')?.icon;

  const renderContent = () => {
    switch (activeView) {
      case 'content':
        return <ConteudosListView />;
      case 'ideas':
        return <BancoDeIdeiasView />;
      default:
        return <PainelView />;
    }
  };

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <PageHeader title="Gestão de Marketing" icon={marketingIcon}>
        {activeView === 'dashboard' && (
          <button
            type="button"
            onClick={() => openProfessionalModal(null)}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Adicionar Prestador
          </button>
        )}
        {activeView === 'content' && (
          <button
            type="button"
            onClick={() => openActivityModal(null, 'edit')}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Novo Conteúdo
          </button>
        )}
        {activeView === 'ideas' && (
          <button
            type="button"
            onClick={() => openIdeaModal(null)}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Nova Ideia
          </button>
        )}
      </PageHeader>

      {/* Nav Links Removed - Navigation handled by Sidebar */}

      <div className="flex-1 overflow-y-auto">{renderContent()}</div>

      <ProfessionalFormModal
        isOpen={isProfessionalModalOpen}
        onClose={() => setProfessionalModalOpen(false)}
        onSave={handleSaveProfessional}
        onDelete={(id) => handleDeleteRequest({ id } as MarketingProfessional, 'professional')}
        initialProfessional={itemToInteract as MarketingProfessional | null}
      />
      <ActivityFormModal
        isOpen={isActivityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        onSave={handleSaveActivity}
        onDelete={(id) => handleDeleteRequest({ id } as MarketingActivity, 'activity')}
        initialActivity={itemToInteract as MarketingActivity | null}
        professionals={professionals}
        projects={projects}
        readOnly={activityModalMode === 'view'}
      />
      <IdeaFormModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        onSave={handleSaveIdea}
        onDelete={(id) => handleDeleteRequest({ id } as MarketingIdea, 'idea')}
        initialIdea={itemToInteract as MarketingIdea | null}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={(itemToInteract as any)?.name || (itemToInteract as any)?.title || ''}
        itemType={itemTypeToDelete || ''}
      />
    </div>
  );
};

export default GestaoMarketingPage;
