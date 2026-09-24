# Testing

Karma + Jasmine, specs **co-located** next to source (`*.spec.ts`).

Run: `pnpm run test:ci` (headless, single run) · `pnpm exec ng test --include='**/x.spec.ts'` (one file).

## What to test

- **Pure functions / mappers** — cover every branch: all inputs, edge cases.
- **Services** — `HttpTestingController`; assert URL, params, and response mapping.
- **Guards** — `TestBed.runInInjectionContext(() => guard(...))` with a mocked router/store.
- **Components** — render + assert user-visible behavior; avoid testing internals.

## Idioms

- Mock collaborators with `jasmine.createSpyObj<T>('Name', ['method'])` and provide via `{ provide, useValue }`.
- List **every** method the subject calls in `jasmine.createSpyObj` — a missing one is a `TypeError` at call time, not a compile error.
- Restore any global/document state in `afterEach`.
- Prefer testing behavior/outputs over implementation.

## Scaffolding vs full coverage

`/component` scaffolds a **smoke test only** (`should create`). Comprehensive coverage is
added deliberately via **`/test`** or when the user asks. Don't leave new runtime code
uncovered when finishing a task.
