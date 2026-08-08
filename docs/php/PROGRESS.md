# Progress — HTML → Vayu PHP conversion

**Next action:** 8.1 — the security pass. Phases 4 through 7 and phase 9 are
done: the public site is served from the database, the panel's 41 screens read
and write through `/api/*`, and the site is indexable. Phase 8 is all that is
left.

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
| 5.1 | Admin components + PHP shell scaffolder | done | Five components, two screen bodies, and `tools/scaffold-admin.php` |
| 5.2 | 41 page shells + routes | done | One route, one action; a screen exists if its shell does |
| 5.3 | `api.js` replaces `store.js` | done | Plus a boot gate, and three vocabularies corrected |
| 5.4 | End-to-end doctor loop verified | done | Driven through the panel's own UI in headless Chrome |

### 5.4

The loop `00-plan.md` names as the definition of done, driven through the
panel's own UI rather than the API: add a doctor → **toast** ("Saved as draft")
→ the row is in the list → reload, and it is still there because it is in
SQLite → open the form, and it binds the record → edit the role, and the change
comes back from `GET api/doctors/{slug}` → delete through the row menu and its
confirm modal, and the record answers `NOT_FOUND` → **Undo** on the toast, and
it is back under the same slug with the same name. Every step passed.

Alongside it, the writes the doctor loop does not touch: a settings save
patches only the group that changed and leaves the other five byte-identical; a
reorder persists and reverses; a bulk hide followed by a bulk publish returns
every id under `succeeded` and reports no failures; a real PNG uploads over
multipart, lands under `assets/uploads/2026/08/` with a random name and is
served over HTTP; and the topbar search answers from `GET api/search` with
eight groups.

All 41 screens were loaded in headless Chrome, signed in, with the console and
the network watched. No exception, no console error and no failed request
except one: `settings-contact` embeds a Google Maps iframe whose seeded `pb=`
parameter is a placeholder, and Google answers it 400. That is the seed's
content, not the panel.

Every screen renders its records — the counts match the database row for row.
Four render "Screen not built yet": `analytics`, `navigation`, `redirects` and
`seo`. Those are the prototype's own stubs, 14 lines each in
`html/admin/assets/js/pages/`, and were stubs before this conversion started.
Their shells, routes and bundles exist; what is missing is the page script, and
that is the same amount of missing it was on the design branch.

The public site was re-checked afterwards: home, the fixed pages, a department,
the blog, careers and contact all still answer 200.

Two things found and left alone, both older than phase 5:

* **A soft-deleted record keeps its slug.** Creating a doctor with the slug of
  a deleted one is refused with "That value is already in use", against a record
  the panel cannot show. Freeing the slug is what a hard delete would be for,
  and there is no hard delete — deliberately, because Undo depends on it.
* **`GET api/search` reaches media and pages** through `searchExtras()`, so
  nothing was lost in moving the topbar search off the client-side scan.

### 5.3

**`api.js` registers as `TMH.store`.** The file is new; the name the panel
reaches for is not. Sixty-five `store.update()` calls and thirty-six
`store.all()` calls are the reason — §1 of [`06-decisions.md`](06-decisions.md)
promised the page scripts would not be rewritten, and a renamed export is a
rewrite of every one of them. Argument lists and promise shapes are the mock's
too, including `remove()` returning `{row, index}` so the toast can still offer
Undo.

**`TMH.boot(fn)` is the one line every page script changed.** `allSync()` is
sixty-four synchronous reads — a table cell rendering a post's author cannot
await — and a mock backed by localStorage could answer them; a network cannot.
So `GET api/bootstrap` fills a cache with all eighteen collections before any
page script runs, and `boot()` is what waits for it. Alongside it go
`/api/settings`, `/api/pages` and `/api/auth/me`, in parallel: four requests, on
a panel whose prototype loaded nine seed files on every screen whether it used
them or not. The difference is that these are read from the database per page
load and cannot be stale.

