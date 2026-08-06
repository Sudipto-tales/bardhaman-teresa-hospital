<?php

/**
 * One animated figure. initCounters() in assets/pages.js reads data-count and
 * counts up to it; the printed value is the same string, so the tile is
 * correct before the script runs and for anyone who never gets it.
 *
 * `value` is text rather than a number because the site prints "4.8" and
 * "24/7" as well as "640" — see the counters table.
 *
 * Props
 *   counter  array of {icon, value|count, suffix, label, note}
 */

$counter = $counter ?? [];
$value = $counter['value'] ?? $counter['count'] ?? '';
$note = $counter['note'] ?? '';
?>
                <div class="pg-stat">
                    <i class="pg-stat__icon fa-solid <?= e($counter['icon'] ?? '') ?>"></i>
                    <p class="pg-stat__num"><span class="pg-stat__value" data-count="<?= e($value) ?>"><?= e($value) ?></span><span
                            class="pg-stat__suffix"><?= e($counter['suffix'] ?? '') ?></span></p>
                    <p class="pg-stat__label"><?= e($counter['label'] ?? '') ?></p>
<?php if ($note !== ''): ?>
                    <span class="pg-stat__note"><i class="fa-solid fa-arrow-trend-up"></i> <?= e($note) ?></span>
<?php endif; ?>
                </div>
