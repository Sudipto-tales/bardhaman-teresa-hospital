<?php

/**
 * The closing call-to-action band.
 *
 * Props
 *   title      string
 *   text       string
 *   id         string  Anchor
 *   section    string  Omitted, the band stays out of the scroll-spy rail —
 *                      which is what the generated pages do for the plain
 *                      version and override for the careers one
 *   primary    array of {href, label, icon}
 *   secondary  array of {href, label, icon}
 */

$primary = $primary ?? ['href' => base_url('contact'), 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'];
$secondary = $secondary ?? ['href' => 'tel:+913423254567', 'label' => '+91 342 325 4567', 'icon' => 'fa-phone'];
$id = $id ?? '';
$section = $section ?? '';
?>
        <section class="pg-section pg-section--tight"<?= $id !== '' ? ' id="' . e($id) . '"' : '' ?><?= $section !== '' ? ' data-section="' . e($section) . '"' : '' ?>>
            <div class="pg-wrap">
                <div class="pg-cta">
                    <div>
                        <h2><?= e($title ?? '') ?></h2>
                        <p><?= e($text ?? '') ?></p>
                    </div>
                    <div class="pg-cta__actions">
<?php if (!empty($primary['href'])): ?>
                        <a href="<?= e($primary['href']) ?>" class="btn-light"><i class="fa-solid <?= e($primary['icon'] ?? 'fa-arrow-right') ?>"></i> <?= e($primary['label'] ?? '') ?></a>
<?php endif; ?>
<?php if (!empty($secondary['href'])): ?>
                        <a href="<?= e($secondary['href']) ?>" class="btn-outline"><i class="fa-solid <?= e($secondary['icon'] ?? 'fa-arrow-right') ?>"></i> <?= e($secondary['label'] ?? '') ?></a>
<?php endif; ?>
                    </div>
                </div>
            </div>
        </section>
