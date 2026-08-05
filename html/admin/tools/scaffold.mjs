/* =========================================================
   Generates the HTML shell for every panel screen.

   The shell is 45 lines of identical boilerplate — head, theme
   pre-paint script, stylesheet order, sidebar/topbar mounts and
   the script list. Hand-maintaining that across 42 files is how
   a panel ends up with three different stylesheet orders.

   Everything a screen actually renders lives in
   assets/js/pages/<page>.js. This file only decides which core
   modules and seed files that page needs.

       node tools/scaffold.mjs          # writes any missing shell
       node tools/scaffold.mjs --force  # rewrites them all

   doctor-form.html is deliberately excluded: it is hand-written
   as the readable reference for what generated field markup
   corresponds to. See assets/js/core/fields.js.
   ========================================================= */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');

/* Core module bundles, by screen type. Order matters: form.js calls into
   repeater and media when it binds a record. */
const CORE = {
    plain: [],
    list: ['table'],
    media: ['media'],
    form: ['repeater', 'media', 'fields', 'form'],
    editor: ['repeater', 'media', 'editor', 'fields', 'form'],
    listform: ['table', 'repeater', 'media', 'fields', 'form'],
};

/* Every seed file. Pages load all of them: cross-entity lookups (a post's
   author, a department's doctors, an enquiry's assignee) are everywhere, and
   the files are small. */
const DATA = ['media', 'doctors', 'departments', 'posts', 'content', 'careers', 'inbox', 'system', 'site'];

const PAGES = [
    /* file                        page key              title                      type */
    ['dashboard',                 'dashboard',          'Dashboard',               'plain'],
    ['analytics',                 'analytics',          'Web Analytics',           'plain'],

    ['leadership',                'leadership',         'Leadership',              'list'],
    ['leadership-form',           'leadership',         'Leadership member',       'form'],
    ['departments',               'departments',        'Departments',             'list'],
    ['department-form',           'departments',        'Department',              'form'],
    ['facilities',                'facilities',         'Facilities',              'listform'],
    ['lab-tests',                 'lab-tests',          'Lab Tests & Packages',    'listform'],
    ['blog',                      'blog',               'Blog & News',             'list'],
    ['blog-form',                 'blog',               'Write a post',            'editor'],
    ['blog-categories',           'blog-categories',    'Categories & Tags',       'listform'],
    ['testimonials',              'testimonials',       'Testimonials',            'listform'],
    ['faqs',                      'faqs',               'FAQs',                    'listform'],
    ['gallery',                   'gallery',            'Media Gallery',           'media'],

    ['pages',                     'pages',              'All Pages',               'list'],
    ['page-home',                 'page-home',          'Home Page',               'form'],
    ['page-about',                'page-about',         'About Page',              'form'],
    ['page-contact',              'page-contact',       'Contact Page',            'form'],
    ['page-careers',              'page-careers',       'Careers Page',            'form'],
    ['stats',                     'stats',              'Counters & Numbers',      'listform'],

    ['jobs',                      'jobs',               'Vacancies',               'list'],
    ['job-form',                  'jobs',               'Vacancy',                 'form'],
    ['applications',              'applications',       'Applications',            'list'],

    ['enquiries',                 'enquiries',          'Enquiries',               'list'],
    ['enquiry-view',              'enquiries',          'Enquiry',                 'form'],
    ['appointments',              'appointments',       'Appointments',            'list'],
    ['seo',                       'seo',                'SEO Manager',             'listform'],
    ['navigation',                'navigation',         'Navigation',              'listform'],
    ['redirects',                 'redirects',          'Redirects',               'listform'],

    ['settings-general',          'settings-general',       'General Settings',    'form'],
    ['settings-contact',          'settings-contact',       'Contact Details',     'form'],
    ['settings-social',           'settings-social',        'Social Links',        'form'],
    ['settings-integrations',     'settings-integrations',  'Integrations',        'form'],
    ['settings-theme',            'settings-theme',         'Theme & Branding',    'form'],

    ['users',                     'users',              'Users & Roles',           'listform'],
    ['user-form',                 'users',              'Panel user',              'form'],
    ['activity-log',              'activity-log',       'Activity Log',            'list'],
    ['profile',                   'profile',            'My Profile',              'form'],
];

const head = (title) => `    <meta charset="UTF-8">

    <!-- Theme resolved before the stylesheet so the first paint is already
         correct — a deferred script would flash the light panel first. -->
    <script>
        (function () {
            try {
                var stored = localStorage.getItem('tmh-admin-theme');
                document.documentElement.dataset.theme = stored
                    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            } catch (e) { /* private mode — stay on the light default */ }
        })();
    </script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} &mdash; Teresa Memorial Admin</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link rel="stylesheet" href="assets/css/tokens.css">
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/layout.css">
    <link rel="stylesheet" href="assets/css/components.css">`;

const shell = (file, page, title, type) => {
    const core = ['util', 'nav', 'toast', 'modal', 'store', 'session', ...CORE[type], 'layout'];
    return `<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
${head(title)}
</head>

<body data-page="${page}">
    <div class="app">
        <div id="sidebar"></div>

        <div class="shell">
            <div id="topbar"></div>

            <main class="main">
                <div id="pageHead"></div>
                <div id="view"></div>
            </main>
        </div>
    </div>

    <!-- core, in dependency order -->
${core.map((c) => `    <script src="assets/js/core/${c}.js"></script>`).join('\n')}

    <!-- seed data -->
${DATA.map((d) => `    <script src="assets/data/${d}.js"></script>`).join('\n')}

    <script src="assets/js/pages/${file}.js"></script>
</body>

</html>
`;
};

let written = 0;
let skipped = 0;

mkdirSync(join(ROOT, 'assets/js/pages'), { recursive: true });

PAGES.forEach(([file, page, title, type]) => {
    const path = join(ROOT, `${file}.html`);
    if (existsSync(path) && !FORCE) {
        skipped += 1;
        return;
    }
    writeFileSync(path, shell(file, page, title, type), 'utf8');
    written += 1;

    /* A shell with no page script is a blank screen, which is worse than a
       missing file — leave a stub so every generated page renders something. */
    const js = join(ROOT, `assets/js/pages/${file}.js`);
    if (!existsSync(js)) {
        writeFileSync(js, `/* ${title} — not built yet. */\n(function () {\n    'use strict';\n    document.addEventListener('DOMContentLoaded', function () {\n        document.getElementById('pageHead').innerHTML = window.TMH.layout.pageHead({\n            title: '${title.replace(/'/g, "\\'")}',\n        });\n        document.getElementById('view').innerHTML =\n            '<article class="card"><div class="empty">'\n            + '<div class="empty__art"><i class="fa-solid fa-hammer"></i></div>'\n            + '<h3>Screen not built yet</h3>'\n            + '<p>The shell is generated; the page script is next.</p></div></article>';\n    });\n}());\n`, 'utf8');
    }
});

console.log(`scaffold: ${written} written, ${skipped} left alone${FORCE ? '' : ' (use --force to rewrite)'}`);
