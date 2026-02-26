import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal, RadarIcon } from '../../components/ui';
import { PROSPECT_INTEREST_OPTIONS, PROSPECT_ORIGIN_OPTIONS } from '../../constants';
import type { Prospect } from '../../types';
import { formatPhone } from '../../utils/formatters';

type ProspectFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prospect: Prospect) => void;
  initialProspect: Prospect | null;
};

const buildInitialProspect = (initialProspect: Prospect | null): Prospect =>
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
      };

export function ProspectFormModal({
  isOpen,
  onClose,
  onSave,
  initialProspect,
}: ProspectFormModalProps): JSX.Element | null {
  const getInitial = useCallback(
    (): Prospect => buildInitialProspect(initialProspect),
    [initialProspect],
  );

  const [prospect, setProspect] = useState<Prospect>(getInitial());

  useEffect(() => {
    if (isOpen) setProspect(getInitial());
  }, [isOpen, getInitial]);

  const handleChange = (field: keyof Prospect, value: Prospect[keyof Prospect]) => {
    setProspect((prev) => {
      let newValue = value;
      if (field === 'followUpDays') {
        newValue = Math.min(90, Math.max(1, parseInt(String(value), 10) || 0));
      }
      return { ...prev, [field]: newValue };
    });
  };

  const handleSave = () => {
    if (!prospect.name.trim()) {
      alert('Nome é obrigatório.');
      return;
    }

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
          <label
            htmlFor="field-nome-interessado"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Nome / Interessado
          </label>
          <input
            id="field-nome-interessado"
            type="text"
            value={prospect.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className={`${inputClass} font-semibold`}
            aria-label="Nome"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-telefone"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Telefone
            </label>
            <div className="flex items-center gap-2">
              <input
                id="field-telefone"
                type="tel"
                value={prospect.phone || ''}
                onChange={(event) => handleChange('phone', formatPhone(event.target.value))}
                maxLength={15}
                className={inputClass}
                aria-label="Telefone"
              />
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={prospect.hasWhatsApp || false}
                  onChange={(event) => handleChange('hasWhatsApp', event.target.checked)}
                  className="rounded accent-primary"
                  aria-label="Telefone possui WhatsApp"
                />
                WhatsApp
              </label>
            </div>
          </div>
          <div>
            <label
              htmlFor="field-email"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Email
            </label>
            <input
              id="field-email"
              type="email"
              value={prospect.email || ''}
              onChange={(event) => handleChange('email', event.target.value)}
              className={inputClass}
              aria-label="Email"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="field-rede-social"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Rede Social
          </label>
          <input
            id="field-rede-social"
            type="text"
            value={prospect.social || ''}
            onChange={(event) => handleChange('social', event.target.value)}
            className={inputClass}
            aria-label="Rede social"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-origem"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Origem
            </label>
            <select
              id="field-origem"
              value={prospect.origin}
              onChange={(event) => handleChange('origin', event.target.value)}
              className={inputClass}
              aria-label="Origem"
            >
              {PROSPECT_ORIGIN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="field-interesse"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Interesse
            </label>
            <select
              id="field-interesse"
              value={prospect.interest}
              onChange={(event) => handleChange('interest', event.target.value)}
              className={inputClass}
              aria-label="Interesse"
            >
              {PROSPECT_INTEREST_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-config-radar"
              className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1"
            >
              <RadarIcon className="w-3 h-3" /> Configuração de Radar (Dias)
            </label>
            <input
              id="field-config-radar"
              type="number"
              min="1"
              max="90"
              value={prospect.followUpDays}
              onChange={(event) => handleChange('followUpDays', event.target.value)}
              className={inputClass}
              aria-label="Dias de radar"
            />
            <p className="text-xs text-text-secondary mt-1">
              * Ativo até{' '}
              {new Date(
                new Date(prospect.startDate).getTime() +
                  prospect.followUpDays * 24 * 60 * 60 * 1000,
              ).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <label
              htmlFor="field-prioridade"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Prioridade
            </label>
            <select
              id="field-prioridade"
              value={prospect.priority}
              onChange={(event) => handleChange('priority', event.target.value)}
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
          <label
            htmlFor="field-anotacoes"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Anotações
          </label>
          <textarea
            id="field-anotacoes"
            value={prospect.notes || ''}
            onChange={(event) => handleChange('notes', event.target.value)}
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
}
