---
name: commit
description: Stage and commit changes with a valid [MO-xxxx] message, respecting hooks
---

Create a well-formed commit.

Steps:

1. Run `git status` and `git diff` to review what changed. **Commit each small logical change
   separately** — component, tests, and config each get their own commit; a series of small,
   scoped commits always beats one bundled commit. Never mix concerns in one commit.
2. Ensure quality is green first: `pnpm run sanitize` (and relevant specs for code changes).
3. If on `dev`, **branch first** (`feature/MO-1234-short-desc`) — never commit to `dev` directly.
4. Derive the ticket from the branch or ask the user. Compose a **human, short, precise**
   message: **`[MO-1234] Imperative summary of the change`** (commitlint enforces the
   `[MO-####]` prefix). One line unless the _why_ needs a short body. Write it as the
   developer would — plain and to the point.
5. `git add` the relevant files (not stray/unrelated ones) and commit.
6. The pre-commit hook runs lint-staged + type-check; the commit-msg hook runs commitlint. If a
   hook fails, fix the cause and retry — **never** use `--no-verify` (it is denied).
7. Confirm with `git log -1 --stat`.

**Never** add AI/tooling references to the message — no `Co-Authored-By: Claude`, no
"Generated with…", no "🤖". Commits must read as authored by the developer. Do not push
unless asked (use `/pr`).
