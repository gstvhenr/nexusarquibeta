import React from 'react';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import { marketingActivityStatuses, marketingContentTypes } from '../../types';

const inputClass = 'w-full bg-background p-2 rounded-md border border-border-color';

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
      <div>
        <label
          htmlFor="field-titulo-tema"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Título / Tema
        </label>
        <input
          id="field-titulo-tema"
          type="text"
          value={activity.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={inputClass}
          disabled={readOnly}
          placeholder="Ex: Reels Obra Residência Silva"
          aria-label="Título ou tema"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="field-data"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Data
          </label>
          <input
            id="field-data"
            type="date"
            value={activity.datePart}
            onChange={(e) => onChange('datePart', e.target.value)}
            className={inputClass}
            disabled={readOnly}
            aria-label="Data"
          />
        </div>
        <div>
          <label
            htmlFor="field-horario"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Horário
          </label>
          <input
            id="field-horario"
            type="time"
            value={activity.timePart}
            onChange={(e) => onChange('timePart', e.target.value)}
            className={inputClass}
            disabled={readOnly}
            aria-label="Hora"
          />
        </div>
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
          <label
            htmlFor="field-custo-adicional-r"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Custo Adicional (R$)
          </label>
          <input
            id="field-custo-adicional-r"
            type="number"
            value={activity.cost || ''}
            onChange={(e) => onChange('cost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={inputClass}
            disabled={readOnly}
            aria-label="Custo adicional"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="field-projeto-vinculado"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Projeto Vinculado
        </label>
        <select
          id="field-projeto-vinculado"
          value={activity.linkedProjectId || ''}
          onChange={(e) => onProjectChange(e.target.value)}
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
        <label
          htmlFor="field-descricao"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Descrição
        </label>
        <textarea
          id="field-descricao"
          value={activity.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className={inputClass}
          disabled={readOnly}
          placeholder="Detalhes do post, legenda, links..."
          aria-label="Descrição"
        />
      </div>
      <div>
        <label
          htmlFor="field-notas-internas"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Notas Internas
        </label>
        <textarea
          id="field-notas-internas"
          value={activity.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={2}
          className={inputClass}
          disabled={readOnly}
          placeholder="Observações para equipe..."
          aria-label="Notas internas"
        />
      </div>
    </div>
  );
}

export default ActivityFormFields;
