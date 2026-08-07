# Progress — HTML → Vayu PHP conversion

**Next action:** 5.1 — the admin components and the PHP shell scaffolder. The
public site is finished: phases 4, 6 and 7 are done, and `/admin` now has a
sign-in (5.0). Phase 8 follows phase 5.

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
| 4.4 | PublicIntake + application CV stream | done | Both intake endpoints and the authenticated file stream. Phase 7 is now only the site-side wiring |
| 4.5 | Activity log + dashboard | done | Both screens built, not just the endpoints. Renders the `view` action the CV stream records |

### 4.3

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

### 4.4

**Four columns and a JSON blob were added to `applications`, and one to
`enquiries`.** The form components written in 6.2 ask for more than the schema
had room for. `location` and the three `cover_letter_*` columns mirror the CV's
exactly — a cover letter names the same person a CV does, so it gets the same
directory, the same rules and the same authenticated endpoint. The optional
half of the form — qualification, notice period, CTC, availability, portfolio
link, how they heard about the role — goes into `details`, one JSON column,
because nothing queries any of it and it is all read at the same moment by the
same person. `enquiries.preferred_slot` stores the time of day the visitor
said would suit; it is not a booking, and nothing in this application confirms
one. The two migrations were edited in place rather than given an `ALTER`
successor: nothing has been deployed, the schema is one file per entity by
design, and `migrate:fresh` is the documented way to pick this up.

**The rate limiter counts submissions that land, not requests that arrive.**
`RateLimit::attempt()` counts every call, which reads well until an applicant
picks the wrong file twice and is locked out of the careers page for an hour.
So the limit is checked before and recorded after the row exists. What is worth
limiting is what costs something — a row, a stored file, two mails; a refused
submission writes nothing.

**reCAPTCHA passes when Google cannot be reached**, and passes entirely when no
secret is configured. Failing closed would let a network problem at the
hospital's end silently stop every contact form and every job application. For
a hospital, losing a patient's message costs more than accepting a spam one,
and the honeypot and the limiter do not depend on anything outside this server.

**An unknown slug never loses a submission.** A stale `?doctor=` link, a
department that has since been renamed, a job title that matches no posting —
all are recorded as sent, against no reference. The visitor did nothing wrong,
and `applications.job_title` is denormalised for exactly this.

`ApplicationController` extends the generic one to add `cvUrl` to the record
through a new `decorate()` seam, because the panel's download button reads that
field and a route is not a column. That keeps
`html/admin/assets/js/pages/applications.js` untouched, which is the promise in
[`06-decisions.md`](06-decisions.md) §1. The honeypot, the `source` marker and
the vacancy's slug were added to the two form components as hidden fields.

Verified live against SQLite: an appointment request posted in the form's own
field names lands with its department, doctor, date and slot resolved and its
subject derived; a filled honeypot gets a cheerful 201 and writes nothing; a
missing token is 419; an application stores both files under random names,
records the failed HR mail in `notify_error` without losing the row, and streams
each file back with `Content-Disposition: attachment` and `no-store`, byte for
byte, only to a signed-in caller. Two failed validations in a row do not burn
the hourly quota; three real submissions do.

### 4.5

**`config/route.php` autoloads controllers instead of requiring the directory.**
It walked `api/controllers/` and required every file in the order the
filesystem listed them — which is readdir order, not alphabetical, and not
stable across machines. `EnquiryController` and `ApplicationController` extend
`ResourceController`, and requiring a child before its parent is a fatal error
at compile time. It had been working by luck, and adding a file to that
directory reshuffles the luck. Models stay eagerly required: they are function
files and have no class name to be found by.

**`POST api/activity/{id}/revert` is in the contract and is deliberately not
built.** `ActivityLog::diff()` stores what changed, not what a record was —
`summarise()` replaces long text with "1,240 characters" and an array with
"6 item(s)", which is what keeps the log from outgrowing the content it
describes. Reverting from that would write the summary into the record. What
the screen offers instead is the undo that already exists: a `delete` row gets
a Restore action wired to `POST api/{resource}/{id}/restore`, and every other
row links to the record. The endpoint tells the panel which is which through
`revertable` on the row, because only the server knows whether the record is
still there under a `deleted_at`.

