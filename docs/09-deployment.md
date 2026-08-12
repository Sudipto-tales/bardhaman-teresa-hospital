# Deployment

Hostinger shared hosting, SQLite, deployed by hand from hPanel.

There is no build step, no MySQL, and nothing automatic. Push to `main`, press
Deploy in hPanel, and that is the deploy.

## The flow

```
git push origin main
    ↓
hPanel → site Dashboard → Advanced → Git → Deploy
    ↓
files in the site's public_html are now what main says
```

That is all it does. hPanel's Deploy button is `git fetch` followed by a reset
onto the selected branch — a file copy with a git shape. It does not run
Composer, it does not run the CLI, and it does not know what a migration is.

Auto-deployment via webhook is deliberately **off**. Deploying is a decision,
and a push to `main` while something is half-finished should not become a live
site on its own.

### Why vendor/ is committed

`.gitignore` un-ignores it, which is not the usual answer and is the right one
here. Three libraries, 1.4 MB, pinned by `composer.lock`. Since nothing runs
`composer install` on the server, an ignored `vendor/` means the deployed tree
has no PhpMailer, no Dotenv and no JWT, and every request fatals on the first
`require`.

Update a dependency with `composer update` locally, then commit the result like
any other change. If `composer.lock` moves and `vendor/` does not, the deployed
code is running libraries the lock file does not describe — put both in the
same commit.

## First deploy

**1. Merge onto `main` and push.** `main` is the branch hPanel deploys from;
`development` is where the work happens.

**2. Connect the repository.** hPanel → the site's Dashboard → Advanced → Git →
*Continue with GitHub*, authorise the Hostinger app against this repository:

- Branch: `main`
- Install path: `public_html`

Leave Auto Deployment alone. The repository row's **Deploy** button is the
whole mechanism.

**3. Paste `.env` into `public_html`** — through the File Manager, next to
`index.php`. It is not in git and never will be, so no deploy can overwrite it:
paste it once and it stays put.

Copy `.env.example` and change the keys that differ in production:

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=<the URL you actually type in the browser>

DB_TYPE=sqlite
DB_DATABASE=

APP_KEY=<php -r "echo bin2hex(random_bytes(32));">
JWT_SECRET=<a different one>
```

Generate the two secrets on your own machine and paste the results in.

`APP_URL` is not decoration. `base_url()` is built from it and every stylesheet,
script and link on the site is an absolute URL built by `base_url()` — so an
`APP_URL` naming a domain that is not serving the page produces markup that
loads its CSS from somewhere else entirely, and the site renders as unstyled
HTML. While the site is on a temporary `*.hostingersite.com` address, that
address is the value; **change this line when the real domain is attached**, or
the assets break again the same way. Include the scheme, and no trailing slash.

Left empty it is derived from the `Host` header, which is right often enough to
be tempting and guesses the scheme from `$_SERVER['HTTPS']` — on a host that
terminates TLS upstream without setting it, that guess is `http://` on an
`https://` page and the browser blocks every asset as mixed content. Set it.

`APP_DEBUG=false` matters: with it on, a fatal prints the absolute server paths
and the failing query to whoever loaded the page.

`DB_DATABASE` empty is deliberate here — see the next step.

**4. Upload the database.** Leaving `DB_DATABASE` empty puts it at the default
path, inside the project:

```
<public_html>/database/database.sqlite
```

Upload your local `database/database.sqlite` there with the File Manager. It
already holds the schema and the seeded content, so there is nothing to migrate
and nothing to seed.

Inside the document root is not where a database would ideally live, and it is
the right answer on a plan with no shell — the alternatives all need one. Three
things make it safe enough:

- `.htaccess` refuses it twice over, by the `database/` rule and by the
  `*.sqlite` rule that also covers the `-wal`, `-shm` and `-journal` siblings.
  Both were checked under Apache with `AllowOverride All`: the path answers 403.
- It is gitignored, so no deploy can overwrite it. That is also why the
  database is **not** committed — a tracked database would be reset to the
  repository's copy on every Deploy, discarding every enquiry and every panel
  edit made since the last one.
- `database/` is writable by PHP, being a deployed directory owned by the
  account.

If your plan does have SSH, put it outside the document root instead — set
`DB_DATABASE=/home/uNNNNNNNNN/data/database.sqlite` against a directory you
made with `mkdir -p ~/data && chmod 750 ~/data`, and build it in place with:

```bash
cd <public_html> && php vayu migrate && php vayu seed
```

