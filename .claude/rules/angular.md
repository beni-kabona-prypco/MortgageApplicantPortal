# Angular conventions (Angular 19)

## Components

- **Standalone only** — `standalone: true` is the default; never create NgModules.
- **`ChangeDetectionStrategy.OnPush`** on every component.
- **`inject()`** for DI — never constructor injection.
- **`input()` / `output()`** signal APIs — never `@Input()` / `@Output()`.
- **Signals** for local state: `signal()`, `computed()`, `linkedSignal()`. Derive with `computed`, never duplicate state.
- **Native control flow** in templates: `@if`, `@for` (with `track`), `@switch`, `@defer`. Never `*ngIf` / `*ngFor` / `*ngSwitch`.
- **No `ngClass` / `ngStyle`** — use `[class.x]` / `[style.x]` bindings or `[class]`/`[style]` with an object/expression.
- **`@let` for repeated signal reads.** When a template reads the same signal 2+ times, bind it once with `@let value = signal();`.
- **No pure function calls in templates.** Wrap in a `@Pipe` (default `pure: true` caches per input).

## Design-system components (`@prypco/web-ui`)

Whenever the DS ships a component, use it — never build a raw HTML equivalent:

- **Text → `<prypco-text>`** with `variant` + `element`. **Never raw `<p>` / `<span>` / `<h*>` for user-facing copy. This is the golden rule.**
- Buttons → `<prypco-button>`. Never `<button class="...">` in feature templates.
- Icons → `<prypco-icon>` with a name from the registry.
- Tooltip / Input / Checkbox / OTP Input / Password Input — same rule.

If the design calls for a component the DS doesn't cover, build it in `shared/ui/` (thin, token-driven, spec'd).

## Host element styling (no wrapper roots)

Templates must **not** add a root `<div>` that exists only to carry styles. The component's host element IS the block:

- Static host styles go on `:host` in the component SCSS.
- Dynamic classes bind via `host: { '[class]': 'hostClass()' }` metadata backed by a `computed()`.

## Access modifiers (enforced)

- Template-accessed members → **`protected`**.
- Internal-only members → **`private`**.
- `input()` / `output()` → no modifier (public API).

```typescript
export class ExampleComponent {
  private readonly route = inject(ActivatedRoute); // internal only
  protected readonly applicationId = toSignal(...); // used in template
  readonly brokerName = input.required<string>(); // public input
}
```

## Providers & bootstrapping

- Register app-wide providers in `app.config.ts` (functional: `provideRouter`, `provideHttpClient(withFetch(), withInterceptors([...]))`).
- Signals-first + OnPush — do not wrap signal writes in `zone.run`.

## Router

- Lazy-load features (`loadChildren` / `loadComponent`). Guards are functional (`CanActivateFn`).
- All buyer flow routes use `:applicationId` param: `get-started/:applicationId`, `consent/:applicationId`, etc.
