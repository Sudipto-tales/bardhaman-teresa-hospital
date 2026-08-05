# Roadmap

## Phase 1 — Design (current)

Build order matters: the shell and the reference module are built first, reviewed,
and only then cloned 40 times. Getting the pattern wrong once is cheap; getting it
wrong 42 times is not.

### 1.1 Docs
`docs/00` – `docs/08`. Done.

### 1.2 Shell
```
assets/css/tokens.css  base.css  layout.css
partials/head.html  sidebar.html  topbar.html
assets/js/core/layout.js  theme.js  toast.js  modal.js  store.js
assets/data/*.json  (seeded from tools/site-data.mjs and assets/jobs.js)
```
Exit check: a blank page renders the full chrome, the sidebar marks the right
item, dark mode works, and `toast.success('hi')` from the console shows a toast.

### 1.3 Reference module — **review gate**
```
assets/css/components.css
assets/js/core/table.js  form.js  repeater.js  uploader.js
doctors.html  +  assets/js/pages/doctors.js
doctor-form.html  +  assets/js/pages/doctor-form.js
```
Exit check: the full loop in `00-overview.md` — add → toast → reload → persists →
edit → delete → confirm → Undo. Responsive at 1280/1024/768/390. Both themes.

**Stop here and review.** Everything after this is repetition of an approved
pattern.

### 1.4 Remaining screens, in dependency order

| Batch | Screens | Why this order |
|---|---|---|
| A | `departments`, `department-form` | Exercises the tabbed form and the doctor picker |
| B | `blog`, `blog-form`, `blog-categories` | Introduces `editor.js`, the largest new component |
| C | The five `settings-*` screens | Exercises repeaters hard; unblocks the "one place for the phone number" goal |
| D | `page-home`, `page-about`, `page-contact`, `page-careers`, `pages`, `stats` | Section-editor type |
| E | `jobs`, `job-form`, `applications` | Repeaters + drawer |
| F | `enquiries`, `enquiry-view`, `appointments` | Detail type + workflow |
| G | `gallery`, `testimonials`, `faqs`, `facilities`, `lab-tests`, `leadership`, `leadership-form` | Grid + modal-form types |
| H | `seo`, `navigation`, `redirects` | Tree editor |
| I | `users`, `user-form`, `activity-log`, `profile` | Permission matrix |
| J | `login`, `forgot-password`, `dashboard`, `analytics` | Chrome-less and overview screens last — they depend on knowing what everything else looks like |

### 1.5 Design sign-off
Walk every screen. Confirm: no dead links, no screen missing from
`02-content-model.md`, every mutation toasts, every destructive action confirms.

---

## Phase 2 — Backend

1. **Stack decision.** Open question — PHP+MySQL (cheapest hosting, matches the
   likely deployment), Node+SQLite (simplest dev), or Node+Mongo (flexible nesting
   for departments). Decide against where this will actually be hosted.
2. Schema from `02-content-model.md`.
3. Endpoints from `07-api-contract.md`.
4. Auth: session, bcrypt/argon2, CSRF, rate limiting on login and public intake.
5. File uploads to disk or object storage, with an image pipeline (resize, WebP).
6. Replace `core/store.js` with `core/api.js`. This is the only client change.
7. Role enforcement server-side. The Phase 1 matrix becomes real.

Exit check: the same end-to-end loop from 1.3, against a real database, in two
browsers, with one of them being a non-admin role that is correctly refused.

---

## Phase 3 — Site migration

Decide how the public site consumes the data. Two viable routes:

| Route | How | Trade-off |
|---|---|---|
| **Regenerate static** | Panel save → `POST /api/build` → `tools/build-pages.mjs` reads the DB instead of `site-data.mjs` and rewrites the `.html` files | Keeps today's output and SEO exactly; adds a build step per save |
| **Runtime fetch** | Pages keep their shell, JS fetches `/api/public/*` and fills the DOM | Instant edits; costs a render flash and weakens SEO on a site that depends on it |

Recommendation: **regenerate static.** This site's value is in fast, crawlable
pages, and `build-pages.mjs` already does 90% of the work — it needs its import of
`site-data.mjs` swapped for a database read. The forms (enquiry, appointment,
application) still post to the API at runtime, which is where dynamism is actually
needed.

Migration steps:
1. Write a one-time seeder: `tools/site-data.mjs` + `assets/jobs.js` → database.
2. Point `build-pages.mjs` at the database.
3. Regenerate and `git diff` — the output must be byte-identical to today's files.
   Any diff is a data-model bug, not an acceptable variation.
4. Replace the hardcoded contact strings in the templates with settings lookups,
   regenerate, and diff again against a settings record seeded with today's values.
5. Wire the public forms to `/api/public/*`.

---

## Phase 4 — Cutover

1. Deploy panel + API behind auth on a subdomain or `/admin`.
2. Seed production, verify the rendered site matches.
3. Hand over: two admin accounts, a short screen recording per module, and this
   docs folder.
4. Delete `tools/site-data.mjs` and `assets/jobs.js` — or leave them as the seed
   fixture and mark them read-only in the README.

---

## Open questions

| # | Question | Needed by |
|---|---|---|
| 1 | Backend stack, driven by where this is hosted | Phase 2 start |
| 2 | Static regeneration vs runtime fetch (recommendation above) | Phase 3 start |
| 3 | Real auth scope: single admin, or users + roles as designed? | Phase 2 start |
| 4 | Do CVs and patient-adjacent enquiry data have a retention policy? | Phase 2 schema |
| 5 | Bengali content — are all text fields bilingual, or is Google Translate still the answer? | Phase 1 sign-off, since it changes every form |

Question 5 is the one that would change the most screens. Worth answering before
batch C.
