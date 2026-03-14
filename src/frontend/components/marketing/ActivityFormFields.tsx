import { FormField, Input, Select, Textarea } from '../ui';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import { marketingActivityStatuses, marketingContentTypes } from '../../types';

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
        <Select
          label="Status"
          value={activity.status}
          onChange={(e) => onChange('status', e.target.value)}
          options={marketingActivityStatuses.map((s) => ({ value: s, label: s }))}
          disabled={readOnly}
          aria-label="Status"
        />
        <Select
          label="Plataforma / Tipo"
          value={activity.contentType}
          onChange={(e) => onChange('contentType', e.target.value)}
          options={marketingContentTypes.map((c) => ({ value: c, label: c }))}
          disabled={readOnly}
          aria-label="Plataforma ou tipo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Responsável"
          value={activity.responsibleId}
          onChange={(e) => onChange('responsibleId', e.target.value)}
          options={[
            { value: 'architect', label: 'Eu (Arquiteto)' },
            ...professionals.map((p) => ({ value: p.id, label: p.name })),
          ]}
          disabled={readOnly}
          aria-label="Responsável"
        />
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

      <Select
        label="Projeto Vinculado"
        value={activity.linkedProjectId || ''}
        onChange={(e) => onProjectChange(e.target.value)}
        options={[
          { value: '', label: 'Nenhum' },
          ...projects.map((p) => ({
            value: p.id,
            label: p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`,
          })),
        ]}
        disabled={readOnly}
        aria-label="Projeto vinculado"
      />

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