**Run `seed` exactly once, on an empty database.** It empties every seeded
table before it loads `database/seeds/*.json`. Against a database with real
content in it, it deletes that content, and the `redirects.hits` counters with
it.

Whichever path you choose, the **directory** has to be writable by PHP, not
just the file — SQLite writes `-wal` and `-shm` files alongside the database,
and a read-only directory fails every write with "attempt to write a readonly
database" even when the database file itself is plainly writable.

### When the path is wrong

Worth knowing what this looks like, because SQLite hides it. `new PDO('sqlite:'
. $path)` on a path that does not exist **creates** the file and connects to
it. No error, no warning — an empty database that answers every query with "no
such table: pages", which reads like a broken migration and is really a typo in
`DB_DATABASE`.

`config/db.php` refuses that now: over HTTP a missing file is a hard error
naming the path it looked for. The CLI is exempt, because creating the file is
what `php vayu migrate` is *for*.

If you hit it before the guard existed, look for a 0-byte `database.sqlite` —
at the `DB_DATABASE` path, or in `public_html/database/` when `DB_DATABASE` was
empty. That is the file being read. Delete it and put the real one where `.env`
says.

## Every deploy after that

Push to `main`, press Deploy. Done — as long as the push added no migration.

**A push that adds a file to `database/migrations/` needs a step nothing on the
server performs.** New code will query a table that does not exist yet, and the
page fatals.

With SSH, that step is `cd <public_html> && php vayu migrate` after pressing
Deploy.

**Without SSH there is no way to apply a migration to the live database.** This
is the standing limitation of the no-shell setup, not an oversight: do not push
a schema change to `main` until there is a way to run it. Something has to fill
that gap before the next one — a token-guarded migrate route is the usual
answer, and the alternative is exporting the content, rebuilding the database
locally and uploading it, which loses everything written in between.

*Content* is no longer part of that gap — see Content packs below, which is the
token-guarded route built for rows and files. Schema still is. The two are
deliberately separate: a pack writes rows to tables that already exist and can
be replayed, and a migration rewrites the shape of a live database and cannot.

Re-uploading `database.sqlite` from your machine is **not** a substitute once
the site is live. It replaces real content — enquiries, appointments, anything
edited in the panel — with whatever your local copy holds. That trick is for
the first deploy only.

## Content packs

The gap above has a floor under it now, for content if not for schema.

A **content pack** is a tracked bundle — binaries plus rows — applied to a live
database without emptying anything. It exists because the two halves of a
content drop are exactly the two things a deploy cannot carry:

| | Why a deploy misses it |
|---|---|
| Photos and clips | `assets/uploads/` is gitignored, so a checkout cannot put a file there |
| The rows describing them | `database.sqlite` is gitignored, and `seed` empties tables |

A pack lives in `database/content/`, which `.htaccess` refuses to serve. It
holds its own copy of every file, checksummed, and one or more sets of rows
keyed by a column. Applying it copies any file not already in place and
upserts each row by its key.

**It is additive.** Nothing in `core/ContentPack.php` issues a DELETE. A row
whose key is already present is updated; a file already at the target path is
left alone and reported. Applying the same pack twice changes nothing the
second time, which is what makes it safe to retry when a response hangs.

### Applying one — no shell

**1. Put a token in `public_html/.env`** through the File Manager:

```ini
CONTENT_IMPORT_TOKEN=<php -r "echo bin2hex(random_bytes(32));">
```

Until that line exists the route answers 404, and so does a wrong token — the
endpoint is invisible rather than merely closed. Under 32 characters is refused
and logged.

**2. Ask what it would do.** Nothing is written by a GET:

```bash
curl -H "X-Content-Token: $TOKEN" \
  "https://<site>/api/content/packs?pack=gallery-2026-08"
```

Read the counts back before continuing. `inserted` is new rows, `updated` is
rows whose key is already on the live site — an `updated` you did not expect
means the pack is about to overwrite something an editor owns.

**3. Apply it:**

```bash
curl -X POST -H "X-Content-Token: $TOKEN" -H "Content-Type: application/json" \
  -d '{"pack":"gallery-2026-08"}' https://<site>/api/content/import
```

**4. Empty `CONTENT_IMPORT_TOKEN` again.** The route closes with it. A token
that stays in `.env` after the import is a write endpoint left open for the
convenience of never having to paste it twice.

The header, not a query string: shared hosting writes URLs to access logs that
support staff can read.

### Applying one — with a shell

```bash
php tools/import-content.php                    # what packs exist
php tools/import-content.php <pack> --dry-run   # what it would change
php tools/import-content.php <pack>             # do it
```