**Two comparisons, not one, behind the four stat tiles.** Two are period counts
and two are totals, and comparing them the same way would be wrong for one
pair. The counts go against the same *days* of last month rather than the whole
of it — on the 3rd, a month-against-month comparison shows every tile falling
off a cliff for the first week of every month. The totals go against the state
at the start of this month. Each tile carries `deltaOf` saying which it used,
so the chip can name its own comparison instead of the panel guessing.
`deltaPercent` is null, not 0, when there is nothing to divide by.

**`GET api/activity` accepts `userId` and `withinDays` alongside the contract's
`user`, `from` and `to`.** The panel's list controller sends a filter under the
name of the field it filters on, and on a log row that field is `userId`; the
date window is the same three-option control the enquiries screen uses. Two
spellings in the controller is one less special case in `api.js`.

**The panel's two new screens are written against `store.*`, like the other
forty.** `store.summary()` is `GET api/dashboard/summary` and gained a mock
that computes the same shape, with the same comparisons, from the seed. The
activity log needed no new method at all: `activity` is already a seeded
entity, so it is `table.create()` over `store.list('activity', …)` and every
filter it declares is a query parameter the endpoint already reads.
`store.revert()` is the one method the mock refuses — it splices rows out of an
array, so by the time the log row is read the record is gone and an id is all
there is; inventing a row from its id would put a stub in the collection and
call it a restore.

`GET api/search` has no `store` method for the same reason: the panel's global
search is not a page script, it is `searchAll()` in `core/layout.js`, and that
is what the endpoint replaces at 5.3. `SEARCH_SOURCES` there stays — which
icon and which screen a collection maps to is presentation, and the API only
answers with the collection's name.

Verified live against SQLite: all three endpoints answer 401 unsigned-in and
correctly signed in, through the real router and middleware; the date filters
convert local days to the stored UTC, so an entry at 21:35 IST files under the
right day; `withinDays=7` drops the one entry older than that; sorting is
whitelisted to four columns and falls back to newest-first. Both screens render
in a headless browser with no console errors, and the existing controllers —
including the two that extend `ResourceController` — still answer after the
autoload change. `node tools/seed-export.mjs` reproduces `database/seeds/`
byte for byte.

## Phase 5 — Admin panel on PHP

| # | Task | Status | Notes |
|---|---|---|---|
| 5.0 | `/admin` sign-in | done | The front door only. `AdminController`, two views, the auth loop against `POST api/auth/login` |
| 5.1 | Admin components + PHP shell scaffolder | todo | Port of `html/admin/tools/scaffold.mjs` |
| 5.2 | 43 page shells + routes | todo | `/admin` shows a placeholder until this lands |
| 5.3 | `api.js` replaces `store.js` | todo | The only client-side change |
| 5.4 | End-to-end doctor loop verified | todo | add → toast → reload → edit → delete → undo, against SQLite |

### 5.0

`/admin` had no route, so the one URL an administrator types answered 404, and
there was no sign-in screen anywhere — the prototype under `html/` never had
one, because `store.js` fakes a session.

`AdminController` is the front door and nothing more. `/admin` renders the
form, or the panel when there is a session; `/admin/login` is the same screen
under the name people link to, and redirects when there is already a session
rather than inviting somebody to sign in twice. Authentication is not
reimplemented: the form posts to `POST api/auth/login`, which is rate limited,
session-based, and the same endpoint `api.js` will call at 5.3.

`/admin/logout` is a GET, unlike the API's CSRF-guarded `POST api/auth/logout`.
Until 5.2 there is no panel JavaScript loaded to call the API version, and a
session with no way out is worse than a forged link that signs somebody out.