`BootstrapController` extends `ResourceController` for one method — `rows()`,
which turns columns into the field names the panel reads. A second copy of that
mapping is the one thing that endpoint must not be.

**Three vocabularies were wrong, and are the kind of wrong a mock hides.**

* *Filter names.* The contract names a filter after what it selects
  (`department`); the panel's list controller sends the name of the field it
  filters on (`departmentId`), because that is what its column definition
  already knows. Ten screens sent a name the registry had never heard of, and an
  unknown filter is silently ignored — the control moves and the list does not.
  Both spellings are registered now, each alias commented with the screen that
  sends it, which is what 4.5 already did for `GET api/activity`. Two new filter
  types came with them: `daysBack` (the enquiries inbox's "Received" window) and
  `when` (the appointments archive's today / upcoming / past).
* *User status.* The panel filed accounts as `published` / `draft` / `hidden`,
  with a comment in `session.js` translating them, because its list component
  only knew those three. The column has always held `active`, `invited` and
  `suspended`. Nineteen literals across `users.js` and `user-form.js` now say
  what the database says.
* *FAQ groups.* `faqs.js` grouped on `Home` / `Contact` / `Department`; the
  column holds the lower-case key the public accordion reads. Every question
  fell outside every group, and the screen showed three empty panels over seven
  seeded rows. The group is now a key and a label, and `page-home.js`'s select
  follows.

**Five columns were added to `users`.** The profile screen has a preferences
form — language, timezone, "Open the panel on", email digest — and none of the
four had a column, so the form saved nothing and said it had. `password_updated_at`
is the fifth: the users list prints "Changed 3 months ago" under Password, and
`updated_at` cannot answer that because it moves when somebody corrects a phone
number. It is stamped by `ResourceController` whenever a password is written,
never sent by the client. `/admin` honours `landingPage` — the select still
offers the design's `dashboard.html` spellings and the controller strips the
extension, like every other admin URL.

**`POST api/auth/verify-password` is new and is not in the contract.** The
profile screen confirms the current password before changing it, and nothing
could answer that. Posting to `login` instead would regenerate the session and
write a second sign-in to the activity log for something that was not one. It
answers 200 either way — a wrong password is an answer, not a failed request,
and a 401 would send somebody to the sign-in screen for a typo. Rate limited
per account, because it takes a password and says whether it was right.

**Four things in `core/` that the mock made true and the API does not:**

* `media.js` uploaded by reading each file into a data URL, because
  localStorage had nowhere else to put the bytes. It posts the file as a file
  now, which is also the only version of this that can reject a PHP script
  renamed `.png` by looking at its bytes. Its size and type checks stay as the
  first, friendlier refusal.
* `layout.js`'s "Reset demo data" is gone with the mock it emptied. There is no
  demo data to go back to, and a button that would have to mean "delete the
  hospital's content" is not a menu item. Sign out points at `/admin/logout`.
* The topbar's global search is `GET api/search`, the endpoint 4.5 built for it.
  What is left of `SEARCH_SOURCES` is which icon a collection wears and which
  screen a record opens on — presentation, which is what that note said it
  would be. Requests can overtake each other now, so a sequence number stops a
  stale answer painting over a newer one.
* The notification bell said "4 new enquiries" whatever the inbox held. It
  counts them, from the same collection the sidebar badge counts.

**A 401 anywhere navigates to the sign-in with `next` set.** A session that
expired mid-visit is not something a screen can recover from — every later
request fails the same way — and one password gets the same screen back.

**`setDoc('settings', doc)` patches only the groups that moved.** The settings
screens read the whole document, change one group and hand the whole thing
back, which is what the mock wanted and what `PATCH /api/settings/{group}` is
not. Sending all six would put six entries in the activity log, and saving the
social links should not read as having edited the SMTP password the same
afternoon.

### 5.2

Forty-one shells, not forty-three: that is how many screens the prototype has,
and `settings-popups` being "the 43rd screen" in the phase 0 note counted the
design's page list rather than the files. The sign-in makes 42 URLs under
`/admin`; there is no forgot-password screen, because none was ever designed —
`POST api/auth/forgot` answers, and nothing calls it yet.

**One route and one action, and no list of valid screens anywhere.** A screen
exists if `app/page/admin/<screen>.php` exists. A route table and a directory
that have to agree are a route table and a directory that eventually do not,
and the failure is a 404 on a page somebody can see in the sidebar.

**There is no `admin/{screen}/{id}`**, though the plan sketched one. The panel
addresses a record with `?id=`, never with a path segment, and a segment would
change what every relative link its page scripts build resolves to.

**`/admin/doctors.html` 301s to `/admin/doctors`.** Every link in `core/nav.js`
and in the forty-one page scripts is still `doctors.html`, written when the
panel was a folder of static files, and those files are the reviewed JavaScript
this port exists to keep (§1 of [`06-decisions.md`](06-decisions.md)). So the
router bends rather than the JavaScript: because the shells are served under
`/admin/`, a page script's `location.href = 'doctor-form.html?id=x'` resolves to
`/admin/doctor-form.html?id=x`, which arrives here and leaves as
`/admin/doctor-form?id=x`. The address bar and any bookmark then hold the clean
one. Two hundred and fifty-four link strings across forty-one files stayed
untouched, and a page script needs no base URL and no helper.

**A `.html` path on the public site now 301s to its clean address too**, from
`ErrorController`, after the redirects table has been asked and before the 404.
The panel's "View on site" buttons link to `../../doctors.html`, which resolves
to `/doctors.html` from `/admin/anything`; so do the fifteen others like it, and
so does every bookmark of the old static site. `site_url()` already knew how one
of those maps onto a route — it is what every stored link in the panel is
resolved through — so this is that function answering one more caller. It costs
nothing on a path that was going to work, because nothing that works arrives at
the 404. The redirects table stays for the addresses that actually moved
(`/heart.html` → `/cardiology`); this is for the ones that only lost an
extension.

**The guard sends an unauthenticated request to `/admin/login?next=<screen>`,
and `next` is a screen name rather than a URL.** It is checked against the
shells on disk before it is used: a login page that redirects to whatever it is
handed is a phishing link that starts on the hospital's own domain. Any query
the original request carried is dropped — it is a row id or a filter, not worth
the attack surface.

`/admin` now redirects to `/admin/dashboard` when there is a session, and
`app/page/admin/panel.php` — 5.0's "the screens are not built yet" placeholder —
is deleted, because they are.

Until 5.3 the shells still load `store.js`, which now has no seed to read. Every
screen renders its chrome, its page head and an empty list. That is the honest
state of the panel between these two commits and it is one word in
`scripts.php` to move on from.

Verified live against SQLite: all 41 screens answer 200 signed in with no PHP
notice in the output and 302 to the sign-in when signed out; `/admin` lands on
the dashboard; `/admin/doctor-form.html?id=dr-x` 301s to
`/admin/doctor-form?id=dr-x`; an unknown screen is a plain-text 404;
`/cardiology.html` and `/website.html` 301 to `/cardiology` and `/`; and every
stylesheet and script the shells reference resolves.

### 5.1

**`html/admin/assets/` was copied to `assets/admin/`, byte identical, minus the
seed data.** `html/` is blocked by `.htaccess`, so nothing under it is served —
the same move phase 6 made for the public site's assets, and with the same
consequence: **from here on the served copy is `assets/admin/`, and a change
made in `html/admin/assets/` alone changes nothing.** Nothing inside the CSS or
the JavaScript points at a relative asset, so there was nothing to rewrite. The
nine files in `assets/data/` are the exception and were left behind on purpose:
they seed `store.js`'s localStorage mock, and the panel's content comes from
`/api/*` now. A seed file shipped beside the API would be a second copy of the
content, stale from the first save.

**Five components under `app/components/admin/`, and a screen is one call.** In
the prototype every screen carried its own copy of the head, the mount points
and the script list — 45 lines repeated 41 times, which is how a panel ends up
with three different stylesheet orders. `layout.php` takes four facts about a
screen and renders the rest: `head.php` (the pre-paint theme script, the
stylesheet order, and two new metas — the CSRF token and the application base,
both of which `api.js` needs at 5.3), `sidebar.php` and `topbar.php` (mount
points, and nothing else: `core/layout.js` replaces both nodes outright, so
anything PHP wrote there would be work done twice and thrown away once), and
`scripts.php`, which holds the module bundles as data.

The bundle table was checked against all 41 prototype screens rather than
copied from `scaffold.mjs`: the `.mjs` table was already wrong about two of
them. `faqs.html` loads `editor.js` — added to the file by hand, which held
until the next `--force` run silently took it away — and `doctor-form.html`
does not load `fields.js`, because it is the one screen whose fields are
written out rather than generated. Both are bundles of their own now
(`listeditor`, `form-static`), and a bundle cannot be forgotten.

**`tools/scaffold-admin.php` is the port of `scaffold.mjs`, with the two
hand-written screens folded back in.** The `.mjs` version excluded `doctors` and
`doctor-form` because their `<main>` is not the empty `#pageHead` / `#view`
pair and regenerating them would have destroyed the markup. PHP has an include
and HTML does not: that markup now sits in `app/components/admin/body/`, copied
unchanged, and the shells above it are as ordinary as the other 39.

`login` is deliberately not in the table. It is not one of the panel's 41
screens — no page script, no sidebar, no session to render for — and 5.0 built
it against the site's own head. `AdminController` renders it directly.

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

## Phase 9 — SEO

Done before phase 8, out of order, because the site was live and unfindable.

| # | Task | Status | Notes |
|---|---|---|---|
| 9.1 | The document head, in full | done | OG, Twitter, keywords, verification, and `core/Schema.php` |
| 9.3 | Structured data per page type | done | MedicalClinic, Article, JobPosting, FAQPage, BreadcrumbList |
| 9.4 | `sitemap.xml` and `robots.txt` | done | Generated per request; 33 URLs, all answering 200 |
| 9.5 | The local keyword pass | done | Bardhaman and Burdwan, in both the meta and the schema |
| 9.6 | Verified end to end | done | 33 pages, no duplicate title or description among them |

There is no 9.2. It was a page per doctor — the reversal of §20 of
[`02-content-model.md`](../02-content-model.md) — and the client dropped it
after it was written. It is recorded here rather than renumbered away because
the gap it leaves is real: a search for a consultant's name has nothing on this
site to land on, and `seo_meta` still carries `doctor` rows nothing reads.

### 9.6

Every URL in the sitemap was fetched and checked: 33 pages, one `ld+json` block
each, all parsing, every one carrying a `Hospital` node whose address is
Bardhaman 713101, and every one carrying `og:title`, `og:description`,
`og:url`, `og:type`, `twitter:card`, a canonical and the verification tag.

**No two pages share a title, and no two share a description.** That was the
check worth running — duplicate metadata across a site is the ordinary way this
work goes wrong, and it is invisible until a crawler reports it.

Both Search Console methods answer: the meta tag on every page, and
`googlea372147cf2362119.html` at the root returning its token with a 200. The
`.html` → clean-URL redirect added in phase 5 does not touch it, because that
fallback only runs for paths that reach `index.php` and this one is a real file
the rewrite hands over first. `/about.html` still 301s, so the redirect is
intact.

No regressions: `php tools/check-resources.php` still resolves all 369
references, all 42 admin shells still route (302 while signed out, which is the
guard doing its job), and the sign-in page still says `noindex,nofollow` — the
panel is the one part of this site that must not be indexed.

### 9.5

The eight fixed pages and two departments carried seeded `seo_meta` rows that
won over every controller default, and most named no place at all — "Our
Doctors — Teresa Memorial Hospital", "Twelve departments, from cardiology to
dental care". A hospital that serves one town was competing for nothing.

Every title and description now carries Bardhaman, with Burdwan beside it.
Keywords are filled in for the first time, one line per page. **Stated plainly
because it belongs on the record: Google has ignored meta keywords since 2009.**
They are populated because the column exists, the panel edits it and Bing still
reads it — not because they will move a ranking. The titles, the descriptions
and the `Hospital` node are what carry the local intent.

Applied to the seed *and* the live database. `migrate:fresh` drops every table,
and rebuilding 372 rows of content for a metadata edit is not a trade worth
making.

### 9.4

`seo.sitemapUrl` had been seeded as `/sitemap.xml` and `seo.robots` as
`index, follow` since phase 3, and neither file existed — the panel's SEO
screen edited two values nothing read.

Both are generated per request rather than written to disk. A file would need
something to rewrite it every time the panel publishes a department, and a
sitemap regenerated nightly is a sitemap that is wrong for the rest of the day.
It is three queries.

33 URLs: eight fixed pages, eleven departments, nine posts, five vacancies,
each with its row's own `updated_at` as `lastmod`. **No doctors** — the roster
is one page, so a URL per doctor would be a sitemap entry that 404s.

`robots.txt` disallows `/admin/`, `/api/` and `/storage/`. Not a second lock —
`.htaccess` already refuses all three — but it stops a crawler spending its
budget on 403s. A `noindex` policy in the settings disallows everything
instead: a site that has asked not to be indexed has asked not to be crawled.

### 9.3

Every page already carried `Hospital` and `WebSite` from 9.1. Each now adds its
own node: `MedicalClinic` on a department, `Article` on a post, `JobPosting` on
a vacancy, `FAQPage` wherever an accordion already answers questions, and a
`BreadcrumbList` on everything below the home page. They reference the hospital
by `@id` rather than repeating it.

`JobPosting` is built against the columns the `jobs` table actually has —
`type`, `dept`, `salaryFrom`/`salaryTo`, `openings`, `experience` — not the
names schema.org uses. `type` is free text a panel user types and
`employmentType` is an enumeration, so anything outside it is dropped: an
invalid value invalidates the whole posting, and no value at all is valid.
`salaryNote` is left out for the same reason — "Plus night differential" is a
sentence, and `MonetaryAmount` has nowhere truthful to put it.

The footer's Promix link was already followed. It now says what it is in the
logo's `alt` and its `title`, and `Schema::website()` names the same
organisation as `creator` — the anchor is what a person follows, the node is
what a crawler reads.

Also fixed here: `titleFull` is printed into `<title>` as markup and the home
page's carried `&mdash;`, so `og:title` read "&amp;mdash;". It is decoded
before being escaped again.

### 9.1

`head.php` emitted `og:image` and nothing else, so a shared link rendered as a
picture over a bare URL. It now carries the full Open Graph set, the Twitter
card, the keywords `seo_meta` has always had a column for, an explicit robots
policy, the favicon, `theme-color` and the geo trio.

The Search Console token is a `seo` setting rather than a literal in the
component — the panel's SEO screen is where somebody would go to change it, and
a verification tag hardcoded into a template is one nobody can rotate.

`core/Schema.php` builds the JSON-LD, beside `SeoMeta` and `MediaUsage` where
the shared logic already lives. It reads the settings the footer and contact
page already read, so the hospital's address exists in one place. Nodes carry
`@id` and reference each other, which is why `head()` appends to the site-wide
graph rather than letting a page replace it, and why `page()` routes through
`head()` instead of merging over it.

`json_encode` gets `HEX_TAG` and `HEX_AMP`: the graph is printed inside a
`<script>`, and an excerpt containing `</script>` would otherwise close it.

**Still a stub:** the panel's SEO Manager screen. `seo`, `analytics`,
`navigation` and `redirects` were stubs on the design branch and are stubs now.
The consequence for this phase is worth naming — the `seo` settings this phase
added have no UI behind them yet, so the verification token and the default
keywords are editable through `PATCH /api/settings/seo` and not through a
screen.

---

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
