/* =========================================================
   Seed export — the JS content sources → database/seeds/*.json

       node tools/seed-export.mjs
       php vayu seed

   Nothing is retyped. Every row the database starts with already exists
   somewhere in this repo, in one of three places:

     tools/site-data.mjs             what the 20 static pages render from
     html/assets/jobs.js             the vacancy list
     html/admin/assets/data/*.js     the admin prototype's seed

   Where two of them describe the same thing, the richer one wins, and this
   file says which and why at each merge. The two that matter:

     departments  the admin seed has all 12 records but only two filled in;
                  site-data.mjs has 11 filled in, and those are what the 11
                  public department pages render today. Admin gives the record
                  its id, order, status, menu note and SEO; site-data gives it
                  its page content.

     posts        the admin seed wins outright — it is the only one with a
                  body. site-data.mjs POSTS carries a listing card and the
                  article text lives in build-pages.mjs.

   Output is already in database-column shape: snake_case names, the columns
   this schema actually has, values normalised to the vocabularies in
   docs/php/02-schema.md. All of the mapping knowledge is here, in one file,
   so the PHP seeder is a loader and nothing else.

   Foreign keys are written as the target's public key, not an integer — this
   script has no database. Each file declares its own `refs`, and the seeder
   resolves them.
   ========================================================= */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as SITE from './site-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'database', 'seeds');

/* ---------------------------------------------------------
   Loading the two browser-shaped sources
   --------------------------------------------------------- */

/* The admin seeds and jobs.js are IIFEs that assign to `window`. Handing them
   a plain object is the whole of what they need — no DOM, no jsdom. */
function loadBrowserGlobals() {
    const w = {};
    const dir = join(ROOT, 'html', 'admin', 'assets', 'data');

    for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
        new Function('window', readFileSync(join(dir, file), 'utf8'))(w);
    }

    new Function('window', readFileSync(join(ROOT, 'html', 'assets', 'jobs.js'), 'utf8'))(w);

    return w;
}

const W = loadBrowserGlobals();
const SEED = W.TMH_SEED;

/* ---------------------------------------------------------
   Normalising
   --------------------------------------------------------- */

const notes = [];
const note = (line) => notes.push(line);

/** '2026-07-28T09:12:00Z' → '2026-07-28 09:12:00', the one format the DB uses. */
const dt = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? null
        : d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
};

const date = (value) => (value ? String(value).slice(0, 10) : null);
const bool = (value) => (value ? 1 : 0);
const str = (value) => (value === undefined || value === null || value === '' ? null : String(value));
const num = (value) => (value === undefined || value === null || value === '' ? null : Number(value));

/** 'Contact form' → 'contact-form', so a display label becomes a stored key. */
const key = (value) =>
    String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

/**
 * The seeds were written for a UI, so some columns hold a display label where
 * the schema wants one of a fixed set of values. Anything unmapped is reported
 * rather than silently stored — a stray vocabulary value is a filter chip that
 * matches nothing, which is invisible until somebody uses it.
 */
function vocab(name, value, map, fallback) {
    const k = key(value);
    if (k === '') return fallback;
    if (map[k]) return map[k];
    if (Object.values(map).includes(k)) return k;

    note(`  ! ${name}: unmapped value "${value}" → "${fallback}"`);
    return fallback;
}

/** 'Bangla, English, Hindi' → ['Bangla','English','Hindi'] */
const list = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return String(value).split(',').map((s) => s.trim()).filter(Boolean);
};

/* Seed records carry status: 'published' | 'draft' | 'hidden'. Users do not —
   theirs is an account state, and the prototype used the content vocabulary
   for it. The seed's two non-published users are "Old Intern" and "HR Desk",
   which is what fixes the reading: hidden is an account switched off, draft is
   one that has not been taken up yet. */
const userStatus = (value) =>
    vocab('users.status', value, {
        published: 'active',
        active: 'active',
        hidden: 'suspended',
        suspended: 'suspended',
        draft: 'invited',
        invited: 'invited',
    }, 'active');

