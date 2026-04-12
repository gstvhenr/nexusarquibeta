---
trigger: always_on
description: Regras de camadas, fronteiras de importação e localização de arquivos do Nexus-Arqui
globs:
  - 'src/frontend/**/*.tsx'
  - 'src/frontend/**/*.ts'
---

# Architecture Rules — Nexus-Arqui

Estas regras são sempre ativas. Violá-las causa regressões estruturais.

## Camadas do Projeto

```
src/frontend/pages/       → Páginas principais (1 pasta por rota)
src/frontend/components/  → Componentes UI reutilizáveis
src/frontend/hooks/       → Custom hooks compartilhados (lógica de estado)
src/frontend/services/    → Lógica de negócio e APIs (infraestrutura isolada)
src/frontend/utils/       → Funções puras (sem dependências React)
src/frontend/types/       → Tipagens e contratos TypeScript (Data Contracts)
```

## Árvores de Decisão (para casos ambíguos)

### "Onde coloco este arquivo .ts/.tsx?"

```
É um componente UI?
├─ SIM → src/frontend/components/
│        Primitive/base? → src/frontend/components/ui/
│        Domínio/feature? → src/frontend/components/<dominio>/
│        NUNCA em src/frontend/pages/**, mesmo quando houver um único consumidor inicial
│
└─ NÃO → Usa React Hooks (useState, useEffect, etc.)?
         ├─ SIM → src/frontend/hooks/
         │
         └─ NÃO → Tem lógica de negócio, integrações ou dados?
                  ├─ SIM → src/frontend/services/
                  │
                  └─ NÃO → É função puramente de transformação (ex: math, date)?
                           ├─ SIM → src/frontend/utils/
                           └─ NÃO → É uma tipagem DTO ou de Domínio?
                                    → src/frontend/types/
```

### "Isso é um hook ou um util?"

```
Usa useState, useEffect, useRef ou outro React hook?
├─ SIM → É um HOOK
│        Global (2+ consumidores)? → src/frontend/hooks/use<Feature>.ts
│        Page-scoped?             → src/frontend/pages/<dom>/<feat>/use<Feature>.ts
│        Obrigações: prefixo use, named export, cleanup em useEffect
│
└─ NÃO → É uma função pura (sem React, DOM, I/O)?
         ├─ SIM → É um UTIL → src/frontend/utils/<topic>.ts
         │        Obrigações: zero deps de React, zero DOM, zero side effects
         │
         └─ NÃO → Faz acesso a dados, storage, API ou I/O?
                  ├─ SIM → É um SERVICE → src/frontend/services/<name>Service.ts
                  │        (Infraestrutura: services/infrastructure/)
                  │
                  └─ NÃO → Provavelmente é um hook wrapping useEffect
                           → src/frontend/hooks/
```

### "Isso vai em services/ ou em utils?"

```
Faz I/O (storage, fetch, IndexedDB, API externa)?
├─ SIM → src/frontend/services/
│        Toca infraestrutura (storage, seed, adapter)? → services/infrastructure/
│        Toca domínio (CRUD, cálculos com persistência)? → services/<name>Service.ts
│
└─ NÃO → Transforma ou processa dados de forma pura?
         ├─ SIM → src/frontend/utils/<topic>.ts
         │        Exemplos: formatCurrency(), calculateBudget(), validateCPF()
         │
         └─ NÃO → É um tipo/interface?
                  → src/frontend/types/<domain>.ts
```

### "Esse tipo novo vai em types/ ou fica co-locado?"

```
O tipo é reutilizado entre 2+ domínios ou entre Service ↔ UI?
├─ SIM → src/frontend/types/<domain>.ts (Data Contract)
│        Obrigação: atualizar docs/data-contracts/types-contracts.md
│
└─ NÃO → É exclusivo de uma feature/página?
         ├─ SIM → Co-locar: src/frontend/pages/<dom>/<feat>/types.ts
         │
         └─ NÃO → É tipo genérico de infraestrutura?
                  → src/frontend/types/infrastructure.ts
```

### "Este arquivo novo precisa de barrel export?"

```
Onde está o arquivo?
├─ src/frontend/components/ui/     → SIM, atualizar/criar index.ts
├─ src/frontend/components/<dom>/  → SIM, quando 2+ arquivos no diretório
├─ src/frontend/hooks/             → SIM, atualizar index.ts (se existir)
├─ src/frontend/utils/             → SIM, atualizar index.ts (se existir)
├─ src/frontend/services/          → DEPENDE (barrel se 3+ services no mesmo nível)
├─ src/frontend/types/             → NÃO (imports diretos por nome de domínio)
├─ src/frontend/pages/             → NÃO (importado diretamente em App.tsx)
└─ src/frontend/constants/         → NÃO (imports diretos)
```

