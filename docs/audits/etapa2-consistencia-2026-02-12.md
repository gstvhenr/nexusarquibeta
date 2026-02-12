# Etapa 2 — Conflitos e Checagem de Consistência

Data: 2026-02-12

## 1) Dev server em 3000 vs padrão Vite

### Evidência local

- Comando executado: `npm run dev`
- URL exibida no ambiente local:
  - `http://localhost:3000/`
- Fonte da configuração:
  - `vite.config.ts` com `server.port = 3000`

### Conclusão

- No Nexus-Arqui, o valor correto documentável é `3000`.
- O padrão geral do Vite pode ser outro, mas aqui existe configuração explícita.

## 2) `src/types` pasta vs `src/types.ts` monolítico

### Evidência local

- `src/types.ts` existe e tem 669 linhas não vazias (`rg -c . src/types.ts`).
- `src/types/` agora também existe (transição incremental) com:
  - `src/types/budget.ts`
  - `src/types/client.ts`
  - `src/types/finance.ts`
  - `src/types/project.ts`
  - `src/types/index.ts`

### Conclusão

- Estado consistente atual: modelo ainda central em `src/types.ts`, com migração iniciada para `src/types/`.
- Diretriz prática: manter compatibilidade e migrar em pequenos lotes.

## 3) `.cursorrules` vs AGENTS portable-first

### Evidência local

- `.cursorrules` não existe no repositório.
- `AGENTS.md` foi criado na raiz como contrato primário.
- ADR registrado em `docs/adr/0001-agent-source-of-truth.md`.

### Conclusão

- Decisão adotada: portable-first com `AGENTS.md` como fonte de verdade.
- Arquivos específicos de ferramenta continuam opcionais/complementares.

## 4) Workflows via comando `/`

### Evidência local

- `.agent/workflows/verify-first.md` existe.
- Não foi encontrada evidência local verificável de binding automático por slash command no ambiente CLI.

### Conclusão

- Tratar `.agent/workflows` como documentação operacional reutilizável.
- Só promover para UX obrigatória quando houver prova de suporte no Antigravity.

## 5) Buzzwords e operacionalização

### Ajuste aplicado

- Critério objetivo de execução definido por comando único: `npm run verify`.
- `verify` passou localmente com sucesso (typecheck + lint + format:check + test + build).

### Regra prática

- Substituir termos vagos por:
  - comandos executados;
  - saída observável;
  - critérios de aceite verificáveis.