/* ---------------------------------------------------------
   Writing
   --------------------------------------------------------- */

const files = [];

/**
 * @param {string} table
 * @param {object[]} rows
 * @param {object} meta  key, refs {column: [table, keyColumn]}, json [columns]
 */
function emit(table, rows, meta = {}) {
    const payload = {
        table,
        key: meta.key ?? null,
        refs: meta.refs ?? {},
        json: meta.json ?? [],
        rows,
    };

    writeFileSync(join(OUT, `${table}.json`), JSON.stringify(payload, null, 2) + '\n');
    files.push(table);
    console.log(`  ${String(rows.length).padStart(4)}  ${table}`);
}

/* ---------------------------------------------------------
   settings
   --------------------------------------------------------- */

function settings() {
    const rows = [];

    for (const [group, values] of Object.entries(SEED.settings)) {
        for (const [k, v] of Object.entries(values)) {
            rows.push({ group_name: group, setting_key: k, value: JSON.stringify(v ?? null) });
        }
    }

    emit('settings', rows);
}

/* ---------------------------------------------------------
   roles, users
   --------------------------------------------------------- */

function roles() {
    emit(
        'roles',
        SEED.roles.map((r) => ({
            public_id: r.id,
            name: r.name,
            description: str(r.description),
            permissions: r.permissions ?? {},
            sort_order: r.order ?? 0,
        })),
        { key: 'public_id', json: ['permissions'] }
    );
}

function users() {
    emit(
        'users',
        SEED.users.map((u) => ({
            public_id: u.id,
            name: u.name,
            email: u.email,
            /* No password in the seed, and none invented here — the PHP
               seeder generates one and prints it once. */
            password: null,
            avatar: str(u.avatar),
            role_id: str(u.roleId),
            phone: str(u.phone),
            two_factor: bool(u.twoFactor),
            status: userStatus(u.status),
            last_active_at: dt(u.lastActiveAt),
            sort_order: u.order ?? 0,
        })),
        { key: 'public_id', refs: { role_id: ['roles', 'public_id'] } }
    );
}

/* ---------------------------------------------------------
   media
   --------------------------------------------------------- */

function media() {
    emit(
        'media',
        SEED.media.map((m) => ({
            public_id: m.id,
            url: m.url,
            /* Seeded images are hosted elsewhere. `path` is set only for real
               uploads, and is what makes a delete remove a file from disk. */
            path: null,
            filename: m.filename,
            mime: str(m.mime),
            alt: str(m.alt),
            caption: str(m.caption),
            folder: str(m.folder),
            width: num(m.width),
            height: num(m.height),
            size_bytes: num(m.sizeBytes),
            created_at: dt(m.uploadedAt),
        })),
        { key: 'public_id' }
    );
}

/* ---------------------------------------------------------
   doctors, leadership
   --------------------------------------------------------- */

function doctors() {
    emit(
        'doctors',
        SEED.doctors.map((d) => ({
            slug: d.id,
            name: d.name,
            role: d.role,
            qualification: d.qualification,
            experience_years: num(d.experienceYears),
            photo: str(d.photo),
            speciality: str(d.speciality),
            registration_no: str(d.registrationNo),
            languages: list(d.languages),
            bio: str(d.bio),
            schedule: d.schedule ?? [],
            consultation_fee: num(d.consultationFee),
            rating: num(d.rating),
            review_count: num(d.reviewCount),
            is_leadership: bool(d.isLeadership),
            appointment_enabled: bool(d.appointmentEnabled !== false),
            sort_order: d.order ?? 0,
            status: d.status ?? 'draft',
            updated_at: dt(d.updatedAt),
        })),
        { key: 'slug', json: ['languages', 'schedule'] }
    );

    seo('doctor', SEED.doctors, 'id');
}

