/**
 * skill-input.schema.ts
 *
 * Define as restrições em torno de um input genérico para chamadas de Skill
 * ou Tool de agentes. Idealmente, para cada Skill complexa listada em /skills,
 * deverá existir um schema complementar neste diretório.
 */

import { validateAgentStructure } from './validator';

export interface GenericSkillInput {
  target: string; // Ex: 'clean-code'
  action: string; // Ex: 'run_analysis'
  payload: Record<string, unknown>; // Argumentos complementares
}

/**
 * Type Guard para validar a forma de entrada da Tool ou Skill.
 */
export function isGenericSkillInput(val: unknown): val is GenericSkillInput {
  if (typeof val !== 'object' || val === null) return false;

  const obj = val as Record<string, unknown>;
  if (typeof obj.target !== 'string') return false;
  if (typeof obj.action !== 'string') return false;
  if (typeof obj.payload !== 'object' || obj.payload === null) return false;

  return true;
}

/**
 * Força a validação antes da invocação da Skill. Repassa o erro de forma a
 * encorajar a auto-correção via 'Self-Healing'.
 */
export function validateSkillInput(payload: unknown): GenericSkillInput {
  return validateAgentStructure<GenericSkillInput>(
    payload,
    isGenericSkillInput,
    'GenericSkillInput',
    {
      target: 'string',
      action: 'string',
      payload: 'object',
    },
  );
}
