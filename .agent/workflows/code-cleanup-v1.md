---
description:
---

# Workflow: Code Cleanup (Agent-First)

// turbo-all

## Objetivo

Executar limpeza de código no Nexus-Arqui de forma incremental, auditável e alinhada ao `AGENTS.md`, preservando contratos e garantindo evidência objetiva com gate final.

## Gatilho de uso

Use este workflow quando o comando interno for `/code-cleanup` ou quando a tarefa exigir limpeza estrutural, legibilidade e governança sem refactor big-bang.

## Pré-flight obrigatório (sessão sem memória)

1. Ler `AGENTS.md`, `NEXT.md`, `ARCHITECTURE.md`.
2. Registrar no `PLAN.md` o escopo exato, fora de escopo, riscos e critérios binários.
3. Rodar o baseline oficial definido em `AGENTS.md`.
4. Rodar `git status` e registrar no `PLAN.md` se o worktree está sujo.
5. Verificar o "don't touch list" do `AGENTS.md` e declarar explicitamente no plano se algum arquivo sensível será tocado.

## Memória zero e decisões (obrigatório)

- Toda decisão importante deve virar artefato no repo: commit com mensagem clara e/ou nota curta.
- Se a decisão impacta estrutura ou contrato, registrar em `DECISIONS.md` e/ou `docs/adr/*`.
- Nenhuma decisão fica apenas no chat.

## Diagnóstico rápido do repo (obrigatório antes de mexer)

Registre um resumo curto no `PLAN.md` (ou em nota curta se necessário) com:

- Estrutura: monorepo ou single repo.
- Pastas principais na raiz e em `src/`.
- Scripts relevantes do `package.json` (apenas referência; não duplicar lista de comandos).
- Configs detectadas: `tsconfig*`, ESLint, Prettier.

## Stack do Nexus-Arqui (snapshot)

- TypeScript: `tsconfig.json`.
- ESLint: `eslint.config.mjs`.
- Prettier: `.prettierrc.json`.
- Build/test: Vite (`vite.config.ts`) e Vitest (`vitest.config.ts`).
- CSS pipeline: Tailwind (`tailwind.config.cjs`) + PostCSS (`postcss.config.cjs`).

Nota: comandos oficiais vivem no `AGENTS.md`; não duplicar listas aqui.

## Regras de escopo e diffs

- Não fazer mudanças amplas sem necessidade.
- Limite de escopo: 3-5 arquivos principais por mudança, salvo justificativa registrada.
- Uma mudança verificável por sessão/PR.
- Não adicionar dependências sem aprovação explícita.
- Não alterar configs sensíveis (`tsconfig*`, `vite.config.ts`, `eslint.config.*`) sem justificativa e gate verde.

## Execução da limpeza

1. Isolar a intenção: defina o tipo de limpeza (nomenclatura, acoplamento, dead code, layout, contratos).
2. Escolher 1 hot spot por sessão.
3. Aplicar refactor incremental mecânico, sem alterar regra de negócio.
4. Atualizar imports/exports residuais no mesmo diff.
5. Se houver mudança estrutural ou de contrato, registrar decisão em `DECISIONS.md` e/ou `docs/adr/*`.

## Evidências obrigatórias

- Plano explícito em `PLAN.md`.
- Registro de comandos executados e resultados objetivos.
- Gate canônico definido em `AGENTS.md` (neste repo, `npm run verify`) deve estar verde.
- `NEXT.md` atualizado no final da sessão.

## Templates operacionais (copiar/colar)

### Template de evidências (colar em `PLAN.md` ou nota curta)

- Escopo:
- Fora de escopo:
- Arquivos alvo:
- Comandos executados + resultados:
- Gate final:
- Observações/alertas:

### Template de decisão (nota curta ou `DECISIONS.md`)

- Contexto:
- Decisão:
- Consequência:
- Reversão:
- Referências:

### Checklist de revisão rápida (antes do gate final)

- [ ] Sem imports/exports residuais.
- [ ] Sem `as any` novo.
- [ ] Sem tocar na "don't touch list" sem justificativa.
- [ ] Barrel files só com API pública.
- [ ] Nenhuma mudança estrutural sem registro em `DECISIONS.md`/ADR.

## Saída mínima (Definition of Done)

- `npm run verify` verde.
- Sem `as any` novo.
- Se mudou regra de negócio: teste em `services/utils` adicionado/atualizado.
- Se mudou interface/contrato: documentação de tipos/contratos atualizada.
- `NEXT.md` atualizado.

## Contrato de limpeza (29 tópicos obrigatórios)

1. Estrutura lógica clara do projeto
   Separação por camadas (quando faz sentido): UI/apresentação, aplicação/orquestração, domínio/regras, infraestrutura/dados.
   Separação por domínio (quando faz sentido): pastas por feature ou por contexto de negócio (ex.: usuario, pedidos, pagamentos).
   Regra prática: só de olhar a árvore de pastas, dá para prever onde algo está.

