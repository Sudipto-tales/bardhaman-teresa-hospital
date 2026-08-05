# Component Specifications

Everything here is built once in `html/admin/assets/js/core/` +
`assets/css/components.css` and reused by all 42 screens. Page JS never
reimplements one of these.

---

## `core/layout.js` — shell

Injects `partials/topbar.html` and `partials/sidebar.html` into every page, then:

- marks the active nav item from `document.body.dataset.page`
- expands the group containing it
- restores the collapsed/expanded sidebar state from localStorage
- wires the mobile drawer (< 1024px the sidebar becomes an overlay)
- moves the active-pill indicator (ported from the existing `syncIndicator()` in
  root `app.js` — same approach: track `offsetTop`/`offsetHeight`, resync on
  resize, font load and `ResizeObserver`)

Every page's markup is therefore just:

```html
<body data-page="doctors">
  <div id="sidebar"></div>
  <div class="shell">
    <div id="topbar"></div>
    <main class="main">…page content…</main>
  </div>
  <script type="module" src="assets/js/pages/doctors.js"></script>
</body>
```

---

## `core/toast.js` — notifications

```js
import { toast } from '../core/toast.js';

toast.success('Doctor published', { action: { label: 'View on site', href: '…' } });
toast.error('Could not save — check your connection', { action: { label: 'Retry', onClick: save } });
toast.warning('9 of 12 published', { action: { label: 'View details', onClick: showPanel } });
toast.info('URL copied');
toast.success('Doctor deleted', { undo: () => store.restore('doctors', row), duration: 8000 });
toast.warning('Site is in maintenance mode', { persistent: true, id: 'maintenance' });
```

Behaviour:

| Aspect | Rule |
|---|---|
| Position | Bottom-right, 24px inset. Bottom-centre under 640px, full-width minus 16px |
| Stack | Newest at the bottom, max 3 visible; further toasts queue |
| Duration | 4000ms default, 8000ms when an action or undo is present, `persistent: true` never auto-dismisses |
| Pause | Hover and keyboard focus pause the timer; leaving resumes it |
| Dismiss | × button, `Esc` while focused, or swipe on touch |
| Dedupe | Same `id` replaces the existing toast instead of stacking |
| Motion | Slide + fade in 180ms `cubic-bezier(.22,1,.36,1)`; exit 140ms. Respects `prefers-reduced-motion` (fade only) |
| A11y | Container is `role="region" aria-live="polite"`; errors use `aria-live="assertive"`. Focus is never stolen |
| Anatomy | Icon disc · title · optional body · optional action button · close · progress hairline showing the remaining time |

Colours by type use the semantic tokens: success `--good`, error `--bad`, warning
`--accent-orange`, info `--brand-blue`.

---

## `core/modal.js` — dialogs and confirms

```js
const ok = await confirm({
  title: 'Delete Dr. Anita Sharma?',
  body: 'She appears on 2 department pages and the doctors page.',
  danger: true,
  confirmLabel: 'Delete doctor',
  typeToConfirm: 'Anita Sharma',   // optional, for high-consequence deletes
});

const data = await modal.form({ title: 'Add facility', fields: [...] });
```

- Backdrop blur, centred panel, max-width 520px (form modals 720px).
- Focus trapped; focus returns to the trigger on close.
- `Esc` closes unless `typeToConfirm` is set and unsatisfied.
- Danger variant tints the header rule and the confirm button red.
- Scroll lock on `<body>`; the panel itself scrolls if taller than the viewport.
- A dependency list renders as a bulleted block inside the body — this is how
  blocked deletes explain themselves (see `04-crud-flows.md`).

## `core/drawer.js`

Right-side sheet, 480px, for record detail without leaving the list — used by
`applications.html`, `gallery.html` and the media picker. Same focus rules as
modal. Slides from the right; becomes a bottom sheet under 640px.

---

## `core/table.js` — list tables

Given a `<table data-table>` and a row-render function, provides:

- **Search** — debounced 200ms, matches configured fields, highlights hits
- **Filters** — status chips and select filters, reflected in the query string
- **Sort** — click a `th[data-sort]`; three-state (asc, desc, none)
- **Pagination** — page size 20/50/100, page numbers with ellipsis
- **Selection** — header checkbox (page-scope), shift-click ranges, a floating
  bulk bar showing the count
- **Reorder** — drag handles, enabled only when sorting by `order`
- **Row actions** — an overflow menu, keyboard reachable
- **States** — skeleton rows while loading, empty state, filtered-empty state
- **Responsive** — under 900px the table becomes stacked cards with `data-label`
  driven pseudo-element labels; horizontal scroll is never the mobile answer

