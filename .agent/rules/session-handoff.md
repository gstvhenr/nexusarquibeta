# Session Handoff Rule

At the end of every agent session:

1. Update `NEXT.md`.
2. If there was a structural change, update `DECISIONS-active.md` and/or `docs/adr/*`.
3. Ensure canonical gate status from `AGENTS.md` is explicit in handoff notes.
4. **tmp/ Hygiene:** Verificar `.agent/tmp/` — se há scripts com >30 dias sem uso, listar para o usuário decidir remoção. Nunca deletar scripts sem confirmação.
5. **Knowledge Promotion:** Se um erro foi corrigido e documentado em `lessons-learned.md`, avaliar se o raciocínio completo merece promoção para `.agent/knowledge/`. Consultar `.agent/knowledge/knowledge-promotion-protocol.md` para critérios.

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
