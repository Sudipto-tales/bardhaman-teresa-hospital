# Information Architecture

## Sidebar tree

The sidebar has six groups. Group labels are section headers, not links.
`partials/sidebar.html` is the single source of truth; every page injects it and
`core/layout.js` marks the active item from `document.body.dataset.page`.

```
MAIN
  Dashboard                dashboard.html
  Web Analytics            analytics.html

CONTENT
  Doctors                  doctors.html          → doctor-form.html
  Leadership               leadership.html       → leadership-form.html
  Departments              departments.html      → department-form.html
  Facilities               facilities.html
  Lab Tests & Packages     lab-tests.html
  Blog & News              blog.html             → blog-form.html
  Blog Categories          blog-categories.html
  Testimonials             testimonials.html
  FAQs                     faqs.html
  Media Gallery            gallery.html

PAGES
  All Pages                pages.html
  Home Page                page-home.html
  About Page               page-about.html
  Contact Page             page-contact.html
  Careers Page             page-careers.html
  Counters & Numbers       stats.html

CAREERS
  Vacancies                jobs.html             → job-form.html
  Applications             applications.html

GROWTH
  Enquiries                enquiries.html        → enquiry-view.html
  Appointments             appointments.html     (read-only)
  SEO Manager              seo.html
  Navigation               navigation.html
  Redirects                redirects.html

SYSTEM
  General Settings         settings-general.html
  Contact Details          settings-contact.html
  Social Links             settings-social.html
  Integrations             settings-integrations.html
  Theme & Branding         settings-theme.html
  Popups & Cookie Bar      settings-popups.html
  Users & Roles            users.html            → user-form.html
  Activity Log             activity-log.html
  My Profile               profile.html
```

Outside the sidebar: `login.html`, `forgot-password.html` (no chrome).

## Why this grouping

- **CONTENT** = repeatable records. Each one is a list + a form.
- **PAGES** = singleton screens that edit one specific public page. No list, no
  add button — you land straight in a sectioned form.
- **GROWTH** = inbound (enquiries, appointments) plus outbound discoverability
  (SEO, navigation, redirects). Appointments is read-only: the site takes no
  bookings, so the screen is an archive rather than a queue — see
  [`03-page-specs.md`](03-page-specs.md) §30.
- **SYSTEM** = configuration that touches the whole site, split by concern so no
  single settings screen becomes a 40-field wall. The current mockup's one
  `site-settings` page mixed identity, appearance and integrations — split here
  into six.

## URL scheme

Phase 1 is flat files, so URLs are literal paths:

```
html/admin/doctors.html                 list
html/admin/doctor-form.html             create
html/admin/doctor-form.html?id=d-004    edit
html/admin/enquiry-view.html?id=e-021   detail
html/admin/department-form.html?id=cardiology&tab=stats   deep link to a tab
```

Rules:
- `?id=` absent → create mode. Present → edit mode. Page JS branches on this once,
  at the top.
- `?tab=` selects a tab on tabbed forms; tab switches update the URL with
  `history.replaceState` so a tab is linkable and survives reload.
- `?q=` / `?status=` / `?page=` on list screens mirror the toolbar state, for the
  same reason.

Phase 2 keeps the same shape (`/admin/doctors`, `/admin/doctors/d-004/edit`), so
no page JS needs rewriting when routing moves server-side.

## Page map — 43 screens

| # | File | Type | Group |
|---|---|---|---|
| 1 | `login.html` | auth | — |
| 2 | `forgot-password.html` | auth | — |
| 3 | `dashboard.html` | overview | Main |
| 4 | `analytics.html` | overview | Main |
| 5 | `doctors.html` | list | Content |
| 6 | `doctor-form.html` | form | Content |
| 7 | `leadership.html` | list | Content |
| 8 | `leadership-form.html` | form | Content |
| 9 | `departments.html` | list | Content |
| 10 | `department-form.html` | tabbed form | Content |
| 11 | `facilities.html` | list + modal form | Content |
| 12 | `lab-tests.html` | list + modal form | Content |
| 13 | `blog.html` | list | Content |
| 14 | `blog-form.html` | form + editor | Content |
| 15 | `blog-categories.html` | list + modal form | Content |
| 16 | `testimonials.html` | list + modal form | Content |
| 17 | `faqs.html` | list + modal form | Content |
| 18 | `gallery.html` | media grid | Content |
| 19 | `pages.html` | list | Pages |
| 20 | `page-home.html` | section editor | Pages |
| 21 | `page-about.html` | section editor | Pages |
| 22 | `page-contact.html` | section editor | Pages |
| 23 | `page-careers.html` | section editor | Pages |
| 24 | `stats.html` | list + inline edit | Pages |
| 25 | `jobs.html` | list | Careers |
| 26 | `job-form.html` | form | Careers |
| 27 | `applications.html` | list + drawer | Careers |
| 28 | `enquiries.html` | list | Growth |
| 29 | `enquiry-view.html` | detail | Growth |
| 30 | `appointments.html` | list, read-only | Growth |
| 31 | `seo.html` | form + table | Growth |
| 32 | `navigation.html` | tree editor | Growth |
| 33 | `redirects.html` | list + modal form | Growth |
| 34 | `settings-general.html` | form | System |
| 35 | `settings-contact.html` | form + repeaters | System |
| 36 | `settings-social.html` | form | System |
| 37 | `settings-integrations.html` | form | System |
| 38 | `settings-theme.html` | form | System |
| 39 | `users.html` | list | System |
| 40 | `user-form.html` | form + permission matrix | System |
| 41 | `activity-log.html` | list | System |
| 42 | `profile.html` | form | System |
| 43 | `settings-popups.html` | form | System |

Six screen *types* cover all 43. Each type is built once in
`assets/css/components.css` + `assets/js/core/`, then composed:

1. **list** — toolbar, table, pagination, row actions
2. **form** — sectioned fields, sticky action bar
3. **tabbed form** — form + tab rail (departments, users)
4. **section editor** — form of collapsible section cards, reorderable
5. **detail** — read view + side panel of actions (enquiry, application)
6. **grid** — media tiles (gallery)
