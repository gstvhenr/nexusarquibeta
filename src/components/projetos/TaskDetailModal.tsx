import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { ProjectTask, Subtask, TaskPriority } from '../../types';
import { PlusIcon, TrashIcon } from '../ui/icons';
import { v4 as uuidv4 } from 'uuid';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTask | null;
  onSave: (updatedTask: ProjectTask) => void;
}

export const TaskDetailModal: (props: TaskDetailModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [editedTask, setEditedTask] = useState<ProjectTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTask(JSON.parse(JSON.stringify(task))); // Deep copy
    }
    setNewSubtaskTitle('');
  }, [task, isOpen]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = { id: uuidv4(), title: newSubtaskTitle, completed: false };
    setEditedTask((prev) =>
      prev ? { ...prev, subtasks: [...(prev.subtasks || []), newSub] } : null,
    );
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subId: string) => {
    setEditedTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks?.map((s) =>
              s.id === subId ? { ...s, completed: !s.completed } : s,
            ),
          }
        : null,
    );
  };

  const removeSubtask = (subId: string) => {
    setEditedTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks?.filter((s) => s.id !== subId),
          }
        : null,
    );
  };

  const priorities: TaskPriority[] = ['Baixa', 'Média', 'Alta'];

  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Tarefa" size="2xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
        {/* Header Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="field-nome-da-tarefa"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Nome da Tarefa
            </label>
            <input
              id="field-nome-da-tarefa"
              type="text"
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className={`${inputClass} font-semibold`}
              aria-label="Nome da Tarefa"
            />
          </div>
          <div>
            <label
              htmlFor="field-prazo"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Prazo
            </label>
            <input
              id="field-prazo"
              type="date"
              value={editedTask.dueDate || ''}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              className={inputClass}
              aria-label="Prazo"
            />
          </div>
          <div>
            <label
              htmlFor="field-horas-estimadas"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Horas Estimadas
            </label>
            <input
              id="field-horas-estimadas"
              type="number"
              value={editedTask.hours}
              onChange={(e) =>
                setEditedTask({ ...editedTask, hours: parseFloat(e.target.value) || 0 })
              }
              className={inputClass}
              aria-label="Horas Estimadas"
            />
          </div>
          <div>
            <label
              htmlFor="field-prioridade"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Prioridade
            </label>
            <select
              id="field-prioridade"
              value={editedTask.priority || 'Média'}
              onChange={(e) =>
                setEditedTask({ ...editedTask, priority: e.target.value as TaskPriority })
              }
              className={inputClass}
              aria-label="Prioridade"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="field-responsavel"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Responsável
            </label>
            <input
              id="field-responsavel"
              type="text"
              placeholder="Nome do responsável"
              value={editedTask.assignee || ''}
              onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
              className={inputClass}
              aria-label="Responsável"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="field-descricao-detalhada"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Descrição Detalhada
          </label>
          <textarea
            id="field-descricao-detalhada"
            rows={4}
            value={editedTask.description || ''}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className={inputClass}
            placeholder="Adicione detalhes, links, especificações ou instruções..."
            aria-label="Descrição Detalhada"
          />
        </div>

        {/* Subtasks */}
        <div>
          <label
            htmlFor="field-subtarefas"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Subtarefas
          </label>

          <div className="flex gap-2 mb-3">
            <input
              id="field-subtarefas"
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              placeholder="Adicionar nova subtarefa..."
              className="flex-1 bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
              aria-label="Nova subtarefa"
            />
            <button
              onClick={addSubtask}
              className="px-3 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
              aria-label="Adicionar subtarefa"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {editedTask.subtasks?.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 p-2 bg-background/50 rounded-md hover:bg-background transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => toggleSubtask(sub.id)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                  aria-label="Concluir subtarefa"
                />
                <span
                  className={`flex-1 text-sm ${sub.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                >
                  {sub.title}
                </span>
                <button
                  onClick={() => removeSubtask(sub.id)}
                  className="text-text-secondary/50 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remover subtarefa"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!editedTask.subtasks || editedTask.subtasks.length === 0) && (
              <p className="text-xs text-text-secondary italic text-center py-2">
                Nenhuma subtarefa adicionada.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
};
