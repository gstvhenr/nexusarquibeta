---
description: Create a Product Requirements Document (PRD) focused on business value, user journeys, and telemetry tracking (PostHog/GA events) before technical mapping.
---

# /prd - Definição de Negócio e Tracking

$ARGUMENTS

---

## Propósito

Separar "O Quê" do "Como". Explicar as motivações de negócio e os casos de uso para garantir que a equipe saiba _por que_ algo está sendo feito. Crucial para definir as métricas de sucesso (Tracking) **antes** de escrever qualquer linha de código React.

---

## 🔴 Regras Invioláveis

1. **PROIBIDO ARQUITETURA:** Não liste arquivos (`.ts`, `.tsx`), funções ou hooks do Nexus-Arqui neste documento. O foco é 100% no negócio e no usuário.
2. **PENSAMENTO SEQUENCIAL OBRIGATÓRIO:** O agente deve usar a tool `mcp_sequential-thinking` para idealizar os eventos de Tracking/Telemetria. Reflita sobre o valor de 5 eventos diferentes, descarte 4 e documente apenas o evento mais crítico para o negócio.
3. **TRACKING OBRIGATÓRIO:** Todo PRD deve, sem exceção, conter uma seção de "Plano de Telemetria/Tracking". Como saberemos se a feature deu certo?
4. **MÉTRICAS CLARAS:** Defina Casos de Uso com alto nível de detalhe.

---

## Comportamento

Quando `/prd` for acionado com um argumento (o tema do épico ou feature):

### 1. Descoberta Ativa (Socratic Gate)

A IA deve engajar em um Socratic Gate específico para Produto:

1. Qual o principal problema do Arquiteto (usuário final) que estamos tentando resolver?
2. Como esta feature impacta o financeiro ou a gestão de projetos deles?
3. Quais os fluxos alternativos (edge cases)?

_(Opcional: A IA pode sugerir os próprios casos de uso para aprovação se o usuário for vago)._

### 2. Geração do Documento de Requisitos

A IA criará um arquivo em `docs/prd/[feature-slug].md`.

---

## Output Format

```markdown
# PRD: [Nome da Feature]

📅 Data: [YYYY-MM-DD] | Status: [Draft/Approved]

## 1. Motivação e Objetivos (Business Value)

[O que estamos construindo e por que é importante para o Nexus-Arqui e seus usuários finais].

## 2. Casos de Uso (User Journeys)

- **Caminho Feliz (Happy Path):** O Arquiteto entra, clica em X, vê Y.
- **Fluxo Alternativo:** Se o arquiteto não tiver permissão ou os dados faltarem, ele vai para Z.
- **Edge Cases:** [Mapear no mínimo 2 edge cases para proteger a UX].

## 3. Plano de Tracking (Telemetria OBRIGATÓRIA) 📊

Defina os eventos analíticos que validarão se a feature teve sucesso no funil de conversão ou engajamento:

| Evento de Tracking        | Propriedades/Payload                   | Gatilho (Trigger)                |
| :------------------------ | :------------------------------------- | :------------------------------- |
| `financeiro_view_monthly` | `{ origin: 'dashboard', month: '10' }` | Clicou na tab mensal             |
| `proposal_filter_applied` | `{ filter_type: 'status', count: 5 }`  | Aplicou filtros grandes na lista |

---

**Próximo Passo:** Com o negócio claro, rode `/plan docs/prd/[feature-slug].md` para gerar o TechSpec exato (mapeamento de arquivos e dependências).
```

---

## Exemplos de Uso

```text
/prd novo módulo de gestão de tarefas da obra
/prd filtros avançados de funil de vendas na tela de propostas
```