2. Separação de responsabilidades por diretório
   src/components/: renderização e interação de UI.
   Não deve conter: regra de negócio, cálculos complexos, chamadas diretas de API com regra acoplada.
   src/services/ (ou src/domain, src/application): regras de negócio e orquestração de dados.
   Não deve conter: JSX, detalhes de UI, hooks de view.
   src/utils/: funções puras e helpers genéricos.
   Não deve conter: estado global, side effects, dependência de UI.
   src/types/: tipos e interfaces por domínio.
   Não deve conter: lógica, "constantes mágicas".
   src/hooks/: hooks reutilizáveis.
   Não deve conter: regra de domínio acoplada a uma página específica.
   src/constants/: constantes e enums nomeados.
   Não deve conter: strings literais espalhadas pelo projeto.
   Raiz do repo:
   Deve conter: configs (package.json, tsconfig, eslint, etc.).
   Não deve conter: código de app "solto".

3. Separação de responsabilidades no nível de função e classe
   Cada função, classe ou módulo faz uma coisa bem definida.
   Evitar "função Deus": valida, transforma, persiste, loga, notifica e renderiza tudo no mesmo lugar.
   Coordenação fica em um ponto; regras e transformações ficam em pontos especializados.

4. Coesão alta por arquivo (Single Responsibility)
   Um componente principal por arquivo .tsx.
   Um serviço por arquivo .ts, agrupando funções do mesmo domínio.
   Tipos agrupados por domínio no diretório de types.
   Anti padrões:
   types.ts gigante com tudo.
   api.ts monolítico com todas as chamadas.
   "pasta lixeira" com arquivos genéricos (utils2.ts, helpers-final.ts).

5. Baixo acoplamento entre módulos
   Módulos não dependem fortemente uns dos outros.
   Dependência por contrato (interfaces, tipos, "ports") em vez de dependência direta em implementação.
   Evitar import circular (A importa B e B importa A) porque quase sempre sinaliza arquitetura ruim.

6. Naming determinístico e sem ambiguidade
   Arquivos: nomes descritivos e consistentes.
   Ex.: calculate-monthly-balance.ts em vez de utils2.ts.
   Componentes: PascalCase; arquivos comuns em kebab-case (ou o padrão do projeto, mas sempre consistente).
   Funções: verbo + substantivo.
   Ex.: getClientById, formatCurrency, validateExpenseForm.
   Evitar: handle(), process(), doStuff().
   Tipos: sufixos quando ajudam.
   Props, State, DTO, Config, Response, Request.
   Um nome deve permitir prever o conteúdo do arquivo sem abrir.

7. Zero magic strings e constantes espalhadas
   Strings de status, chaves, rotas, labels, tipos de evento, mensagens padrão devem virar constantes nomeadas.
   Centralizar em src/constants/ ou por domínio.
   Benefício real: reduz divergência silenciosa e bugs por typo.

8. Padronização consistente do projeto
   Mesma convenção de pastas e nomes em todo o repo.
   Mesmo padrão de retorno (ex.: Result/Either, exceptions, nullables) quando aplicável.
   Mesmo estilo de tratamento de erro e logging.
   Mesmo padrão de formatação (Prettier) e qualidade (ESLint, TypeScript strict).

9. Complexidade controlada
   Funções curtas, com poucos ramos de decisão.
   Reduzir ifs aninhados e lógica "espaguete".
   Extrair subfunções quando:
   há repetição,
   há regra de negócio escondida,
   há muitos caminhos possíveis.
   Métrica mental simples: se ficou difícil explicar em voz alta, provavelmente está complexo demais.

10. Ausência de código morto, redundante ou "lixo"
    Nada de:
    funções não usadas,
    imports desnecessários,
    blocos comentados antigos,
    lógica duplicada,
    arquivos órfãos.
    Poluição típica:
    "debug esquecido" (console.log).
    "TODO/FIXME" abandonado no código.
    Solução prática:
    lint rules (no-console),
    auto-fix para unused imports,
    auditoria periódica de exports e arquivos não referenciados.

11. Barrel files (index.ts) disciplinados
    index.ts por diretório para reexportar a API pública.
    Só exportar o que é público; internos ficam internos.
    Benefício: melhora navegação e reduz import caótico.
    Risco: se exportar tudo indiscriminadamente, vira poluição e opacidade. Disciplina é o ponto.

12. Tratamento de erro explícito e previsível
    Erros não são engolidos.
    Nada de try/catch vazio.
    Erros devem:
    ter mensagem útil,
    ser rastreáveis (log estruturado quando necessário),
    seguir um padrão (ex.: lançar exceção, retornar Result, etc.).
    Resultado: sistemas mais resilientes e mais fáceis de depurar.

13. Testabilidade como consequência da estrutura
    Dependências injetáveis (ou ao menos isoláveis).
    Funções puras quando possível, side effects encapsulados.
    Separação entre regra e infraestrutura facilita testes unitários e de integração.
    Se testar exige "montar o mundo", a estrutura está poluída.

14. Ausência de efeitos colaterais inesperados
    Funções com entradas e saídas claras.
    Evitar estado global mutável sem contrato.
    Evitar funções que "fazem algo escondido" (ex.: alteram cache global ou variáveis externas sem deixar claro).
    Previsibilidade é parte do "limpo".

