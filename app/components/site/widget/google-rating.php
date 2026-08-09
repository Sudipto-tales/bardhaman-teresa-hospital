<?php

/**
 * The Google rating tile — the score, a star row filled to the exact fraction,
 * and how many reviews it is drawn from.
 *
 * The numbers come from GoogleReviews::summary(), which answers from a cache
 * file and refreshes it after the response has gone out, so this costs a page
 * render nothing. It falls back to the panel's own figures when no Places API
 * key is configured, and to `fallback` — the score a section stored before this
 * existed — when even those are empty.
 *
 * The stars are two identical rows stacked, the gold one clipped to the score's
 * share of five. That is what makes 4.4 read as four and a bit rather than
 * rounding to four or to five. They are decoration: the whole tile carries one
 * aria-label and the rows are hidden from the reader.
 *
 * The count line and the link are dropped when the review count is unknown,
 * because "Based on 0 Google Reviews" reads worse than no line at all.
 *
 * Props
 *   summary   array|null  GoogleReviews::summary(); read here when not passed
 *   label     string      The tile's eyebrow
 *   variant   string      'track' (home) or 'mosaic' (about)
 *   fallback  string      A stored score to show when nothing else is available
 */

$summary = $summary ?? GoogleReviews::summary();

if ($summary === null) {
    $fallback = (float) ($fallback ?? 0);

    $summary = $fallback > 0 ? [
        'score' => number_format($fallback, 1),
        'count' => 0,
        'countLabel' => '0',
        'percent' => (int) round(min($fallback, 5) / 5 * 100),
        'url' => '',
    ] : null;
}
?>
<?php if ($summary !== null): ?>
<?php
$variant = ($variant ?? 'track') === 'mosaic' ? 'mosaic' : 'track';
$stars = str_repeat('<i class="fa-solid fa-star"></i>', 5);
$count = (int) $summary['count'];

$aria = 'Rated ' . $summary['score'] . ' out of 5 on Google'
    . ($count > 0 ? ' from ' . $summary['countLabel'] . ' reviews' : '');
?>
                    <div class="grating grating--<?= e($variant) ?>" role="img" aria-label="<?= e($aria) ?>">
                        <span class="grating__label"><?= e($label ?? 'Average Google rating') ?></span>

                        <p class="grating__score">
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <span class="grating__value"><?= e($summary['score']) ?></span>
                            <span class="grating__of">/ 5</span>
                        </p>

                        <div class="grating__stars" aria-hidden="true">
                            <?= $stars ?>
                            <span class="grating__stars-fill" style="width: <?= (int) $summary['percent'] ?>%"><?= $stars ?></span>
                        </div>

                        <div class="grating__bar" aria-hidden="true">
                            <span style="width: <?= (int) $summary['percent'] ?>%"></span>
                        </div>

<?php if ($count > 0): ?>
                        <span class="grating__count">Based on <?= e($summary['countLabel']) ?> Google reviews</span>
<?php endif; ?>

<?php if ($count > 0 && ($summary['url'] ?? '') !== ''): ?>
                        <a class="grating__link" href="<?= e($summary['url']) ?>" target="_blank" rel="noopener nofollow">
                            View all reviews on Google <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        </a>
<?php endif; ?>
                    </div>
<?php endif; ?>
