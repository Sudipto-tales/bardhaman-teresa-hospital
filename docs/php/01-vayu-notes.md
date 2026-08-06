# Vayu — what was changed and why

The framework came from `/home/weloin/Projects/vayu` at v1.0.4. It is small and
mostly right; this is every change made to it for this project, so that a later
upgrade knows what will conflict.

Nothing here is a rewrite. Where a fix was possible without changing an API the
application already uses, that is what was done.

---

## Removed on copy

`.git`, `vendor/`, `database/database.sqlite`, `.env`, `.claude/`, `.agent/`
and the framework's own `docs/` (which would have overwritten this project's).
`README.md` and `.gitignore` were overwritten by the copy and restored.

The framework's demo files — `app/controllers/Welcome.php`,
`app/page/welcome.php`, `app/components/hero.php`, `api/controllers/
UserController.php`, `assets/css/style.css`, `assets/js/script.js` — are still
present and are replaced in phases 4 to 6. `database/migrations/UsersTable.php`
was deleted immediately, because it creates a `users_tbl` this project does not
use and running it would have left a junk table in every fresh database.

---

## 1. `core/RouteManager.php` — frontend route parameters

**Was.** Frontend routes matched by exact array key only. `{param}` matching
existed, but only on the API side.

**Why it had to change.** `/blog/how-to-read-a-blood-report` and
`/departments/cardiology` are not expressible as fixed keys. The route table is
built in `app/view.php`, which `config/config.php` requires *before* `db.php`
runs — so a route table generated from the database is not possible either.
Without this, every post and department would need a literal route entry
written by hand.

**Now.** Frontend dispatch tries the exact key first, then patterns. The same
`matchPattern()` serves both route tables, so `/api/v1/users/{id}` and
`/departments/{slug}` cannot drift apart in their matching rules.

Details worth knowing:

- Exact beats pattern regardless of declaration order, so `blog/archive` wins
  over `blog/{slug}`.
- A `{param}` never spans `/`, so `blog/{slug}` does not swallow
  `blog/2026/january`.
- Literal segments are `preg_quote`d, so a dot in a route is a dot rather than
  "any character".
- Keys carrying an `HTTP_METHOD:` prefix are skipped when matching frontend
  routes — otherwise a wildcard API pattern could answer a page request.
- Captured parameters reach the controller through `setRouteParams()`, which
  `BaseController` now implements the same way `ApiController` already did.

## 2. `core/RouteManager.php` — a real 404, and middleware

**Was.** A miss called `load_view('resources/views/404.php')`, a path that does
not exist anywhere in the framework, so a missing page rendered
`Error: View 'resources/views/404.php' not found!` with a 404 status.

**Now.** A miss renders through the `'404'` route when the application declares
one, so the error page is an ordinary controller with the site's own chrome. If
that route is missing or broken it falls back to plain text — a framework that
fatals while reporting a missing page is worse than one that says "Not found".

Middleware was a single inline `if ($middleware === 'auth')`. It is now
`applyMiddleware()` with two names:

| Name | Checks |
|---|---|
| `session` | `Auth::isAuthenticated()` plus `Csrf::verifyRequest()`. What the admin panel uses. |
| `auth` | `JwtAuth::authenticate()`. Kept for machine-to-machine callers. |

An unrecognised middleware name is a 500, not a pass. A typo in a route table
should not quietly open an endpoint.

## 3. `core/BaseController.php`

Added `setRouteParams()` / `param()` (for change 1), `query()`, `redirect()`,
and `notFound()` — the last so a controller that finds no record can render the
site's own 404 rather than an empty page shell, which reads as a bug to a
visitor and to a crawler alike.

## 4. `core/Mailer.php` — credentials and attachments

**Was.** A Gmail address and a working 16-character app password as literals in
the file, no attachment support, and `send()` threw on failure.

**Now.** SMTP comes from `MAIL_*` environment variables. `send()` takes an
options array — `attachments`, `replyTo`, `cc`, `bcc` — and returns a bool,
never throwing.

