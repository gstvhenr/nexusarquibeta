/**
 * agent-task.schema.ts
 *
 * Define o contrato estático de como gerenciar ou delegar uma Tarefa.
 * Este é o schema lido pelos agentes quando precisam interagir com tarefas
 * gerenciadas através de status, e orienta o Self-Healing se malformado.
 */

import { validateAgentStructure } from './validator';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

/**
 * Interface estrita definindo a estrutura de uma Tarefa (Task).
 * Não injete propriedades adicionais a menos que documentado.
 */
export interface AgentTaskSchema {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline?: string; // Formato ISO8601 YYYY-MM-DD
}

/**
 * Type Guard que verifica a conformidade estrutural.
 */
export function isAgentTask(val: unknown): val is AgentTaskSchema {
  if (typeof val !== 'object' || val === null) return false;

  const obj = val as Record<string, unknown>;

  if (typeof obj.id !== 'string') return false;
  if (typeof obj.title !== 'string') return false;
  if (typeof obj.description !== 'string') return false;

  const validStatuses: TaskStatus[] = ['pending', 'in-progress', 'completed', 'blocked'];
  if (!validStatuses.includes(obj.status as TaskStatus)) return false;

  if (obj.deadline !== undefined && typeof obj.deadline !== 'string') return false;

  return true;
}

/**
 * Função utilitária acionada por um Workflow que recebe o output do LLM.
 * Se o LLM alucinar, esta função extrai as violações para a Pipeline de Auto-Correção.
 */
export function validateTaskPayload(payload: unknown): AgentTaskSchema {
  return validateAgentStructure<AgentTaskSchema>(
    payload,
    isAgentTask,
    'AgentTask',
    {
      id: 'string',
      title: 'string',
      description: 'string',
      status: 'string'
    }
  );
}
