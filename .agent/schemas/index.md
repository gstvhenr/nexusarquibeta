# 📚 Schemas & Validation Layer (Agent Knowledge)

> **MANDATORY**: Esta é a Documentação Viva do sistema de Schemas do Nexus-Arqui. Qualquer Agente operando em fluxos que exijam outputs estruturados (Data Contracts, Parâmetros de Skills) **DEVE** ler e aderir a este padrão.

## 🎯 O Propósito dos Schemas

Os schemas funcionam como a camada de validação estática e de runtime que fundamenta a interoperabilidade estrutural entre o Modelo de Linguagem (você) e a infraestrutura de ferramentas.

1. **Eliminar a Ambiguidade:** Os tipos Typescript ditam o que é obrigatório, opcional, e em qual formato. Extensões (chaves não documentadas) são desencorajadas ou falharão.
2. **Permitir a Composição:** Os outputs de um agente tornam-se inputs seguros do próximo agente na pipeline.
3. **Segurança de Execução:** Uma ferramenta só será chamada quando os argumentos passarem na validação estrita, prevenindo corrupção no `Nexus-Arqui`.

---

## 🔁 O Ciclo de Auto-Correção (Self-Healing)

Para um sistema _Agent-First_ não quebrar, validações que falham disparam um processo de _Self-Healing_.
Quando uma skill ou ferramenta rejeitar seu output através de uma função de runtime (`validator.ts`), você não será interrompido permanentemente. Em vez disso, **você receberá a mensagem exata de erro de validação**.

### Como agir diante do "Self-Healing"

- **Leia o erro cuidadosamente:** O validador apontará `Campo faltante`, `Tipo incorreto` ou `Valor não suportado`.
- **Corrija sem reclamar:** Simplesmente gere a resposta novamente utilizando o formato rigidamente exigido pelo Schema (olhe para a `interface` equivalente).

---

## 🛠️ Como os Schemas são Construídos

Nosso ecossistema não utiliza dependências externas (como Zod) para manter o núcleo leve e agnóstico, mas sim **Custom TypeScript Type Guards** aliados a uma checagem rigorosa de runtime via código puro.

### Padrão para um Título de Schema

Todo novo schema criado em `.agent/schemas/*.schema.ts` DEVE conter:

1. Uma `interface` clara.
2. Uma função Type Guard ex: `isTask(data: unknown): data is Task`.
3. Uma documentação de "Expected Input" focada no agente (`JSDoc`).

Consulte `agent-task.schema.ts` como o paradigma principal.
