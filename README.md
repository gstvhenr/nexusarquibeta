# Nexus-Arqui

ERP web exclusivo para operação do profissional autônomo Rafael Munaro (clientes, propostas, projetos, financeiro e documentos).

## Setup rápido (humano)

1. Instalar dependências.
2. Iniciar ambiente de desenvolvimento.
3. Executar o gate canônico antes de concluir mudanças.

Comandos oficiais: consultar `AGENTS.md`.

## Testes

Estratégia e convenções: `TESTING.md`.
Comandos oficiais: `AGENTS.md`.

## Arquitetura (visão rápida)

```text
src/
  pages        -> composição de telas
  components   -> UI reutilizável
  services     -> regras de negócio
  context      -> estado global
  utils        -> funções puras
```

Documentação de arquitetura:

- `ARCHITECTURE.md`
- `docs/architecture.md`
- `docs/architecture-screaming.md`

## Regras do agente

- Contrato principal: `AGENTS.md`
- Contrato complementar de governança: `docs/governance/core-contract.md`
- Regras locais complementares: `.cursorrules`, `.agent/rules/*`
- Workflow operacional: `docs/process/agent-workflow.md`
- Exemplos canônicos: `docs/examples/canonical-service-client.md`, `docs/examples/canonical-component-client-row.md`

## Troubleshooting

- Erros de tipos/lint/test/build: execute o gate canônico definido em `AGENTS.md`.
- Segurança crítica: execute o comando de segurança definido em `AGENTS.md`.
- Porta de dev divergente: verifique `vite.config.ts` (`server.port`).
- Mudança estrutural sem registro: atualize `DECISIONS-active.md`/ADR e `NEXT.md`.

## Deploy contínuo

- O repositório expõe `Dockerfile` multi-stage para ambientes que fazem deploy por Git/Cloud Run.
- O runtime de produção usa `node server.mjs` para servir `dist/` com fallback SPA e respeitar `PORT`.
- Para compatibilidade com buildpacks Node, `package.json` também expõe `gcp-build` e `start`.
- O `server.mjs` injeta no HTML as envs públicas `VITE_PERSISTENCE_ADAPTER` e `VITE_FIREBASE_*`, permitindo que o frontend publicado leia a configuração do container em runtime.
