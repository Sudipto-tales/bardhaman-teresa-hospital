<?php

/**
 * The Facilities drop-down inside the primary nav.
 *
 * The same anatomy as about-menu.php — a narrow single-column rail of icon
 * tile, label, one line of context, an arrow on hover — because the two sit
 * side by side in the same bar and a second layout there would read as a
 * second kind of menu. It borrows that component's classes outright rather
 * than declaring its own; there is no CSS behind this file.
 *
 * `Lab Test` is a section, not a page. The tests live in the home page's lab
 * band and there is no /lab-tests route to send anyone to, so the row carries
 * the fragment. It is the one item here that can never be the current row —
 * a fragment is not a route, and resolveRoute() has nothing to match it
 * against — which is correct: arriving at #lab leaves you on the home page.
 */

$route = RouteManager::resolveRoute();

$items = [
    ['path' => 'facilities', 'icon' => 'fa-hospital', 'label' => 'Our Facilities', 'note' => 'Everything on the campus'],
    ['path' => '', 'href' => base_url('/') . '#lab', 'icon' => 'fa-flask-vial', 'label' => 'Lab Test', 'note' => 'Tests &amp; health packages'],
    ['path' => 'gallery', 'icon' => 'fa-images', 'label' => 'Our Gallery', 'note' => 'Photos and video from the wards'],
];
?>
                <div class="nav-sub">
<?php foreach ($items as $item): ?>
<?php $path = (string) $item['path']; ?>
                    <a href="<?= e($item['href'] ?? base_url($path)) ?>" class="nav-sub-item<?= $path !== '' && ($route === $path || str_starts_with($route, $path . '/')) ? ' is-current' : '' ?>">
                        <span class="nav-sub-item__ico"><i class="fa-solid <?= e($item['icon']) ?>"></i></span>
                        <span class="nav-sub-item__txt"><strong><?= e($item['label']) ?></strong><span><?= $item['note'] ?></span></span>
                        <i class="fa-solid fa-arrow-right nav-sub-item__go"></i>
                    </a>
<?php endforeach; ?>
                </div>
