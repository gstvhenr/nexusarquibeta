---
description: Semantic Release drafting and Changelog generation based on NEXT.md and closed sessions. Updates package version and formats the official project history.
---

# /release - Gestão de Release e Changelog

$ARGUMENTS

---

## Propósito

Transformar a torrente diária de anotações técnicas (`NEXT.md`, `task.md`, logs puros) em uma **Nota de Versão (Release Notes) com alto valor de negócio**. Eleva a governança ao comunicar o valor gerado aos stakeholders do ERP.

---

## Comportamento

Quando `/release` for acionado:

### 1. Coleta de Contexto

// turbo

O agente deve compilar as informações da iteração atual (sessões concluídas):

```powershell
Get-Content NEXT.md
Get-ChildItem docs/changelog/session-log-*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

### 2. Filtro de Ruído

A IA deve processar as logs brutas e **excluir ruído de desenvolvedor**:

- ❌ "Concertado typo no comentário."
- ❌ "Executado plan planner."
- ❌ "Ajuste na config do linter."

E focar apenas no **valor entregue (Features, Fixes, Perf)**:

- ✅ "Novo painel financeiro mensal implementado."
- ✅ "Redução de 60% na lentidão ao renderizar a lista de clientes."
- ✅ "Schema do IndexedDB atualizado para suportar eventos híbridos."

### 3. Classificação SemVer

Determinar qual parte da versão do `package.json` deve subir, baseado no impacto:

- **PATCH (x.x.++):** Apenas correções de bugs invisíveis, perf tweaks sem alteração de UI, refatores limpos.
- **MINOR (x.++.0):** Novas telas, features, filtros visíveis na UI, melhorias na arquitetura.
- **MAJOR (++.0.0):** Mudança radical no domínio, reescrita completa do banco, troca de framework (Muito raro).

### 4. Geração do Changelog Draft

Criar o draft formatado baseado no padrão [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### 5. Atualização de Arquivos (Após Aprovação)

O agente deve apresentar o rascunho ao usuário. **Se aprovado (S):**

1. Atualizar o arquivo `CHANGELOG.md` na raiz.
2. Atualizar a versão no `package.json`:

   ```powershell
   npm version minor --no-git-tag-version
   ```

   _(Ou patch/major dependendo do calculo)_

---

## Output Format (Rascunho de Aprovação)

```markdown
## 🚀 Preparação de Release

Baseado nos últimos logs, a sugestão de versão é: **[vX.Y.Z] -> [vX.Y.Z+1]** (Bump de **[MINOR/PATCH]**)

---

### Rascunho para o `CHANGELOG.md`:

## [X.Y.Z+1] - YYYY-MM-DD

### Adicionado (Added)

- **Financeiro:** Novo toggle de visões mensais no dashboard `FinanceiroOverview`.
- **Comissões:** Exportação para Excel (.xlsx) na listagem.

### Corrigido (Fixed)

- **Clientes:** Correção de estado assíncrono que zerava o formulário ao alternar abas rapidamente.

### Melhorado (Changed/Performance)

- **UI:** Renderização da lista de `ProjectGantt` virtualizada, reduzindo o main-thread blocking em 75%.

---

Você aprova este rascunho? (S/N)

- **S:** O agente atualizará `CHANGELOG.md` e o `package.json`.
- **N:** Indique os ajustes que deseja fazer no texto.
```

---

## Regras

1. **Nunca executar `npm version` antes da aprovação do usuário.**
2. O Changelog deve usar linguagem de negócio/produto, voltada para um gestor de TI ou Product Owner.
3. Não destruir os arquivos `.agent/lessons-learned.md` durante o processo.

---

## Exemplos de Uso

```text
/release
/release patch (Força a criação apenas de um patch release)
/release draft (Apenas gera o texto, não toca em numeração de arquivos)
```
