<?php

/**
 * The consultant strip. Used by every department page, the doctors index and
 * the about-page leadership row.
 *
 * Props
 *   section  string
 *   eyebrow  string
 *   title    string  Markup
 *   doctors  array   Rows for card/doctor
 *   alt      bool
 */

$doctors = $doctors ?? [];
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="section-head section-head--center">
                    <span class="eyebrow"><?= e($eyebrow ?? '') ?></span>
                    <!-- raw: section headings carry <strong> on the emphasised half -->
                    <h2><?= $title ?? '' ?></h2>
                </div>

                <div class="pg-team">
<?php foreach ($doctors as $doctor): ?>
<?= App::component('site/card/doctor', ['doctor' => $doctor]) ?>
<?php endforeach; ?>
                </div>
            </div>
        </section>