The screen borrows the site's document head — theme, fonts, stylesheets — but
not `SiteController::page()`, which would put the public header, the department
mega menu, the pre-footer and both popups around a sign-in form. It does not
load `site/layout/scripts` either: GSAP, Lenis and website.js exist to animate
markup that is not there. The `.adm-*` rules are appended to `assets/pages.css`
rather than borrowed from `html/admin/assets/css/`, which is not served and is
5.1's to port.

Signed in, `/admin` says the panel screens are not built yet. It does not
redirect into the prototype: that reads from a seeded JavaScript store and
would look like a working panel that saves nothing.

Verified live against SQLite: the full loop through the rendered form — sign
in, land on the panel, sign out, land back on the form — plus `/admin/login`
redirecting to `/admin` while a session exists, and `noindex,nofollow` on both.

## Phase 6 — Public site as components

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Layout components | done | 10 under `app/components/site/layout/` |
| 6.2 | Block + card + form components | done | 34 components total. Pure: no database, no superglobals, safe with zero props |
| 6.3 | Pages + controllers + models | done | 12 page templates, 10 controllers, 18 models, and the frontend route table. Every URL the design has, served from the database |
| 6.4 | Settings-driven contact details, redirects | done | Redirects in 6.3. No phone number or address is written in a file any more — changing one in the panel changes every page |

`html/` is blocked by `.htaccess`, so the eleven
files in `html/assets/` were copied to `assets/` — flat, not under `css/` and
`js/`, because that is the path the components already reference
(`assets/website.css`, `assets/pages.js`, `assets/logo-teresa.png`). Byte
identical, and nothing inside the CSS or JS points at a relative asset, so
there was nothing to rewrite. `html/` stays the frozen design reference:
**from here on the served copy is `assets/`, and a change made in `html/assets/`
alone changes nothing.**

The contact, careers, job and blog-listing page bodies have no functions in
`build-pages.mjs` at all — they are inline template literals, so those regions
(`ct-tiles`, `ct-aside`, `ct-map`, `cr-toolbar`, the blog sidebar) have no
component and the page templates carry them.

Section headings, a banner's `lead` and an FAQ's `answer` are echoed as raw
markup, because every heading in this design carries `<strong>` on its
emphasised half. A controller must never pass visitor input into those.

### 6.3

**Department pages sit at the root.** `/cardiology`, not
`/departments/cardiology` — the design names the files that way, the seeded
redirects point at them that way, and a department is a destination on this
site rather than a child of the listing. So `{slug}` is the last route and
deliberately a catch-all: an unknown one-segment path is a department that does
not exist, and `DepartmentController` answers it through the redirect table and
then the 404 page. `RouteManager` tries exact keys before patterns and a
`{param}` never spans a `/`, so no literal route and no `blog/{slug}` can be
swallowed by it.

*Corrected afterwards:* `layout/mega-menu.php` was still building the nested
form, so eleven links in the primary nav — the most-used route into a
department page on the whole site — answered 404. The URL sweep in 6.3 walked
the record tables and the route list; it did not walk the rendered pages, which
is where the two shapes could disagree. `departments/{slug}` is now a route of
its own that 301s to the root address when the slug is a real department and
falls through to the ordinary 404 when it is not, so an old bookmark still
lands and there is still one address per page. Every internal link on every
page is now walked and answered: 52 unique URLs, none broken.

**The redirect table runs where the 404 does, and nowhere else.** Checking it
on every request would be one query on every page that was going to work
anyway; checking it in `ErrorController` costs a query only on paths that had
already failed. `site_url()` is what makes the seeded rows still mean
something: they were written against the static site, so `/heart.html` →
`/cardiology.html` arrives as a 301 to `/cardiology`. The same function drops
the leading `../` from `settings.general.logo` — the path relative to
`html/admin/` that PROGRESS flagged for 6.4 — and resolves every stored
`*.html` through the same route map.

**The two lists the design builds in JavaScript are now server-rendered, and
`pages.js` was taught to leave them alone.** A vacancy list marked
`data-server` is filtered in place: the rows came from the database, and
rebuilding them from `TMH_JOBS` would replace real markup with a copy of it —
or with nothing, on a page where that global is not printed at all. The static
design file has no such marker and keeps rendering its own. `website.js` takes
the same shape for the specialities panel and the testimonial rotator:
`window.TMH_SPECIALITIES` and `window.TMH_TESTIMONIALS` replace the literals
outright rather than merging into them, because a department deleted in the
panel has to disappear rather than survive under the design's own key.

