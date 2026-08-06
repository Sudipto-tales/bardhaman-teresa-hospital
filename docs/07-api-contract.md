# API Contract (Phase 2)

Written now so the mock layer in `assets/js/core/store.js` matches the real thing
in shape. When the backend lands, `store.js` is deleted and its methods become
`fetch` calls. No page JS changes.

The stack is decided: **PHP on the Vayu framework**, SQLite in development and
MySQL in production. The contract below is unchanged by that — it was written
stack-agnostic and stays that way, because the panel only ever sees JSON.

## Conventions

- Base: `/api`
- JSON in, JSON out. `Content-Type: application/json`.
- Auth: session cookie, `HttpOnly; Secure; SameSite=Lax`. Mutating requests carry
  `X-CSRF-Token`.
- Timestamps ISO 8601 UTC.
- IDs are strings.

Envelope:

```json
{ "data": {...}, "meta": { "page": 1, "pageSize": 20, "total": 47 } }
```

Errors:

```json
{ "error": { "code": "VALIDATION_FAILED",
             "message": "3 fields need attention",
             "fields": { "slug": "Already in use", "photo": "Required" } } }
```

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No/expired session |
| `FORBIDDEN` | 403 | Role lacks the permission |
| `NOT_FOUND` | 404 | |
| `VALIDATION_FAILED` | 422 | `fields` map drives inline errors |
| `CONFLICT` | 409 | Stale `updatedAt`, or slug taken |
| `HAS_DEPENDENTS` | 409 | Delete blocked; `dependents[]` lists them |
| `RATE_LIMITED` | 429 | |

## Auth

```
POST   /api/auth/login          {email, password, remember}     → {user}
POST   /api/auth/logout                                          → 204
GET    /api/auth/me                                              → {user, permissions}
POST   /api/auth/forgot         {email}                          → 204 (always)
POST   /api/auth/reset          {token, password}                → 204
```

## Generic resource routes

Applied uniformly to: `doctors`, `leadership`, `departments`, `facilities`,
`lab-tests`, `posts`, `categories`, `testimonials`, `faqs`, `jobs`,
`applications`, `enquiries`, `redirects`, `nav-items`, `counters`, `users`,
`roles`.

`appointments` is the one exception: **`GET` only.** No POST, PATCH, DELETE,
reorder or bulk. The site does not take bookings, so there is nothing to write —
see §20 of [`02-content-model.md`](02-content-model.md). A write endpoint here
would be an invitation to rebuild the workflow that was deliberately removed.

```
GET    /api/{resource}?q=&status=&sort=&page=&pageSize=&<filters>
GET    /api/{resource}/{id}
POST   /api/{resource}                       → 201 {data}
PATCH  /api/{resource}/{id}                  → {data}
DELETE /api/{resource}/{id}?force=false      → 204 | 409 HAS_DEPENDENTS
POST   /api/{resource}/{id}/restore          → {data}
POST   /api/{resource}/reorder   {ids: []}   → 204
POST   /api/{resource}/bulk      {ids, action, payload}
                                 → {succeeded: [], failed: [{id, reason}]}
```

`PATCH` accepts a partial body and requires `updatedAt` for optimistic
concurrency. Publish/unpublish are `PATCH {status}` — not separate verbs.

Per-resource filters:

| Resource | Filters |
|---|---|
| `doctors` | `department`, `isLeadership` |
| `posts` | `category`, `author`, `tag`, `from`, `to`, `featured` |
| `jobs` | `dept`, `type`, `closingWithinDays` |
| `enquiries` | `source`, `assignedTo`, `priority`, `from`, `to` |
| `appointments` | `department`, `doctor`, `date` — read-only |
| `counters` | `scope`, `department` |
| `nav-items` | `location` |

## Settings (singleton)

```
GET    /api/settings                     → every group in one object
PATCH  /api/settings/{group}             group ∈ general|contact|social|integrations|theme|popups|seo
POST   /api/settings/integrations/test-smtp   → {ok, message, config}
```

## Site pages

