# SECURITY.md

## Política de dependências

- Não instalar dependências sem aprovação explícita.
- Preferir upgrades mínimos e testáveis.

## Segredos

- Nunca commitar `.env`, tokens, chaves, credenciais.
- Sanitizar dados sensíveis em logs e fixtures.

## Gates de segurança

- Comando local e sequência oficial: consultar `AGENTS.md`.
- CI: executar os gates oficiais de `AGENTS.md` com bloqueio para severidade crítica.

## Critério de bloqueio

- Vulnerabilidade crítica bloqueia merge.

## Processo de incidente

1. Identificar pacote e severidade.
2. Definir mitigação (upgrade, patch, workaround).
3. Rodar os gates oficiais definidos em `AGENTS.md`.
4. Registrar decisão em `DECISIONS.md`/ADR se houver impacto estrutural.
