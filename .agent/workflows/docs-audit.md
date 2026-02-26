---
description: Audit and sync docs/ folder with current codebase. Removes obsolete files, updates outdated content.
---

# /docs-audit - Auditoria e Sincronização da Pasta `docs/`

$ARGUMENTS

---

## Objetivo

Garantir que **todos os arquivos em `docs/`** correspondam fielmente ao código-fonte atual.
Conteúdo desatualizado deve ser corrigido; arquivos sem uso devem ser excluídos.

---

## Passos

### 1. Inventário completo

// turbo

- Listar recursivamente todos os arquivos em `docs/`:

```powershell
Get-ChildItem -Recurse docs/ -File | Select-Object FullName, Length, LastWriteTime
```

- Registrar contagem total de arquivos e subpastas

### 2. Análise de correspondência (arquivo por arquivo)

Para **cada arquivo** encontrado, executar esta checklist mental:

| Critério                         | Ação se falhar                             |
| -------------------------------- | ------------------------------------------ |
| Referencia tipos que existem?    | Atualizar ou remover referências fantasma  |
| Referencia serviços existentes?  | Atualizar ou remover                       |
| Referencia componentes/páginas?  | Verificar se ainda existem no `src/`       |
| Caminhos de import estão certos? | Corrigir paths                             |
| Conteúdo reflete código atual?   | Reescrever seções desatualizadas           |
| Arquivo tem consumidores?        | Se ninguém referencia, candidato a remoção |
| É duplicado de outro doc?        | Manter o mais completo, remover o outro    |

**Ferramentas para validar:**

// turbo

- Buscar referências no código:

```powershell
grep -r "nome-do-arquivo" src/ docs/ AGENTS.md ARCHITECTURE.md
```

- Verificar se tipos/interfaces mencionados existem:

```powershell
grep -r "NomeDoTipo" src/types/
```

- Verificar se serviços mencionados existem:

```powershell
grep -r "nomeDaFuncao" src/services/
```

### 3. Classificar cada arquivo

Classificar em uma das categorias:

- ✅ **Atual** — conteúdo corresponde ao código, nenhuma ação necessária
- 🔄 **Desatualizado** — conteúdo válido mas com informações incorretas/incompletas → ATUALIZAR
- 🗑️ **Obsoleto** — sem referências, sem consumidores, conteúdo irrelevante → EXCLUIR
- ⚠️ **Requer decisão** — ambíguo, perguntar ao usuário antes de agir

### 4. Apresentar relatório ao usuário

Antes de qualquer modificação, apresentar tabela completa:

```markdown
## Relatório de Auditoria — docs/

| Arquivo                                | Status           | Ação Proposta | Justificativa               |
| -------------------------------------- | ---------------- | ------------- | --------------------------- |
| docs/adr/0001-xxx.md                   | ✅ Atual         | Nenhuma       | Corresponde ao código       |
| docs/examples/xxx.md                   | 🗑️ Obsoleto      | Excluir       | Sem referências no codebase |
| docs/data-contracts/types-contracts.md | 🔄 Desatualizado | Atualizar     | Tipos mudaram em E3         |
```

**Aguardar aprovação explícita do usuário antes de prosseguir.**

### 5. Executar ações aprovadas

- **Atualizar**: reescrever com base no código-fonte atual
- **Excluir**: remover arquivo + confirmar que ninguém o importa/referencia
- **Manter**: não tocar

### 6. Verificação final

// turbo

- Confirmar que `npm run check:docs:governance` passa:

```powershell
npm run check:docs:governance
```

// turbo

- Confirmar build limpo:

```powershell
npm run verify:quick
```

- Listar arquivos restantes em `docs/` e confirmar que todos estão na categoria ✅

---

## Regras Invioláveis

1. **Nunca excluir sem mostrar evidência** de que não há referências
2. **Nunca reescrever sem ler o código atual** — abrir os arquivos-fonte antes de atualizar
3. **ADRs nunca são excluídos** — podem ser marcados como "Superseded" mas preservados
4. **Apresentar relatório ANTES de agir** — o usuário aprova explicitamente
5. **Sem scope creep** — auditar apenas `docs/`, não refatorar código-fonte

---

## Subpastas Conhecidas

| Subpasta               | Propósito Esperado                    |
| ---------------------- | ------------------------------------- |
| `docs/adr/`            | Architecture Decision Records         |
| `docs/audits/`         | Relatórios de auditoria anteriores    |
| `docs/changelog/`      | Log de mudanças por versão/sprint     |
| `docs/checklists/`     | Checklists operacionais               |
| `docs/data-contracts/` | Contratos de tipo entre serviços e UI |
| `docs/design-system/`  | Tokens, paletas, tipografia           |
| `docs/examples/`       | Exemplos de uso para devs             |
| `docs/governance/`     | Regras de governança documental       |
| `docs/process/`        | Processos de trabalho                 |

---

## Exemplos de Uso

```text
/docs-audit
/docs-audit focar em data-contracts e examples
/docs-audit verificar apenas ADRs
```