The bool matters more than it looks. The endpoints that send mail are public
intake: a job application must be written to the database whether or not the
notification reaches HR. An exception unwinding the request before the row is
committed would lose the application because SMTP was down.

`Mailer::$lastError` carries the reason for the caller to log or store.

## 5. `core/Csrf.php` — new

One token per session. The panel sends it as `X-CSRF-Token`; public forms send
it as a `_token` field. Safe methods pass without one.

`SameSite=Lax` on the session cookie already blocks the classic cross-site form
post, but not a same-site subdomain. This is the check that does not depend on
browser behaviour.

## 6. `core/Upload.php` — new

Two kinds with deliberately different rules:

| Kind | Destination | Accepts | Served |
|---|---|---|---|
| `media` | `assets/uploads/<year>/<month>/` | images | by URL |
| `cv` | `storage/cv/` | pdf, doc, docx, odt, rtf | only through an authenticated endpoint |

**Corrected in 4.3.** Media was originally written to `storage/uploads/`, which
cannot work: `storage/` is denied wholesale by the root `.htaccess` and again
by its own, precisely so that no CV can ever be reached by URL. An image that
has to be public does not belong in the directory whose rule is "nothing here
is served" — one exception in that rule is how a CV eventually leaks. So public
uploads live in `assets/uploads/`, beside the site's other images, and that
directory carries its own `.htaccess` refusing anything executable: `Upload`
already accepts images only, by extension and by the file's own bytes, and this
is the second lock if that ever loosens.

Both get a random stored filename — the browser's filename is kept in the
database for display, but using it on disk invites a collision at best and a
path-traversal attempt at worst. MIME is read from the file's own bytes with
`finfo`, not from the `Content-Type` the client sent, which the client controls
entirely.

`delete()` refuses any path that resolves outside `storage/`.

## 7. `core/RateLimit.php` — new

Per-IP, per-action, in a `rate_limits` table. Needed on the three endpoints
anyone can reach without an account: the contact form, the application form and
the login screen. Without it the first two are a free mail relay pointed at the
hospital's own inbox and the third is an open door to password guessing.

A fixed window, not a sliding one, and pruned probabilistically — there is no
cron on this deployment. Proxy headers are trusted only when `TRUST_PROXY` says
so, because a limiter keyed on a spoofable header limits nobody.

## 8. `core/Auth.php` — session auth for the panel

**Was.** Two `require_once` calls at the top that resolved against the include
path, i.e. the working directory: `require_once 'config/db.php'` and
`require_once 'Mailer.php'`. The second could never have found its target —
`Mailer.php` is in `core/`. Both are gone; `bootstrap.php` loads them.

**Was.** Login refused any account whose email was not verified. Panel accounts
are created by an administrator, so a verification mail that must arrive before
the first login is a way to lock everybody out of a new install before SMTP is
configured.

**Also changed.**

- Session cookie flags set before `session_start()`: `HttpOnly`, `SameSite=Lax`,
  and `Secure` in production only — forcing `Secure` in development means the
  cookie is never set and nobody can log in locally.
- `session_regenerate_id(true)` on login, so a session id fixated before login
  is worthless after it.
- Remember-me stores a *hash* of the token, not the token. A leaked database
  should not hand out working sessions.
- One message for "no such account" and "wrong password". Telling them apart
  hands an attacker a list of who has an account.
- `users_tbl` → `users`, matching this project's schema.

## 9. `config/db.php`

- `ERRMODE_EXCEPTION`, `FETCH_ASSOC` and `EMULATE_PREPARES => false` set on the
  connection instead of left to the driver defaults.
- SQLite gets `PRAGMA foreign_keys = ON` — off by default, which would let a
  stale `doctor_id` sit unnoticed until a page rendered a blank card.
- Added `db_scalar()` and `db_transaction()`.
- **Removed the MongoDB branch.** Unused here, and its helpers took a different
  shape from the SQL ones — which is how a codebase ends up with two ways to
  read a row.
