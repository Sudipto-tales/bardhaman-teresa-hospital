# CRUD Flows

One set of rules, applied by every screen. If a module deviates, it is documented
in [`03-page-specs.md`](03-page-specs.md).

**One module is exempt entirely.** `appointments` is read-only — no create, no
update, no delete, no bulk, no reorder. The site takes no bookings, so there is
nothing to confirm or cancel. Nothing below applies to it.

## Status model

```
                 ┌──────────┐
   create ──────►│  draft   │
                 └────┬─────┘
                      │ Publish
                      ▼
   ┌──────────┐  ┌───────────┐  Unpublish  ┌──────────┐
   │scheduled │─►│ published │────────────►│  hidden  │
   └──────────┘  └───────────┘             └────┬─────┘
        ▲             │                          │ Publish
        │ Publish at  │ Delete                   │
        └─────────────┴──────────────────────────┘
```

| Status | On the public site | Badge |
|---|---|---|
| `draft` | Not rendered. No URL. | `.tag warn` — Draft |
| `published` | Live | `.tag ok` — Published |
| `hidden` | Not rendered, URL 404s, record kept | `.tag off` — Hidden |
| `scheduled` | Goes live at `publishedAt` | `.tag info` — Scheduled |

Delete is separate from status and always soft in Phase 2 (`deletedAt` set,
purged after 30 days). Phase 1's mock store removes the row outright but keeps it
in memory long enough for Undo.

---

## Create

1. List screen → **Add** (page header, primary button).
2. Form opens with defaults: `status = draft`, `order = max + 1`, current user as
   author where applicable.
3. Validation runs on blur per field and again on submit.
4. **Save draft** → stays on the form, toast `success` "Doctor saved as draft",
   URL gains `?id=` so a reload does not create a duplicate.
5. **Publish** → validates required-for-publish fields (stricter than draft: SEO
   title, cover image, slug), then returns to the list with the new row
   highlighted for 2s and a toast "Doctor published · View on site".

Duplicate-slug handling: the slug field checks on blur, shows an inline error,
and offers the next free variant (`cardiology-2`).

## Read

- List loads via `store.list(entity, {q, status, sort, page})`.
- Toolbar state is mirrored into the query string, so a filtered list is a
  shareable URL and survives reload and back-navigation.
- Page size 20, with 50/100 options. Server-side in Phase 2.

## Update

1. Row → **Edit**, or click the row's primary cell.
2. Form loads the record. A snapshot is taken for the dirty check.
3. Any change marks the form dirty: the action bar's Save button enables and the
   page title gains an "Unsaved" chip.
4. Leaving a dirty form — sidebar click, back button, tab close — triggers a
   confirm modal: Discard changes / Keep editing.
5. **Update** → toast `success` "Doctor updated". Stay on the form; do not bounce
   the user back to the list mid-edit.
6. Editing a published record shows a "Live" indicator; the Update button reads
   "Update & republish".

Concurrent edit (Phase 2): the form sends `updatedAt`; a mismatch returns 409 and
the panel shows a conflict panel with both versions rather than silently winning.

## Delete

Never inline, never one click.

1. Row action **Delete** → confirm modal.
2. Modal names the record: "Delete *Dr. Anita Sharma*?" and states the
   consequence: "This removes her from 2 department pages and the doctors page."
3. **Dependency check first.** If other records reference this one, the modal
   lists them and the delete is blocked or offers a reassignment:

   | Entity | Blocked when | Offer |
   |---|---|---|
   | Doctor | Author of published posts | Reassign author |
   | Department | Has published page + doctors | Reassign doctors, then delete |
   | Category | Posts reference it | Reassign to another category |
   | Media | `usedBy` non-empty | List the records; force-delete is opt-in |
   | User | Owns assigned enquiries | Reassign |

4. Confirm → row disappears with a fade, toast `success` "Doctor deleted" with an
   **Undo** action live for 8s.
5. Undo restores the row at its original index and toasts "Restored".

Destructive-with-scale actions (bulk delete of 10+, deleting a department with a
live page) require typing the record name to confirm.

## Bulk actions

1. Header checkbox selects the page; a bar appears: "12 selected · Publish ·
   Hide · Delete · Clear".
2. Bulk delete uses the same confirm modal, with the count and a sample of names.
3. Partial failure reports honestly: toast `warning` "9 published, 3 failed —
   view details", the details link opening a panel with the per-row reason.

## Reorder

- Only enabled when the list is sorted by `order`. Any other sort disables drag
  and shows a hint.
- Drag writes new `order` values for the affected span and toasts "Order saved".
- Reorder is not undoable via toast; it is in the activity log.

## Publish / unpublish

- Publish validates the stricter rule set and, on failure, focuses the first bad
  field and toasts `error` "Cannot publish — cover image is required".
- Unpublish from a published record warns if the URL is linked from the
  navigation; offers to remove the nav item or create a redirect.
- Scheduled publish takes a datetime; the list shows the countdown.

## Validation rules

| Rule | Applied |
|---|---|
| Required | Marked **req** in `02-content-model.md` |
| Slug | lowercase, `a-z0-9-`, unique per entity, immutable warning on change |
| Email / phone | Format check; phone stored E.164, displayed formatted |
| URL | Must parse; internal links checked against the page list |
| Meta title | Soft limit 60 chars — amber over, never blocks |
| Meta description | Soft limit 155 chars |
| Image alt | Required before a media item can be used on a published page |
| Dates | `closesAt` must be after `postedAt` |
| Repeaters | Min/max enforced (department stats fixed at 4) |

Errors render inline under the field, in red, with the field border tinted. The
submit-time toast counts them: "3 fields need attention".

## Toast coverage

Every mutation ends in a toast. No silent success.

| Action | Type | Message | Extra |
|---|---|---|---|
| Save draft | success | "Saved as draft" | |
| Publish | success | "Published" | View on site |
| Update | success | "Changes saved" | |
| Delete | success | "Deleted" | Undo (8s) |
| Bulk partial | warning | "9 of 12 published" | View details |
| Validation fail | error | "3 fields need attention" | |
| Save failed | error | "Could not save — check your connection" | Retry |
| Upload done | success | "4 files uploaded" | |
| Copy URL | info | "URL copied" | |
| Reorder | success | "Order saved" | |
| Maintenance on | warning | "Site is in maintenance mode" | persistent |