function leadership() {
    emit(
        'leadership',
        SEED.leadership.map((l) => ({
            slug: l.id,
            name: l.name,
            title: l.title,
            photo: str(l.photo),
            category: vocab('leadership.category', l.category, {
                board: 'board',
                management: 'management',
                'clinical-leadership': 'clinical-leadership',
            }, 'management'),
            message: str(l.message),
            linked_doctor_id: str(l.linkedDoctorId),
            sort_order: l.order ?? 0,
            status: l.status ?? 'draft',
            updated_at: dt(l.updatedAt),
        })),
        { key: 'slug', refs: { linked_doctor_id: ['doctors', 'slug'] } }
    );
}

/* ---------------------------------------------------------
   departments — the merge
   --------------------------------------------------------- */

function departments() {
    const content = new Map(SITE.DEPARTMENTS.map((d) => [d.slug, d]));
    let merged = 0;

    const rows = SEED.departments.map((a) => {
        const s = content.get(a.id);
        if (s) merged++;

        /* The admin form splits the floating badge into three fields; the
           generator reads it as one object. The column is the object. */
        const badge = s?.badge ?? (a.badgeIcon || a.badgeTitle || a.badgeText
            ? { icon: a.badgeIcon, title: a.badgeTitle, text: a.badgeText }
            : null);

        return {
            slug: a.id,
            name: a.name,
            icon: a.icon,
            menu_note: str(a.menuNote),
            show_in_menu: bool(a.showInMenu),

            banner: str(s?.banner ?? a.banner),
            title_lead: str(s?.titleLead ?? a.titleLead),
            title_strong: s?.titleStrong ?? a.titleStrong,
            lead: str(s?.lead ?? a.lead),
            chips: (s?.chips ?? a.chips ?? []).map((c) => (typeof c === 'string' ? { text: c } : c)),
            primary_cta: null,
            ghost_cta: null,

            intro_title: str(s?.introTitle ?? a.introTitle),
            intro_body: (s?.introBody ?? a.introBody ?? []).map((p) => (typeof p === 'string' ? { paragraph: p } : p)),
            checks: (s?.checks ?? a.checks ?? []).map((c) => (typeof c === 'string' ? { text: c } : c)),
            intro_img: str(s?.introImg ?? a.introImg),
            badge,

            procedures: s?.procedures ?? a.procedures ?? [],

            conditions_title: str(s?.conditionsTitle ?? a.conditionsTitle),
            conditions_lead: str(s?.conditionsLead ?? a.conditionsLead),
            conditions: (s?.conditions ?? a.conditions ?? []).map((c) => (typeof c === 'string' ? { text: c } : c)),

            sort_order: a.order ?? 0,
            status: a.status ?? 'draft',
            updated_at: dt(a.updatedAt),
        };
    });

    note(`  departments: ${merged} of ${rows.length} took their page content from site-data.mjs`);

    const missing = [...content.keys()].filter((slug) => !SEED.departments.some((d) => d.id === slug));
    if (missing.length) {
        note(`  ! site-data.mjs has departments the admin seed does not: ${missing.join(', ')}`);
    }

    emit('departments', rows, {
        key: 'slug',
        json: ['chips', 'primary_cta', 'ghost_cta', 'intro_body', 'checks', 'badge', 'procedures', 'conditions'],
    });

    departmentDoctors();
    seo('department', SEED.departments, 'id');
}

/**
 * The team strip.
 *
 * Built from the doctors' own `departments` list, not from the departments'
 * `doctorIds` or from site-data's `team` arrays. Those two are display strips
 * assembled by reusing whatever doctor cards were handy — following them files
 * an interventional cardiologist under nephrology. The doctor record is the
 * one place a doctor's departments are stated deliberately.
 */
function departmentDoctors() {
    const known = new Set(SEED.departments.map((d) => d.id));
    const rows = [];

    for (const d of SEED.doctors) {
        (d.departments ?? []).forEach((slug, i) => {
            if (!known.has(slug)) {
                note(`  ! ${d.id} lists department "${slug}", which does not exist`);
                return;
            }
            rows.push({ department_id: slug, doctor_id: d.id, sort_order: i });
        });
    }

    const claimed = new Set(rows.map((r) => `${r.department_id}|${r.doctor_id}`));
    const dropped = SEED.departments.flatMap((dept) =>
        (dept.doctorIds ?? [])
            .filter((doc) => !claimed.has(`${dept.id}|${doc}`))
            .map((doc) => `${dept.id}←${doc}`)
    );

    if (dropped.length) {
        note(`  departments listed ${dropped.length} doctor(s) the doctors do not claim; ignored: ${dropped.join(', ')}`);
    }

    emit('department_doctors', rows, {
        refs: { department_id: ['departments', 'slug'], doctor_id: ['doctors', 'slug'] },
    });
}

