# Content Model

Every entity below has exactly one owning admin screen. The right-hand column is
the audit trail: what in the current codebase this entity replaces. If something
on the public site is not in this document, it has no owner and is a gap.

Shared conventions:

- `id` — stable string key. Slugs for anything with a public URL, `d-001` style
  otherwise. Never reused after delete.
- `status` — `draft` | `published` | `hidden` | `scheduled`. See
  [`04-crud-flows.md`](04-crud-flows.md).
- `order` — integer, ascending. Drag-to-reorder writes it.
- `createdAt` / `updatedAt` / `updatedBy` — set by the server in Phase 2; the
  mock store fakes them.
- Fields marked **req** block save when empty.

---

## 1. Settings (singleton, split across 6 screens)

The sixth group, **popups**, is documented at §22b because it describes site
behaviour rather than site identity.

One record. Splitting is a UI concern only — the API returns one object.

### 1a. General — `settings-general.html`

| Field | Type | Notes |
|---|---|---|
| `name` **req** | text | "Teresa Memorial Hospital" |
| `shortName` | text | Used in the browser tab and mobile header |
| `tagline` | text | "We care ··· He cures" |
| `logo` | media | Header logo — currently `assets/logo-teresa.png` |
| `logoDark` | media | Dark-theme variant |
| `favicon` | media | |
| `establishedYear` | number | 1994 — drives the "since" line and milestones |
| `registrationNo` | text | Shown in the footer |
| `openingHours` | repeater `{day, from, to, closed}` | 7 rows |
| `emergencyAlwaysOpen` | bool | Renders "24/7" instead of hours for emergency |
| `maintenanceMode` | bool | |
| `maintenanceMessage` | textarea | |

**Replaces:** header/footer branding in `tools/build-pages.mjs` `HEADER`/`FOOTER`.

### 1b. Contact details — `settings-contact.html`

This is the screen that removes the repo-wide find-and-replace.

| Field | Type | Notes |
|---|---|---|
| `phones` **req** | repeater `{label, number, isPrimary, showInHeader, showInDock}` | e.g. Reception / Emergency / Ambulance |
| `emergencyNumber` **req** | text | The one the red dock button dials |
| `emails` **req** | repeater `{label, address, showInHeader}` | contact@ / careers@ / billing@ |
| `whatsapp` | text | Number + prefilled message |
| `addressLines` **req** | repeater `{line}` | |
| `city` / `state` / `pincode` | text | |
| `mapEmbed` | textarea | Google Maps iframe src |
| `mapLat` / `mapLng` | number | For schema.org markup |
| `directions` | textarea | "Landmark: opposite …" |
| `departmentLines` | repeater `{department, number}` | Direct lines on the contact page |

**Replaces:** `+91 342 325 4567` and `contact@teresamemorial.org` hardcoded in all
20 `.html` files (header bar line 71–72, mobile dock line 157, CTA line ~399),
`careers@teresamemorial.org` in `job.html:372`, and the contact blocks in
`contact.html`.

### 1c. Social — `settings-social.html`

| Field | Type |
|---|---|
| `social` | repeater `{platform, url, showInHeader, showInFooter}` |
| `shareImage` | media (default OG image) |
| `languages` | repeater `{code, label, enabled}` — currently `en` / `bn` via Google Translate |
| `defaultLanguage` | select |

**Replaces:** the language/translate wiring in `website.html` head script and the
social row in `FOOTER`.

### 1d. Integrations — `settings-integrations.html`

| Field | Type |
|---|---|
| `ga4Id`, `gtmId`, `searchConsoleTag`, `facebookPixel` | text |
| `smtp` | group `{host, port, user, pass, fromName, fromEmail, secure}` |
| `notifyEnquiryTo` | repeater `{email}` — who gets the contact-form mail |
| `recaptchaSiteKey` / `recaptchaSecret` | text |
| `liveChat` | group `{provider, embedCode, hoursFrom, hoursTo, enabled}` |

### 1e. Theme — `settings-theme.html`

