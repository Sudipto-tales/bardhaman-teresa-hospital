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
| F | `enquiries`, `enquiry-view`, `appointments` | Detail type + workflow. Appointments was later cut back to read-only — see "Scope removed" below |
| G | `gallery`, `testimonials`, `faqs`, `facilities`, `lab-tests`, `leadership`, `leadership-form` | Grid + modal-form types |
| H | `seo`, `navigation`, `redirects` | Tree editor |
| I | `users`, `user-form`, `activity-log`, `profile` | Permission matrix |
| J | `login`, `forgot-password`, `dashboard`, `analytics` | Chrome-less and overview screens last — they depend on knowing what everything else looks like |

### 1.5 Design sign-off
Walk every screen. Confirm: no dead links, no screen missing from
`02-content-model.md`, every mutation toasts, every destructive action confirms.

---

## Phase 2 — Backend

1. **Stack decided: PHP on the Vayu framework** (`/home/weloin/Projects/vayu`),
   SQLite in development and MySQL in production — the same switch, one `.env`
   key. Chosen against where this is actually hosted.
2. Schema from `02-content-model.md`.
3. Endpoints from `07-api-contract.md`.
4. Auth: session, bcrypt/argon2, CSRF, rate limiting on login and public intake.
5. File uploads to disk or object storage, with an image pipeline (resize, WebP).
6. Replace `core/store.js` with `core/api.js`. This is the only client change —
   the panel keeps its JS and PHP serves a thin shell per screen.
7. Roles are displayed, not enforced. The permission matrix stays visual for
   now; the decision was that a single hospital admin team does not need it
   yet, and enforcing it half-way is worse than not enforcing it at all.

Exit check: the same end-to-end loop from 1.3, against a real database, in two
browsers, signed in as two different users.

---

## Phase 3 — Site migration

**Decided: server-rendered PHP.** Neither of the two routes originally weighed
up — regenerating static files, or fetching JSON at runtime — survives the move
to Vayu. PHP renders the page on request from the database, which keeps the
crawlable HTML that static regeneration was chosen for without the build step,
and avoids the render flash that runtime fetch would have cost.

`tools/build-pages.mjs` does not become the renderer; it becomes the reference.
Its generator functions map one-to-one onto the PHP components (`banner()` →
`block/banner.php`, `team()` → `block/team.php`, and so on), which is the proof
that those are the right seams.

Migration steps:
1. Export `tools/site-data.mjs` + `assets/jobs.js` + the panel's seed files to
   JSON, and seed the database from them — no content is retyped.
2. Build the components, then the pages that compose them.
3. Diff the PHP-rendered output against the frozen `html/` prototype. A
   difference is a porting bug until proven otherwise.
4. Replace the hardcoded contact strings with settings lookups, and diff again
   against a settings record seeded with today's values.
5. Wire the public forms to `/api/public/*`.

The frozen prototype lives on the `design/html` branch and in `html/` on
`development`, so every diff in step 3 has something to diff against.

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

| # | Question | Status |
|---|---|---|
| 1 | Backend stack, driven by where this is hosted | **Answered** — PHP on Vayu, SQLite in dev, MySQL in production |
| 2 | Static regeneration vs runtime fetch | **Answered** — neither: pages are server-rendered PHP components reading the database directly |
| 3 | Real auth scope: single admin, or users + roles as designed? | **Answered** — multiple users with a real session login; roles displayed, not enforced |
| 4 | Do CVs and patient-adjacent enquiry data have a retention policy? | Open — needed for the Phase 2 schema |
| 5 | Bengali content — are all text fields bilingual, or is Google Translate still the answer? | Open — Google Translate stands for now |

Question 4 is the one with a legal edge: CVs are held indefinitely today because
nothing deletes them. A retention window has to be decided before the
applications table is considered finished.

## Scope removed, and why

Two modules were designed richer than the hospital's actual process, and were cut
back before any of it was built in PHP:

- **Appointments** were designed as a bookable workflow — confirm, reschedule,
  cancel, notify. The hospital takes no bookings online. The screen is now a
  read-only archive, the entity is `GET`-only, and the site links a doctor card
  to the contact page instead, but only for doctors whose *Appointments
  available* toggle is on. Building the confirm flow would have meant the panel
  promising slots nobody could honour.
- **Applications** keep their stage pipeline, because it costs nothing and helps
  whoever reads the inbox — but the work that matters is the submit path: row
  written, HR mailed with the CV attached, applicant acknowledged.

Added in the same pass: **Popups & Cookie Bar** (§22b of the content model), the
one screen that controls what the site shows a visitor uninvited.
