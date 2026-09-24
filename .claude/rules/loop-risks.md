# Reactive Loop and Crash Risk Patterns

When reading or editing **any Angular TypeScript file**, actively scan for the patterns below and
flag them immediately — do not wait to be asked.

---

## Pattern 1 — `allowSignalWrites: true` in `effect()` without a loop-termination proof

**Severity: HIGH — latent loop on any signal write**

`allowSignalWrites: true` lets an `effect()` write to a signal that may itself be tracked by the
same effect. Without a proof that the write terminates, this is a latent infinite loop.

**Flag when you see:**

```typescript
effect(() => { ... }, { allowSignalWrites: true })  // no comment above it
```

**Required action:**

Add a comment block directly above the effect proving loop termination — one of:

- The written signal is **not** tracked inside this effect (it is never read via `signalFoo()`
  inside the effect body), OR
- The write is idempotent (sets the same value that was already there), OR
- A guard prevents re-entry: `if (step === maxAllowed) return;`

---

## Pattern 2 — Signal read + written in same `effect()` without `untracked()`

**Severity: HIGH — direct feedback loop**

If an `effect()` reads `this.foo()` (tracked dependency) and also calls `this.foo.set(...)`
(write), Angular re-runs the effect after every write, which reads again — unbounded loop.

**Flag when you see:**

- `this.foo()` and `this.foo.set(...)` both appearing inside the body of the same `effect()`.

**Required fix:**

- Move the write to an event handler outside the effect.
- Wrap the read with `untracked(() => this.foo())` so it does not re-trigger the effect.
- Replace with `computed()` if the value is purely derived.

---

## Pattern 3 — Object/array literals emitted from observables without content-equality dedup

**Severity: MEDIUM — silent bypass of identity-based dedup, latent loop risk**

Any observable that constructs a fresh object or array on every emission
(`{ ... }`, `arr.map(...)`, `arr.filter(...)`) will never pass a reference-equality check.
Downstream `distinctUntilChanged()` with no comparator is silently bypassed.

**Flag when you see:**

- `.next({ ... })` or `.next(arr.map(...))` on a Subject/BehaviorSubject.

**Required fix:**

```typescript
someSubject.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)));
```

---

## Quick-reference severity table

| Pattern                                                          | Severity  |
| ---------------------------------------------------------------- | --------- |
| `allowSignalWrites: true` without termination proof              | 🔴 HIGH   |
| Signal read + written in same `effect()` without `untracked()`  | 🔴 HIGH   |
| Object literals emitted without content-equality guard           | 🟡 MEDIUM |
