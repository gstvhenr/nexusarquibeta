# Session Handoff Rule

At the end of every agent session:

1. Update `NEXT.md`.
2. If there was a structural change, update `DECISIONS-active.md` and/or `docs/adr/*`.
3. Ensure canonical gate status from `AGENTS.md` is explicit in handoff notes.
4. **tmp/ Hygiene:** Verificar `.agent/tmp/` — se há scripts com >30 dias sem uso, listar para o usuário decidir remoção. Nunca deletar scripts sem confirmação.
5. **Knowledge Promotion:** Se um erro foi corrigido e documentado em `lessons-learned.md`, avaliar se o raciocínio completo merece promoção para `.agent/knowledge/`. Consultar `.agent/knowledge/knowledge-promotion-protocol.md` para critérios.
