# Styling

## Tokens — never hardcode

All colors, spacing, radii, font sizes/weights, shadows, and z-index are CSS custom properties
in `src/styles/_variables.scss` (`:root`). **Always** use `var(--token)`. Never write a raw
hex, px spacing, or magic number in a component.

**Lookup order** — before using a hardcoded value, walk this ladder in order:

1. **Local `--` token** (`var(--color-text)`, `var(--space-4)`) — check `src/styles/_variables.scss` first.
2. **Extend `_variables.scss`** — if a semantic value has no home, add a token there first. Reused literals belong in the token file, not in component SCSS.
3. **Literal + justification comment** — only for genuinely one-off, unambiguous dimensions (e.g. a fixed illustration size used exactly once). Explain in a comment why no token fits.

```scss
// good
color: var(--color-text);
padding: var(--space-4);
inline-size: 8.75rem; // one-off — avatar used once at this exact size

// bad
color: #0b0c0f;
padding: 16px;
```

## UI fidelity

Implementations must match the design **exactly** — spacing, sizes, colors, radii, borders,
typography, icon sizes, alignment. Read the precise values from Figma, map each to the right
token, and visually compare the result against the design before finishing. "Close enough" is
not done.

## Component stylesheets

Use `@use 'abstracts' as *;` if mixins are needed (resolved via `stylePreprocessorOptions.includePaths`).
Keep component styles scoped. Use `:host` for host-level styles.

## Layout

- **Mobile-first.** Default styles target mobile; use `@media (width >= 768px)` for desktop.
- No CSS grid in general layouts — prefer flexbox. Grid is allowed for overlay patterns (e.g. stacking a QR background image under a card via `place-items: center`).
- The buyer portal desktop card is `width: 900px` centered; the background covers the full viewport.

## Class naming — BEM, SCSS mirrors the template

Classes follow **BEM**: `block__element` and `block__element--modifier`. The block is the
component name; the component's host element is the block itself — host-level styles go
on `:host`. Nest SCSS to mirror the template hierarchy.

## Text rendering

All user-facing text renders through **`<prypco-text>`** (`TextComponent`, `variant` + `element`
inputs from `@prypco/web-ui`). **Never render user-facing copy in raw `<p>`, `<span>`, `<h*>`
elements. This is the golden rule.**

Buyer variant sizes: `heading-bold-md` 32px · `paragraph-bold-xl` 24px ·
`paragraph-*-lg/md/sm/xs` 18/16/14/12px · `mobile-paragraph-*-md` 14px.

## Fonts

`Aeonik` is the brand typeface (`--font-family-sans`). Use `font-weight: var(--font-weight-medium)` etc.

## Tooling

Prettier must pass: `pnpm run format:check` / `pnpm run format:fix`.
ESLint must pass: `pnpm run lint` / `pnpm run lint:fix`.