| Field | Type | Notes |
|---|---|---|
| `brandPrimary` | colour | `#C1272D` |
| `brandAccent` | colour | `#2E6BB8` |
| `brandDeep` | colour | `#7A1540` |
| `defaultTheme` | select | light / dark / follow OS |
| `headingFont` / `bodyFont` | select | Sora / Inter today |
| `bannerStyle` | select | Affects `banner()` in `build-pages.mjs` |

---

## 2. Doctor — `doctors.html` / `doctor-form.html`

| Field | Type | Notes |
|---|---|---|
| `id` | slug | `dr-jonathon-ronan` |
| `name` **req** | text | |
| `role` **req** | text | "Head of Cardiology" |
| `qualification` **req** | text | "MD, DM (Cardiology)" |
| `experienceYears` | number | Rendered as "· 22 yrs" |
| `photo` **req** | media | |
| `departments` | multi-select → Department | Drives the department Team strip |
| `speciality` | text | |
| `registrationNo` | text | |
| `languages` | tags | Bangla / English / Hindi |
| `bio` | rich text | |
| `schedule` | repeater `{day, from, to, location}` | |
| `consultationFee` | number | |
| `rating` / `reviewCount` | number | |
| `isLeadership` | bool | Also surface on the About page leadership strip |
| `appointmentEnabled` | bool, default true | On: the doctor card carries a "Book an appointment" link to `contact.html?doctor=<id>`, which preselects them. Off: no link. The site never books anyone — the desk calls back. See §20. |
| `order` | number | |
| `status` | enum | |
| `seo` | group (see §14) | |

**Replaces:** `DOCS` and `ROSTER` in `tools/site-data.mjs:25-55`, the team strips
on all 12 department pages, and `doctors.html` on the public site.

---

## 3. Leadership member — `leadership.html` / `leadership-form.html`

Separate from Doctor because board members and administrators are not clinicians.
`about.html:378` currently fakes this section by reusing four doctor cards.

| Field | Type |
|---|---|
| `id` | slug |
| `name` **req** | text |
| `title` **req** | text — "Medical Director", "Chairman", "Head of Nursing" |
| `photo` **req** | media |
| `category` | enum — board / management / clinical-leadership |
| `message` | rich text — for a director's-message block |
| `linkedDoctorId` | ref → Doctor, optional |
| `order` / `status` | |

---

## 4. Department — `departments.html` / `department-form.html`

The largest record. The form is tabbed because it fills an entire public page.

| Tab | Field | Type | Notes |
|---|---|---|---|
| Basics | `slug` **req** | text | Doubles as the filename — `cardiology.html` |
| | `name` **req** | text | |
| | `icon` **req** | icon picker | Font Awesome, e.g. `fa-heart-pulse` |
| | `menuNote` | text | "6+ Doctors Available" in the mega menu |
| | `showInMenu` | bool | |
| | `order` / `status` | | |
| Banner | `banner` | media | |
| | `titleLead` / `titleStrong` **req** | text | Split headline — "Cardiology &" / "Heart Care" |
| | `lead` **req** | textarea | |
| | `chips` | repeater `{text}` | "24/7 Cath Lab" |
| | `primaryCta` / `ghostCta` | group `{label, href}` | |
| Stats | `stats` | repeater ×4 `{icon, count, suffix, label, note}` | The animated counters |
| Intro | `introTitle` **req** | text (allows `<strong>`) | |
| | `introBody` | repeater `{paragraph}` | |
| | `checks` | repeater `{text}` | Tick list |
| | `introImg` | media | |
| | `badge` | group `{icon, title, text}` | The floating alert card |
| Procedures | `procedures` | repeater `{icon, title, text}` | Card grid |
| Conditions | `conditionsTitle` / `conditionsLead` | text | |
| | `conditions` | repeater `{text}` | Chip list |
| Team | `doctorIds` | multi-select → Doctor | |
| SEO | `seo` | group (§14) | |

**Replaces:** `DEPARTMENTS` in `tools/site-data.mjs:57-470` — 12 records driving
12 public pages plus the mega menu and `departments.html`.

---

## 5. Facility — `facilities.html`

| Field | Type |
|---|---|
| `id`, `icon` **req**, `title` **req**, `text` **req**, `image`, `order`, `status` |

