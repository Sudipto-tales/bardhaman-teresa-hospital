<?php

/**
 * The 404.
 *
 * A dead end is not the place to be terse. What somebody asked for was
 * probably a department, so the page offers all of them rather than an apology
 * and a back button — and it is built from the same two blocks every other
 * page is, so it cannot drift out of the design on its own.
 *
 * $notFoundMessage  optional, from the controller that gave up
 * $departments      the mega-menu rows, rendered as the card grid
 * $bannerImage      the site's default OG image; the banner wants a photo
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [
        ['label' => 'Home', 'href' => base_url('/')],
        ['label' => 'Not found'],
    ],
    'title' => 'This page',
    'strong' => 'is not here',
    'lead' => e($notFoundMessage ?: 'The address may have changed, or the page may have been taken down. Everything below is still where it was.'),
    'img' => $bannerImage ?? '',
    'primary' => ['href' => base_url('/'), 'label' => 'Back to the home page'],
    'ghost' => ['href' => base_url('contact'), 'icon' => 'fa-phone', 'label' => 'Contact the hospital'],
]); ?>

<?php if (!empty($departments)): ?>
<?php App::render('site/block/cards', [
    'section' => 'Departments',
    'eyebrow' => 'Try one of these',
    'title' => 'Our <strong>departments</strong>',
    'items' => array_map(static fn (array $row): array => [
        'icon' => $row['icon'] ?? 'fa-hospital',
        'title' => $row['name'] ?? '',
        'text' => $row['menuNote'] ?? '',
        /* Department pages sit at the root — the row's public key is the path. */
        'href' => base_url((string) ($row['id'] ?? '')),
    ], $departments),
    'alt' => true,
]); ?>
<?php endif; ?>
