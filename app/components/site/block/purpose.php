<?php

/**
 * A photo strip carrying its own copy, then the three pastel mission / vision
 * / values cards. Card order is fixed — the CSS tints them by :nth-child.
 *
 * Props
 *   section  string
 *   eyebrow  string
 *   title    string  Markup. The reference breaks the heading with one <span>
 *                    per line rather than relying on wrap
 *   img      string
 *   cta      array of {href, label}
 *   items    array of {icon, title, text}
 *   alt      bool
 */

$items = $items ?? [];
$cta = $cta ?? [];
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="ab-banner">
                    <img src="<?= e($img ?? '') ?>" alt="" aria-hidden="true" loading="lazy">
                    <div class="ab-banner__copy">
                        <span class="eyebrow eyebrow--onDark"><?= e($eyebrow ?? '') ?></span>
                        <!-- raw: the heading is broken into <span> lines by hand -->
                        <h2><?= $title ?? '' ?></h2>
<?php if (!empty($cta['href'])): ?>
                        <a href="<?= e($cta['href']) ?>" class="btn-primary"><i class="fa-solid fa-circle-arrow-right"></i> <?= e($cta['label'] ?? '') ?></a>
<?php endif; ?>
                    </div>
                </div>

                <div class="ab-pillars">
<?php foreach ($items as $item): ?>
                    <article class="ab-pillar">
                        <i class="ab-pillar__icon fa-solid <?= e($item['icon'] ?? '') ?>"></i>
                        <h3><?= e($item['title'] ?? '') ?></h3>
                        <p><?= e($item['text'] ?? '') ?></p>
                    </article>
<?php endforeach; ?>
                </div>
            </div>
        </section>