/* ---------------------------------------------------------
   facilities, lab tests
   --------------------------------------------------------- */

function facilities() {
    emit(
        'facilities',
        SEED.facilities.map((f) => ({
            slug: f.id,
            icon: f.icon,
            title: f.title,
            text: f.text,
            image: str(f.image),
            sort_order: f.order ?? 0,
            status: f.status ?? 'draft',
        })),
        { key: 'slug' }
    );
}

function labTests() {
    emit(
        'lab_tests',
        SEED['lab-tests'].map((t) => ({
            slug: t.id,
            name: t.name,
            category: vocab('lab_tests.category', t.category, {
                test: 'test',
                package: 'package',
                'health-package': 'package',
            }, 'test'),
            icon: str(t.icon),
            description: str(t.description),
            includes: (t.includes ?? []).map((i) => (typeof i === 'string' ? { item: i } : i)),
            price: num(t.price),
            discount_price: num(t.discountPrice),
            prep_instructions: str(t.prepInstructions),
            report_time: str(t.reportTime),
            home_collection: bool(t.homeCollection),
            featured: bool(t.featured),
            sort_order: t.order ?? 0,
            status: t.status ?? 'draft',
        })),
        { key: 'slug', json: ['includes'] }
    );
}

/* ---------------------------------------------------------
   blog
   --------------------------------------------------------- */

function categories() {
    emit(
        'categories',
        SEED.categories.map((c) => ({
            slug: c.id,
            name: c.name,
            type: vocab('categories.type', c.type, { category: 'category', tag: 'tag' }, 'category'),
            description: str(c.description),
            sort_order: c.order ?? 0,
            status: c.status ?? 'draft',
        })),
        { key: 'slug' }
    );
}

function posts() {
    emit(
        'posts',
        SEED.posts.map((p) => ({
            slug: p.id,
            title: p.title,
            heading: str(p.heading),
            excerpt: p.excerpt,
            body: p.body,
            cover_image: str(p.coverImage),
            category_id: str(p.categoryId),
            author_id: str(p.authorId),
            read_minutes: num(p.readMinutes),
            published_at: dt(p.publishedAt),
            featured: bool(p.featured),
            views: p.views ?? 0,
            sort_order: p.order ?? 0,
            status: p.status ?? 'draft',
            updated_at: dt(p.updatedAt),
        })),
        {
            key: 'slug',
            refs: { category_id: ['categories', 'slug'], author_id: ['doctors', 'slug'] },
        }
    );

    const known = new Set(SEED.categories.map((c) => c.id));
    const rows = [];

    for (const p of SEED.posts) {
        for (const tag of p.tags ?? []) {
            if (!known.has(tag)) {
                note(`  ! post ${p.id} is tagged "${tag}", which is not in categories`);
                continue;
            }
            rows.push({ post_id: p.id, category_id: tag });
        }
    }

    emit('post_tags', rows, {
        refs: { post_id: ['posts', 'slug'], category_id: ['categories', 'slug'] },
    });

    seo('post', SEED.posts, 'id');
}

/* ---------------------------------------------------------
   testimonials, faqs
   --------------------------------------------------------- */

function testimonials() {
    emit(
        'testimonials',
        SEED.testimonials.map((t) => ({
            public_id: t.id,
            text: t.text,
            name: t.name,
            role: str(t.role),
            photo: str(t.photo),
            rating: num(t.rating),
            department_id: str(t.departmentId),
            source: vocab('testimonials.source', t.source, {
                'website-form': 'website',
                website: 'website',
                google: 'google',
                manual: 'manual',
            }, 'manual'),
            featured: bool(t.featured),
            sort_order: t.order ?? 0,
            status: t.status ?? 'draft',
        })),
        { key: 'public_id', refs: { department_id: ['departments', 'slug'] } }
    );
}

