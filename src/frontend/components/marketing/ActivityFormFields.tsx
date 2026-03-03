import React from 'react';
import { FormField, Input, Textarea } from '../ui';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import { marketingActivityStatuses, marketingContentTypes } from '../../types';

const selectClass = 'w-full bg-background p-2 rounded-md border border-border-color';

interface ActivityFormFieldsProps {
  activity: MarketingActivity & { datePart: string; timePart: string };
  readOnly: boolean;
  professionals: MarketingProfessional[];
  projects: Project[];
  onChange: (field: string, value: string | number | null) => void;
  onProjectChange: (projectId: string) => void;
}

function ActivityFormFields({
  activity,
  readOnly,
  professionals,
  projects,
  onChange,
  onProjectChange,
}: ActivityFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField label="Título / Tema">
        <Input
          type="text"
          value={activity.title}
          onChange={(e) => onChange('title', e.target.value)}
          disabled={readOnly}
          placeholder="Ex: Reels Obra Residência Silva"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Data">
          <Input
            type="date"
            value={activity.datePart}
            onChange={(e) => onChange('datePart', e.target.value)}
            disabled={readOnly}
          />
        </FormField>
        <FormField label="Horário">
          <Input
            type="time"
            value={activity.timePart}
            onChange={(e) => onChange('timePart', e.target.value)}
            disabled={readOnly}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="field-status"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Status
          </label>
          <select
            id="field-status"
            value={activity.status}
            onChange={(e) => onChange('status', e.target.value)}
            className={selectClass}
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
          <label
            htmlFor="field-plataforma-tipo"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Plataforma / Tipo
          </label>
          <select
            id="field-plataforma-tipo"
            value={activity.contentType}
            onChange={(e) => onChange('contentType', e.target.value)}
            className={selectClass}
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
          <label
            htmlFor="field-responsavel"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Responsável
          </label>
          <select
            id="field-responsavel"
            value={activity.responsibleId}
            onChange={(e) => onChange('responsibleId', e.target.value)}
            className={selectClass}
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
        <FormField label="Custo Adicional (R$)">
          <Input
            type="number"
            value={activity.cost || ''}
            onChange={(e) => onChange('cost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={readOnly}
          />
        </FormField>
      </div>

      <FormField label="Projeto Vinculado">
        <select
          id="field-projeto-vinculado"
          value={activity.linkedProjectId || ''}
          onChange={(e) => onProjectChange(e.target.value)}
          className={selectClass}
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
      </FormField>

      <FormField label="Descrição">
        <Textarea
          value={activity.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          disabled={readOnly}
          placeholder="Detalhes do post, legenda, links..."
        />
      </FormField>
      <FormField label="Notas Internas">
        <Textarea
          value={activity.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={2}
          disabled={readOnly}
          placeholder="Observações para equipe..."
        />
      </FormField>
    </div>
  );
}

export default ActivityFormFields;
