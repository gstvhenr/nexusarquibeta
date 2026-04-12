---
trigger: always_on
description: Disciplina de limpeza obrigatória em toda edição — previne acúmulo de código morto, imports fantasma, comentários defasados e arquivos órfãos no Nexus-Arqui
globs:
  - 'src/frontend/**/*.tsx'
  - 'src/frontend/**/*.ts'
---

# Code Hygiene — Nexus-Arqui

Esta regra é fundamental para a saúde do ERP no longo prazo. Toda edição de código — por menor que seja — **deve** incluir limpeza dos efeitos colaterais.

## Princípio Central

> **Ao modificar qualquer arquivo, você é responsável por TODOS os arquivos que ele toca.**
> Nunca deixe o projeto em estado pior do que encontrou (Regra do Escoteiro).

## Checklist Obrigatório PÓS-EDIÇÃO

Após **toda** modificação (criar, editar, renomear ou deletar), execute mentalmente:

### 1. Imports — Remover os que sobraram

```
Editou ou deletou uma função/componente?
├─ Verificar: alguém ainda importa o que foi alterado?
│  ├─ NÃO → Remover o import órfão de TODOS os consumidores
│  └─ SIM → OK, manter
│
Adicionou import novo?
├─ Verificar: o import antigo que ele substitui foi removido?
│  └─ NÃO → Remover o import antigo
```

### 2. Exports — Limpar barrels desatualizados

```
Deletou ou renomeou um arquivo reutilizável em src/frontend/components/ ou src/frontend/hooks/?
├─ Verificar barrel exports (index.ts respectivos).
├─ Atualizar barrel export com o novo nome.
├─ Atualizar TODOS os arquivos que importavam o nome antigo.
```

### 3. Código morto — Nunca deixar para depois

| Tipo                                 | Ação                     | Nunca                  |
| ------------------------------------ | ------------------------ | ---------------------- |
| Função não chamada                   | **Deletar**              | "Deixar caso precise"  |
| Variável declarada mas não usada     | **Deletar**              | "Pode servir depois"   |
| Componente não importado por ninguém | **Deletar arquivo**      | "Talvez use no futuro" |
| Hook sem consumidor                  | **Deletar arquivo**      | "Pode ser útil"        |
| Import não utilizado                 | **Deletar linha**        | "Pode precisar"        |
| Props declaradas mas não passadas    | **Remover da interface** | "Futuro uso"           |
| `console.log` de debug               | **Deletar**              | "Vou tirar depois"     |

### 4. Comentários — Manter apenas os úteis

| Manter                                      | Deletar                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| JSDoc com `@param`, `@returns`, `@example`  | `// TODO: fazer depois` sem data (Exceção: itens já no `NEXT.md`) |
| Explicação de lógica complexa de negócio    | `// Componente antigo`                                            |
| Link para documentação externa/GitHub issue | Código comentado (`// const old = ...`)                           |

**NUNCA** deixar código comentado. Se não é necessário agora, **deletar**. O Git/histórico preserva.

### 5. Arquivos — Detectar órfãos

- Ao deletar/mover qualquer tela (`src/frontend/pages/`), lembrar de deletar componentes correlatos que não são usados por mais ninguém.
- Ao deletar uma API em `src/frontend/services/`, remover os DTOs associados se estiverem órfãos e as dependências em Hooks/Components.

### 6. Duplicação — Tolerância zero

- Verifique `npm run check:duplication` como gate de segurança.
- A lógica de UI idêntica em múltiplas páginas deve migrar para `src/frontend/components/`.
- A lógica de mutação/fetch similar deve ir para hooks compartilhados ou abstrata em `src/frontend/services/`.

### 6.1. UI local em `pages/**` é dívida bloqueante

- Ao encontrar um `.tsx` visual dentro de `src/frontend/pages/**` que não seja `*Page.tsx`, mover para:
  - `src/frontend/components/ui/` quando for primitive, shell ou padrão base
  - `src/frontend/components/<dominio>/` quando for componente de domínio
- Se o arquivo não tiver consumidores reais após a migração, deletar.
- Nunca encerrar a sessão deixando UI nova em `pages/**`.

### 6.2. Ratchet de reutilização

- Nenhuma edição pode introduzir novo componente visual em `src/frontend/pages/**`.
- Toda migração estrutural deve executar `npm run validate:structure` e `npm run check:pollution`.
- Ao mover componente, atualizar barrels, imports consumidores e arquivos `types.ts` correlatos na mesma sessão.

### 7. Auto-manutenção da `.agent/` (OBRIGATÓRIO)

A `.agent/` nunca pode ficar desatualizada em relação ao código. Se o `src/frontend/` mudou estruturalmente, a `.agent/` **obrigatoriamente** muda junto na mesma edição.

```
A edição alterou a ESTRUTURA do projeto?
(nova pasta, nova lib, nova camada, novo domínio, renomeação de camada)
├─ SIM → Verificar se .agent/ reflete a realidade:
│        ├─ .agent/rules/architecture-decisions.md → "Camadas" lista a nova pasta?
│        ├─ .agent/rules/architecture-decisions.md → Árvore de decisão cobre?
│        ├─ .agent/rules/purity-boundaries.md → Regras da nova camada definidas?
│        ├─ AGENTS.md → Referências atualizadas?
│        ├─ DECISIONS-active.md → Decisão registrada?
│        └─ Se QUALQUER resposta for NÃO → Atualizar AGORA, antes de prosseguir
│
A edição alterou um CONTRATO de dados?
(novo tipo, interface modificada, DTO adicionado/removido)
├─ SIM → docs/data-contracts/types-contracts.md precisa de update?
│        └─ Se SIM → Atualizar na mesma sessão
│
A edição criou/removeu WORKFLOW, AGENT ou SKILL?
├─ SIM → Verificar:
│        ├─ behavioral-protocol.md → Tabela de auto-dispatch atualizada?
│        ├─ AGENTS.md → Lista de workflows/agents reflete realidade?
│        └─ Se QUALQUER resposta for NÃO → Atualizar AGORA
│
└─ NÃO (nenhuma alteração estrutural) → OK, .agent/ não precisa de atualização
```

### 8. Contratos de dados — Sincronizar tipos

```
Adicionou ou modificou tipo em src/frontend/types/?
├─ Verificar: services que consomem esse tipo foram atualizados?
├─ Verificar: fixtures de teste existentes refletem o novo shape?
├─ Verificar: docs/data-contracts/types-contracts.md documenta o contrato?
│
Removeu campo de um tipo?
├─ grep por nome do campo em TODOS os consumidores
├─ Remover usos órfãos (componentes, hooks, services)
```

### 9. Regras de Ouro

1. **Nunca deixar "para depois"** — Se você vê código morto durante uma edição, limpe agora
2. **Edição mínima ≠ edição isolada** — Mudar 1 arquivo pode exigir limpar 5
3. **O Git é seu backup** — Deletar código morto não é perder código. O histórico existe
4. **Import count** — Se um arquivo tem imports não usados após sua edição, sua edição está **incompleta**
5. **Arquivo sem consumidor = arquivo morto** — Se ninguém importa, não deveria existir
6. **Memória do projeto** — Ao final de cada sessão, atualizar `NEXT.md` com o que foi feito
7. **Prova de higiene** — Sempre rodar `npm run check:pollution` após edições significativas
8. **Validate:structure** — Após criar/mover arquivos, rodar `npm run validate:structure` antes de prosseguir

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
