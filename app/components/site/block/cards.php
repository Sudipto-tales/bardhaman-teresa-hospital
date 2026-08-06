<?php

/**
 * The icon-card grid. One block serves procedures, facilities, values and the
 * careers benefits — they are the same record shape and the same tile.
 *
 * Props
 *   section  string
 *   eyebrow  string
 *   title    string  Markup
 *   items    array   Rows for card/facility: {icon, title, text, href}
 *   alt      bool
 *   center   bool    Centres the section head; default true
 */

$items = $items ?? [];
$center = $center ?? true;
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="section-head<?= $center ? ' section-head--center' : '' ?>">
                    <span class="eyebrow"><?= e($eyebrow ?? '') ?></span>
                    <!-- raw: section headings carry <strong> on the emphasised half -->
                    <h2><?= $title ?? '' ?></h2>
                </div>

                <div class="pg-cards">
<?php foreach ($items as $item): ?>
<?= App::component('site/card/facility', ['item' => $item]) ?>
<?php endforeach; ?>
                </div>
            </div>
        </section>