**Replaces:** `FACILITIES` in `site-data.mjs:499-512` and `facilities.html`.

---

## 6. Lab test / package — `lab-tests.html`

| Field | Type | Notes |
|---|---|---|
| `id`, `name` **req** | | |
| `category` | enum | Test / Health package |
| `icon` | icon picker | |
| `description` | textarea | |
| `includes` | repeater `{item}` | For packages |
| `price` / `discountPrice` | number | |
| `prepInstructions` | textarea | "Fasting 12 hours" |
| `reportTime` | text | "Same day" |
| `homeCollection` | bool | |
| `featured` | bool | Surfaces on the home Lab Tests block |
| `order` / `status` | | |

**Replaces:** the hardcoded lab block at `website.html:604` and
`lab-diagnostics.html`.

---

## 7. Blog post — `blog.html` / `blog-form.html`

| Field | Type | Notes |
|---|---|---|
| `id` | slug | `blog-post` today — becomes the URL |
| `title` **req** | text | Sentence case, for listing cards |
| `heading` | text | Title-case variant for the article banner |
| `excerpt` **req** | textarea | |
| `body` **req** | rich text | The writing pad |
| `coverImage` **req** | media | |
| `categoryId` **req** | ref → Category | |
| `tags` | multi-ref → Tag | Drives the related-posts picker |
| `authorId` **req** | ref → Doctor | |
| `readMinutes` | number | Auto-estimated from body, overridable |
| `publishedAt` | datetime | |
| `featured` | bool | Position 0 — what `blog-post.html` renders in full |
| `views` | number, read-only | |
| `status` | enum | |
| `seo` | group (§14) | |

**Replaces:** `POSTS` in `site-data.mjs:471-497`, `blog.html`, `blog-post.html`,
and the `relatedFor()` picker in `build-pages.mjs:1227`.

## 8. Blog category / tag — `blog-categories.html`

| Field | Type |
|---|---|
| `id`, `name` **req**, `slug`, `type` (category\|tag), `description`, `order` |

**Replaces:** `CATS` derived at `build-pages.mjs:1120` and the `tags` array on
each post.

---

## 9. Testimonial — `testimonials.html`

| Field | Type | Notes |
|---|---|---|
| `id`, `text` **req** | | |
| `name` **req**, `role` | text | "Patient — Cardiology" |
| `photo` | media | |
| `rating` | 1–5 | |
| `departmentId` | ref, optional | |
| `source` | enum | Website form / Google / Manual |
| `status` | enum | `draft` doubles as the moderation queue |
| `featured` / `order` | | |

**Replaces:** `QUOTES` in `site-data.mjs:548-552` and the home testimonial rail.

## 10. FAQ — `faqs.html`

| Field | Type |
|---|---|
| `id`, `question` **req**, `answer` **req** (rich text), `group` (Home\|Contact\|Department), `departmentId`, `order`, `status` |

**Replaces:** the accordion hardcoded at `website.html:803-870`.

## 11. Media — `gallery.html`

| Field | Type |
|---|---|
| `id`, `url`, `filename`, `alt` **req**, `caption`, `folder`, `width`/`height`, `sizeBytes`, `uploadedAt`, `usedBy[]` (read-only back-refs) |

**Replaces:** the `IMG` Unsplash pool at `site-data.mjs:13-23`. `usedBy` is what
makes deletion safe — the confirm modal lists every record referencing the file.

---

## 12. Site page — `pages.html` + the four section editors

One record per public page. Editing goes to a purpose-built screen rather than a
generic block builder, because each public page has a fixed, known layout.

| Field | Type |
|---|---|
| `id` (`home`, `about`, `contact`, `careers`, …), `title`, `path`, `status`, `updatedAt`, `sections[]` |

`sections[]` per page — each `{key, label, enabled, order, data}`:

| Page | Sections | Replaces |
|---|---|---|
| `home` | hero, about, care, services, specialities, why-us, doctors, lab-tests, testimonials, articles, faq, contact | `website.html` `[data-section]` blocks |
| `about` | story, purpose, values, milestones, leadership, in-practice, careers-cta | `about.html`; data from `PILLARS`, `VALUES`, `MILESTONES` |
| `contact` | reach-us, appointment, location, cta | `contact.html` |
| `careers` | why-us, what-we-offer, openings, contact-hr | `careers.html`; data from `CAREER_CHECKS`, `CAREER_BENEFITS` |

