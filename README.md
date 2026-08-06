# Teresa Memorial Hospital

Website and admin panel for Teresa Memorial Hospital, Bardhaman.

## Layout

```
html/            the design set — open any file from disk, no server needed
  *.html         the 20 public pages (website.html is the home page)
  assets/        their CSS, JS, images, and the jobs + popups config files
  admin/         the 43-screen admin panel prototype
docs/            what the panel is, screen by screen and field by field
tools/           generators — the public pages are built, not hand-edited
```

## Branches

| Branch | What is on it |
|---|---|
| `main` | the state before the PHP conversion started |
| `design/html` | the frozen, signed-off design set — HTML, CSS and JS only |
| `development` | the PHP application, with `html/` kept alongside as the reference to diff against |

## Working on the design set

The public pages are generated. Editing `html/cardiology.html` by hand is
wasted work — the next build overwrites it. Change the copy in
`tools/site-data.mjs` or the markup in `tools/build-pages.mjs`, then:

```bash
node tools/build-pages.mjs      # rewrites the 20 public pages into html/
```

The admin panel's 43 page shells are generated the same way, from one table:

```bash
node html/admin/tools/scaffold.mjs           # writes any missing shell
node html/admin/tools/scaffold.mjs --force   # rewrites them all
```

Adding an admin screen means one row in that table and one line in
`html/admin/assets/js/core/nav.js` — not editing 43 files.

## Documentation

Start at [`docs/00-overview.md`](docs/00-overview.md). It maps the rest.