15. Legibilidade acima de esperteza
    Preferir código óbvio e direto a truques "inteligentes".
    Evitar abstração prematura e generalização exagerada.
    Se só quem escreveu entende, está poluído, mesmo que "funcione".

16. Consistência visual e CSS (quando tem front)
    Definir um caminho e seguir:
    CSS Modules ou utilitários ou styled solutions, mas sem misturar aleatoriamente.
    Design tokens para cores, espaçamentos e tipografia.
    Evitar hardcoded espalhado.
    Padrões de espaçamento previsíveis (ex.: container sempre p-4, etc.).

17. Agent-First (quando o projeto usa agentes e automação)
    Um local de "mente do projeto" com regras e contexto operacional (ex.: pasta .agent/).
    Arquivos de contexto atualizados:
    AGENTS.md: como o agente deve agir.
    ARCHITECTURE.md: decisões e visão estrutural.
    NEXT.md: estado atual e próximos passos.
    Contratos explícitos de dados:
    um único lugar para validar shapes e mudanças (ex.: docs/data-contracts).
    Objetivo: previsibilidade estrutural para reduzir erro humano e reduzir "invenção" do agente.

18. Padrão de imports e dependências
    Imports agrupados e ordenados:
    bibliotecas externas,
    internos por alias (@/services, @/types),
    relativos.
    Sem dependência circular.
    Sem dependência surpresa:
    adicionar pacote só com justificativa, para evitar inchamento e risco.

19. Arquitetura escalável e sustentável
    Estrutura organizada permite:
    crescimento do projeto sem virar caos,
    inclusão de features com mudança localizada,
    evolução sem reescrever tudo.
    Se qualquer feature nova exige mexer em 15 lugares aleatórios, é sinal de poluição estrutural.

20. Acessibilidade e consistência de UI (se for front)
    Objetivo: UI previsível, reutilizável e sem gambiarra visual.
    Boa prática: componentes base, padrões de layout, acessibilidade mínima (labels, foco, teclas).
    Sinal de poluição: cada tela inventa um padrão, estilos improvisados, comportamento inconsistente.

21. Configuração fora do código
    Objetivo: evitar que o comportamento do sistema fique escondido em "ifs" e valores hardcoded.
    Boa prática: usar variáveis de ambiente, arquivos de config por ambiente e um padrão único para ler config.
    Sinal de poluição: chaves, URLs, tokens, flags e limites espalhados em arquivos diferentes.

22. Observabilidade padronizada (logs, métricas, rastreio)
    Objetivo: conseguir entender o que o sistema está fazendo sem enfiar console.log no meio do código.
    Boa prática: logging com níveis (info, warn, error), formato consistente, contexto (requestId, userId quando aplicável).
    Sinal de poluição: cada módulo loga de um jeito, mensagens soltas e sem padrão, ou falta total de rastreabilidade.

23. Validações e contratos na borda do sistema
    Objetivo: garantir que entradas e saídas tenham forma previsível, evitando "surpresas" no meio do fluxo.
    Boa prática: validar dados ao receber input (API, formulários, integrações) e normalizar formatos cedo.
    Sinal de poluição: validação espalhada ou inexistente, bugs recorrentes por dados "quebrados".

24. Organização de integrações externas
    Objetivo: impedir que chamadas externas virem acoplamento e bagunça.
    Boa prática: isolar integrações (clients/adapters), com contratos claros e tratamento de erro padronizado.
    Sinal de poluição: chamada HTTP direta espalhada em componentes e serviços aleatórios.

25. Gestão de dependências com disciplina
    Objetivo: evitar inchaço, conflito e risco de supply chain.
    Boa prática: dependências com propósito claro, lockfile, updates controlados, remover libs não usadas.
    Sinal de poluição: várias libs para fazer a mesma coisa, pacote adicionado por conveniência e nunca revisado.

26. Qualidade automatizada no pipeline (CI)
    Objetivo: impedir que "poluição" entre no repositório.
    Boa prática: lint, testes, typecheck e build rodando automaticamente em PR.
    Sinal de poluição: depender de "bom senso" individual para manter padrão.

27. Limites claros de "camadas" em runtime
    Objetivo: manter a arquitetura real, não só bonita na árvore de pastas.
    Boa prática: regras que impedem import proibido (ex.: UI não pode importar infra direto).
    Sinal de poluição: a pasta está "certa", mas qualquer camada importa qualquer coisa.

28. Estratégia de migração e versionamento de esquema (quando existe banco)
    Objetivo: mudanças de dados serem rastreáveis e reproduzíveis.
    Boa prática: migrations versionadas, reversíveis quando possível, e padrão único para evoluir schema.
    Sinal de poluição: mudanças manuais em produção, scripts soltos, histórico perdido.

29. Feature flags e comportamento evolutivo
    Objetivo: evitar "ifs eternos" e deploys traumáticos.
    Boa prática: flags bem nomeadas, com local definido, ciclo de vida (cria, usa, remove).
    Sinal de poluição: flags espalhadas, nunca removidas, condicionais acumulando.