Sub-entities edited inside those screens:

- **Pillar** `{icon, title, text}` — `PILLARS`, `site-data.mjs:540`
- **Value** `{icon, title, text}` — `VALUES`, `site-data.mjs:514`
- **Milestone** `{year, text}` — `MILESTONES`, `site-data.mjs:523`
- **Career check** `{text}` — `CAREER_CHECKS`, `site-data.mjs:556`
- **Career benefit** `{icon, title, text}` — `CAREER_BENEFITS`, `site-data.mjs:565`

## 13. Counter — `stats.html`

Every animated number on the site, in one table, so "640 beds" is changed once.

| Field | Type | Notes |
|---|---|---|
| `id`, `key` | text | `beds`, `doctors`, `procedures-year` |
| `icon`, `label` **req**, `value` **req** | | |
| `suffix` | text | `+`, `/5`, ` min` |
| `note` | text | "18% more than 2024" |
| `scope` | enum | global \| home \| about \| department |
| `departmentId` | ref | When scope is department, this is the `stats[]` row |
| `order` | | |

**Replaces:** the `stats[]` arrays inside every `DEPARTMENTS` record and the home
page counter row.

---

## 14. SEO block (embedded, not a screen of its own)

Attached to Doctor, Department, Post and Site page. Also editable in bulk on
`seo.html`.

| Field | Type |
|---|---|
| `metaTitle` (60 char guide), `metaDescription` (155 char guide), `ogImage`, `canonical`, `noindex`, `keywords` |

## 15. Navigation — `navigation.html`

| Field | Type |
|---|---|
| `id`, `location` (header\|mega\|footer-1..4\|dock\|mobile), `label` **req**, `href` **req**, `icon`, `target`, `parentId`, `order`, `visible` |

**Replaces:** `navBar()` and `megaMenu()` in `build-pages.mjs:29-81` and the
`FOOTER` link columns.

## 16. Redirect — `redirects.html`

`{id, from, to, code (301|302), hits, active}`

---

## 17. Job vacancy — `jobs.html` / `job-form.html`

| Field | Type | Notes |
|---|---|---|
| `id` **req** | slug | Used as `job.html?id=` |
| `title` **req**, `dept` **req**, `type` (Full time…), `location` | | |
| `experience` | text | |
| `postedAt` / `closesAt` **req** | date | ISO, printed as "12 Jul 2026" |
| `summary` **req** | textarea | |
| `responsibilities` / `requirements` / `benefits` **req** | repeater `{text}` | |
| `niceToHave` | repeater | Optional — omitting it drops the section |
| `salaryFrom` / `salaryTo` / `salaryNote` | | |
| `applyEmail` | text | Defaults to settings `careers@` |
| `openings` | number | |
| `status` | enum | `hidden` = closed; an empty published set shows the careers "nothing open" panel |

**Replaces:** `window.TMH_JOBS` in `assets/jobs.js`.

## 18. Application — `applications.html`

`{id, jobId, name, email, phone, experience, currentEmployer, cvFile, cvUrl,
coverNote, stage (new|shortlisted|interview|offered|rejected), rating, notes[],
appliedAt, notifiedAt}`

Submitting is the part that matters, and it does three things: write the row,
mail HR with the applicant's details **and the CV attached**, and acknowledge to
the applicant. `notifiedAt` records the mail; a row whose mail failed keeps the
row and is retried from the panel, because losing an application because SMTP
was down is not an acceptable failure.

`cvFile` is the original filename, for display. `cvUrl` is the authenticated
stream `GET /api/applications/{id}/cv` — the file itself lives outside the web
root and is never reachable by URL guessing.

The `stage` pipeline is retained but affects nothing outside the panel. Nobody
on the public site can see it, so it costs nothing to keep and saves whoever
reads the inbox from tracking candidates elsewhere.

---

## 19. Enquiry — `enquiries.html` / `enquiry-view.html`

