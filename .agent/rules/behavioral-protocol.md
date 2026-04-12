---
trigger: always_on
description: Protocolo obrigatório de eco de compreensão e auto-dispatch de workflows — executado antes de qualquer ação
globs:
  - 'src/frontend/**/*.tsx'
  - 'src/frontend/**/*.ts'
  - '**/*.md'
---

# Protocolo Comportamental — Nexus-Arqui

## 1. Eco de Compreensão (OBRIGATÓRIO — Antes de QUALQUER ação)

**Em TODA solicitação do usuário**, antes de editar código ou executar qualquer ação estrutural:

1. Inicie a resposta com `📋 Entendi:` seguido de um resumo conciso e direto do que o usuário pediu
2. O resumo deve ser proporcional à complexidade — breve para simples, detalhado para complexo
3. **Sem sugestões** ou "o que acha de fazermos X?" — apenas o que o pedido do usuário determina
4. O usuário tem a chance de ver isso no output antes que muita coisa seja escrita ou alterada, alinhando as expectativas.

Exemplos:

```
Pedido simples:
📋 Entendi: Adicionar formatação de moeda BRL (R$) na tabela de faturamento e usar os nossos utils.

Pedido complexo:
📋 Entendi: Criar hook genérico de fetch (useFetchEntity) no frontend utilizando abort controller,
 e substituir as chamadas isoladas na página de propostas e clientes.
```

**NUNCA** pule este passo. Ele é a principal rede de segurança contra _scope creep_ e alucinações.

## 2. Auto-Dispatch de Workflows

No Nexus-Arqui, temos vários workflows em `.agent/workflows`. Quando a solicitação do usuário se alinhar funcionalmente a um deles, ative internamente a mentalidade descrita ou o protocolo **automaticamente** sem o usuário precisar digitar `/`:

| Ação Detectada                         | Workflow Automático / Protocolo Recomendado     | Trigger Words                                                                       |
| -------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| Refatorar código existente             | `/refactor`                                     | "refatorar", "extrair", "separar", "mover lógica"                                   |
| Testes na aplicação                    | `/test` e `/test-impact`                        | "teste", "testar", "gerar testes", "cobertura"                                      |
| Saúde do Repositório                   | `/health-check`                                 | "health", "verificar projeto", "diagnóstico de qualidade"                           |
| Adicionar Funcionalidade / Implementar | `/enhance` ou `/plan` (depende da complexidade) | "implementar", "criar tela", "adicionar", "nova funcionalidade"                     |
| Otimizar Performance Web               | `/perf`                                         | "lento", "re-render", "bundle", "bottleneck"                                        |
| UI/UX Pro Max / Padronização Visual    | `/ui-ux-pro-max` ou `/componentize`             | "melhorar visual", "estilizar tela", "padronizar app", "deixar mais bonito"         |
| Erro em runtime, tela branca           | `/debug`                                        | "erro", "quebrou", "bug", "crash"                                                   |
| Criar nova página/rota                 | `/nova-pagina`                                  | "nova página", "criar rota", "adicionar página", "criar tela"                       |
| Criar novo componente React            | `/novo-componente`                              | "novo componente", "criar componente", "extrair componente"                         |
| Criar novo custom hook                 | `/novo-hook`                                    | "novo hook", "criar hook", "extrair hook", "useAlgo"                                |
| Limpeza profunda do projeto            | `/limpar-projeto`                               | "limpar projeto", "dead code", "código morto", "limpeza"                            |
| Renomear rota/módulo existente         | `/renomear-rota`                                | "renomear rota", "mudar path", "alterar rota", "renomear módulo", "renomear página" |
| Sincronizar/auditar navegação          | `/sync-nav`                                     | "sincronizar navegação", "verificar rotas", "links quebrados", "nav desatualizado"  |
| Auditar contratos de dados             | `/contract-check`                               | "verificar contratos", "contrato de tipos", "drift de interface"                    |
| Auditar acoplamento                    | `/coupling-check`                               | "acoplamento", "coupling", "dependência circular", "god module"                     |
| Auditar documentação                   | `/docs-audit`                                   | "documentação desatualizada", "sync docs", "auditar docs"                           |

O usuário **não precisa** explicitar o comando com `/`. Assuma os passos estritos do workflow caso a intenção final do prompt corrobore a finalidade primária deste script.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