function faqs() {
    emit(
        'faqs',
        SEED.faqs.map((f) => ({
            public_id: f.id,
            question: f.question,
            answer: f.answer,
            faq_group: vocab('faqs.group', f.group, {
                home: 'home',
                contact: 'contact',
                department: 'department',
            }, 'home'),
            department_id: str(f.departmentId),
            sort_order: f.order ?? 0,
            status: f.status ?? 'draft',
        })),
        { key: 'public_id', refs: { department_id: ['departments', 'slug'] } }
    );
}

/* ---------------------------------------------------------
   pages, counters, navigation, redirects
   --------------------------------------------------------- */

function pages() {
    emit(
        'pages',
        SEED.pages.map((p) => ({
            slug: p.id,
            title: p.title,
            path: p.path,
            status: p.status ?? 'published',
            updated_at: dt(p.updatedAt),
        })),
        { key: 'slug' }
    );

    const sections = SEED.pages.flatMap((p) =>
        (p.sections ?? []).map((s, i) => ({
            page_id: p.id,
            section_key: s.key,
            label: str(s.label),
            enabled: bool(s.enabled !== false),
            sort_order: s.order ?? i + 1,
            data: s.data ?? {},
        }))
    );

    emit('page_sections', sections, {
        refs: { page_id: ['pages', 'slug'] },
        json: ['data'],
    });

    seo('page', SEED.pages, 'id');
}

/**
 * Counters.
 *
 * The admin seed carries the global and per-page ones. The department strips
 * are still inside site-data.mjs as a stats[] array on each department, which
 * is exactly what docs/02-content-model.md §13 says this table exists to
 * replace — so they are lifted out here. A department the admin seed already
 * has counters for is left alone.
 */
function counters() {
    const rows = SEED.counters.map((c) => ({
        public_id: c.id,
        counter_key: c.key,
        icon: str(c.icon),
        label: c.label,
        value: String(c.value),
        suffix: str(c.suffix),
        note: str(c.note),
        scope: vocab('counters.scope', c.scope, {
            global: 'global', home: 'home', about: 'about', department: 'department',
        }, 'global'),
        department_id: str(c.departmentId),
        sort_order: c.order ?? 0,
    }));

    const covered = new Set(rows.filter((r) => r.scope === 'department').map((r) => r.department_id));
    let lifted = 0;

    for (const dept of SITE.DEPARTMENTS) {
        if (covered.has(dept.slug)) continue;

        (dept.stats ?? []).forEach((s, i) => {
            rows.push({
                public_id: `cnt-${dept.slug}-${i + 1}`,
                counter_key: `${dept.slug}-${key(s.label)}`,
                icon: str(s.icon),
                label: s.label,
                value: String(s.count),
                suffix: str(s.suffix),
                note: str(s.note),
                scope: 'department',
                department_id: dept.slug,
                sort_order: i + 1,
            });
            lifted++;
        });
    }

    note(`  counters: ${SEED.counters.length} from the admin seed, ${lifted} lifted out of department stats[]`);

    emit('counters', rows, { key: 'public_id', refs: { department_id: ['departments', 'slug'] } });
}

function navItems() {
    emit(
        'nav_items',
        SEED['nav-items'].map((n) => ({
            public_id: n.id,
            location: n.location,
            label: n.label,
            href: n.href,
            icon: str(n.icon),
            target: str(n.target),
            parent_id: str(n.parentId),
            sort_order: n.order ?? 0,
            visible: bool(n.visible !== false),
        })),
        { key: 'public_id', refs: { parent_id: ['nav_items', 'public_id'] } }
    );
}

function redirects() {
    emit(
        'redirects',
        SEED.redirects.map((r) => ({
            public_id: r.id,
            from_path: r.from,
            to_path: r.to,
            code: r.code ?? 301,
            hits: r.hits ?? 0,
            active: bool(r.status !== 'hidden'),
            sort_order: r.order ?? 0,
        })),
        { key: 'public_id' }
    );
}

