# Teresa Memorial Hospital

Website and admin panel for Teresa Memorial Hospital, Bardhaman. A PHP
application on the Vayu micro-framework, with a SQLite or MySQL database.

## Layout

```
index.php        the single entry point; .htaccess routes everything here
app/             routes (view.php), controllers, models, page templates, components
api/             the JSON API the admin panel talks to
core/            the framework — routing, auth, validation, schema, mail
config/          bootstrap, environment, database, migrations
database/        migrations, JSON seeds, and the SQLite file
assets/          the public site's CSS and JS; assets/admin/ is the panel's
storage/         uploads, applicant CVs, logs — never served
docs/            what the panel is, screen by screen and field by field
tools/           maintenance scripts
vayu             the CLI
```

## Branches

| Branch | What is on it |
|---|---|
| `main` | production — a push here deploys to the live site |
| `design/html` | the frozen, signed-off design set — the HTML/CSS/JS prototype and its generators |
| `development` | the PHP application |

The prototype used to sit in `html/` on this branch as something to diff
against. Phase 9 finished, so it was deleted — it lives on `design/html`, along
with the `build-pages.mjs`, `rewire-home.mjs` and `seed-export.mjs` generators
that read and wrote it.

## Running it

```bash
php vayu setup      # first-run wizard
php vayu migrate    # apply any pending migrations
php vayu run        # dev server
```

`php vayu seed` loads `database/seeds/*.json`. **It empties every seeded table
first**, so it is for a fresh install only — running it against real content
destroys that content, and the `redirects.hits` counters with it. A deploy is
`php vayu migrate` and nothing else.

## Deploying

Push to `main`, then press Deploy in hPanel → Advanced → Git. That is the whole
deploy: it copies the branch into `public_html` and runs nothing afterwards,
which is why `vendor/` is committed and why a push that adds a migration still
needs `php vayu migrate` run over SSH. The database is SQLite and lives outside
the document root; `.env` is pasted onto the server once and no deploy touches
it.

[`docs/09-deployment.md`](docs/09-deployment.md) is the procedure — the server
`.env`, where the database goes, and the backup cron that is not optional.

## URLs

Public pages are clean paths: `/`, `/about`, `/doctors`, `/cardiology`,
`/blog/{slug}`, `/careers/{slug}`. The admin panel is `/admin/{screen}`, one
shell per file in `app/page/admin/`.

The old static site's `.html` addresses still resolve. `ErrorController` 301s
any unmatched `*.html` path to its clean equivalent, and the `redirects` table
covers the ones that also moved (`/heart.html` → `/cardiology`). Nothing in the
application *emits* that spelling any more — if you find one, it is a bug.

## Adding an admin screen

One row in the table in `tools/scaffold-admin.php`, one file in
`app/page/admin/`, and one line in `assets/admin/js/core/nav.js`.

## Documentation

Start at [`docs/00-overview.md`](docs/00-overview.md). It maps the rest. Note
that `docs/` is partly a historical record — `docs/php/PROGRESS.md` and
`docs/php/00-plan.md` describe decisions as they were made, not the tree as it
stands today.
