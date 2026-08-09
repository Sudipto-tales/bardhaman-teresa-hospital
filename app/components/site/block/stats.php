<?php

/**
 * The growth band. Sits between the banner and the first section, and rides
 * up over the banner's foot — pass `stats: true` to block/banner so it makes
 * room.
 *
 * Props
 *   counters  array  Rows for widget/counter
 *   label     string aria-label for the section
 *   flow      bool   Drop the upward pull and the gutter. Use when the band
 *                    sits inside a normal section rather than under a banner.
 */

$counters = $counters ?? [];
$flow     = !empty($flow);
?>
        <!-- ============ GROWTH STATS ============ -->
        <section class="pg-stats<?= $flow ? ' pg-stats--flow' : '' ?>" aria-label="<?= e($label ?? 'Key figures') ?>">
            <div class="pg-stats__grid">
<?php foreach ($counters as $counter): ?>
<?= App::component('site/widget/counter', ['counter' => $counter]) ?>
<?php endforeach; ?>
            </div>
        </section>