**A form with an `action` posts it; one without keeps validating and
clearing.** That is what lets the same `pages.js` serve both this site and the
static design copy. The submit is intercepted either way — the endpoint answers
JSON, and a native post would navigate the visitor to it. A 422 names the
fields it rejected and the note shows the first, because the note is one line
and the browser has already caught everything checkable without the server.

**A draft or hidden record is a 404, not a thinner page.** One draft
department, one draft post and one draft vacancy in the seed, plus one vacancy
marked `hidden` — which the content model defines as *closed* — and all four
answer 404 while their published neighbours render.

Verified live against SQLite: all 33 public URLs — home, seven fixed pages,
eleven published departments, nine published posts and five open vacancies —
answer 200 with no PHP notice in the output, and the four unpublished records
answer 404. The design had twenty static pages; a page per record is what
replaces them. Every asset the pages reference resolves. The
three seeded redirects 301 to their clean-URL targets, and a path matching no
route at all now reaches the site's own 404 page rather than the framework's
plain-text fallback (see [`01-vayu-notes.md`](01-vayu-notes.md) §10 — `'404'`
is a numeric key and `array_merge()` was renumbering it). Both intake forms
were submitted as the browser sends them, from the markup the server rendered:
the enquiry resolved its department, date and slot; the application stored its
CV, denormalised `job_title` from the slug and filed the optional half of the
form into `details`.

### 6.4

**The components no longer carry a fallback phone number or address.** They
carried the design's own — `+91 342 325 4567`, four times across the header,
the dock, the closing band and the article banner — which read as a safety net
and was in fact the failure this conversion set out to remove: a number nobody
edits in the panel and nobody finds when it changes. A missing value now prints
nothing. The top strip shows one item or none, a dock button with nothing to
dial is not rendered, and the closing band prints one button rather than two.

**`SiteController::page()` supplies `phone`, `email` and `callAction` to every
page**, so a controller cannot forget them — which is what the four listing and
department pages had done, falling through to the component's literal and
looking correct while doing it. `callAction` is the closing band's second
button ready-made, empty when there is no number.

Two shapes for `$phone` were in circulation, both under that name: an array on
eight templates and the number alone on `doctors.php`. It is the array
everywhere now, and `DoctorController` no longer passes its own.

`facilities.php` also had "Contact the desk" where the design says "Book an
Appointment". Corrected against `html/facilities.html`.

Verified live against SQLite: changing the reception number in `settings`
changes it on every page that prints it, in one edit — home, the three listing
pages, every department, the blog listing, an article and a vacancy. Emptying
the `phones` repeater altogether leaves all eight pages at 200 with no PHP
notice and no `href="tel:"` pointing at nothing.

Three copies of the number survive in the database, and are meant to: the
cardiology badge ("Chest pain? Call …"), the maintenance message and the
WhatsApp field. Those are records with a panel screen behind them, which is the
point — editorial copy that names a number is edited where the number is.

`initJobDetail()` in `pages.js` still has the careers address written into its
"role no longer listed" panel. It is unreachable here: the vacancy page is
server-rendered and carries no `#jobDetail`, so the function returns on its
first line. It stays for the static design copy, like the two literal blocks in
`website.js`.

## Phase 7 — Forms, mail, popups

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Enquiry endpoint + notification | done | Endpoint in 4.4, the site-side `fetch` in 6.3 |
| 7.2 | Application: CV upload, HR mail, applicant ack | done | Row first, mail second — a failed send must not lose the application |
| 7.3 | Doctor appointment link behaviour | done in 6.3 | Nine of ten published doctors carry `?doctor=`; the tenth has booking off and carries none |
| 7.4 | Cookie bar + ads popup from the database | done in 6.3 | `SiteController::popups()`, from the `popups` settings group |

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
