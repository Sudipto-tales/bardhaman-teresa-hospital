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

**3. Find out where the site actually is.** Hostinger does not put every
account's site in the same place. It may be at `~/public_html`, or nested per
domain:

```
/home/uNNNNNNNNN/domains/example.hostingersite.com/public_html
```

Do not guess, and do not copy the path out of this document. Over SSH:

```bash
pwd                     # from the home directory: /home/uNNNNNNNNN
ls ~/domains            # empty on a flat account, a directory per site otherwise
```

Every absolute path below is written against `/home/uNNNNNNNNN` — substitute
the real one. A path that is merely *plausible* is the failure this whole
section exists to prevent; see step 5.

**4. Make a home for the database, outside the document root.**

```bash
mkdir -p /home/uNNNNNNNNN/data
chmod 750 /home/uNNNNNNNNN/data
```

Beside `public_html` rather than inside it, and at the account root rather than
inside `domains/`, so it stays put if the domain is renamed. `public_html` is
served; this is not, and no amount of `.htaccess` going missing changes that.

The **directory** has to be writable by PHP, not just the file — SQLite writes
`-wal` and `-shm` files alongside the database, and a read-only directory fails
every write with "attempt to write a readonly database" even when the database
file itself is plainly writable.

**5. Paste `.env` into the `public_html` you found in step 3.** File Manager,
or scp. It is not in git and never will be, so no deploy can overwrite it —
paste it once and it stays put.

Copy `.env.example` and change the keys that differ in production:

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://teresamemorial.org

DB_TYPE=sqlite
DB_DATABASE=/home/uNNNNNNNNN/data/database.sqlite

APP_KEY=<php -r "echo bin2hex(random_bytes(32));">
JWT_SECRET=<a different one>
```

Two of those are worth saying plainly:

- `APP_DEBUG=false`. With it on, a fatal prints the absolute server paths and
  the failing query to whoever loaded the page.
- `DB_DATABASE` set, and set to a path that exists. Left empty, `config/db.php`
  falls back to `database/database.sqlite`, which after a deploy means inside
  `public_html`.

**6. Put the database in place.** The simplest route, and the one that matches
the rest of this: upload your local `database/database.sqlite` into
`/home/uNNNNNNNNN/data/` through the File Manager. It already has the schema
and the seeded content, so there is nothing to migrate and nothing to seed.

With SSH available, the equivalent from scratch is:

```bash
cd <the public_html from step 3> && php vayu migrate && php vayu seed
```

**Run `seed` exactly once, on an empty database.** It empties every seeded
table before it loads `database/seeds/*.json`. Against a database with real
content in it, it deletes that content, and the `redirects.hits` counters with
it.

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
page fatals. There is no automatic path for this: run

```bash
cd <the public_html from step 3> && php vayu migrate
```

over SSH after pressing Deploy. Without SSH, there is currently no way to apply
a migration to the live database — do not push schema changes to `main` until
there is one.

Re-uploading `database.sqlite` from your machine is **not** a substitute once
the site is live. It replaces real content — enquiries, appointments, anything
edited in the panel — with whatever your local copy holds. That trick is for
the first deploy only.

## What a deploy does not touch

The reset is a git operation, so anything untracked or ignored survives it:

- `.env` — ignored, never committed, pasted onto the server once
- the SQLite database — outside `public_html` entirely
- `storage/uploads/`, `storage/cv/`, `assets/uploads/` — ignored
- `storage/cache/` — ignored, rebuilt on demand

Nothing in that list is in git, so nothing in that list can be overwritten by a
deploy. That is why those paths are ignored, not a side effect of it.

## Backups

Nothing above backs anything up. A deploy cannot destroy the database, but a
bad `seed` or a bad migration can, and the host's own snapshots are not a
content backup.

```bash
# crontab -e, daily
0 3 * * * sqlite3 /home/uNNNNNNNNN/data/database.sqlite ".backup '/home/uNNNNNNNNN/backups/db-$(date +\%F).sqlite'"
```

`.backup` rather than `cp`: copying a live SQLite file mid-write gives a
corrupt one, and under WAL it silently omits everything still sitting in the
log. `storage/cv/` needs the same treatment — a CV is not in git either, and it
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