| Field | Type |
|---|---|
| `id`, `name` **req**, `email`, `phone`, `subject`, `message`, `source` (contact form \| chat \| phone widget \| landing), `departmentId`, `assignedTo` (ref → User), `status` (new\|replied\|closed\|spam), `priority`, `replies[] {by, at, body}`, `internalNotes[]`, `receivedAt` |

**Replaces:** the contact form on `contact.html` (currently posts nowhere).

## 20. Appointment request — `appointments.html` (read-only)

`{id, patientName, phone, email, departmentId, doctorId, preferredDate,
preferredSlot, reason, status (pending|confirmed|cancelled|completed),
confirmedSlot, cancelReason, confirmedAt, createdAt}`

**The hospital does not take bookings online, so nothing writes this entity.**
There is no create endpoint and no status-change endpoint; the screen reads and
the panel offers a phone number. The records that exist are kept because they
still have to be readable.

What the site does instead: the contact page keeps its request form, which
lands as an **Enquiry** with `source = appointment` (§19). A doctor card links
to that form with `?doctor=<id>` when `appointmentEnabled` is on, and carries no
link when it is off — offering a booking and then refusing it is worse than
saying so.

**Replaces:** nothing. The booking form at `contact.html` now feeds §19.

---

## 21. User — `users.html` / `user-form.html`

`{id, name, email, passwordHash, avatar, roleId, phone, twoFactor, lastActiveAt,
status (active|suspended|invited)}`

## 22. Role — inside `users.html`

`{id, name, description, permissions{module: [view, create, edit, delete, publish]}}`

Modules match the sidebar groups. Phase 1 displays the matrix; it is not enforced.

## 22b. Popups (singleton) — `settings-popups.html`

The sixth settings group. One record, two unrelated widgets.

| Field | Type | Notes |
|---|---|---|
| `cookieEnabled` | bool | |
| `cookieMessage` | textarea | |
| `cookieAcceptLabel` / `cookieDeclineLabel` | text | An empty decline label offers no decline button |
| `cookiePolicyUrl` | text | |
| `cookieRemember` | number | Days the consent cookie lasts. Default 180 |
| `adsEnabled` | bool | |
| `adsTitle` / `adsBody` | text / textarea | |
| `adsImage` | media | Optional — the card renders without one |
| `adsLink` / `adsLinkLabel` | text | |
| `adsStart` / `adsEnd` | date | Outside the window the popup does not render, so a campaign stops on its own |
| `adsFrequency` | enum | `session` \| `days:N` \| `always` (testing) |
| `adsDismissible` | bool | Off means it can only be dismissed by following the link |

Consent and the seen-mark are first-party cookies rather than `localStorage`:
the consent decision must survive a visitor who blocks storage APIs. The
seen-mark is keyed on the campaign's title and start date, so editing the popup
shows the new one to everybody instead of it being swallowed by the old
campaign's cookie.

**Replaces:** nothing — new. Rendered by `assets/popups.js`, configured in Phase
1 by `assets/popups-config.js` and in Phase 2 by this record.

## 23. Activity log — `activity-log.html`

`{id, userId, action (create|update|delete|publish|login), entity, entityId,
summary, diff, ip, at}` — read-only, generated server-side in Phase 2.

---

## Coverage audit

Every export in `tools/site-data.mjs`:

| Export | Owner screen |
|---|---|
| `IMG` | `gallery.html` |
| `DOCS`, `ROSTER` | `doctors.html` |
| `DEPARTMENTS` | `departments.html` |
| `POSTS` | `blog.html` |
| `FACILITIES` | `facilities.html` |
| `VALUES` | `page-about.html` |
| `MILESTONES` | `page-about.html` |
| `PILLARS` | `page-about.html` |
| `QUOTES` | `testimonials.html` |
| `CAREER_CHECKS` | `page-careers.html` |
| `CAREER_BENEFITS` | `page-careers.html` |

Plus `assets/jobs.js` → `jobs.html`, and the three blocks still inline in
`website.html` (FAQ → `faqs.html`, lab tests → `lab-tests.html`, counters →
`stats.html`). Nothing unowned.
