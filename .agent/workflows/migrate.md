---
description: Safe IndexedDB schema and data contract migration. Validates backward compatibility, read/write integrity, and updates all contract layers.
---

# /migrate - Migração de Schema/Contrato IndexedDB

$ARGUMENTS

---

## Propósito

Guiar migrações de schema IndexedDB e mudanças de contrato de dados de forma **segura e rastreável**. Protege a integridade dos dados do usuário do ERP.

> ⚠️ **AGENTS.md regra dura:** "Não mexer em persistência (`src/services/infrastructure/*`) sem validar leitura/escrita básica."

---

## 🔴 Regras Invioláveis

1. **Backward compatibility** — dados existentes devem continuar legíveis
2. **Validar leitura/escrita** antes e depois da migração
3. **Atualizar todas as 4 camadas de contrato** (tipos → serviços → fixtures → docs)
4. **Registrar em ADR** se mudança estrutural
5. **Sem migration destrutiva** — não apagar stores sem backup/fallback

---

## Comportamento

### 1. Definir a mudança

| Pergunta                           | Resposta obrigatória                                      |
| ---------------------------------- | --------------------------------------------------------- |
| Qual store/entidade será alterada? | Ex: `projects`, `proposals`                               |
| Tipo de mudança?                   | Adicionar campo / Remover campo / Mudar tipo / Nova store |
| Há dados existentes afetados?      | Sim/Não — se Sim, qual a estratégia de migração?          |
| É reversível?                      | Sim/Não                                                   |

### 2. Verificar estado atual

// turbo

Confirmar que o baseline está verde antes de mexer em persistência:

```powershell
npm run verify
```

Inspecionar o schema atual em `src/services/infrastructure/`:

- Identificar versão atual do banco (se versionado)
- Listar stores e índices existentes
- Verificar se há dados no browser que serão afetados

### 3. Implementar migração

**Ordem obrigatória:**

1. **Tipos** — atualizar interface em `src/types/`
2. **Infraestrutura** — atualizar schema em `src/services/infrastructure/`
3. **Serviços** — atualizar funções que leem/escrevem a entidade
4. **Fixtures** — atualizar `src/test/fixtures/` com novos campos
5. **Golden test** — atualizar `src/test/golden-fixtures.test.ts`
6. **Documentação** — atualizar `docs/data-contracts/types-contracts.md`

### 4. Validar leitura/escrita

// turbo

```powershell
npm run test
```

Além dos testes automatizados, verificar manualmente ou via teste:

- ✅ Dados novos são gravados corretamente
- ✅ Dados existentes (formato antigo) são lidos sem erro
- ✅ Campos novos têm default/fallback para registros antigos

### 5. Verificar gates

// turbo

```powershell
npm run verify
```

### 6. Registrar decisão

- Criar/atualizar ADR em `docs/adr/` se mudança estrutural
- Atualizar `DECISIONS-active.md`
- Atualizar `NEXT.md`

---

## Output Format

```markdown
## 🔀 Migrate: [Entidade] — [Descrição curta]

### Definição

| Item              | Valor                          |
| ----------------- | ------------------------------ |
| Store/Entidade    | [nome]                         |
| Tipo de mudança   | [adicionar/remover/mudar/nova] |
| Dados existentes? | [Sim/Não]                      |
| Reversível?       | [Sim/Não]                      |
| Estratégia        | [default value/lazy migration] |

### Camadas Atualizadas

- [x] `src/types/[entidade].ts`
- [x] `src/services/infrastructure/[store].ts`
- [x] `src/services/[entidade]Service.ts`
- [x] `src/test/fixtures/[entidade].ts`
- [x] `golden-fixtures.test.ts`
- [x] `docs/data-contracts/types-contracts.md`

### Validação de Integridade

| Cenário           | Resultado |
| ----------------- | --------- |
| Gravar dado novo  | ✅/❌     |
| Ler dado antigo   | ✅/❌     |
| Campo com default | ✅/❌     |
| npm run verify    | ✅/❌     |

### ADR

- [x] `docs/adr/XXXX-[titulo].md` criado/atualizado
```

---

## Estratégias de Migração

| Estratégia          | Quando usar              | Exemplo                                      |
| ------------------- | ------------------------ | -------------------------------------------- |
| **Default value**   | Adicionar campo opcional | `newField ?? defaultValue`                   |
| **Lazy migration**  | Atualizar formato ao ler | Converter no getter, gravar formato novo     |
| **Batch migration** | Mudar todos de uma vez   | Script que lê e reescreve todos os registros |
| **Nova store**      | Domínio novo             | Criar store sem afetar existentes            |

---

## Exemplos de Uso

```text
/migrate adicionar campo recorrência em Project
/migrate mudar formato de datas de string para ISO
/migrate nova store para agenda/eventos
/migrate remover campo legado observacoesAntigas de Client
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