---

## Evolução Arquitetural — Novas Bibliotecas e Camadas

Quando uma nova biblioteca ou padrão for introduzido, usar esta árvore de decisão:

### "Onde coloco o código da nova biblioteca?"

```
A biblioteca gera ESTADO GLOBAL (Zustand, Redux, Jotai)?
├─ SIM → Criar src/frontend/stores/
│        Regra: 1 store por arquivo, named exports
│        Barrel: src/frontend/stores/index.ts → SIM
│        Boundary: pages/ e hooks/ podem importar. utils/ NÃO.

A biblioteca faz REQUISIÇÕES HTTP (Axios, React Query, SWR)?
├─ SIM → Integrar em src/frontend/services/
│        Regra: 1 service por domínio (<domain>Service.ts)
│        Adapters HTTP → services/infrastructure/
│        NÃO criar pasta nova — reutilizar services/

A biblioteca gerencia FORMULÁRIOS (React Hook Form, Formik, Zod)?
├─ SIM → Integrar nos componentes de input existentes
│        Hook wrapper → src/frontend/hooks/useForm<Feature>.ts
│        Schemas de validação → src/frontend/utils/validation/
│        NÃO criar pasta nova

A biblioteca adiciona TESTES (Vitest, Testing Library, Playwright)?
├─ SIM → Arquivos de teste CO-LOCADOS com o arquivo testado
│        Convenção: Component.test.tsx junto de Component.tsx
│        Harness/fixtures: src/frontend/test/
│        NÃO criar pasta __tests__/ separada

A biblioteca adiciona INTERNACIONALIZAÇÃO (i18next)?
├─ SIM → Centralizar em src/frontend/constants/strings/
│        Adaptar textos para exportar via i18n
│        NÃO criar arquivos .json de tradução separados

Outro caso?
├─ Perguntar: "Produz COMPONENTES VISUAIS?"
│  ├─ SIM → Integrar em src/frontend/components/<place>/
│  └─ NÃO → "Produz LÓGICA REATIVA (React hooks)?"
│     ├─ SIM → src/frontend/hooks/
│     └─ NÃO → "É uma FUNÇÃO PURA?"
│        ├─ SIM → src/frontend/utils/
│        └─ NÃO → Criar nova camada src/frontend/<nome>/
│                  E OBRIGATORIAMENTE atualizar:
│                  1. Este arquivo (architecture-decisions.md)
│                  2. ARCHITECTURE.md
│                  3. purity-boundaries.md
│                  4. AGENTS.md (se boundary nova)
│                  5. docs/PLACEMENT_RULES.md
```

### Regra de Ouro para Novas Camadas

Ao criar qualquer nova pasta em `src/frontend/`:

1. **Atualizar `.agent/rules/architecture-decisions.md`** — "Camadas" + "Árvore de decisão"
2. **Atualizar `ARCHITECTURE.md`** — Mapa de diretórios
3. **Atualizar `.agent/rules/purity-boundaries.md`** — Quem pode importar quem
4. **Atualizar `docs/PLACEMENT_RULES.md`** — Registrar na Decision Tree oficial
5. **Definir barrel export** — Criar `index.ts` se 2+ arquivos reutilizáveis
6. **Manter hierarquia unidirecional** — `pages → components → hooks → services → utils → types`

**NUNCA** criar pasta nova em `src/frontend/` sem atualizar toda a documentação `.agent/`.

---

### Regras de Ouro de Posicionamento

1. Nunca crie lógica de negócio forte em `src/frontend/pages/`.
2. `src/frontend/pages/**` existe apenas para rota, composição e conexão com hooks/context.
3. `*Page.tsx` não pode importar `./Subcomponent.tsx` visual local; toda UI deve vir de `components/ui` ou `components/<dominio>`.
4. Nunca acesse `localStorage` ou APIs diretas em `src/frontend/components/`. Crie hooks ou services.
5. Tipos devem sempre convergir para `src/frontend/types/` (Data Contracts) se compartilhados entre Backend Mock/Service e UI.
6. Nunca crie arquivo em `src/frontend/` sem consultar `docs/PLACEMENT_RULES.md`.
7. Após criar/mover arquivo, rodar `npm run validate:structure` e tratar violações como bloqueantes.

## Ratchet de composição visual

1. Nenhuma página pode depender de componente visual co-localizado em `src/frontend/pages/**`.
2. Todo primitive novo nasce em `src/frontend/components/ui/` com export via barrel.
3. Componentes visuais reutilizáveis, mesmo com consumidor único inicial, nascem em `src/frontend/components/<dominio>/`.
4. Hooks page-scoped continuam permitidos em `src/frontend/pages/**` apenas quando orquestram a page e não renderizam JSX.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
