---
description: Add or update features in existing application. Used for iterative development.
---

# /enhance - Adicionar ou Atualizar Features

$ARGUMENTS

---

## Task

Este comando adiciona features ou faz atualizações em componentes, serviços ou páginas existentes no Nexus-Arqui.

### Passos:

1. **Entender o estado atual**
   - Ler `CONTEXT.md` e `NEXT.md`
   - Identificar arquivos afetados: `src/components/`, `src/services/`, `src/pages/`
   - Verificar contratos de tipo em `docs/data-contracts/types-contracts.md`

2. **Planejar mudanças**
   - Determinar o mínimo necessário (sem scope creep)
   - Detectar arquivos afetados e dependências
   - Verificar se há fixture de teste relacionada em `src/test/fixtures/`

3. **Apresentar plano ao usuário** (para mudanças maiores)

   ```
   "Para adicionar filtros na tela de Propostas:
   - Modificarei: src/pages/PropostasPage.tsx, src/services/proposalService.ts
   - Criarei: nenhum novo arquivo
   - Tempo estimado: ~15 min

   Posso prosseguir?"
   ```

4. **Aplicar**
   - Chamar agentes relevantes (`frontend-specialist`, `backend-specialist`)
   - Fazer mudanças no escopo definido
   - **Não expandir escopo** sem confirmação

5. **Verificar**
   - `npm run verify` — deve passar com verde

---

## Exemplo de Scope Discipline

```
❌ ERRADO: usuário pediu "adicionar filtro por status"
         → agente também refatora o componente, muda estilos e adiciona analytics

✅ CORRETO: usuário pediu "adicionar filtro por status"
          → agente implementa APENAS o filtro por status
          → registra extras em NEXT.md
```

---

## Cuidados

- Obter aprovação antes de mudanças grandes
- Avisar sobre breaking changes (tipo mudado, prop renomeada)
- Registrar extras identificados em `NEXT.md`
- `npm run verify` **sempre** antes de declarar conclusão

---

## Exemplos de Uso

```
/enhance adicionar dark mode toggle no header
/enhance filtrar propostas por status na listagem
/enhance melhorar performance do Dashboard
/enhance adicionar campo de observações em Projeto
/enhance corrigir alinhamento no ProposalCard
```
