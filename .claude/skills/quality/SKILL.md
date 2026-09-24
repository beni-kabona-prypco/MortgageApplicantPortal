---
name: quality
description: Run the full code-quality suite (format, lint, type-check) and fix failures
---

Run instamortgage-buyer's full quality gate and drive it to green.

Steps:

1. Run `pnpm run sanitize` (format:check + lint + type-check).
2. If it passes — report success clearly.
3. If it fails — identify which check, list the errors, then fix each:
   - Format → `pnpm run format:fix`
   - ESLint → `pnpm run lint:fix`, then fix anything left by hand
   - Types → read the files and fix the type errors properly (no `any`, no `@ts-ignore`)
4. Re-run `pnpm run sanitize` until green.
5. Report final status.

If `$ARGUMENTS` names a path, scope lint/format to it where possible, but always finish
with a full `pnpm run sanitize`.

Do not silence errors with disables/`any` to pass — fix the root cause.
