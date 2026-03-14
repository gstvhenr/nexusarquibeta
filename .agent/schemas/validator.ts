/**
 * validation.ts
 *
 * Camada de runtime para Auto-Correção (Self-Healing).
 * Função utilitária que aplica um Type Guard e gera mensagens ricas
 * para o Modelo de Linguagem em caso de desvio estrutural no Schema.
 */

export interface ValidationErrorDetail {
  property: string;
  expected: string;
  received: string;
  message: string;
}

export class SchemaValidationError extends Error {
  public details: ValidationErrorDetail[];

  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'SchemaValidationError';
    this.details = details;
  }
}

/**
 * Utilitário agnóstico para validar a presença de campos num objeto.
 * Se houver falhas, constrói um array de erros descritivos projetados
 * especificamente para guiar um Agente na Auto-Correção (Self-healing).
 */
export function validateAgentStructure<T>(
  data: unknown,
  typeGuard: (val: unknown) => val is T,
  schemaContextName: string,
  requiredFields: Record<string, 'string' | 'number' | 'boolean' | 'object'>,
): T {
  // 1. O dado deve ser um Objeto
  if (typeof data !== 'object' || data === null) {
    throw new SchemaValidationError(
      `[Self-Healing] O output para '${schemaContextName}' deve ser um objeto JSON válido, mas recebeu: ${typeof data}`,
    );
  }

  const record = data as Record<string, unknown>;
  const errors: ValidationErrorDetail[] = [];

  // 2. Validação Rígida dos Campos (Semântica LLM-friendly)
  for (const [field, expectedType] of Object.entries(requiredFields)) {
    if (!(field in record)) {
      errors.push({
        property: field,
        expected: expectedType,
        received: 'undefined',
        message: `Campo MANDATÓRIO ausente: '${field}'.`,
      });
      continue;
    }

    const actualType = typeof record[field];
    if (actualType !== expectedType) {
      if (expectedType === 'object' && Array.isArray(record[field])) {
        // Exceção se array for validado separadamente no Guard
      } else {
        errors.push({
          property: field,
          expected: expectedType,
          received: actualType,
          message: `Inconsistência de tipo em '${field}': era esperado '${expectedType}'.`,
        });
      }
    }
  }

  // 3. Verifica via Type Guard customizado (Validações complexas/enums)
  if (!typeGuard(data)) {
    throw new SchemaValidationError(
      `[Self-Healing] O objeto falhou na validação customizada para '${schemaContextName}'. Estrutura incompatível com o esperado. Corrija baseando-se no contrato.`,
      errors,
    );
  }

  if (errors.length > 0) {
    const errorDetailsMsg = errors.map((e) => `- ${e.message}`).join('\n');
    throw new SchemaValidationError(
      `[Self-Healing] Rejeitado por '${schemaContextName}'. Por favor corrija sua resposta:\n${errorDetailsMsg}`,
      errors,
    );
  }

  return data as T;
}
