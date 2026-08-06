<?php

/**
 * The inner-page banner: photo, breadcrumb, split headline, two actions and
 * an optional chip row.
 *
 * Props
 *   crumb    array of {label, href} — the last entry renders as current
 *   title    string  The light half of the headline
 *   strong   string  The heavy half
 *   lead     string
 *   img      string
 *   chips    array   Strings, or {text} rows straight out of a JSON column
 *   primary  array of {href, label}
 *   ghost    array of {href, icon, label}
 *   stats    bool    True when a stats band follows, which rides up over the
 *                    banner's foot and needs extra clearance for the chips
 */

$crumb = $crumb ?? [];
$chips = $chips ?? [];
$primary = $primary ?? [];
$ghost = $ghost ?? [];
$last = count($crumb) - 1;
?>
        <!-- ============ PAGE BANNER ============ -->
        <section class="pg-hero<?= !empty($stats) ? ' pg-hero--stats' : '' ?>">
            <img class="pg-hero__img" src="<?= e($img ?? '') ?>" alt="" aria-hidden="true">
            <div class="pg-hero__scrim"></div>
            <div class="pg-hero__ring" aria-hidden="true"></div>
            <svg class="pg-hero__ecg" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 40 H300 l14 -24 l16 46 l14 -32 l12 16 H680 l16 -28 l18 42 l14 -30 H1200" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <div class="pg-hero__inner">
                <nav class="pg-crumb" aria-label="Breadcrumb">
<?php foreach ($crumb as $i => $item): ?>
<?php if ($i === $last): ?>
                    <span aria-current="page"><?= e($item['label'] ?? '') ?></span>
<?php else: ?>
                    <a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a>
                    <i class="fa-solid fa-chevron-right"></i>
<?php endif; ?>
<?php endforeach; ?>
                </nav>

                <div class="pg-hero__head">
                    <h1><?= e($title ?? '') ?> <strong><?= e($strong ?? '') ?></strong></h1>
                    <!-- raw: a department's lead is stored as rich text and carries <strong> -->
                    <p class="pg-hero__lead"><?= $lead ?? '' ?></p>
                </div>

                <div class="pg-hero__actions">
<?php if (!empty($primary['href'])): ?>
                    <a href="<?= e($primary['href']) ?>" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> <?= e($primary['label'] ?? '') ?></a>
<?php endif; ?>
<?php if (!empty($ghost['href'])): ?>
                    <a href="<?= e($ghost['href']) ?>" class="btn-ghost"><i class="fa-solid <?= e($ghost['icon'] ?? 'fa-arrow-right') ?>"></i> <?= e($ghost['label'] ?? '') ?></a>
<?php endif; ?>
                </div>
<?php if ($chips): ?>

                <div class="pg-hero__chips">
<?php foreach ($chips as $chip): ?>
                    <span class="pg-hero__chip"><i class="fa-solid fa-circle-check"></i> <?= e(is_array($chip) ? ($chip['text'] ?? '') : $chip) ?></span>
<?php endforeach; ?>
                </div>
<?php endif; ?>
            </div>
        </section>
