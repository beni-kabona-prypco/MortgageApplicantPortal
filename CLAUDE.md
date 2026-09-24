# CLAUDE.md

Guidance for Claude Code working in the **instamortgage-buyer** repository —
the buyer-facing portal where mortgage applicants complete identity verification and
sign off on key documents as part of the InstaMortgage flow.

## Stack

- **Angular 19** — standalone components, **no NgModules**
- **TypeScript 5** — strict, `strictTemplates`
- **Package manager: pnpm — NEVER use npm/yarn.** `only-allow pnpm` is enforced.
- **State:** plain Angular **signals** (`signal()`, `computed()`, `linkedSignal()`). No NgRx.
- **Tests:** Karma + Jasmine, co-located `*.spec.ts`.
- **Lint/format:** ESLint (flat config) + Prettier.
- **Hooks:** Husky + lint-staged; commitlint enforces **`[MO-1234] Subject`**.
- **Design system:** `@prypco/web-ui` — use its components for all UI (Button, Text, Icon, Input, Checkbox, OTP, Tooltip). Packages come from GitHub Packages (`@prypco` scope).
- **Styling:** Aeonik font + CSS-variable design tokens; **mobile-first** (`@media (width >= 768px)` for desktop); **BEM class naming** with SCSS nesting mirroring the template.
- **QR codes:** `angularx-qrcode` (`QRCodeComponent`, selector `qrcode`).

## Commands

```bash
pnpm start                              # ng serve → http://localhost:4200
pnpm build                              # production build

pnpm run sanitize                       # format:check + lint + type-check (run after every change)
pnpm run lint            # eslint          pnpm run lint:fix
pnpm run format:fix      # prettier write  pnpm run format:check
pnpm run type-check      # tsc --noEmit

pnpm run test:ci                        # Karma headless single run
pnpm exec ng test --include='**/path/to/file.spec.ts'   # single spec
```

## Buyer flow routes (all require `:applicationId`)

```
/                               → home (landing, no applicationId)
/get-started/:applicationId     → step 1 — buyer intro + QR code
/consent/:applicationId         → step 2 — T&C
/buyer-details/:applicationId   → step 3 — personal info
/verify-your-identity/:applicationId → step 4 — EID scan
/verification-completed/:applicationId → step 5 — success
/kfs/:applicationId             → step 6 — Key Facts Statement
```

## Architecture

```
src/app/
├── shared/        # reusable, stateless, feature-agnostic (ui, util)
│   ├── ui/           PageLayoutComponent, TopNavBuyerComponent, PageCardComponent
│   └── util/         pure functions
└── features/      # one lazy-loaded domain per folder (never import another feature)
    ├── get-started/
    ├── consent/
    ├── buyer-details/
    ├── verify-your-identity/
    ├── verification-completed/
    └── kfs/
```

- **Import boundaries:** `features/*` never import each other. `shared/*` imports neither `core` nor `features`.
- **Path aliases:** `@shared/*` → `src/app/shared/*`, `@features/*` → `src/app/features/*`, `@env/*` → `src/environments/*`.

## Critical conventions

1. **pnpm only.** Never run `npm`/`yarn`.
2. **Standalone + OnPush + `inject()`.** No NgModules, no constructor DI, no `@Input()/@Output()` — use `input()`/`output()`.
3. **Native control flow** `@if` / `@for` / `@switch`. No `*ngIf`/`*ngFor`, no `ngClass`/`ngStyle`.
4. **Access modifiers:** template-accessed members are `protected`; internal-only are `private`; `input()`/`output()` are the public API (no modifier needed).
5. **`<prypco-text>` golden rule.** Every piece of user-facing copy goes through `<prypco-text variant="..." element="...">`. Never raw `<p>`, `<span>`, `<h*>`. Never `<button class="...">` in feature templates — use `<prypco-button>`.
6. **No hardcoded values in SCSS.** Always use `var(--token)` from `src/styles/_variables.scss`. If a token is missing, add it there first.
7. **Mobile-first layout.** Base styles target mobile; wrap desktop-specific styles in `@media (width >= 768px)`.
8. **File separation:** types only in `*.model.ts`; constants only in `*.constants.ts`; pure helpers in `*.utils.ts`; one component per `*.component.ts`. See `.claude/rules/architecture.md`.
9. **Host styling:** no styling-wrapper root elements — style `:host`, bind dynamic classes via `host: {}` metadata.
10. **Commits:** `[MO-xxxx] Description` — human, short, precise; **no AI/`Co-Authored-By: Claude`/"🤖" references**. Never `--no-verify`. Branch off `dev`; PR into `dev`.

## Deep-dive rules → `.claude/rules/`

`architecture` · `angular` · `typescript` · `styling` · `testing` · `git` · `loop-risks` — **Reactive-loop and crash-risk patterns** (flag on sight — do not wait to be asked)

## Task scaffolds → `.claude/skills/` (invoke with `/name`)

`/component` · `/quality` · `/from-figma` · `/commit` · `/pr`
