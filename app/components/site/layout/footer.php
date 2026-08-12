<?php

/**
 * The footer proper, the legal strip beneath it and the back-to-top button.
 *
 * Props
 *   logo, siteName, home
 *   address     array of lines
 *   hours       array of {label, value} — the visiting-hours block
 *   columns     array of {title, links:[{label, href}]}
 *   social      array of {icon, url, label}
 *   copyright   string
 *   tagline     string  Already Bengali; left to the widget it gets round-tripped.
 *   developer   array of {name, url, logo}
 */

$siteName = $siteName ?? 'Teresa Memorial Hospital';
$address = $address ?? ['G.T. Road, Bardhaman,', 'West Bengal 713101'];

/* Every day carries the same value, so it collapses to one range — the same
   shape SiteController::openingHours() produces from the settings panel. */
$hours = $hours ?? [
    ['label' => 'Monday – Sunday', 'value' => 'Open 24 hours'],
];

$columns = $columns ?? [
    ['title' => 'Community', 'links' => [
        ['label' => 'Doctors', 'href' => base_url('doctors')],
        ['label' => 'Testimonials', 'href' => base_url('/') . '#testimonials'],
        ['label' => 'Blogs', 'href' => base_url('blog')],
        ['label' => 'FAQ', 'href' => base_url('/') . '#faq'],
    ]],
    ['title' => 'About', 'links' => [
        ['label' => 'About Us', 'href' => base_url('about')],
        ['label' => 'Career', 'href' => base_url('careers')],
        ['label' => 'Facilities', 'href' => base_url('facilities')],
        ['label' => 'Departments', 'href' => base_url('departments')],
    ]],
    ['title' => 'Support', 'links' => [
        ['label' => 'Terms & Conditions', 'href' => base_url('contact')],
        /* The contact page's emergency panel, by id — the same target the
           dock's ambulance button uses. */
        ['label' => 'Emergency', 'href' => base_url('contact') . '#emergency'],
        ['label' => 'Contact Us', 'href' => base_url('contact')],
    ]],
];

/* The fifth column carries the social row as well as its links, so it is
   rendered below rather than folded into $columns.

   Terms & Conditions is not repeated here: it is the first row of Support,
   the column beside this one, and the same label twice across adjacent
   columns reads as two different documents. */
$legal = $legal ?? [
    ['label' => 'Privacy Policy', 'href' => base_url('contact')],
    ['label' => 'Hospital Stay', 'href' => base_url('facilities') . '#visiting'],
];

$social = $social ?? [
    ['icon' => 'fa-brands fa-facebook-f', 'url' => '#', 'label' => 'Facebook'],
    ['icon' => 'fa-brands fa-x-twitter', 'url' => '#', 'label' => 'X'],
    ['icon' => 'fa-brands fa-youtube', 'url' => '#', 'label' => 'YouTube'],
    ['icon' => 'fa-brands fa-linkedin-in', 'url' => '#', 'label' => 'LinkedIn'],
];

$developer = $developer ?? ['name' => 'Promix', 'url' => 'https://promix.tech/', 'logo' => base_url('assets/promix-logo.png')];
?>
    <!-- ============ FOOTER ============ -->
    <footer class="site-footer">
        <svg class="site-footer__ecg" id="footerEcg" viewBox="0 0 1200 60" preserveAspectRatio="none"
            aria-hidden="true">
            <path d="M0 30 H320 l14 -22 l16 44 l14 -30 l12 14 H700 l16 -26 l18 40 l14 -28 H1200" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <div class="ft__grid">
            <div class="ft__col">
                <a class="ft__logo" href="<?= e($home ?? base_url('/')) ?>" aria-label="<?= e($siteName) ?>">
                    <img src="<?= e($logo ?? base_url('assets/logo-teresa.png')) ?>" alt="<?= e($siteName) ?>" loading="lazy">
                </a>

                <div class="ft__contact">
                    <p><strong>Location:</strong> <?= implode('<br>', array_map('e', $address)) ?></p>
                    <p><strong>Visiting Hours:</strong><br>
<?php foreach ($hours as $row): ?>
                        <?= e($row['label'] ?? '') ?>: <?= e($row['value'] ?? '') ?><br>
<?php endforeach; ?>
                    </p>
                </div>
            </div>

<?php foreach ($columns as $column): ?>
            <div class="ft__col">
                <h4><?= e($column['title'] ?? '') ?></h4>
                <ul>
<?php foreach ($column['links'] ?? [] as $item): ?>
                    <li><a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a></li>
<?php endforeach; ?>
                </ul>
            </div>
<?php endforeach; ?>

            <div class="ft__col">
                <h4>Trust &amp; Legal</h4>
                <ul>
<?php foreach ($legal as $item): ?>
                    <li><a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a></li>
<?php endforeach; ?>
                </ul>

                <h4>Social Media</h4>
                <div class="ft__social">
<?php foreach ($social as $item): ?>
                    <a href="<?= e($item['url'] ?? '#') ?>" aria-label="<?= e($item['label'] ?? '') ?>"><i class="<?= e($item['icon'] ?? '') ?>"></i></a>
<?php endforeach; ?>
                </div>
            </div>
        </div>
    </footer>

    <div class="ft__bottom">
        <p class="ft__bottom-copy"><?= e($copyright ?? '© ' . date('Y') . ' ' . $siteName . '. All rights reserved.') ?></p>
        <!-- already Bengali; left to the widget it gets round-tripped -->
        <p class="ft__bottom-tag" lang="bn" translate="no"><?= e($tagline ?? 'মানুষের সাথে ..... মানুষের পাশে') ?></p>
<?php if (!empty($developer['url'])): ?>
        <!-- The anchor text is the logo's alt, so it says who and what rather
             than just the name; the link stays followed, and Schema::website()
             names the same organisation as `creator`. -->
        <a class="ft__dev" href="<?= e($developer['url']) ?>" target="_blank" rel="noopener noreferrer" data-tip="<?= e($developer['name'] ?? '') ?>"
            title="Website designed and developed by <?= e($developer['name'] ?? '') ?>">
            <span>Developed by</span>
            <img src="<?= e($developer['logo'] ?? '') ?>"
                alt="<?= e($developer['name'] ?? '') ?> — website design and development" loading="lazy">
        </a>
<?php endif; ?>
    </div>

    <button class="to-top" id="toTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
