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
 *   filter   bool    The doctors index only: search bar, filter row, and a
 *                    Load More that reveals the rest of the roster in place
 *   initial  int     How many cards the filtered grid shows before Load More.
 *                    Two rows of the four-up desktop grid.
 */

$doctors = $doctors ?? [];
$filter = !empty($filter);
$initial = (int) ($initial ?? 8);
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="section-head section-head--center">
                    <span class="eyebrow"><?= e($eyebrow ?? '') ?></span>
                    <!-- raw: section headings carry <strong> on the emphasised half -->
                    <h2><?= $title ?? '' ?></h2>
                </div>

<?php if ($filter): ?>
<?= App::component('site/block/doctor-search', ['doctors' => $doctors]) ?>
<?php endif; ?>

                <!-- Every card is rendered; the cap and the filtering are the
                     script's, so without JS the page is the whole roster
                     rather than eight of it and no way to reach the rest. -->
                <div class="pg-team"<?= $filter ? ' data-doc-grid data-initial="' . $initial . '"' : '' ?>>
<?php foreach ($doctors as $doctor): ?>
<?= App::component('site/card/doctor', ['doctor' => $doctor]) ?>
<?php endforeach; ?>
                </div>

<?php if ($filter): ?>
                <p class="dfind__empty" data-find-empty hidden>
                    No consultant matches that. Try a department, or clear the filters.
                </p>

                <div class="dfind__more">
                    <button type="button" class="btn-ghost" data-find-more hidden>
                        <i class="fa-solid fa-arrow-down" aria-hidden="true"></i> Load more doctors
                    </button>
                </div>
<?php endif; ?>
            </div>
        </section>
