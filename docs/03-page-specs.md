# Page Specifications

Per screen: what it shows, what you can do, and what it looks like when empty or
broken. Components referenced here are specified in
[`05-components.md`](05-components.md).

Every screen inside the sidebar shares the same chrome: fixed sidebar, topbar
(search, theme toggle, notifications, account menu), page header (title,
breadcrumb, primary action), content area.

---

## Auth

### 1. `login.html`
Split screen — brand panel left (logo, tagline, a photo), form right.
Fields: email, password (reveal toggle), remember me. Actions: Sign in, Forgot
password. Errors render inline above the form, not as a toast.
States: idle, submitting (button spinner, fields locked), invalid credentials,
account locked.

### 2. `forgot-password.html`
Single email field → success panel ("If that address is registered, a reset link
is on its way"). Never confirms whether the address exists.

---

## Main

### 3. `dashboard.html`
- Stat strip ×4: enquiries this month, appointment requests, published posts,
  active vacancies. Each with a delta chip.
- **Needs attention** card: draft content older than 7 days, unanswered enquiries,
  vacancies closing this week, media with no alt text.
- **Recent enquiries** table (5 rows) → `enquiries.html`.
- **Quick actions** row: Add doctor · Write post · Post a vacancy · Edit contact
  details.
- **Recently edited** feed from the activity log.
- Empty state on a fresh install: a checklist card walking through settings →
  doctors → departments.

### 4. `analytics.html`
Ports the four Chart.js views already built in the root `app.js`: visitors line
(current vs previous period), source bar chart, device doughnut, top pages table.
Date-range selector in the page header. Charts re-render on theme change.

---

## Content

### 5. `doctors.html` — reference list screen
- Stat strip: total, published, drafts, departments covered.
- Toolbar: search (name / speciality), department filter, status filter chips,
  sort (name, experience, order), view toggle (table ⇄ cards), bulk select.
- Table: photo + name, role, qualification, experience, departments, appointments
  (Yes/No), status, row actions (Edit, Duplicate, View on site, Delete).
- Bulk actions: publish, hide, delete.
- Drag handle when sorted by `order`.
- Empty: "No doctors yet" + Add doctor. Filtered-empty is a different message
  with a Clear filters link.

### 6. `doctor-form.html` — reference form screen
Sections: Identity (name, role, qualification, experience, photo) · Assignment
(departments, speciality, registration no, languages) · Profile (bio rich text,
schedule repeater, fee) · Visibility (leadership toggle, **appointments-available
toggle**, order, status) · SEO.
Sticky action bar: Cancel · Save draft · Publish (label becomes Update when
editing a published record).
Live preview card in the right rail showing how the doctor renders on a
department team strip.

### 7. `leadership.html` / 8. `leadership-form.html`
Card grid by category (Board / Management / Clinical). Drag to reorder inside a
category. Form adds a director's-message rich text field and an optional link to
an existing doctor record.

### 9. `departments.html`
Table: icon + name, slug, doctors, procedures count, menu visibility, status.
Row actions include "Open public page". Reorder controls the mega-menu order.

### 10. `department-form.html` — tabbed
Tabs: Basics · Banner · Stats · Intro · Procedures · Conditions · Team · SEO.
- Tab rail shows a dot on any tab with an unfilled required field.
- Slug field warns when changing an existing slug (breaks the public URL) and
  offers to create a redirect.
- Stats tab is fixed at 4 rows — add is disabled at 4, delete at 1.
- Team tab is a picker against the doctor list with drag ordering.
- Save is blocked until every tab's required fields pass; the failing tab is
  focused and the toast names it.

### 11. `facilities.html`
Card grid, 12-ish short records. Add/edit in a modal, not a page — every field
fits. Icon picker, title, text, optional image, order, status.

### 12. `lab-tests.html`
Two tabs: Tests and Health packages. Table with price columns, a Featured toggle
that surfaces the row on the home page block, and a warning when more than six
are featured (the block only renders six).

### 13. `blog.html`
Table: thumbnail, title + excerpt, category, author, published date, views,
status. Filter by category, author, status, date range. The single Featured post
is marked with a star and is what the article page renders in full — setting a
new one clears the old, with a toast saying so.

### 14. `blog-form.html`
Two-column: writing pad left, meta rail right.
- Pad: title input styled as a heading, then the editor (see §Editor in
  `05-components.md`).
- Rail: cover image, category, tags, author, publish date, read time (auto,
  overridable), featured toggle, SEO accordion with a live search-result preview.
- Autosaves a local draft every 20s; a "Draft restored" banner appears if an
  unsaved draft is found on load.
- Word count and reading time update live.

### 15. `blog-categories.html`
Two lists side by side — Categories and Tags. Inline add row at the top of each.
Delete is blocked while posts reference the term; the modal offers to reassign.

### 16. `testimonials.html`
Tabs: Pending (status `draft`) · Published · Hidden. Quote cards with Approve /
Reject actions. Approve publishes and toasts with Undo.

### 17. `faqs.html`
Accordion list grouped by `group`. Inline expand to edit, drag to reorder within
a group. Rich text for the answer.

### 18. `gallery.html`
- Drop zone across the top; drag files anywhere on the page to upload.
- Folder rail left, tile grid right, detail drawer on click (preview, filename,
  dimensions, alt, caption, copy URL, used-by list).
- Filter: all / images / documents / unused / missing alt.
- Delete is blocked when `usedBy` is non-empty; the modal lists the records.
- Bulk select for delete and folder move.

---

## Pages

### 19. `pages.html`
Table of the public pages: title, path, sections enabled, last edited, status,
Edit → the matching editor, and "View" → the live file.

### 20. `page-home.html`
A vertical stack of collapsible section cards, one per `[data-section]` block in
`website.html`. Each card header: drag handle, section name, enabled toggle,
expand chevron. Expanded body holds that section's fields.
A sticky mini-map on the right lists the sections and scrolls to them.
Reordering warns that the public page order changes.

### 21. `page-about.html`
Same pattern. Sections: Our Story (rich text + image) · Purpose (3 pillars) ·
Values (repeater) · Milestones (year + text repeater) · Leadership (picker into
the leadership list) · In Practice (photo mosaic + quotes) · Careers CTA.

### 22. `page-contact.html`
Sections: Reach Us (pulls from settings, read-only with an "Edit in Contact
Details" link — no duplicate source of truth) · Appointment form config (which
fields, which departments, confirmation message) · Location (map, directions) ·
CTA.

### 23. `page-careers.html`
Sections: Why Us (checks repeater) · What We Offer (benefits repeater) · Open
Roles (read-only count + link to `jobs.html`) · Contact HR.

### 24. `stats.html`
One table of every counter, grouped by scope. Inline editing — click a value,
type, tab out, toast. Rows scoped to a department link back to that department's
Stats tab. Add is allowed for global/home/about scope only; department counters
are fixed at four per department.

---

## Careers

### 25. `jobs.html`
Table: title, department, type, location, posted, closes, applications count,
status. A closing-soon chip on anything within 7 days. Filter by department and
type. Duplicate action for reposting.

### 26. `job-form.html`
Sections: Role (title, dept, type, location, experience, openings) · Dates
(posted, closes) · Description (summary, then four repeaters) · Compensation ·
Application (apply email, form on/off) · Visibility.
Each repeater supports paste-a-list: pasting multiline text splits into rows.

### 27. `applications.html`
List with a stage filter, plus an optional kanban view by stage. Row click opens
a drawer: applicant details, CV download, cover note, stage selector, rating,
internal notes. Bulk: move stage, reject with template.

The stage pipeline is kept, but it is a convenience for whoever reads the
inbox — nothing about it reaches the public site. What matters on submit is the
other half: the application is written to the database **and** mailed to HR with
the CV attached, and the applicant gets an acknowledgement. See
[`07-api-contract.md`](07-api-contract.md) `POST /api/public/application`.

CV download hits `GET /api/applications/{id}/cv`, an authenticated stream — CVs
are stored outside the web root and never served from a public path.

---

## Growth

### 28. `enquiries.html`
Inbox table: unread rows in bold, name, subject, source, department, assigned,
received, status. Filters by status, source, assignee, date. Bulk: assign, close,
mark spam.

### 29. `enquiry-view.html`
Left: the message and the reply thread, with a reply composer (template picker,
send). Right: contact card (click-to-call, click-to-mail), assignment, status,
priority, department, internal notes, and a related-enquiries list matched on
email or phone.

### 30. `appointments.html` — read-only

The hospital takes no bookings online, so this screen writes nothing. It is an
archive of what was collected, kept because the records still have to be
readable.

Table plus an optional day view, both read-only. An info banner at the top says
so and points at the doctor list. Row actions are Open and Call patient; the
drawer shows the request and offers the phone number, nothing else. No status
changes, no delete, no bulk bar, and no sidebar badge — a count would be nagging
about work the panel gives no way to do.

What replaced the workflow: a doctor card on the public site links to the
contact page with that doctor preselected when the doctor's **Appointments
available** toggle is on, and to nothing at all when it is off. The desk calls
back. See §2 and §20 in [`02-content-model.md`](02-content-model.md).

### 31. `seo.html`
Top: global defaults (title pattern, default description, default OG image,
robots, sitemap URL, canonical domain).
Below: a table of every indexable page with meta title, description, length
meters (green/amber/red), a score, and inline editing. Filter to "issues only".

### 32. `navigation.html`
Three panels — Header, Mega menu, Footer — each a drag-and-drop tree. Nesting one
level. Add link (internal picker or external URL), icon, target, visibility.
Broken internal links flagged with a warning icon.

### 33. `redirects.html`
Table: from, to, code, hits, active. Inline add row. Validates against loops and
against a `from` that matches an existing page.

---

## System

### 34–38. Settings screens
All five follow the same shape: sectioned form, sticky Save bar, dirty-guard.
- `settings-general.html` — identity, logos, hours repeater, maintenance mode
  (turning it on asks for confirmation and shows a persistent warning banner
  across the panel while active).
- `settings-contact.html` — the phones and emails repeaters, address, map with a
  live iframe preview, department direct lines. A "used in 20 places" note next
  to the primary phone.
- `settings-social.html` — social repeater with platform icons, language toggles.
- `settings-integrations.html` — secrets masked with a reveal button; a Test
  connection button on SMTP that toasts the result.
- `settings-theme.html` — colour pickers with a live swatch strip and a contrast
  warning if a brand colour fails AA against white.

### 43. `settings-popups.html`
The two overlays the site shows uninvited, on one screen, because whoever
switches one off usually wants to see the state of the other.

- **Cookie bar** — enabled, message, accept label, decline label (empty means no
  decline button), policy link, remember-for days. Consent is a first-party
  cookie, not `localStorage`: it must survive a visitor who blocks storage APIs.
- **Ads popup** — enabled, title, body, image, link + label, start and end date,
  frequency (once per visit / day / week / month / every load for testing) and
  whether the visitor may close it.
- A live preview of both cards, and a warning banner when the ads popup is on
  but its end date has passed — an expired campaign is not broken, it has
  stopped, and saying so beats leaving someone to wonder.

Off means *not rendered at all*, not rendered-and-hidden: a hidden overlay still
costs a screen-reader user a tab stop.

### 39. `users.html`
Tabs: Users and Roles. User table: avatar + name, email, role, last active, 2FA,
status. Actions: edit, resend invite, suspend, delete. Roles tab lists roles with
a member count.

### 40. `user-form.html`
Identity, role select, then a permission matrix — modules down, view/create/edit/
delete/publish across. Selecting a role fills the matrix; editing a cell marks
the user as having custom permissions.

### 41. `activity-log.html`
Reverse-chronological table: user, action, entity, summary, time, IP. Filter by
user, entity type and date. Expanding a row shows the field-level diff. Restore
action on update and delete rows.

### 42. `profile.html`
Own account: name, email, avatar, password change, 2FA setup. Panel preferences:
language, timezone, density, default landing page, email digest.

---

## Global states

| State | Treatment |
|---|---|
| Loading | Skeleton rows/cards, never a spinner over the whole page |
| Empty | Illustration + one-line explanation + the primary action |
| Filtered empty | Different copy + Clear filters |
| Error | Inline panel with the reason and a Retry |
| Offline / save failed | Toast with Retry; form keeps its values |
| Permission denied | The action is hidden, not disabled without explanation |