/* ---------------------------------------------------------
   careers and the inbox
   --------------------------------------------------------- */

/**
 * The two vacancy lists overlap in three of five ids each. Neither is a subset
 * of the other: html/assets/jobs.js is what the careers page lists today, the
 * admin seed is what the panel lists, and the union is the only set that keeps
 * both showing what they show now. Admin fields win where the two describe the
 * same posting, because only that side carries order, status and salary.
 */
function jobs() {
    const site = new Map((W.TMH_JOBS ?? []).map((j) => [j.id, j]));
    const rep = (value) => (value ?? []).map((v) => (typeof v === 'string' ? { text: v } : v));

    const siteOnly = [...site.values()].filter((s) => !SEED.jobs.some((j) => j.id === s.id));
    if (siteOnly.length) {
        note(`  jobs: ${siteOnly.length} from html/assets/jobs.js that the admin seed does not have: ${siteOnly.map((j) => j.id).join(', ')}`);
    }

    const merged = [...SEED.jobs, ...siteOnly.map((s) => ({ ...s, order: 0, status: 'published' }))];

    emit(
        'jobs',
        merged.map((j) => {
            const s = site.get(j.id) ?? {};
            return {
                slug: j.id,
                title: j.title,
                dept: j.dept,
                type: str(j.type),
                location: str(j.location),
                experience: str(j.experience),
                posted_at: date(j.postedAt ?? s.posted),
                closes_at: date(j.closesAt ?? s.closes),
                summary: j.summary,
                responsibilities: rep(j.responsibilities ?? s.responsibilities),
                requirements: rep(j.requirements ?? s.requirements),
                benefits: rep(j.benefits ?? s.benefits),
                nice_to_have: rep(j.niceToHave ?? s.niceToHave),
                salary_from: num(j.salaryFrom),
                salary_to: num(j.salaryTo),
                salary_note: str(j.salaryNote),
                apply_email: str(j.applyEmail),
                openings: num(j.openings),
                sort_order: j.order ?? 0,
                status: j.status ?? 'draft',
                updated_at: dt(j.updatedAt),
            };
        }),
        { key: 'slug', json: ['responsibilities', 'requirements', 'benefits', 'nice_to_have'] }
    );
}

function applications() {
    const title = new Map(SEED.jobs.map((j) => [j.id, j.title]));

    emit(
        'applications',
        SEED.applications.map((a) => ({
            public_id: a.id,
            job_id: str(a.jobId),
            job_title: title.get(a.jobId) ?? null,
            name: a.name,
            email: a.email,
            phone: str(a.phone),
            experience: str(a.experience),
            current_employer: str(a.currentEmployer),
            /* The prototype's cvUrl was '#' — there is no file behind a seeded
               application, and cv_path stays null so the download endpoint
               says so rather than 500ing on a missing file. */
            cv_file: str(a.cvFile),
            cv_path: null,
            cv_size: null,
            cover_note: str(a.coverNote),
            stage: vocab('applications.stage', a.stage, {
                new: 'new', shortlisted: 'shortlisted', interview: 'interview',
                offered: 'offered', rejected: 'rejected',
            }, 'new'),
            rating: num(a.rating),
            notes: [],
            applied_at: dt(a.appliedAt),
            sort_order: a.order ?? 0,
        })),
        { key: 'public_id', refs: { job_id: ['jobs', 'slug'] }, json: ['notes'] }
    );
}

