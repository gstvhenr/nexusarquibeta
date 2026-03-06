# Prompt Eval Scenarios — Nexus-Arqui

> **Propósito:** Cenários de regressão para validar que mudanças em agent/skill/workflow
> não degradam o comportamento esperado. Antes de modificar um `.md` de agente,
> verificar se os cenários abaixo continuam válidos.

---

## Como usar

1. Antes de editar um `agents/*.md`, leia os cenários do agente correspondente abaixo.
2. Após a edição, valide mentalmente (ou em sessão de teste) que o agente continua
   respeitando os comportamentos esperados e evitando os proibidos.
3. Se um cenário falhar após a edição, a mudança precisa ser revisada.

---

## orchestrator

### Cenário O-1: Tarefa multi-domínio

**Input:** "Crie um relatório financeiro com gráficos e persistência no IndexedDB."
**Esperado:** Decompor em sub-tarefas, atribuir `project-planner` → `backend-specialist` → `frontend-specialist`, sequenciar com dependências.
**Proibido:** Executar código diretamente. Selecionar apenas 1 agente.

### Cenário O-2: Tarefa simples de 1 domínio

**Input:** "Corrija o bug de renderização no componente Badge."
**Esperado:** Rotear diretamente para `debugger` ou `frontend-specialist`. Sem orchestração complexa.
**Proibido:** Decompor em pipeline multi-agente desnecessariamente.

### Cenário O-3: Scope creep detection

**Input:** "Adicione um botão de exportar na tela de propostas. Aproveitando, refatore o layout dos cards também."
**Esperado:** Separar escopos. Implementar botão. Registrar refatoração de cards em `NEXT.md`.
**Proibido:** Aceitar ambos os escopos na mesma tarefa silenciosamente.

---

## frontend-specialist

### Cenário F-1: Request com design genérico implícito

**Input:** "Crie um dashboard com cards de KPIs e um gráfico de pizza."
**Esperado:** Ativar Design Thinking Profundo. Questionar se Bento Grid é a melhor escolha. Propor layout contextualizado para ERP de arquitetura.
**Proibido:** Implementar Bento Grid genérico sem questionamento. Usar cores hardcoded.

### Cenário F-2: Regra de negócio em componente

**Input:** "Adicione cálculo de comissão no componente ProjectFinanceSection."
**Esperado:** Recusar colocar lógica em `components/`. Propor implementação em `services/` com consumo via prop/hook.
**Proibido:** Escrever lógica de cálculo dentro de JSX ou componente.

### Cenário F-3: Pedido que toca arquivo sensível

**Input:** "Altere storageService.ts para adicionar um novo store."
**Esperado:** Parar, informar que o arquivo está na Don't Touch List, pedir confirmação explícita.
**Proibido:** Editar `storageService.ts` diretamente sem confirmação.

---

## debugger

### Cenário D-1: Pedido de fix rápido sem reprodução

**Input:** "O modal não fecha, corrige isso rápido."
**Esperado:** Forçar Fase 1 (Reproduzir). Pedir passos de reprodução antes de qualquer hipótese.
**Proibido:** Pular para hipótese ou fix sem reproduzir.

### Cenário D-2: Bug em arquivo sensível

**Input:** "loadData.ts retorna undefined, conserta."
**Esperado:** Aplicar Chesterton's Fence — entender por que o código é assim. Ler ADR-0007. Propor fix mínimo.
**Proibido:** Reescrever a função. Ignorar a Don't Touch List.

### Cenário D-3: Teste flaky

**Input:** "DeleteConfirmationModal.test.tsx falha intermitentemente."
**Esperado:** Consultar `lessons-learned.md` (já documentado). Aplicar a correção conhecida (timeout + cleanup).
**Proibido:** Ignorar o flake. Desabilitar o teste.

---

## project-planner

### Cenário P-1: Pedido de implementação direta

**Input:** "Implemente a feature de subcontratação agora."
**Esperado:** Criar `{task-slug}.md` com breakdown ANTES de qualquer código. Zero código nesta fase.
**Proibido:** Escrever código de produção.

### Cenário P-2: Escopo vago

**Input:** "Quero melhorar o financeiro do projeto."
**Esperado:** Ativar Socratic Gate. Perguntar: qual aspecto? (comissões, aditivos, fluxo de caixa?)
**Proibido:** Assumir um escopo e planejar sem validação.

---

## test-engineer

### Cenário T-1: Teste com fixture ad-hoc

**Input:** "Crie teste para projectService com `{ id: '1', name: 'Test' }`."
**Esperado:** Recusar fixture ad-hoc. Usar `createTestProject()` de `src/test/fixtures/`.
**Proibido:** Criar dados de teste inline sem fixture canônica.

### Cenário T-2: Snapshot test para lógica

**Input:** "Adicione snapshot test para validar o cálculo de receita."
**Esperado:** Recusar snapshot para lógica. Usar assertions explícitas (`expect().toBe()`).
**Proibido:** `expect(result).toMatchSnapshot()` para lógica de negócio.

---

## code-archaeologist

### Cenário A-1: Big-bang refactor

**Input:** "Refatore toda a camada de services de uma vez."
**Esperado:** Recusar big-bang. Propor Strangler Fig pattern com micro-batches.
**Proibido:** Aceitar refatoração transversal em diff único.

---

## explorer-agent

### Cenário E-1: Auditoria sem evidência

**Input:** "Me diga se o codebase está saudável."
**Esperado:** Executar comandos de diagnóstico (`npm run verify`, `check:pollution`, `check:lines`). Apresentar evidência objetiva.
**Proibido:** Responder com opinião subjetiva sem rodar comandos.
