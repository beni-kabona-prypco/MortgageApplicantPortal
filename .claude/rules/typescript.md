# TypeScript conventions

- **Strict everywhere.** No `any` — use `unknown` + narrowing. No non-null `!` on optional-chained values.
- **`readonly` by default** on interface fields and injected members. Prefer immutable data.
- **DTO ↔ model separation.** Wire types are `*.dto.ts`; domain types are `*.model.ts`. Convert with mapper functions **in the service layer, never in components or templates**.
- **Models only in `*.model.ts`.** Every interface/type/enum lives in a `*.model.ts` file — never inline in a service, component, or constants file.
- **Constants only in `*.constants.ts`.** Every constant value (config objects, lookup maps, magic numbers/strings) lives in a `*.constants.ts` file.
- **Helpers only in `*.utils.ts`.** Non-trivial pure functions live in a `*.utils.ts` file with a co-located `*.utils.spec.ts` covering every branch.
- **Never duplicate a type.** A type needed by 2+ areas moves to a shared home; never copy-pasted.
- **Discriminated unions** for state (`{ status: 'loading' } | { status: 'error'; error: string }`) over boolean flags.
- **Enums vs unions:** prefer string literal unions (`type Step = 'consent' | 'details' | 'verify'`) unless a real enum is needed.
- **Access modifiers** as in `angular.md`: `protected` for template, `private` for internal, none for `input()/output()`.
- **Path aliases** (`@shared/*`, `@features/*`, `@env/*`) over deep relative imports. Any relative import climbing two or more parents is a code-smell.
- **Barrels:** each module folder exposes an `index.ts`; import from the barrel.
- **Name variables descriptively.** No one-letter locals — use the domain noun.
- No `console.*` in feature code.

## Code style (ESLint-enforced)

- **`if` statements are always braced** — never `if (x) return;` on one line.
- **Blank line above and below every `if` block**, unless it is the first or last statement of its enclosing block.

## Prefer

- `??` over `||`, optional chaining, `as const`, `readonly` members, `startsWith/endsWith`, `includes`.
- `replaceAll` over `replace(/…/g, …)`.
- Avoid empty interfaces, unnecessary type args, useless constructors, and redundant casts.