function enquiries() {
    emit(
        'enquiries',
        SEED.enquiries.map((e) => ({
            public_id: e.id,
            name: e.name,
            email: str(e.email),
            phone: str(e.phone),
            subject: str(e.subject),
            message: str(e.message),
            source: vocab('enquiries.source', e.source, {
                'contact-form': 'contact', contact: 'contact',
                appointment: 'appointment', 'appointment-request': 'appointment',
                'chat-widget': 'chat', chat: 'chat',
                'phone-widget': 'phone', phone: 'phone',
                'landing-page': 'landing', landing: 'landing',
            }, 'contact'),
            department_id: str(e.departmentId),
            doctor_id: null,
            preferred_date: null,
            assigned_to: str(e.assignedTo),
            status: vocab('enquiries.status', e.status, {
                new: 'new', replied: 'replied', closed: 'closed', spam: 'spam',
            }, 'new'),
            priority: key(e.priority) || 'normal',
            replies: e.replies ?? [],
            internal_notes: e.internalNotes ?? [],
            received_at: dt(e.receivedAt),
            sort_order: e.order ?? 0,
        })),
        {
            key: 'public_id',
            refs: {
                department_id: ['departments', 'slug'],
                assigned_to: ['users', 'public_id'],
            },
            json: ['replies', 'internal_notes'],
        }
    );
}

/* Read-only (§20). Seeded so the screen has something to render; nothing in
   the application ever writes this table. */
function appointments() {
    emit(
        'appointments',
        SEED.appointments.map((a) => ({
            public_id: a.id,
            patient_name: a.patientName,
            phone: str(a.phone),
            email: str(a.email),
            department_id: str(a.departmentId),
            doctor_id: str(a.doctorId),
            preferred_date: date(a.preferredDate),
            preferred_slot: str(a.preferredSlot),
            reason: str(a.reason),
            status: vocab('appointments.status', a.status, {
                pending: 'pending', confirmed: 'confirmed',
                cancelled: 'cancelled', completed: 'completed',
            }, 'pending'),
            confirmed_slot: str(a.confirmedSlot),
            cancel_reason: str(a.cancelReason),
            confirmed_at: dt(a.confirmedAt),
            created_at: dt(a.createdAt),
        })),
        {
            key: 'public_id',
            refs: { department_id: ['departments', 'slug'], doctor_id: ['doctors', 'slug'] },
        }
    );
}

function activity() {
    const name = new Map(SEED.users.map((u) => [u.id, u.name]));

    emit(
        'activity_log',
        SEED.activity.map((a) => ({
            user_id: str(a.userId),
            user_name: name.get(a.userId) ?? null,
            action: key(a.action),
            entity: str(a.entity),
            entity_id: str(a.entityId),
            summary: str(a.summary),
            diff: null,
            ip: str(a.ip),
            created_at: dt(a.at),
        })),
        { refs: { user_id: ['users', 'public_id'] } }
    );
}

/* ---------------------------------------------------------
   SEO — one polymorphic table fed from four sources
   --------------------------------------------------------- */

const seoRows = [];

function seo(entityType, records, idField) {
    for (const r of records) {
        if (!r.metaTitle && !r.metaDescription) continue;

        seoRows.push({
            entity_type: entityType,
            entity_id: r[idField],
            meta_title: str(r.metaTitle),
            meta_description: str(r.metaDescription),
            og_image: null,
            canonical: null,
            noindex: 0,
            keywords: null,
        });
    }
}

/* ---------------------------------------------------------
   Run
   --------------------------------------------------------- */

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

console.log('\n  Exporting seeds\n');

settings();
roles();
users();
media();
doctors();
leadership();
departments();
facilities();
labTests();
categories();
posts();
testimonials();
faqs();
pages();
counters();
navItems();
redirects();
jobs();
applications();
enquiries();
appointments();
activity();

/* Last: it collects rows from four of the exporters above, and its refs point
   at the table named in each row rather than one fixed table, so the seeder
   resolves it by entity_type. */
emit('seo_meta', seoRows, {
    refs: {
        entity_id: [
            { doctor: ['doctors', 'slug'], department: ['departments', 'slug'], post: ['posts', 'slug'], page: ['pages', 'slug'] },
            'entity_type',
        ],
    },
});

writeFileSync(join(OUT, 'order.json'), JSON.stringify(files, null, 2) + '\n');

if (notes.length) {
    console.log('\n  Notes\n');
    notes.forEach((n) => console.log(n));
}

console.log(`\n  ${files.length} files → database/seeds/\n`);
