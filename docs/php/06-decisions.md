# Decisions

Choices made during the conversion, and why. A decision without its reason is
just a rule someone will overturn the moment it becomes inconvenient.

---

## 1. The admin panel keeps its JavaScript

**Decision.** PHP serves a thin shell per admin screen — head, sidebar mount,
topbar mount, `<div id="view">`, script list. Everything the screen renders
still comes from `html/admin/assets/js/`. The one client-side change is
`store.js` → `api.js`.

**Why.** The panel is roughly 5,000 lines of working, reviewed JavaScript:
`table.js`, `form.js`, `fields.js`, `repeater.js`, `modal.js`, `toast.js`,
`media.js`, `editor.js`, plus 40 page scripts. It was written against a mock
store whose method signatures deliberately mirror the API contract, and
`docs/00-overview.md` names that store as "the single seam". Rewriting it as
PHP templates would take weeks and produce something no better; the panel is
behind a login, so server rendering buys no SEO.

**What it costs.** The admin is unusable with JavaScript off. Acceptable: it is
an internal tool for a known set of staff on modern browsers, not a public page.

**Alternative rejected.** Full PHP server-render of all 43 screens.

---

## 2. Roles are displayed, not enforced

**Decision.** Real session login with multiple users. The permission matrix on
`user-form.html` renders and saves, but the server does not check it.

**Why.** The hospital has one small admin team, all trusted. Enforcing
permissions half-way — some endpoints checked, some not — is worse than not
enforcing them, because it reads as protection that is not there.

**What it costs.** Any panel user can do anything. The activity log is
therefore the accountability mechanism, not the permission system, and every
mutation must write to it.

**When to revisit.** The first time someone outside the core team needs an
account.

---

## 3. Vayu goes into this repo, `html/` stays

**Decision.** The framework is copied to the repo root on `development`.
`html/` is left exactly where it is.

**Why.** One repo, one deploy. Keeping the prototype in the tree means every
PHP page has something to diff against while it is being built — the Phase 6
verification depends on it. A frozen copy also lives on `design/html`, so
deleting it later loses nothing.

> **Superseded.** `html/` was deleted after Phase 9, along with the
> `tools/build-pages.mjs`, `tools/rewire-home.mjs` and `tools/seed-export.mjs`
> generators that read and wrote it. The reason above held while pages were
> being built; once they were, a 2.8M folder blocked by `.htaccess` was a
> second copy of the site that nothing diffed against. It is on `design/html`,
> which is where the last sentence said it would end up.

---

## 4. Server-rendered PHP, not static regeneration

**Decision.** Public pages are rendered per request from the database.

**Why.** `docs/08-roadmap.md` originally recommended regenerating static HTML
on save, because that keeps crawlable pages and `build-pages.mjs` already did
most of the work. Moving to PHP makes that moot: PHP produces the same
crawlable HTML with no build step and no window where the files on disk
disagree with the database.

`build-pages.mjs` still earns its keep — as the reference. Its generator
functions map one-to-one onto the components (`banner()` → `block/banner.php`,
`team()` → `block/team.php`), which is the evidence those are the right seams
rather than a guess.

---

## 5. Appointments are read-only, with no write endpoints

**Decision.** The `appointments` entity is `GET`-only. No create, no status
change, no delete, no bulk. The screen is an archive.

**Why.** The hospital does not take bookings online. The designed workflow —
confirm a slot, reschedule, cancel with a reason, "patient notified" — would
have had the panel promising slots nobody could honour, and the "notified"
toast was already lying in the prototype.

**What replaces it.** The contact form posts an **enquiry** with
`source = appointment`. A doctor card links to that form with `?doctor=<slug>`
when the doctor's `appointmentEnabled` toggle is on, and carries no link at all
when it is off. Offering a booking and then refusing it is worse than saying so
up front.

**Why keep the screen.** The records that exist still have to be readable, and
deleting the screen would mean rebuilding it if intake is ever added.

