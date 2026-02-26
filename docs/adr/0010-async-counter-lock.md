# ADR 0010 — Async Counter Lock (Busy-Wait Removal)

## Status

Accepted

## Context

`api.reserveGlobalIdentifier()` in `src/services/infrastructure/api.ts` contains a synchronous busy-wait loop that blocks the main thread for up to 250ms:

```ts
while (Date.now() < end) {
  // Busy-wait
}
```

This pattern blocks UI rendering, input processing, and any async operations during the wait. The function is on the "Don't Touch" list, requiring this ADR before modification.

**Single caller**: `OrcamentosPage.tsx` line 83.

## Decision

Replace the synchronous busy-wait with `setTimeout`-based async delay:

```diff
-  reserveGlobalIdentifier: (): number => {
+  reserveGlobalIdentifier: async (): Promise<number> => {
     ...
-    const end = Date.now() + COUNTER_LOCK_RETRY_MS;
-    while (Date.now() < end) { /* Busy-wait */ }
+    await new Promise(resolve => setTimeout(resolve, COUNTER_LOCK_RETRY_MS));
```

The lock mechanism (`counterLock.ts`) remains unchanged. Only the waiting strategy changes.

## Consequences

- **Positive**: Main thread no longer blocked during lock contention.
- **Breaking**: Return type changes from `number` to `Promise<number>`. All callers must `await`.
- **Scope**: Only 1 caller (`OrcamentosPage.tsx`) needs updating.
- **Reversible**: Revert to sync loop by removing `async`/`await`.
