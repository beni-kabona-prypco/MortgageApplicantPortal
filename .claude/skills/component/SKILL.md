---
name: component
description: Scaffold an Angular 19 standalone component (ts/html/scss/spec) per instamortgage-buyer conventions
---

Scaffold a standalone Angular 19 component.

Arguments: `$ARGUMENTS` — component name, optionally with a path, e.g.
`shared/ui/status-badge` or `get-started/step-indicator`.

Steps:

1. Resolve the target dir from `$ARGUMENTS`. If no path prefix, ask where it belongs
   (`shared/ui`, a feature folder, etc.) — respect the boundaries in `.claude/rules/architecture.md`.
2. Create four files in `<dir>/<name>/`: `<name>.component.ts|html|scss|spec.ts`.

**`<name>.component.ts`:**

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-<name>',
  imports: [],
  templateUrl: './<name>.component.html',
  styleUrl: './<name>.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <Name>Component {}
```

**`<name>.component.scss`:** start with `:host { display: block; }`.

**`<name>.component.spec.ts`:** smoke test only (`should create`). Fuller coverage comes via `/test`.

Follow `.claude/rules/angular.md` + `styling.md`:

- **`@prypco/web-ui` first — golden rule.** Before writing any text, use `<prypco-text>`. Before
  adding a button, use `<prypco-button>`. Never use raw `<p>`, `<span>`, `<h*>` for user-facing
  copy, and never use `<button class="...">` in feature templates.
- No `standalone: true`; always `OnPush`; `inject()` not constructor DI.
- `input()` / `output()` — not `@Input()`/`@Output()`.
- Template members `protected`, internal `private`.
- Native control flow (`@if`/`@for` with `track`); no `ngClass`/`ngStyle`.
- SCSS uses `var(--token)` only — never hardcode values.
- Mobile-first styles; `@media (width >= 768px)` for desktop.

Finally: run `pnpm run sanitize` and fix any issues.
