# Architecture Patterns Reference

> Quick reference for common patterns with usage guidance.

## Data Access Patterns

| Pattern           | When to Use                      | When NOT to Use                   | Complexity |
| ----------------- | -------------------------------- | --------------------------------- | ---------- |
| **Active Record** | Simple CRUD, rapid prototyping   | Complex queries, multiple sources | Low        |
| **Repository**    | Testing needed, multiple sources | Simple CRUD, single database      | Medium     |
| **Unit of Work**  | Complex transactions             | Simple operations                 | High       |
| **Data Mapper**   | Complex domain, performance      | Simple CRUD, rapid dev            | High       |

## Domain Logic Patterns

| Pattern                | When to Use                    | When NOT to Use           | Complexity |
| ---------------------- | ------------------------------ | ------------------------- | ---------- |
| **Transaction Script** | Simple CRUD, procedural        | Complex business rules    | Low        |
| **Table Module**       | Record-based logic             | Rich behavior needed      | Low        |
| **Domain Model**       | Complex business logic         | Simple CRUD               | Medium     |
| **DDD (Full)**         | Complex domain, domain experts | Simple domain, no experts | High       |

## Distributed System Patterns

| Pattern              | When to Use                     | When NOT to Use                      | Complexity |
| -------------------- | ------------------------------- | ------------------------------------ | ---------- |
| **Modular Monolith** | Small teams, unclear boundaries | Clear contexts, different scales     | Medium     |
| **Microservices**    | Different scales, large teams   | Small teams, simple domain           | Very High  |
| **Event-Driven**     | Real-time, loose coupling       | Simple workflows, strong consistency | High       |
| **CQRS**             | Read/write performance diverges | Simple CRUD, same model              | High       |
| **Saga**             | Distributed transactions        | Single database, simple ACID         | High       |

## API Patterns

| Pattern       | When to Use                        | When NOT to Use              | Complexity |
| ------------- | ---------------------------------- | ---------------------------- | ---------- |
| **REST**      | Standard CRUD, resources           | Real-time, complex queries   | Low        |
| **GraphQL**   | Flexible queries, multiple clients | Simple CRUD, caching needs   | Medium     |
| **gRPC**      | Internal services, performance     | Public APIs, browser clients | Medium     |
| **WebSocket** | Real-time updates                  | Simple request/response      | Medium     |

---

## Simplicity Principle

**"Start simple, add complexity only when proven necessary."**

- You can always add patterns later
- Removing complexity is MUCH harder than adding it
- When in doubt, choose simpler option

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
