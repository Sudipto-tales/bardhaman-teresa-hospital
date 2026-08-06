# Progress — HTML → Vayu PHP conversion

**Next action:** 4.1 — `config/resources.php`, the registry describing each
CRUD resource: table, public id field, writable fields, filters, sort
whitelist, publish rules, dependency checks.

This file is the resume point. If a session dies, read it top to bottom and
start at the next `todo`. Every numbered step below is one commit, and the row
is updated in that same commit — so `git log` and this table cannot disagree.

Status values: `todo` · `doing` · `done` · `blocked`

---

## Phase 0 — Admin design corrections

Done on `design/html`, commit `8e67983`.

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | Doctor `appointmentEnabled` toggle + list column | done | Two of twelve seeded doctors have it off, so the negative case is visible |
| 0.2 | Appointments screen → read-only | done | No writes, no bulk bar, no sidebar badge, info banner explains why |
| 0.3 | Applications: CV download + filename | done | Opens a real URL when one exists; warns honestly when it does not |
| 0.4 | Popups admin screen | done | New `settings-popups.html`, 43rd screen |
| 0.5 | Site: per-doctor booking link, cookie bar, ads popup | done | `html/assets/popups.js` + `popups-config.js` |
| 0.6 | Docs updated to match | done | `00`–`05`, `07`, `08` |

## Phase 1 — Restructure and branches

Done on `design/html`, commit `3527910`.

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Move the public site into `html/` | done | Git recorded pure renames |
| 1.2 | Retarget the generators, verify byte-identical | done | 20 pages rebuilt, zero content diff |
| 1.3 | Branch `design/html` + push | done | Pushed to origin |
| 1.4 | Branch `development` + `docs/php/` scaffold | done | This file |

## Phase 2 — Vayu scaffold and framework patches

Done on `development`, commit `a721018`. Every patch and its reason is in
[`01-vayu-notes.md`](01-vayu-notes.md).

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Copy Vayu in, `composer install`, `.env` | done | v1.0.4, minus `.git`/`vendor`/`.env`/its own `docs`. `.env` is gitignored; `.env.example` rewritten |
| 2.2 | `RouteManager`: frontend `{param}` + real 404 | done | One matcher for both route tables. Exact beats pattern; params never span `/` |
| 2.3 | `Mailer`: read SMTP from env, add attachments | done | Hardcoded Gmail address + app password removed. `send()` returns bool so a dead SMTP cannot lose an application row |
| 2.4 | Add `Csrf`, `Upload`, `RateLimit` | done | Uploads split media (public) from CV (outside the web root) |
| 2.5 | `migrate` / `seed` CLI + dialect helpers | done | `migrate`, `migrate:fresh`, `seed`. Dialect helpers so migrations are written once for SQLite and MySQL |
| 2.6 | `Auth` fixes + admin guard | done | Broken requires, email-verify gate, session flags, `session_regenerate_id`, remember token stored hashed |

Also fixed, unplanned: `server.php` resolved every nested route to its last
segment under the dev server (`SCRIPT_NAME` is the requested path when a router
script is used), so `/api/v1/users` arrived as `users`. `.htaccess` hardened.

Verified: live smoke test — `/` 200, `/api/v1/users` 401, `/api/nope` 404 JSON,
`/nope` 404 text, `/.env` and `/config/db.php` 403. Route matching checked by
reflection across eight cases.

## Phase 3 — Database

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Migrations for every table | done | 27 tables + `migrations`. Definitions and the JSON-column contract in [`02-schema.md`](02-schema.md) |
| 3.2 | `tools/seed-export.mjs` | done | Existing JS content → JSON; nothing retyped. All the mapping lives here so the PHP side is a loader |
| 3.3 | PHP seeder + verify row counts | done | 372 rows across 26 tables, no unresolved references |

The two vacancy lists in the repo overlap in three of five ids each and neither
contains the other, so the database takes the union — 7 jobs, and both the
careers page and the panel still list what they list today.

Three merges are recorded in the exporter's own output each run: departments
(11 of 12 take their page content from `site-data.mjs`), counters (16 from the
admin seed plus 36 lifted out of department `stats[]`), and jobs.

Seeded accounts get one generated password, printed once. Nothing in the
repository contains a hash.

## Phase 4 — API layer

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | `config/resources.php` registry | todo | One registry, not twenty controllers |
| 4.2 | Generic `ResourceController` | todo | |
| 4.3 | Auth / Settings / Media / Page / Popup controllers | todo | |
| 4.4 | PublicIntake + application CV stream | todo | |
| 4.5 | Activity log + dashboard | todo | |

## Phase 5 — Admin panel on PHP

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Admin components + PHP shell scaffolder | todo | Port of `html/admin/tools/scaffold.mjs` |
| 5.2 | 43 page shells + routes | todo | |
| 5.3 | `api.js` replaces `store.js` | todo | The only client-side change |
| 5.4 | End-to-end doctor loop verified | todo | add → toast → reload → edit → delete → undo, against SQLite |

## Phase 6 — Public site as components

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Layout components | todo | head, header, nav, mega menu, dock, footer |
| 6.2 | Block + card + form components | todo | One per generator function in `build-pages.mjs` |
| 6.3 | Pages + controllers + models | todo | |
| 6.4 | Settings-driven contact details, redirects | todo | Kills the repo-wide find-and-replace |

## Phase 7 — Forms, mail, popups

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Enquiry endpoint + notification | todo | |
| 7.2 | Application: CV upload, HR mail, applicant ack | todo | Row first, mail second — a failed send must not lose the application |
| 7.3 | Doctor appointment link behaviour | todo | |
| 7.4 | Cookie bar + ads popup from the database | todo | |

## Phase 8 — Hardening and handover

| # | Task | Status | Notes |
|---|---|---|---|
| 8.1 | Security pass | todo | CSRF, uploads, storage deny, session flags |
| 8.2 | MySQL verification | todo | Same migrations and seed, only `.env` changed |
| 8.3 | Runbook + handover docs | todo | |

---

## Decisions already taken

Recorded in full in [`00-plan.md`](00-plan.md) and
[`06-decisions.md`](06-decisions.md).

| Decision | Choice |
|---|---|
| Admin rendering | Thin PHP shell per screen; the panel keeps its JS. `store.js` → `api.js`. |
| Auth | Session login, multiple users, roles displayed but not enforced. |
| Repo layout | Vayu at the repo root; `html/` kept as the frozen design reference. |
| Public site | Server-rendered PHP components reading the database — not static regeneration, not runtime fetch. |
| Appointments | Read-only. No write endpoints at all. |
| Ads popup | One record: enabled, title, image, link, date window, frequency. |
