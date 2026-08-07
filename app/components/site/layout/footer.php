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

$hours = $hours ?? [
    ['label' => 'Sunday', 'value' => '08:00 AM &ndash; 10:00 PM'],
    ['label' => 'Monday &ndash; Friday', 'value' => '06:00 AM &ndash; 12:00 AM'],
];

$columns = $columns ?? [
    ['title' => 'Community', 'links' => [
        ['label' => 'Doctors', 'href' => base_url('doctors')],
        ['label' => 'Testimonials', 'href' => base_url('/') . '#testimonials'],
        ['label' => 'FAQs', 'href' => base_url('/') . '#faq'],
        ['label' => 'Blog', 'href' => base_url('blog')],
        ['label' => 'Site Map', 'href' => base_url('departments')],
    ]],
    ['title' => 'About', 'links' => [
        ['label' => 'Careers', 'href' => base_url('careers')],
        ['label' => 'Education', 'href' => base_url('blog')],
        ['label' => 'About Us', 'href' => base_url('about')],
        ['label' => 'Areas of Care', 'href' => base_url('departments')],
        ['label' => 'Volunteers', 'href' => base_url('careers') . '#openings'],
    ]],
    ['title' => 'Support', 'links' => [
        ['label' => 'Visitor Information', 'href' => base_url('facilities') . '#visiting'],
        ['label' => 'Emergency Care', 'href' => base_url('contact') . '#emergency'],
        ['label' => 'Donate', 'href' => base_url('contact')],
        /* Department pages sit at the root, not under /departments/ — the
           design names them that way and the redirects follow it. */
        ['label' => 'Online Services', 'href' => base_url('lab-diagnostics')],
        ['label' => 'Pay Your Bills', 'href' => base_url('contact')],
    ]],
];

/* The fifth column carries the social row as well as its links, so it is
   rendered below rather than folded into $columns. */
$legal = $legal ?? [
    ['label' => 'Terms & Conditions', 'href' => base_url('contact')],
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
                        <?= e($row['label'] ?? '') ?>: <?= $row['value'] ?? '' ?><br>
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
        <a class="ft__dev" href="<?= e($developer['url']) ?>" target="_blank" rel="noopener noreferrer" data-tip="<?= e($developer['name'] ?? '') ?>"
            aria-label="Developed by <?= e($developer['name'] ?? '') ?>">
            <span>Developed by</span>
            <img src="<?= e($developer['logo'] ?? '') ?>" alt="<?= e($developer['name'] ?? '') ?>" loading="lazy">
        </a>
<?php endif; ?>
    </div>

    <button class="to-top" id="toTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
