# Git & PR workflow

## Package manager

**pnpm only.** Never run `npm`/`yarn`. `only-allow pnpm` blocks the wrong one. After
dependency changes commit `pnpm-lock.yaml`; never commit `package-lock.json`.

## Branches

- Default and integration branch is **`dev`**. Never commit directly to `dev` — branch first.
- Branch names: **always `feature/MO-1234-short-desc`**, whatever the work is — a fix, a
  chore and a feature all use the same prefix. One prefix keeps branch listings and CI
  filters simple; the ticket already says what kind of work it is.

## Commits

- Format enforced by commitlint: **`[MO-1234] Description`**, e.g. `[MO-3841] Add get-started page`.
- **Message style: human, short, precise.** One imperative line describing _what_ changed
  (add a body only when the _why_ isn't obvious). Write as the author would — plainly.
- **Never** add AI/tooling references: no `Co-Authored-By: Claude`, no "Generated with…",
  no "🤖" — commits must read as authored by the developer.
- **Commit each small logical change separately** (data layer, component, tests…) so the
  history is easy to track — never one bundled commit for a whole task. Never bypass hooks
  (`--no-verify` is denied).
- The pre-commit hook runs lint-staged + type-check; the commit-msg hook runs commitlint.

## Before committing

Run `pnpm run sanitize` and the relevant specs. Don't commit red.

## Pull requests

- Target `dev`. Title mirrors the commit convention.
- Use `gh pr create`. Include: what/why, test evidence, and any follow-ups.
- CI runs `format:check · lint · type-check · build`.
