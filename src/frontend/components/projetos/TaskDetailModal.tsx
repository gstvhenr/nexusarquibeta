import React, { useState, useEffect } from 'react';
import { Button, FormField, Input, Modal, Textarea } from '../ui';
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

  const isDelegated = Boolean(editedTask.assignee?.startsWith('Freelancer:'));

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Tarefa" size="2xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
        {isDelegated && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <p className="text-sm text-primary font-medium">
              Tarefa delegada ao freelancer — edição bloqueada. Gerencie pelo módulo de
              Subcontratação.
            </p>
          </div>
        )}

        {/* Header Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome da Tarefa" className="col-span-1 md:col-span-2">
            <Input
              type="text"
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className={`font-semibold ${isDelegated ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-label="Nome da Tarefa"
              disabled={isDelegated}
            />
          </FormField>
          <FormField label="Prazo">
            <Input
              type="date"
              value={editedTask.dueDate || ''}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              aria-label="Prazo"
              disabled={isDelegated}
              className={isDelegated ? 'opacity-60 cursor-not-allowed' : ''}
            />
          </FormField>
          <FormField label="Horas Estimadas">
            <Input
              type="number"
              value={isDelegated ? 0 : editedTask.hours}
              onChange={(e) =>
                setEditedTask({ ...editedTask, hours: parseFloat(e.target.value) || 0 })
              }
              aria-label="Horas Estimadas"
              disabled={isDelegated}
              className={isDelegated ? 'opacity-50 cursor-not-allowed' : ''}
            />
            {isDelegated && (
              <p className="text-xs text-text-secondary mt-1 italic">
                Horas não se aplicam a tarefas delegadas ao freelancer.
              </p>
            )}
          </FormField>
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
              className={`w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm ${isDelegated ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-label="Prioridade"
              disabled={isDelegated}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Responsável">
            <Input
              type="text"
              placeholder="Nome do responsável"
              value={editedTask.assignee || ''}
              onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
              aria-label="Responsável"
              disabled={isDelegated}
              className={isDelegated ? 'opacity-50 cursor-not-allowed' : ''}
            />
            {isDelegated && (
              <p className="text-xs text-text-secondary mt-1 italic">
                Gerenciado pela subcontratação.
              </p>
            )}
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Descrição Detalhada">
          <Textarea
            rows={4}
            value={editedTask.description || ''}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            placeholder="Adicione detalhes, links, especificações ou instruções..."
            aria-label="Descrição Detalhada"
            disabled={isDelegated}
            className={isDelegated ? 'opacity-60 cursor-not-allowed' : ''}
          />
        </FormField>

        {/* Subtasks */}
        <div>
          <label
            htmlFor="field-subtarefas"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Subtarefas
          </label>

          {!isDelegated && (
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
          )}

          <div className="space-y-2">
            {editedTask.subtasks?.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 p-2 bg-background/50 rounded-md hover:bg-background transition-colors group"
              >
                <input
                  id={`subtask-${sub.id}`}
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => toggleSubtask(sub.id)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                  aria-label="Concluir subtarefa"
                  disabled={isDelegated}
                />
                <span
                  className={`flex-1 text-sm ${sub.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                >
                  {sub.title}
                </span>
                {!isDelegated && (
                  <button
                    onClick={() => removeSubtask(sub.id)}
                    className="text-text-secondary/50 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remover subtarefa"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
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
        {isDelegated ? (
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Salvar
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