Same class, no token — a shell on the server is already the credential.

### What a pack may not do

The repository is the trusted part and the request is not: a caller picks a
pack by name from a directory listing, and cannot supply one. The constraints
are enforced anyway, because a generator bug should not be able to do these
things either:

- Writes only under `assets/uploads/`, and only `.jpg .jpeg .png .gif .webp
  .avif .mp4 .webm`. No SVG — it is a document that can carry script — and
  nothing that the server would execute.
- Writes only to the tables in `ContentPack::TABLES`, currently `gallery` and
  `media`. Extend that list only for tables holding authored content: an upsert
  into `enquiries` would be editing a message somebody sent.
- Every column named in a row must exist on the table, and every file must
  match the SHA-256 in its manifest, or the whole pack is refused before the
  first write.
- 20 requests per hour per IP, and every rejection is logged.

### Building one

`database/content/<name>.json` — files with checksums, then sets of rows:

```json
{
  "pack": "gallery-2026-08",
  "files": [
    {"source": "media/ab12.mp4", "target": "assets/uploads/2026/08/ab12.mp4",
     "bytes": 907994, "sha256": "..."}
  ],
  "sets": [
    {"table": "media", "key": "url", "idPrefix": "med", "rows": [...]},
    {"table": "gallery", "key": "slug", "rows": [...]}
  ]
}
```

`idPrefix` fills a `public_id` at import time from the numbers the *destination*
is using. A pack cannot carry those: it was built against one database and
`med-004` is taken on the live site by whatever was uploaded last Tuesday.

Two things worth getting right when generating the rows:

- **Pick keys that cannot collide.** The gallery pack uses `cathlab-01`, not
  `gal-001`, precisely so it cannot overwrite the seeded placeholders or an
  editor's row. A key you invent is an insert; a key that already exists is a
  silent edit to somebody else's record.
- **Strip anything local to your database** — `id`, `created_at`,
  `updated_by`, `public_id`. Those describe the row where it was built, not
  where it is going.

Packs are cheap to keep and worth keeping: the pack is the record of what was
imported and when, and re-running it repairs a file somebody deleted.

## What a deploy does not touch

The reset is a git operation, so anything untracked or ignored survives it:

- `.env` — ignored, never committed, pasted onto the server once
- `database/database.sqlite` — ignored, uploaded once
- `storage/uploads/`, `storage/cv/`, `assets/uploads/` — ignored
- `storage/cache/` — ignored, rebuilt on demand

Nothing in that list is in git, so nothing in that list can be overwritten by a
deploy. That is why those paths are ignored, not a side effect of it.

## Backups

Nothing above backs anything up. A deploy cannot destroy the database, but a
bad `seed`, a bad migration or a mistaken overwrite can, and the host's own
snapshots are not a content backup.

**Without a shell**, this is a recurring manual job: download
`<public_html>/database/database.sqlite` and the contents of `storage/cv/`
through the File Manager, on a schedule you actually keep. Put a reminder
somewhere. It is the weakest part of this setup and the one most likely to
matter.

Download the `-wal` file alongside the database if one is present, or the copy
may be missing the most recent writes — WAL keeps committed data in that file
until a checkpoint folds it back in.

**With a shell**, a cron does it properly:

```bash
# crontab -e, daily
0 3 * * * sqlite3 <db path> ".backup '/home/uNNNNNNNNN/backups/db-$(date +\%F).sqlite'"
```

`.backup` rather than `cp`: copying a live SQLite file mid-write gives a
corrupt one, and it reads a consistent snapshot without the WAL caveat above.
`storage/cv/` needs the same treatment either way — a CV is not in git, and it
is not regenerable.

## Why SQLite here, and where it stops

The site is read-heavy — visitors read, a handful of staff write. SQLite in WAL
mode serves that shape well, and `config/db.php` sets it up accordingly:
`journal_mode=WAL` so a save in the panel does not block a visitor's page load,
`busy_timeout=5000` so two colliding writes wait instead of returning "database
is locked", and `synchronous=NORMAL` for the write speed, which trades
durability across a power cut for durability across a process crash. That last
trade is why the backup cron above is not optional.

Writes still serialise: SQLite locks the database, not the row. Concurrent
editors in the admin panel are fine; hundreds of simultaneous enquiry
submissions would not be. If that day arrives, `DB_TYPE=mysql` and the four
keys beneath it are the whole migration path — `config/db.php` switches on that
one value, and the migrations already run on both engines.
