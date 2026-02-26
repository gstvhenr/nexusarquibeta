# ADR 0011 — Domain Context Decomposition

## Status

Accepted

## Context

`DataContext.tsx` manages all 27 entities of `AppData` through a single React Context, with a single `useMemo` value object. This causes:

- **Excessive re-renders**: Any field change triggers re-render of all 37 consumers.
- **No granular subscription**: A page needing only `clients` still receives updates from `marketingIdeas`.
- **Cognitive overload**: 27 setters in a single interface.

## Decision

Decompose into 5 domain-specific contexts, each managing a subset of `AppData`:

| Domain      | Fields                                                                                                                                                                 | Hook                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Core        | projects, proposals, clients                                                                                                                                           | `useCoreData()`        |
| Finance     | commissions, manualExpenses, manualIncomes, cashBoxExpenses, cashBoxCredits                                                                                            | `useFinanceData()`     |
| SupplyChain | suppliers, products, supplierProductPrices, quotations, freelancers                                                                                                    | `useSupplyChainData()` |
| Marketing   | marketingProfessionals, marketingActivities, marketingIdeas, socialNetworks, prospects                                                                                 | `useMarketingData()`   |
| System      | documentStorage, agendaEvents, reminders, customBudgetTemplate, globalIdentifierCounter, dismissedFocusItems, acceptedPaymentMethods, hiredServices, contractDeadlines | `useSystemData()`      |

### Backward Compatibility

`useData()` remains as a **façade** that merges all domain hooks. Zero existing consumers break. Migration to domain hooks is incremental and optional.

### Provider Structure

`DataProvider` nests domain providers internally — no changes to `App.tsx` or consumer code.

## Consequences

- **Positive**: Consumers subscribing to domain hooks only re-render on domain changes.
- **Positive**: Zero breaking changes — full backward compatibility via `useData()` façade.
- **Risk**: `useData()` façade still causes all-domain re-renders (by design, for backward compat).
- **Migration**: Consumers can incrementally switch from `useData()` to domain hooks.
- **Reversible**: Remove domain contexts and revert to single context.
