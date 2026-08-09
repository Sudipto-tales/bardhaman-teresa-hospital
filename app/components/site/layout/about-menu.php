<?php

/**
 * The About Us drop-down inside the primary nav.
 *
 * Deliberately not the department mega menu. That one is a wide three-column
 * card grid because it carries eleven-odd departments and needs the density;
 * this one carries three destinations, so it is a narrow single-column rail —
 * icon tile, label, one line of context, an arrow that arrives on hover.
 * Same panel chrome, different anatomy, so the two never read as the same menu.
 *
 * `Our Gallery` is not here. It exists now, but it hangs off Facilities —
 * facilities-menu.php, which borrows this file's markup wholesale.
 *
 * The current row is read off the route rather than taken as a prop. All three
 * pages sit under the same `active` key ('about') so the pill above stays lit
 * on every one of them — which leaves that key unable to tell them apart.
 */

$route = RouteManager::resolveRoute();

$items = [
    ['path' => 'about', 'icon' => 'fa-book-open', 'label' => 'Our Story', 'note' => 'How the hospital got here'],
    ['path' => 'doctors', 'icon' => 'fa-user-doctor', 'label' => 'Our Doctors', 'note' => 'Consultants &amp; specialities'],
    ['path' => 'blog', 'icon' => 'fa-newspaper', 'label' => 'Our Blog', 'note' => 'Health notes from our team'],
];
?>
                <div class="nav-sub">
<?php foreach ($items as $item): ?>
                    <a href="<?= e(base_url($item['path'])) ?>" class="nav-sub-item<?= $route === $item['path'] || str_starts_with($route, $item['path'] . '/') ? ' is-current' : '' ?>">
                        <span class="nav-sub-item__ico"><i class="fa-solid <?= e($item['icon']) ?>"></i></span>
                        <span class="nav-sub-item__txt"><strong><?= e($item['label']) ?></strong><span><?= $item['note'] ?></span></span>
                        <i class="fa-solid fa-arrow-right nav-sub-item__go"></i>
                    </a>
<?php endforeach; ?>
                </div>