```
GET    /api/pages                                  → list
GET    /api/pages/{id}                             → {sections: [...]}
PATCH  /api/pages/{id}                             → {data}
POST   /api/pages/{id}/sections/reorder  {keys}    → 204
```

## Media

```
GET    /api/media?folder=&type=&unused=&missingAlt=&q=
POST   /api/media            multipart/form-data   → 201 {data}
PATCH  /api/media/{id}       {alt, caption, folder}
DELETE /api/media/{id}?force=false                 → 409 lists usedBy
POST   /api/media/{id}/restore                     → {data}
GET    /api/media/{id}/usage                       → {usedBy: [{entity, id, label}]}
```

`usedBy` is on every row of the list too — the panel's prototype worked it out
client-side by loading every entity that can hold an image, which against a real
database would be eight list requests to render one screen. A delete is soft, so
the Undo on its toast is `restore`; the file on disk is kept either way.

## Enquiries & applications (workflow)

```
POST   /api/enquiries/{id}/reply    {body, templateId}   → {data}
POST   /api/enquiries/{id}/note     {body}
PATCH  /api/enquiries/{id}          {status, assignedTo, priority}
PATCH  /api/applications/{id}       {stage, rating}
GET    /api/applications/{id}/cv                          → file stream
GET    /api/applications/{id}/cv?file=cover-letter        → file stream
```

An application record carries `cvUrl` and `coverLetterUrl` — the routes above,
or null where no file was stored. They are what the panel's download button
opens; a stream is not a column, so the record has to name it.

## Public intake (called by the website, not the panel)

```
POST   /api/public/enquiry       {name, email, phone, subject, message, source,
                                  department, doctor, preferredDate, slot, recaptcha}
POST   /api/public/application   multipart — job application + CV
```

There is no `POST /api/public/appointment`. The contact page's request form
posts an **enquiry** with `source = appointment`, carrying the department,
doctor and preferred slot the visitor chose. The desk calls back; the site never
confirms anything it cannot honour.

`POST /api/public/application` does three things in order, and the order is the
point: write the row, then mail HR with the applicant's details and the CV
attached, then acknowledge to the applicant. A failed send leaves the row
intact with `notifiedAt` null, retryable from the panel — losing an application
because SMTP was down is not an acceptable failure.

Rate-limited, reCAPTCHA-verified, honeypot field. These are the endpoints that
make the site's existing forms actually deliver.

Four details of that, decided when they were built:

- The CSRF token comes from the page that rendered the form, not from a
  session the visitor does not have.
- A filled honeypot is answered with a success and writes nothing. Telling a
  bot it was caught is telling it what to change.
- The rate limit is checked on arrival and counted only once a row exists, so
  an applicant who picks the wrong file twice is not locked out for an hour.
- reCAPTCHA passes when no secret is configured, and when Google cannot be
  reached. Losing a patient's message costs more than accepting a spam one.

`preferredDate`/`slot` are also accepted as `date`/`time`, which is what the
site's own form calls them.

## Public read (if the site fetches at runtime)

```
GET    /api/public/settings           includes the popups group — the cookie
                                      bar and ads popup read it
GET    /api/public/departments        GET /api/public/departments/{slug}
GET    /api/public/doctors            GET /api/public/posts?category=&page=
GET    /api/public/posts/{slug}       GET /api/public/jobs
GET    /api/public/page/{id}
```

Published records only, aggressively cacheable, `ETag` + `Cache-Control`.
If Phase 3 instead regenerates static HTML, these are unnecessary and
`POST /api/build` triggers `tools/build-pages.mjs` on save.

## Support

```
GET    /api/activity?user=&entity=&from=&to=
POST   /api/activity/{id}/revert
GET    /api/dashboard/summary        → stat tiles, attention list, recent feed
GET    /api/analytics?range=          → chart series
GET    /api/seo/pages                 → per-page meta + score
GET    /api/search?q=                 → global search across entities
```

## Not in scope for Phase 2

Webhooks, a public write API, multi-tenant, versioned content history beyond the
activity log.
