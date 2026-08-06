# Progress — HTML → Vayu PHP conversion

**Next action:** 4.4 — `PublicIntakeController` (enquiry + application) and the
authenticated CV stream at `GET api/applications/{id}/cv`.

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
| 4.1 | `config/resources.php` registry | done | 18 resources. `php tools/check-resources.php` walks all 350 references against the live schema |
| 4.2 | Generic `ResourceController` | done | All 18 resources verified over HTTP: list, filter, search, sort, paginate, create, patch, delete, restore, reorder, bulk |
| 4.3 | Auth / Settings / Media / Page / Enquiry controllers | done | All five. Popups are a settings group, not a controller of their own |
| 4.4 | PublicIntake + application CV stream | todo | |
| 4.5 | Activity log + dashboard | todo | |

Four decisions taken in 4.3.

**Uploaded media moved to `assets/uploads/`.** `storage/` is denied wholesale by
two `.htaccess` files so that a CV can never be reached by URL, and media that
must be public cannot live behind that rule — one exception in it is how a CV
eventually leaks. The directory carries its own `.htaccess` refusing anything
executable. Full reasoning in [`01-vayu-notes.md`](01-vayu-notes.md) §6.

**SMTP reads the environment first and `settings.integrations` second.** A
secret belongs in `.env`, not in a table a panel user can read — but the panel
has an SMTP screen, and a screen whose fields do nothing is worse than no
screen. `.env.example` ships host, port and encryption filled in and the
credentials empty, which is the split this is built around. `test-smtp` answers
200 with `ok: false` and the server's own words when a send fails: the request
worked, SMTP is what did not, and a 500 would make the panel report something
unrelated.

**A reply is recorded before it is sent.** A desk that typed an answer has
answered whether or not the mail server was reachable, so the row is written
first and the stored entry carries `emailed`. An enquiry with no address is a
phone enquiry — the reply is still recorded, there is simply nothing to send.

**`POST api/media/{id}/restore` was added to the route table.** Not in the
contract's media block, but every delete toast offers Undo, and media is not a
generic resource so it cannot borrow `POST api/{resource}/{id}/restore`.

Two extractions, so the new controllers and the generic one cannot drift:
`core/SeoMeta.php` (the polymorphic meta table, which the fixed pages need and
have no registry entry to reach through) and `core/MediaUsage.php` (the
back-reference scan). `ResourceController::readSeo`/`writeSeo` now delegate,
and its `resource()`, `find()`, `row()` and `userId()` are protected so
`EnquiryController` answers with the same record shape as `GET
api/enquiries/{id}`.

Verified live against SQLite: all six settings groups read back grouped and a
PATCH writes only the keys it was sent; a page PATCH merges section `data`
rather than replacing it, refuses an unknown section key, a slug change and a
stale `updatedAt`; section reorder renumbers and refuses a key the page does
not have; media filters, uploads, serves the file over HTTP, rejects a PHP file
renamed `.png` by its own bytes, blocks a delete with `HAS_DEPENDENTS` and
restores; reply and note append, move status, assign, and log the failed send
without losing the reply. `storage/` still answers 403, every new route answers
401 unsigned-in, and the generic controller's SEO round-trip still works after
the extraction.

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
| 6.1 | Layout components | done | 10 under `app/components/site/layout/` |
| 6.2 | Block + card + form components | done | 34 components total. Pure: no database, no superglobals, safe with zero props |
| 6.3 | Pages + controllers + models | doing | `app/models/` done — 16 files, read-only, published-only. Pages and controllers still to write |
| 6.4 | Settings-driven contact details, redirects | todo | Kills the repo-wide find-and-replace |

Two things 6.3 must handle. `html/` is blocked by `.htaccess`, so the CSS, JS
and images the components reference need copying to the root `assets/`. And the
contact, careers, job and blog-listing page bodies have no functions in
`build-pages.mjs` at all — they are inline template literals, so those regions
(`ct-tiles`, `ct-aside`, `ct-map`, `cr-toolbar`, the blog sidebar) have no
component and the page templates carry them.

Section headings, a banner's `lead` and an FAQ's `answer` are echoed as raw
markup, because every heading in this design carries `<strong>` on its
emphasised half. A controller must never pass visitor input into those.

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