Sticky header, sticky first column on wide tables, and zebra-free rows (hairline
separators only — matches the public site's restraint).

---

## `core/form.js` — forms

- `bind(formEl, record)` fills fields from a record; `collect(formEl)` reads them
  back, coercing numbers, booleans and repeaters.
- **Validation** — declarative via attributes (`required`, `data-rule="slug"`,
  `data-max="60"`). Runs on blur, on input once a field has errored, and on
  submit. Errors render in `.field__error` under the control.
- **Dirty tracking** — snapshot on load, deep compare on change. Sets
  `form.dataset.dirty`, enables the Save button, adds the "Unsaved" chip, and
  registers a `beforeunload` guard plus an in-app navigation guard.
- **Sticky action bar** — pinned to the bottom of the content column: Cancel ·
  Save draft · Publish. Shows a spinner in place of the label while saving.
- **Character meters** — `data-max` renders a live counter that goes amber at the
  limit rather than blocking.
- **Autosave** — opt-in per form (`data-autosave="post:{id}"`), writes to
  localStorage every 20s, offers restore on next load, clears on successful save.

Field types: text, textarea, number, select, multi-select (chips), tags, toggle,
radio group, date, datetime, colour, icon picker, media picker, rich text,
repeater.

## `core/repeater.js` — array fields

Used everywhere `02-content-model.md` says "repeater": phones, emails, chips,
checks, procedures, conditions, responsibilities, milestones.

- Add row (button at the bottom), remove row (× per row, with a min-count guard)
- Drag to reorder
- **Paste a list** — pasting multiline text into an empty row splits it into one
  row per line. This is how a 12-item responsibilities list gets entered in one
  action instead of twelve.
- `min` / `max` attributes; add disables at max, remove at min
- Empty state inside the repeater with a "Add the first one" button

## `core/uploader.js` + media picker

- Drop zone and file input; drag-anywhere on gallery.
- Client-side validation: type allowlist, max 5MB, min dimensions for cover
  images.
- Per-file progress rows; a failed file stays in the list with a Retry.
- Phase 1 stores a data URL in localStorage. Phase 2 posts to `/api/media`.
- **Media picker** — opening a media field shows the gallery in a drawer with
  search, folder filter and an Upload tab. Selecting returns `{id, url, alt}`.
- Alt text is requested at upload time; skipping flags the item in the gallery's
  "missing alt" filter.

## `core/editor.js` — the writing pad

A `contenteditable` region with a sticky toolbar. No third-party dependency.

Toolbar: paragraph style (P, H2, H3, H4) · bold · italic · underline ·
bullet list · numbered list · blockquote · link · image · horizontal rule ·
callout box · clear formatting · undo/redo.

- **Paste is sanitised** — HTML from Word or Google Docs is stripped to the
  allowed tag set (`p h2 h3 h4 strong em u ul ol li blockquote a img hr figure
  figcaption`). Everything else is unwrapped. This is the single most important
  behaviour: unsanitised paste is how a CMS breaks a site's typography.
- **Link editing** — inline bubble with URL, text and open-in-new-tab; internal
  links autocomplete against the page list.
- **Image insert** — goes through the media picker, inserts a `<figure>` with an
  optional caption.
- **Slash menu** — typing `/` at the start of an empty line opens a block menu.
- Markdown shortcuts: `## ` → H2, `- ` → list, `> ` → quote, `**x**` → bold.
- Word count, character count and estimated read time under the pad.
- Full-screen toggle.
- The output is stored as HTML and rendered on the public site with the same CSS
  the article body already uses in `blog-post.html`.

## `core/store.js` — mock data layer (Phase 1 only)

```js
store.list('doctors', { q, status, sort, page, pageSize })  // → {rows, total}
store.get('doctors', id)
store.create('doctors', data)
store.update('doctors', id, patch)
store.remove('doctors', id)          // returns the removed row for Undo
store.restore('doctors', row, index)
store.reorder('doctors', idsInOrder)
```

- Seeds from `assets/data/<entity>.json` on first load, then reads and writes
  `localStorage['tmh-admin:<entity>']`.
- Simulates latency (120–260ms) so skeleton states are actually visible during
  design review.
- `store.reset()` wipes localStorage and re-seeds — exposed as a "Reset demo
  data" item in the topbar account menu.
- Every method returns a Promise, matching the shape `fetch` will have in Phase 2.
  Replacing this file is the whole backend integration on the client side.

## `core/theme.js`

Light/dark toggle, stored in `localStorage['tmh-admin-theme']`, resolved in a
blocking head script before first paint so there is no flash — same technique as
`website.html`'s head script. Re-renders Chart.js instances on change.

---

## Shared partials

- `partials/head.html` — meta, font links, stylesheet order, the theme
  pre-paint script.
- `partials/topbar.html` — global search, breadcrumb slot, theme toggle,
  notifications bell, account menu (Profile, Reset demo data, Sign out).
- `partials/sidebar.html` — logo, six nav groups, collapse toggle, version chip.

Changing the nav means editing one file, not 42.
