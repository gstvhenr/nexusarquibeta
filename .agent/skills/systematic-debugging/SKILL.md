---
name: systematic-debugging
description: Metodologia sistematica de depuracao em 4 fases com analise de causa raiz e verificacao baseada em evidencias. Use ao depurar problemas complexos.
allowed-tools: Read, Glob, Grep
---

# Systematic Debugging — Nexus-Arqui

> Abordagem estruturada para bugs reais do projeto: TypeScript errors, React state, IndexedDB, Vite build.

---

## 4-Phase Debugging Process

### Phase 1: Reproduce

Antes de corrigir, reproduza de forma confiável.

```markdown
## Reproduction Steps

1. [Passo exato para reproduzir]
2. [Próximo passo]
3. [Expected vs actual result]

## Reproduction Rate

- [ ] Sempre (100%)
- [ ] Frequente (50-90%)
- [ ] Às vezes (10-50%)
- [ ] Raro (<10%)
```

---

### Phase 2: Isolate

Reduza ao mínimo para encontrar a fonte.

```markdown
## Isolation Questions

- Quando começou a acontecer?
- O que mudou recentemente? (git log)
- Acontece em todos os navegadores?
- Posso reproduzir com o menor código possível?
- É relacionado a um contexto específico (IndexedDB, re-render)?
```

---

### Phase 3: Understand

Root cause, não apenas sintoma.

```markdown
## Root Cause Analysis — 5 Whys

1. Por quê: [Primeira observação]
2. Por quê: [Razão mais profunda]
3. Por quê: [Mais profundo ainda]
4. Por quê: [Chegando perto]
5. Por quê: [Root cause]
```

---

### Phase 4: Fix & Verify

```markdown
## Fix Verification

- [ ] Bug não se reproduz mais
- [ ] Funcionalidade relacionada ainda funciona
- [ ] npm run verify passa
- [ ] Teste adicionado para prevenir regressão
```

---

## Debugging Checklist — Nexus-Arqui

### Antes de Começar

- [ ] Reproduzo de forma confiável
- [ ] Tenho minimal reproduction case
- [ ] Entendo o comportamento esperado

### Durante a Investigação

```bash
# Alterações recentes
git log --oneline -20
git diff HEAD~5

# Buscar padrão no codebase
grep -r "errorPattern" src/ --include="*.ts" --include="*.tsx"
```

---

## Categorias de Bug — Por Contexto

### TypeScript Errors

```typescript
// Erro: Property 'x' does not exist on type 'Y'
// → Verifique se o tipo está correto em src/types/
// → Use optional chaining: obj?.x
// → Adicione type guard: if ('x' in obj) { obj.x }
```

### React State / Re-renders

```typescript
// Sintoma: componente re-renderiza infinitamente
// → useEffect com dependência de objeto/array inline
// → Mutation direta de state: state.push(x) — ERRADO
// → Missing dependencies no useEffect
```

### IndexedDB

```typescript
// Sintoma: dados não persistem ou retornam undefined
// → Verificar se a transaction foi commitada
// → Verificar nome do store: app_entity_state, ui_preferences, app_auto_backups
// → Verificar se está chamando via src/services/ (nunca diretamente)
```

### Vite Build

```bash
# Build falhou?
npm run build 2>&1 | head -50

# TypeScript errors antes do build
npm run typecheck
```

---

## Anti-Patterns

❌ **Mudanças aleatórias** — "Talvez se eu mudar isso..."
❌ **Ignorar evidências** — "Isso não pode ser a causa"
❌ **Assumir** — "Deve ser X" sem prova
❌ **Não reproduzir primeiro** — Corrigir às cegas
❌ **Parar nos sintomas** — Não encontrar o root cause
