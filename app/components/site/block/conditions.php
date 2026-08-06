<?php

/**
 * A short intro beside a two-column chip list — conditions treated, visiting
 * rules, test packages, milestones.
 *
 * Props
 *   section  string
 *   id       string  Anchor, when something links to this block
 *   title    string
 *   lead     string
 *   items    array   Strings, or {text} rows from a JSON column
 *   cta      array of {href, label}
 *   alt      bool
 */

$items = $items ?? [];
$cta = $cta ?? ['href' => base_url('contact'), 'label' => 'Book an appointment'];
$id = $id ?? '';
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>"<?= $id !== '' ? ' id="' . e($id) . '"' : '' ?> data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="pg-cond">
                    <div class="pg-cond__intro">
                        <h2><?= e($title ?? '') ?></h2>
                        <p><?= e($lead ?? '') ?></p>
<?php if (!empty($cta['href'])): ?>
                        <a href="<?= e($cta['href']) ?>" class="arrow-link arrow-link--cool"><i class="fa-solid fa-arrow-right"></i> <?= e($cta['label'] ?? '') ?></a>
<?php endif; ?>
                    </div>

                    <ul class="pg-cond__list">
<?php foreach ($items as $item): ?>
                        <li><i class="fa-solid fa-check"></i> <?= e(is_array($item) ? ($item['text'] ?? '') : $item) ?></li>
<?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </section>
