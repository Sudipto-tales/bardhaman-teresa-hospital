<?php

/**
 * Generates the PHP shell for every panel screen.
 *
 *     php tools/scaffold-admin.php          # writes any missing shell
 *     php tools/scaffold-admin.php --force  # rewrites them all
 *
 * The PHP twin of html/admin/tools/scaffold.mjs, and the table below is that
 * file's PAGES table with the two hand-written screens folded back in.
 * Everything a screen renders still lives in assets/admin/js/pages/<file>.js;
 * this only decides which core modules it needs and what goes in the title bar.
 *
 * Two differences from the original, both because a PHP shell is a component
 * call rather than a copy of the chrome:
 *
 * 1. `doctors` and `doctor-form` are generated here. The .mjs version left
 *    them out because their <main> is not the empty #pageHead / #view pair and
 *    regenerating them would have destroyed the markup; here that markup sits
 *    in a component of its own — app/components/admin/body/ — and the shell
 *    above it is as ordinary as any other.
 * 2. `faqs` is `listeditor`, which is what the checked-in faqs.html actually
 *    loads. The .mjs table said `listform` and the extra <script> was added to
 *    the file by hand, which held until the next --force run took it away.
 *
 * Not in the table: `login`. The sign-in screen is not one of the panel's 41
 * screens — it has no page script, no sidebar and no session to render for,
 * and it was built in 5.0 against the site's own head. AdminController renders
 * it directly.
 *
 * Adding a screen is a row here plus a page script. The sidebar entry is a
 * separate one-line change in assets/admin/js/core/nav.js, which is the
 * panel's own source of truth for navigation.
 */

$root = dirname(__DIR__);
$force = in_array('--force', $argv, true);

/* file                       sidebar key         title                   type          body */
$pages = [
    ['dashboard',             'dashboard',        'Dashboard',            'plain'],
    ['analytics',             'analytics',        'Web Analytics',        'plain'],

    ['doctors',               'doctors',          'Doctors',              'list',        'doctors'],
    ['doctor-form',           'doctors',          'Doctor',               'form-static', 'doctor-form'],
    ['leadership',            'leadership',       'Leadership',           'list'],
    ['leadership-form',       'leadership',       'Leadership member',    'form'],
    ['departments',           'departments',      'Departments',          'list'],
    ['department-form',       'departments',      'Department',           'form'],
    ['facilities',            'facilities',       'Facilities',           'listform'],
    ['lab-tests',             'lab-tests',        'Lab Tests & Packages', 'listform'],
    ['blog',                  'blog',             'Blog & News',          'list'],
    ['blog-form',             'blog',             'Write a post',         'editor'],
    ['blog-categories',       'blog-categories',  'Categories & Tags',    'listform'],
    ['testimonials',          'testimonials',     'Testimonials',         'listform'],
    ['faqs',                  'faqs',             'FAQs',                 'listeditor'],
    ['gallery',               'gallery',          'Media Gallery',        'media'],

    ['pages',                 'pages',            'All Pages',            'list'],
    ['page-home',             'page-home',        'Home Page',            'form'],
    ['page-about',            'page-about',       'About Page',           'form'],
    ['page-contact',          'page-contact',     'Contact Page',         'form'],
    ['page-careers',          'page-careers',     'Careers Page',         'form'],
    ['stats',                 'stats',            'Counters & Numbers',   'listform'],

    ['jobs',                  'jobs',             'Vacancies',            'list'],
    ['job-form',              'jobs',             'Vacancy',              'form'],
    ['applications',          'applications',     'Applications',         'list'],

    ['enquiries',             'enquiries',        'Enquiries',            'list'],
    ['enquiry-view',          'enquiries',        'Enquiry',              'form'],
    ['appointments',          'appointments',     'Appointments',         'list'],
    ['seo',                   'seo',              'SEO Manager',          'listform'],
    ['navigation',            'navigation',       'Navigation',           'listform'],
    ['redirects',             'redirects',        'Redirects',            'listform'],

    ['settings-general',      'settings-general',      'General Settings',    'form'],
    ['settings-contact',      'settings-contact',      'Contact Details',     'form'],
    ['settings-social',       'settings-social',       'Social Links',        'form'],
    ['settings-integrations', 'settings-integrations', 'Integrations',        'form'],
    ['settings-theme',        'settings-theme',        'Theme & Branding',    'form'],
    ['settings-popups',       'settings-popups',       'Popups & Cookie Bar', 'form'],

    ['users',                 'users',            'Users & Roles',        'listform'],
    ['user-form',             'users',            'Panel user',           'form'],
    ['activity-log',          'activity-log',     'Activity Log',         'list'],
    ['profile',               'profile',          'My Profile',           'form'],
];

/**
 * A shell, as PHP source. `script` is only written when it differs from the
 * sidebar key — a form screen names its list there so the nav stays lit.
 */
function shell(string $file, string $page, string $title, string $type, ?string $body): string
{
    $quote = static fn (string $v): string => "'" . str_replace(['\\', "'"], ['\\\\', "\\'"], $v) . "'";

    $props = [
        "    'page' => " . $quote($page) . ',',
        "    'title' => " . $quote($title) . ',',
        "    'type' => " . $quote($type) . ',',
    ];

    if ($file !== $page) {
        $props[] = "    'script' => " . $quote($file) . ',';
    }

    if ($body !== null) {
        $props[] = "    'body' => " . $quote('admin/body/' . $body) . ',';
    }

    return "<?php\n\n"
        . "/* Generated by tools/scaffold-admin.php. Edit the table there, not this file. */\n\n"
        . "App::render('admin/layout', [\n"
        . implode("\n", $props) . "\n"
        . "]);\n";
}

/**
 * A shell with no page script is a blank screen, which is worse than a missing
 * file — leave a stub so every generated page renders something.
 */
function stub(string $title): string
{
    $safe = str_replace("'", "\\'", $title);

    return "/* {$title} — not built yet. */\n"
        . "(function () {\n"
        . "    'use strict';\n"
        . "    document.addEventListener('DOMContentLoaded', function () {\n"
        . "        document.getElementById('pageHead').innerHTML = window.TMH.layout.pageHead({\n"
        . "            title: '{$safe}',\n"
        . "        });\n"
        . "        document.getElementById('view').innerHTML =\n"
        . "            '<article class=\"card\"><div class=\"empty\">'\n"
        . "            + '<div class=\"empty__art\"><i class=\"fa-solid fa-hammer\"></i></div>'\n"
        . "            + '<h3>Screen not built yet</h3>'\n"
        . "            + '<p>The shell is generated; the page script is next.</p></div></article>';\n"
        . "    });\n"
        . "}());\n";
}

$written = 0;
$skipped = 0;

@mkdir($root . '/app/page/admin', 0o775, true);
@mkdir($root . '/assets/admin/js/pages', 0o775, true);

foreach ($pages as $row) {
    [$file, $page, $title, $type] = $row;
    $body = $row[4] ?? null;

    $path = $root . '/app/page/admin/' . $file . '.php';

    if (file_exists($path) && !$force) {
        $skipped++;
        continue;
    }

    file_put_contents($path, shell($file, $page, $title, $type, $body));
    $written++;

    $js = $root . '/assets/admin/js/pages/' . $file . '.js';

    if (!file_exists($js)) {
        file_put_contents($js, stub($title));
    }
}

echo "scaffold-admin: {$written} written, {$skipped} left alone"
    . ($force ? '' : ' (use --force to rewrite)') . "\n";
