---
name: pr
description: Push the current branch and open a PR into dev with a proper description
---

Open a pull request into `dev`.

Steps:

1. Confirm you're on a feature branch (not `dev`). If on `dev`, stop and branch first.
2. Ensure everything is committed and green: `pnpm run sanitize` + `pnpm run test:ci`.
3. Push: `git push -u origin <branch>` (this will prompt — that's expected).
4. Create the PR with `gh pr create --base dev` and a body containing:
   - **What & why** — the change and its motivation (link the `MO-####` ticket).
   - **Testing** — what you ran / added.
   - **Screenshots** — for UI changes.
   - **Follow-ups** — anything deferred.
5. Title mirrors the commit convention: `[MO-1234] Summary`.
6. Report the PR URL.

CI (`format:check · lint · type-check · build`) must pass on the PR. If red, fix and push again.
Never force-push shared branches.
