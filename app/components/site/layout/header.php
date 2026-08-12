<?php

/**
 * Everything above <main>: the brand rail, the nav shell, the mobile overlay,
 * the quick-action dock and the (empty) scroll-spy rail.
 *
 * The overlay menu lives here rather than in its own file because it is the
 * burger's target — the two only make sense together.
 *
 * Props
 *   active, departments, searchPlaceholder  Forwarded to the nav bar.
 *   email, phone                            The top bar.
 *   logo, siteName                          Forwarded to the brand rail.
 *   tel, whatsapp                           Forwarded to the dock.
 */

/* No literal fallback. A number written here is a number nobody edits in the
   panel and nobody finds when it changes — which is the thing this conversion
   set out to remove. Absent, the strip prints one item or none rather than a
   stale one. */
$email = trim((string) ($email ?? ''));
$phone = trim((string) ($phone ?? ''));
?>
<?= App::component('site/layout/brand-rail', [
    'logo' => $logo ?? null,
    'siteName' => $siteName ?? null,
]) ?>

    <!-- ============ NAV (separate element — hides on scroll-down) ============ -->
    <div class="nav-shell" id="navShell">
        <div class="nav-topbar" translate="no">
<?php if ($email !== ''): ?>
            <span><i class="fa-solid fa-envelope"></i> <?= e($email) ?></span>
<?php endif; ?>
<?php if ($phone !== ''): ?>
            <span><i class="fa-solid fa-phone"></i> <?= e($phone) ?></span>
<?php endif; ?>
        </div>

<?= App::component('site/layout/nav-bar', [
    'active' => $active ?? '',
    'departments' => $departments ?? [],
    'searchPlaceholder' => $searchPlaceholder ?? null,
]) ?>
    </div>

    <!-- mobile overlay menu -->
<?php
/* The three desktop drops, flattened into one data shape. Departments used to
   be the odd one out — the only nav item whose children never reached the
   overlay — so it is built from the same rows the mega menu is handed rather
   than from a second hardcoded list that would drift away from it.

   Collapsible rather than always-open: eleven departments plus six other
   children is more than fits a phone, and a menu that scrolls past its own
   last item reads as broken. */
$mobileGroups = [
    [
        'id' => 'mmAbout',
        'label' => 'About Us',
        'href' => base_url('about'),
        'items' => [
            ['label' => 'Our Story', 'href' => base_url('about')],
            ['label' => 'Our Doctors', 'href' => base_url('doctors')],
            ['label' => 'Our Blog', 'href' => base_url('blog')],
        ],
    ],
    [
        'id' => 'mmDepartments',
        'label' => 'Our Department',
        'href' => base_url('departments'),
        'items' => array_merge(
            [['label' => 'All Departments', 'href' => base_url('departments')]],
            array_map(static fn ($row) => [
                'label' => (string) ($row['name'] ?? ''),
                /* A department's page is at the root — /cardiology, not
                   /departments/cardiology — same as mega-menu.php. */
                'href' => base_url((string) ($row['slug'] ?? $row['id'] ?? '')),
            ], $departments ?? [])
        ),
    ],
    [
        'id' => 'mmFacilities',
        'label' => 'Facilities',
        'href' => base_url('facilities'),
        'items' => [
            ['label' => 'Our Facilities', 'href' => base_url('facilities')],
            ['label' => 'Lab Test', 'href' => base_url('/') . '#lab'],
            ['label' => 'Our Gallery', 'href' => base_url('gallery')],
        ],
    ],
];
?>
    <div class="mobile-menu" id="mobileMenu">
        <nav class="mm__list" aria-label="Mobile menu">
            <a class="mm__link" href="<?= e(base_url('/')) ?>">Home</a>

<?php foreach ($mobileGroups as $group): ?>
            <div class="mm__group">
                <div class="mm__row">
                    <a class="mm__link" href="<?= e($group['href']) ?>"><?= e($group['label']) ?></a>
                    <button class="mm__plus" type="button" aria-expanded="false"
                        aria-controls="<?= e($group['id']) ?>" aria-label="Show <?= e($group['label']) ?> pages">
                        <span aria-hidden="true"></span>
                    </button>
                </div>
                <div class="mm__panel" id="<?= e($group['id']) ?>">
                    <div class="mm__panel-in">
<?php foreach ($group['items'] as $item): ?>
                        <a href="<?= e($item['href']) ?>"><?= e($item['label']) ?></a>
<?php endforeach; ?>
                    </div>
                </div>
            </div>
<?php endforeach; ?>

            <a class="mm__link" href="<?= e(base_url('careers')) ?>">Careers</a>
            <a class="mm__cta" href="<?= e(base_url('contact')) ?>">Contact</a>
        </nav>
    </div>

<?= App::component('site/layout/mobile-dock', [
    'tel' => $tel ?? null,
    'whatsapp' => $whatsapp ?? null,
]) ?>

<?= App::component('site/layout/scroll-spy') ?>