- `$GLOBALS['pdo']` is set explicitly. The console commands `require`
  `bootstrap.php` from inside a method, which makes `$pdo` local to that method
  and leaves every `global $pdo` reading null.

## 10. `config/config.php`

- `$_SERVER['HTTP_HOST']` was read unguarded. It does not exist under the CLI,
  and the migrate and seed commands load this file — this guard is what lets
  `php vayu migrate` run at all.
- `date_default_timezone_set()` from `APP_TIMEZONE`. Left at UTC, an
  appointment logged at 9pm IST files itself under the previous day.
- `display_errors` follows `APP_DEBUG` instead of the php.ini default.
- Behind a TLS-terminating proxy, `X-Forwarded-Proto` is honoured when building
  the base URL — otherwise every link on an https page is emitted as http.

## 11. `config/bootstrap.php`

- `base_url()` was built from `$_SERVER` and so returned nothing usable under
  the CLI and the wrong scheme behind a proxy. It now builds from `APP_URL`.
- `load_view()` no longer echoes its error in production; it logs.
- Added `e()` for HTML escaping, because views are full of it.

## 12. `config/migration.php` — dialect helpers

Development is SQLite and production is MySQL, and the two disagree about the
one column every table has: SQLite wants `INTEGER PRIMARY KEY AUTOINCREMENT`,
MySQL wants `INT AUTO_INCREMENT PRIMARY KEY` and rejects the other outright.

Rather than write every migration twice — which is how two schemas quietly
drift apart — the base class now offers `id()`, `json()`, `bool()`,
`timestamps()`, `create()`, `drop()` and `index()`, which answer for whichever
driver is connected. Everything else in the migrations is ordinary SQL both
accept.

## 13. `config/migrate.php` and the CLI

**Was.** The file opened with `define('_BASEDIR_', $base_url)` against a
variable that did not exist yet, and there was no command that ran it.

**Now.** `migration_run()`, `migration_reset()` and `migration_seed()`, driven
by three new commands:

```
php vayu migrate         run anything not yet run
php vayu migrate:fresh   drop every table, then run all of them
php vayu seed            run each migration's seed()
```

`migrate:fresh` prompts before destroying anything and refuses outright when
`APP_ENV=production`. `--force` skips the prompt; nothing skips the guard.

## 14. `config/route.php`

Loaded `app/controllers/Welcome.php` by name and globbed `api/controllers/*.php`
one level deep. Now walks `app/models`, `app/controllers` and `api/controllers`
recursively, so adding a controller is adding a file rather than adding a file
and remembering to require it.

## 15. `server.php` — the dev-server route bug

**The bug.** Under `php -S host:port server.php`, PHP sets `SCRIPT_NAME` to the
*requested* path. `RouteManager::resolveRoute()` strips `dirname(SCRIPT_NAME)`
from the URI to support subdirectory installs — so a request for
`/api/v1/users` had `/api/v1` stripped and arrived as `users`. Every nested
route resolved to its last segment, and only on the dev server; under Apache
the rewrite sets `?route=` and the strip never happens.

**The fix.** `server.php` sets `$_GET['route']` itself, taking the same
short-circuit the Apache rewrite does. Both servers now resolve routes
identically.

It also refuses the paths Apache refuses — `.env`, `vayu`, `composer.json`,
anything under `storage/`, `config/`, `core/` — which the dev server would
otherwise hand over as plain text.

## 16. `.htaccess`

Added denials for `.env`, `composer.json`, `composer.lock`, and everything
under `storage/`, `database/`, `config/`, `core/`, `app/`, `api/`, `vendor/`,
`tools/` and `html/`. A `<FilesMatch>` block repeats the most important of
these, so they hold even if `mod_rewrite` is off and every `RewriteRule` above
is inert. `storage/.htaccess` denies the directory from inside, so the
protection travels with it.

Plus `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy`.

---

## Worth upstreaming

Changes 1, 2, 10, 11, 13 and 15 are framework bugs rather than project needs —
particularly 15, which makes nested routes fail on the framework's own
`php vayu run`, and 13, which makes the migration runner unreachable.
