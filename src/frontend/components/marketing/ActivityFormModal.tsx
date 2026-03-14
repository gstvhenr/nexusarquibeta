import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal } from '../ui';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import ActivityFormFields from './ActivityFormFields';
import { getTodayDateOnly } from '../../utils/formatters';

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
    return {
      id: `act_${Date.now()}`,
      title: '',
      status: 'Pendente',
      contentType: 'Post (Instagram)',
      dueDate: null,
      datePart: getTodayDateOnly(),
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
    onSave({ ...cleanActivity, dueDate: dateTimeString });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        readOnly ? 'Detalhes do Conteúdo' : initialActivity ? 'Editar Conteúdo' : 'Novo Conteúdo'
      }
      size="2xl"
    >
      <ActivityFormFields
        activity={activity}
        readOnly={readOnly}
        professionals={professionals}
        projects={projects}
        onChange={handleChange}
        onProjectChange={handleProjectChange}
      />
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {!readOnly && initialActivity && (
            <Button variant="danger" onClick={() => onDelete(activity.id)}>
              Excluir
            </Button>
          )}
        </div>
        <div className="flex space-x-4">
          <Button variant="secondary" onClick={onClose}>
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly && (
            <Button variant="primary" onClick={handleSave}>
              Salvar
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ActivityFormModal;
