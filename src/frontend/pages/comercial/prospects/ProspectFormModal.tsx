import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal, Input, Textarea, FormField, Button, RadarIcon } from '@/components/ui';
import { PROSPECT_INTEREST_OPTIONS, PROSPECT_ORIGIN_OPTIONS } from '@/constants';
import type { Prospect } from '@/types';
import { formatPhone, getTodayDateOnly, parseDateString } from '@/utils/formatters';

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
        startDate: getTodayDateOnly(),
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

  const inputOverride = 'p-2 rounded-md';
  const followUpBaseDate = parseDateString(prospect.startDate);
  const followUpDeadline = followUpBaseDate
    ? new Date(followUpBaseDate.getTime() + prospect.followUpDays * 24 * 60 * 60 * 1000)
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProspect ? 'Editar Prospect' : 'Adicionar ao Radar'}
      size="2xl"
    >
      <div className="space-y-4">
        <FormField label="Nome / Interessado">
          <Input
            id="field-nome-interessado"
            type="text"
            value={prospect.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className={`${inputOverride} font-semibold`}
            aria-label="Nome"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField label="Telefone">
              <div className="flex items-center gap-2">
                <Input
                  id="field-telefone"
                  type="tel"
                  value={prospect.phone || ''}
                  onChange={(event) => handleChange('phone', formatPhone(event.target.value))}
                  maxLength={15}
                  className={inputOverride}
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
            </FormField>
          </div>
          <FormField label="Email">
            <Input
              id="field-email"
              type="email"
              value={prospect.email || ''}
              onChange={(event) => handleChange('email', event.target.value)}
              className={inputOverride}
              aria-label="Email"
            />
          </FormField>
        </div>

        <FormField label="Rede Social">
          <Input
            id="field-rede-social"
            type="text"
            value={prospect.social || ''}
            onChange={(event) => handleChange('social', event.target.value)}
            className={inputOverride}
            aria-label="Rede social"
          />
        </FormField>

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
              className={`w-full bg-background p-2 rounded-md border border-border-color text-sm transition ${inputOverride}`}
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
              className={`w-full bg-background p-2 rounded-md border border-border-color text-sm transition ${inputOverride}`}
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
            <FormField label="">
              <label
                htmlFor="field-config-radar"
                className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1"
              >
                <RadarIcon className="w-3 h-3" /> Configuração de Radar (Dias)
              </label>
              <Input
                id="field-config-radar"
                type="number"
                min="1"
                max="90"
                value={prospect.followUpDays}
                onChange={(event) => handleChange('followUpDays', event.target.value)}
                className={inputOverride}
                aria-label="Dias de radar"
              />
              <p className="text-xs text-text-secondary mt-1">
                * Ativo até {followUpDeadline?.toLocaleDateString('pt-BR') ?? 'Data inválida'}
              </p>
            </FormField>
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
              className={`w-full bg-background p-2 rounded-md border border-border-color text-sm transition ${inputOverride}`}
              aria-label="Prioridade"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <FormField label="Anotações">
          <Textarea
            id="field-anotacoes"
            value={prospect.notes || ''}
            onChange={(event) => handleChange('notes', event.target.value)}
            rows={3}
            className="p-2 rounded-md"
            placeholder="Detalhes da conversa, necessidades específicas..."
            aria-label="Anotações"
          />
        </FormField>
      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </Modal>
  );
}
