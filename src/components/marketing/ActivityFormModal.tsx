import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '../ui';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import { marketingActivityStatuses, marketingContentTypes } from '../../types';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: MarketingActivity) => void;
  onDelete: (id: string) => void;
  initialActivity: MarketingActivity | null;
  professionals: MarketingProfessional[];
  projects: Project[];
  readOnly: boolean;
}

const ActivityFormModal: (props: ActivityFormModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialActivity,
  professionals,
  projects,
  readOnly,
}) => {
  const extractTime = (isoString: string | null) => {
    if (!isoString) return '09:00';
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitialState = useCallback(() => {
    if (initialActivity) {
      return {
        ...initialActivity,
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

    const dateTimeString = `${activity.datePart}T${activity.timePart}:00`;
    const { datePart: _datePart, timePart: _timePart, ...cleanActivity } = activity;
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
            onChange={(e) => handleChange('title', e.target.value)}
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
              onChange={(e) => handleChange('datePart', e.target.value)}
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
              onChange={(e) => handleChange('timePart', e.target.value)}
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
            <label
              htmlFor="field-plataforma-tipo"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Plataforma / Tipo
            </label>
            <select
              id="field-plataforma-tipo"
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
            <label
              htmlFor="field-responsavel"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Responsável
            </label>
            <select
              id="field-responsavel"
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
              onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
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
          <label
            htmlFor="field-descricao"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Descrição
          </label>
          <textarea
            id="field-descricao"
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
          <label
            htmlFor="field-notas-internas"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Notas Internas
          </label>
          <textarea
            id="field-notas-internas"
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

export default ActivityFormModal;
