---
trigger: on_demand
---

# AGENTS INDEX — Nexus-Arqui

Agentes especializados disponíveis para o projeto. Cada arquivo contém persona, framework de decisão, anti-patterns e checklist de qualidade.

> **Regra de seleção:** Corresponder o agente ao DOMÍNIO da tarefa.
> Para tarefas multi-domínio → usar `orchestrator` primeiro.

## 🏗 Core / Arquitetura

| Arquivo                         | Agente             | Gatilhos                                                                      |
| ------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| `orchestrator.md`               | Orchestrator       | multi-agente, complexo, coordenar, múltiplos domínios                         |
| `project-planner.md`            | Project Planner    | planejar, arquitetar, decompor, roadmap                                       |
| `explorer-agent.md`             | Explorer           | auditar, analisar repositório, mapear, viabilidade                            |
| `code-archaeologist.md`         | Code Archaeologist | legado, refatorar, entender codebase, dead code                               |
| `architecture-health-doctor.md` | Arch Health Doctor | circular, acoplamento, coupling, órfão, orphan, entry point, grafo, ArchPulse |

## 💻 Desenvolvimento

| Arquivo                  | Agente              | Gatilhos                                              |
| ------------------------ | ------------------- | ----------------------------------------------------- |
| `frontend-specialist.md` | Frontend Specialist | componente, UI, React, CSS, hook, TailwindCSS, design |
| `backend-specialist.md`  | Backend Specialist  | service, storage, IndexedDB, persistência, infra      |
| `database-architect.md`  | Database Architect  | schema, store, IndexedDB, migração, tipos, modelagem  |

## 🧪 Qualidade

| Arquivo                     | Agente                | Gatilhos                                        |
| --------------------------- | --------------------- | ----------------------------------------------- |
| `test-engineer.md`          | Test Engineer         | teste, TDD, cobertura, vitest, unit test        |
| `qa-automation-engineer.md` | QA Automation         | E2E, Playwright, automação, regressão, CI       |
| `debugger.md`               | Debugger              | bug, erro, crash, não funciona, investigar      |
| `performance-optimizer.md`  | Performance Optimizer | lento, performance, bundle, LCP, INP, re-render |

## 🔒 Segurança

| Arquivo               | Agente           | Gatilhos                                          |
| --------------------- | ---------------- | ------------------------------------------------- |
| `security-auditor.md` | Security Auditor | segurança, OWASP, vulnerabilidade, XSS, injection |

## 🚀 Operações

| Arquivo              | Agente          | Gatilhos                                          |
| -------------------- | --------------- | ------------------------------------------------- |
| `devops-engineer.md` | DevOps Engineer | deploy, produção, CI/CD, build, release, rollback |

## 📝 Documentação

| Arquivo                   | Agente               | Gatilhos                                                            |
| ------------------------- | -------------------- | ------------------------------------------------------------------- |
| `documentation-writer.md` | Documentation Writer | README, JSDoc, ADR, changelog (apenas quando explicitamente pedido) |

---

## ⚠️ Regras Críticas

1. **SEMPRE ler o arquivo do agente** antes de iniciar — persona + skills importam.
2. **Orchestrator primeiro** para tarefas multi-domínio.
3. **Project Planner escreve ZERO código** — produz apenas `{task-slug}.md`.
4. **Gate obrigatório em todos os agentes**: `npm run verify` → `[VERIFY][LOOP][PASS]`.

## 🔁 SYS_UPDATE Log

| Data       | Arquivo                       | Resumo                                                                                                                                                                                                                                                                     |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-21 | ALL (14 files)                | [SYS_UPDATE] Integração dos 20 agentes do Antigravity Kit. Removidos game-developer, mobile-developer, seo-specialist, penetration-tester, product-manager e product-owner (irrelevantes para ERP interno React). 14 agentes adaptados ao stack e contexto do Nexus-Arqui. |
| 2026-03-06 | architecture-health-doctor.md | [SYS_UPDATE] Novo agente especialista em saúde estrutural do grafo de dependências. Acompanha 4 workflows: `/circular-deps`, `/orphan-modules`, `/coupling-check`, `/entry-points`.                                                                                        |

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