---

## 6. Applications keep their stage pipeline

**Decision.** `new → shortlisted → interview → offered → rejected` stays, and
is writable.

**Why.** It affects nothing on the public site, so it costs nothing to keep,
and it saves whoever reads the inbox from tracking candidates in a spreadsheet.
This was the user's call: "as it does not affect anything on the website, no
issue, take it."

**What actually matters** is the submit path, and its order is deliberate:
write the row, then mail HR with the CV attached, then acknowledge to the
applicant. A row is never lost to a failed send — `notifiedAt` stays null and
the mail is retried from the panel.

---

## 7. CVs live outside the web root

**Decision.** Uploaded CVs go to `storage/cv/` with randomised filenames and
are served only through `GET /api/applications/{id}/cv`, behind the session.

**Why.** A CV is a named person's address, phone number and employment history.
Serving it from a public path means one guessed URL, or one search-engine
crawl of a directory listing, leaks it. The extra streaming endpoint is cheap
insurance.

**Still open.** Retention. Nothing deletes these today. See open question 4 in
`docs/08-roadmap.md`.

---

## 8. Consent is a cookie, not `localStorage`

**Decision.** Cookie-bar consent and the ads-popup seen-mark are first-party
cookies. Only the `session` frequency uses `sessionStorage`.

**Why.** The consent decision is the one thing on the site that must not
silently reset. A visitor who blocks storage APIs but not cookies would be
asked again on every page load, which is both annoying and a bad look for a
consent notice.

The seen-mark is keyed on the campaign's title and start date, so editing the
popup in the panel shows the new one to everybody instead of it being swallowed
by the previous campaign's cookie.

---

## 9. One resource controller, not twenty

**Decision.** `config/resources.php` describes each CRUD resource — table,
fields, casts, filters, sort whitelist, publish rules, dependency checks — and
one `ResourceController` implements the whole contract from it.

**Why.** Twenty near-identical controllers is twenty places for the pagination
to drift, twenty places to forget the activity-log write, and twenty places to
fix a bug. The panel already treats them uniformly: `store.list(entity, …)` has
no per-entity branches.

**Where it stops.** Anything whose shape genuinely differs gets its own
controller — auth, settings, media upload, page sections, public intake, the CV
stream. Forcing those through the registry would be the same mistake in the
other direction.

---

## 10. SEO is server-rendered, and the panel owns the copy

**Decision.** Every meta tag, the JSON-LD graph, `sitemap.xml` and `robots.txt`
are produced by PHP from the database. Nothing is a literal in a template — the
Search Console token is a `seo` setting, the sitemap is three queries per
request, and the titles and descriptions come from `seo_meta` rows the panel
edits.

**Why.** The alternative is a file somebody regenerates. A sitemap rebuilt
nightly is wrong for the rest of the day, and a verification tag hardcoded into
a component is one nobody can rotate without a deploy. Two of these were
already half-built: `seo.sitemapUrl` and `seo.robots` had been seeded since
phase 3 and nothing read them, which is exactly the failure mode this avoids.

**Meta keywords are ignored by Google, and are populated anyway.** They have
been dead as a ranking signal since 2009. The column exists, the panel edits
it, Bing still parses it, and the cost is one tag. What is *not* claimed is
that filling them in does anything for a Google ranking: the titles, the
descriptions and the `Hospital` node with a real postal address are what carry
the local intent, and those are where the work went.

**Both spellings, everywhere.** Bardhaman and Burdwan are the same town.
`areaServed` carries both, and so does every page description, because a
patient searching for the hospital may only know it by the other one.

**No page per doctor.** Reversing §20 of `02-content-model.md` was planned and
dropped at the client's direction. The consequence is worth writing down rather
than discovering later: a search for a consultant's name has nothing on this
site to rank, because a card in a grid of twelve is not a page about that
person. `seo_meta` still holds `doctor` rows from the seed, unread, if that is
ever revisited.
