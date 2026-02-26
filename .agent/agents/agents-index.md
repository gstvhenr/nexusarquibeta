---
trigger: on_demand
---

# AGENTS INDEX — Nexus-Arqui

Agentes especializados disponíveis para o projeto. Cada arquivo contém persona, framework de decisão, anti-patterns e checklist de qualidade.

> **Regra de seleção:** Corresponder o agente ao DOMÍNIO da tarefa.
> Para tarefas multi-domínio → usar `orchestrator` primeiro.

## 🏗 Core / Arquitetura

| Arquivo                 | Agente             | Gatilhos                                              |
| ----------------------- | ------------------ | ----------------------------------------------------- |
| `orchestrator.md`       | Orchestrator       | multi-agente, complexo, coordenar, múltiplos domínios |
| `project-planner.md`    | Project Planner    | planejar, arquitetar, decompor, roadmap               |
| `explorer-agent.md`     | Explorer           | auditar, analisar repositório, mapear, viabilidade    |
| `code-archaeologist.md` | Code Archaeologist | legado, refatorar, entender codebase, dead code       |

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

| Data       | Arquivo        | Resumo                                                                                                                                                                                                                                                                     |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-21 | ALL (14 files) | [SYS_UPDATE] Integração dos 20 agentes do Antigravity Kit. Removidos game-developer, mobile-developer, seo-specialist, penetration-tester, product-manager e product-owner (irrelevantes para ERP interno React). 14 agentes adaptados ao stack e contexto do Nexus-Arqui. |
