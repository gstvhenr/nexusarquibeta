import type { ClientFormNotesTabProps } from './types';

export const ClientFormNotesTab = ({
  fieldId,
  client,
  initialClient,
  isReadOnly,
  commonInputClass,
  onChange,
  getModifiedClass,
}: ClientFormNotesTabProps) => (
  <div className="space-y-2">
    <label
      className="block text-sm font-medium text-text-secondary"
      htmlFor={fieldId('generalNotes')}
    >
      Observações Gerais
    </label>
    <textarea
      id={fieldId('generalNotes')}
      value={client.generalNotes || ''}
      onChange={(e) => onChange('generalNotes', e.target.value)}
      rows={12}
      placeholder="Adicione anotações gerais sobre o cliente, preferências, histórico de contatos, etc."
      className={`${commonInputClass} ${getModifiedClass(client.generalNotes, initialClient?.generalNotes)}`}
      disabled={isReadOnly}
    />
  </div>
);
