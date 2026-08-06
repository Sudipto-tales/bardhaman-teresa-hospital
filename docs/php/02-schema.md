# Schema

27 tables plus `migrations`, from `docs/02-content-model.md`. One migration
file per entity in `database/migrations/`, numbered so a table exists before
anything references it. Join tables live in their parent's migration, because
they are created and dropped with it.

```
php vayu migrate         run anything not yet run
php vayu migrate:fresh   drop everything and rebuild   (refuses in production)
php vayu seed            load database/seeds/*.json
```

---

## Conventions

**Two keys per row.** An integer `id` is the primary key and the only thing
foreign keys point at. A separate string column is what the API and the URLs
use: `slug` where the record has a public URL (doctors, departments, posts,
jobs, facilities, lab tests, categories, pages, leadership), `public_id` where
it does not (testimonials, FAQs, counters, nav items, redirects, media,
applications, enquiries, appointments, users, roles).

Both are unique. The integer never appears in a URL or an API response; the
string never appears in a foreign key. `config/resources.php` records which of
the two each resource uses, which is why the generic controller can serve all
of them.

**`sort_order`, not `order`.** `order`, `key`, `group`, `from` and `to` are
reserved words in MySQL. Rather than quote identifiers — backticks in MySQL,
double quotes in SQLite, and a portability problem on every query — the columns
are named around it: `sort_order`, `setting_key`, `group_name`, `faq_group`,
`from_path`, `to_path`. The API still calls the field `order`; the registry
maps it.

**`status`** is `VARCHAR(20)`, not an enum. MySQL has `ENUM` and SQLite does
not, and a `CHECK` constraint that only one of the two enforces is worse than
neither. Allowed values are in a comment above each column and validated by the
resource registry, which is where a bad value should be caught anyway — with a
422 naming the field, rather than a driver error.

**Timestamps.** `created_at`, `updated_at`, `deleted_at`, all `DATETIME`, all
written by the application in one format (`now_iso()`), so sorting works. A
non-null `deleted_at` is a soft delete; the Undo the panel offers is clearing
it.

**`updated_by`** holds a user id on every content table. With roles displayed
but not enforced, this and `activity_log` are the whole answer to "who changed
this".

**Media columns hold a URL**, not a media id. The seeded content is a set of
external image URLs, uploads resolve to a URL as well, and a column that could
only hold an uploaded file's id would have nothing to put in it on day one.

---

## The JSON-column contract

A repeater is a JSON column when it is **edited as a block and never selected
across rows**, and a real table when it is queried.

| JSON | Table |
|---|---|
| A doctor's `schedule` | `department_doctors` |
| A department's `chips`, `intro_body`, `checks`, `procedures`, `conditions`, `badge`, CTAs | `post_tags` |
| A job's `responsibilities`, `requirements`, `benefits`, `nice_to_have` | `page_sections` |
| A lab package's `includes` | `counters` (department stats) |
| An enquiry's `replies` and `internal_notes` | |
| A role's `permissions`, a page section's `data`, an activity row's `diff` | |

The test is whether anything ever asks a question *of* the contents. Nothing
asks which doctors work Tuesdays, so a schedule is JSON. The related-posts
strip does ask which other posts share a tag, so tags are a table. A department
page lists its team and a doctor card lists their departments, so that is a
table read from both ends.

Two entries where the plan's table list said otherwise:

- **`doctor_schedules` is not a table.** It would buy a join on every doctor
  page to answer a query nobody makes.
- **`counters` holds department stats**, rather than a `stats` JSON column on
  `departments`. `docs/02-content-model.md` §13 is explicit that the point of
  that table is for "640 beds" to be one row wherever it appears, and a number
  buried in a blob on one department is the thing it exists to remove.

Read a JSON column back with `json_column()` (`core/Helpers.php`), which
returns `[]` for anything malformed. A bad column should cost one section of a
page, not the page.

---

## Tables

| Table | §  | Notes |
|---|---|---|
| `settings` | 1 | One row per key, `value` always JSON. Groups: general, contact, social, integrations, theme, **popups** |
| `roles` | 22 | `permissions` JSON, stored and displayed, never checked |
| `users` | 21 | `password` bcrypt; `remember_token` is a sha256 of the cookie token |
| `media` | 11 | No `used_by` column — computed, see below |
| `doctors` | 2 | `appointment_enabled` decides whether the card links to the contact form |
| `leadership` | 3 | `linked_doctor_id` for a director who is also a consultant |
| `departments` + `department_doctors` | 4 | One row fills one public page |
| `facilities` | 5 | |
| `lab_tests` | 6 | Tests and packages, split by `category` |
| `categories` | 8 | Categories and tags, split by `type`, unique on the pair |
| `posts` + `post_tags` | 7 | `author_id` has no FK: a doctor can leave, their articles stay |
| `testimonials` | 9 | `status = draft` is the moderation queue |
| `faqs` | 10 | |
| `pages` + `page_sections` | 12 | Sections are rows because they reorder individually |
| `counters` | 13 | Every animated number on the site |
| `nav_items` | 15 | |
| `redirects` | 16 | What keeps `/doctors.html` alive after the conversion |
| `seo_meta` | 14 | Polymorphic, so `seo.html` is one query and not a four-way union |
| `jobs` | 17 | Closed by `status = hidden`, never deleted |
| `applications` | 18 | CV outside the web root; row written before the mail is attempted |
| `enquiries` | 19 | Also holds appointment requests, `source = appointment` |
| `appointments` | 20 | **Read-only.** Nothing in this application writes it |
| `activity_log` | 23 | `diff` holds only the fields that moved |
| `rate_limits` | — | Contact form, application form, login |

### Popups is a settings group, not a table

`docs/02-content-model.md` §22b calls it "the sixth settings group" and
describes one record of fifteen fields. A one-row table for that would need its
own migration, model and controller to do what `PATCH /api/settings/popups`
already does for free. It lives in `settings` under `group_name = 'popups'`.

### `media.used_by` is computed, not stored

The content model lists it as a read-only back-reference, and it is what makes
deleting a file safe — the confirm dialog names every record using it. A stored
copy would be wrong the moment any record pointing at a file is edited by
something that forgets to update it. `MediaController` derives it on demand,
which is the only version that cannot go stale, and it is needed on exactly one
screen and one dialog.

---

## SQLite and MySQL

One set of migrations runs on both. `config/migration.php` supplies the four
things the two dialects disagree about:

| Helper | SQLite | MySQL |
|---|---|---|
| `id()` | `INTEGER PRIMARY KEY AUTOINCREMENT` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `json()` | `TEXT` | `JSON` |
| `bool()` | `TINYINT NOT NULL DEFAULT 0/1` | same |
| `tableOptions()` | nothing | `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` |

The primary key is **signed**. MySQL refuses a foreign key whose column is
`INT` when the column it references is `INT UNSIGNED`, so an unsigned key would
mean every `*_id` column repeating `UNSIGNED` — and the one that forgot would
pass on SQLite, which does not check, and fail on MySQL.

SQLite enforces foreign keys only with `PRAGMA foreign_keys = ON`, which
`config/db.php` sets on connect. Off, a stale `doctor_id` sits unnoticed until
a page renders a card with nothing in it.

Verified on SQLite by running `migrate`, `migrate` again (nothing to do),
`migrate:fresh`, and an insert that a foreign key correctly refused. The MySQL
DDL was rendered statically and checked for the three things that differ:
index names within the 64-character limit, foreign-key column types matching
what they reference, and `ENGINE=InnoDB` on all 27 tables. Running it against a
live MySQL server is step 8.2.
