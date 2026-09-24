---
name: from-figma
description: Implement a screen/component from a Figma node using the Figma MCP + buyer portal tokens
---

Implement a design from Figma as instamortgage-buyer-conventional Angular.

Arguments: `$ARGUMENTS` — a Figma URL (must include `node-id`) and optional target location.

Steps:

1. If no node-specific URL is given, ask for one.
2. Call `get_design_context` (primary tool — returns reference code, screenshot, and hints).
   For very large nodes use `get_metadata` first to pick the right node, then `get_design_context`.
3. Extract the design's tokens (colors, spacing, type, radii) and map them to **existing
   `var(--token)`s** in `src/styles/_variables.scss`. If a token is missing, add it there first —
   never hardcode raw values from Figma.
4. Build standalone component(s) per `.claude/rules/angular.md`: OnPush, `inject()`,
   `input()/output()`, native control flow (`@if`/`@for`). Reuse `shared/ui` where it exists.
5. **prypco-text golden rule:** every piece of user-facing copy goes through `<prypco-text>`
   with the right `variant` and `element`. Never raw `<p>`, `<span>`, `<h*>`.
6. Style per `.claude/rules/styling.md`: tokens only, mobile-first (`@media (width >= 768px)`
   for desktop), BEM class names, SCSS nested to mirror the template.
7. Images and icons: use the exported asset URL as `src` for rendering; download-and-commit
   the bytes for anything that ships (asset URLs expire in ~7 days). Never hand-write SVG paths.
8. Add a smoke spec. Use `/test` for full coverage.
9. Run `pnpm run sanitize`, then show the result.

Treat `get_design_context` reference code as a **reference, not final code** — adapt it to
Angular + buyer conventions. Do NOT paste raw generated CSS from Figma; always translate to tokens.
