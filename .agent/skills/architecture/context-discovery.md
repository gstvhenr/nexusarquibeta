# Context Discovery

> Before suggesting any architecture, gather context.

## Question Hierarchy (Ask User FIRST)

1. **Scale**
   - How many users? (10, 1K, 100K, 1M+)
   - Data volume? (MB, GB, TB)
   - Transaction rate? (per second/minute)

2. **Team**
   - Solo developer or team?
   - Team size and expertise?
   - Distributed or co-located?

3. **Timeline**
   - MVP/Prototype or long-term product?
   - Time to market pressure?

4. **Domain**
   - CRUD-heavy or business logic complex?
   - Real-time requirements?
   - Compliance/regulations?

5. **Constraints**
   - Budget limitations?
   - Legacy systems to integrate?
   - Technology stack preferences?

## Project Classification Matrix

```
                    MVP              SaaS           Enterprise
┌─────────────────────────────────────────────────────────────┐
│ Scale        │ <1K           │ 1K-100K      │ 100K+        │
│ Team         │ Solo          │ 2-10         │ 10+          │
│ Timeline     │ Fast (weeks)  │ Medium (months)│ Long (years)│
│ Architecture │ Simple        │ Modular      │ Distributed  │
│ Patterns     │ Minimal       │ Selective    │ Comprehensive│
│ Example      │ Next.js API   │ NestJS       │ Microservices│
└─────────────────────────────────────────────────────────────┘
```

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
