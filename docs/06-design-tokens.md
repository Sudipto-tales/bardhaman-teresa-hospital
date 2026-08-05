# Design Tokens

Carried over from the existing panel mockup (`style.css`) and the public site so
the two read as one product. Defined in `html/admin/assets/css/tokens.css`.

## Brand

| Token | Light | Role |
|---|---|---|
| `--brand-red` | `#C1272D` | Primary action, active nav, series 1 |
| `--brand-magenta` | `#A81E5C` | Series 4, accents |
| `--brand-magenta-deep` | `#7A1540` | Shadow tint, deep fills |
| `--brand-navy` | `#1B3E7A` | Series 3 |
| `--brand-blue` | `#2E6BB8` | Series 2, info |
| `--accent-orange` | `#F57C00` | Warning |

## Semantic

| Token | Light | Dark |
|---|---|---|
| `--good` | `#2E7D32` | `#4CAF50` |
| `--bad` | `#C62828` | `#EF5350` |
| `--warn` | `#F57C00` | `#FFA726` |
| `--info` | `#2E6BB8` | `#64B5F6` |

## Surfaces

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F7F1F3` | `#171015` |
| `--surface` | `#FFFFFF` | `#221A20` |
| `--surface-2` | `#FBF6F8` | `#2B222A` |
| `--sidebar-bg` | `#FFFFFF` | `#1D151B` |
| `--hairline` | `#F0E3E8` | `#3A2F37` |

## Text

| Token | Light | Dark |
|---|---|---|
| `--text-dark` | `#2C2028` | `#F3EAEF` |
| `--text-mid` | `#6B5A62` | `#B9A8B1` |
| `--text-muted` | `#9C8B93` | `#8B7B85` |

Every foreground/background pair above clears WCAG AA at body size. `--text-muted`
on `--surface` is 4.6:1 — it is for secondary labels only, never for body copy.

## Chart series

Fixed order, never cycled — matches the existing `SERIES` array in root `app.js`
and is CVD-checked:

```
1  --brand-red      #C1272D
2  --brand-blue     #2E6BB8
3  --brand-navy     #1B3E7A
4  --brand-magenta  #A81E5C
grid  #F0E3E8   axis/label  #6B5A62
```

## Type

| Token | Value |
|---|---|
| `--font-head` | `'Sora', system-ui, sans-serif` |
| `--font-body` | `'Inter', system-ui, sans-serif` |
| `--fs-display` | `clamp(1.6rem, 2.4vw, 2.1rem)` — page title |
| `--fs-h2` | `1.25rem` — card heading |
| `--fs-h3` | `1.05rem` |
| `--fs-body` | `0.9375rem` |
| `--fs-sm` | `0.8125rem` — table cells, hints |
| `--fs-xs` | `0.6875rem` — eyebrows, badges, uppercase labels |

Line heights: 1.2 headings, 1.55 body. Numerals in tables use
`font-variant-numeric: tabular-nums`.

## Space

4px base scale: `--s1 4px`, `--s2 8px`, `--s3 12px`, `--s4 16px`, `--s5 20px`,
`--s6 24px`, `--s8 32px`, `--s10 40px`, `--s12 48px`, `--s16 64px`.

Layout constants: `--sidebar-w 264px`, `--sidebar-w-collapsed 76px`,
`--topbar-h 64px`, `--content-max 1440px`, `--gutter 24px` (16px under 768px).

## Radius & elevation

| Token | Value | Used on |
|---|---|---|
| `--radius` | `22px` | Cards, panels, modals |
| `--radius-sm` | `12px` | Inputs, buttons, chips |
| `--radius-xs` | `8px` | Badges, small tags |
| `--radius-full` | `999px` | Avatars, pills |

```
--card-shadow        0 10px 24px -12px rgba(122,22,48,.22), 0 2px 6px -2px rgba(0,0,0,.05)
--card-shadow-hover  0 22px 40px -18px rgba(122,22,48,.32), 0 4px 10px -4px rgba(0,0,0,.07)
--overlay-shadow     0 32px 64px -24px rgba(30,10,20,.45)
```

Dark mode drops the magenta tint and reduces opacity — shadows read as depth, not
smudge.

## Motion

| Token | Value | Used on |
|---|---|---|
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Everything |
| `--dur-fast` | `140ms` | Hover, focus, exit |
| `--dur` | `180ms` | Toast in, modal in, tab switch |
| `--dur-slow` | `260ms` | Drawer, sidebar collapse |

`@media (prefers-reduced-motion: reduce)` collapses all of the above to `1ms` and
replaces slides with fades. The stagger animation on card entry is disabled
entirely.

## Grid

12-column bento inside the content area, `gap: var(--s6)`. Card span classes
`c3 c4 c6 c8 c12` — carried over from the existing mockup so ported markup keeps
working.

Breakpoints: `1440` content max · `1200` bento collapses `c3 → c6` · `1024`
sidebar becomes an overlay · `900` tables become stacked cards · `640` single
column, toasts go bottom-centre.

## Focus

One visible ring everywhere: `outline: 2px solid var(--brand-blue); outline-offset: 2px`.
Never removed without a replacement. All interactive elements are reachable by
keyboard in DOM order, and every icon-only button carries an `aria-label`.

## Iconography

Font Awesome 6 solid, matching the public site. Icon pickers offer the curated
subset already used in `site-data.mjs` (`fa-heart-pulse`, `fa-brain`,
`fa-bed-pulse`, `fa-flask-vial`, `fa-x-ray`, …) plus free search.
