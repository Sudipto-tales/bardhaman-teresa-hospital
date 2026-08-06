<?php

/**
 * Copy and a tick list beside a photo with a floating badge card.
 *
 * Props
 *   section  string  The [data-section] label the scroll-spy rail picks up
 *   eyebrow  string
 *   title    string  Markup — a department's introTitle carries <strong>
 *   body     array   Strings, or {paragraph} rows from a JSON column
 *   checks   array   Strings, or {text} rows
 *   img      string
 *   imgAlt   string
 *   badge    array of {icon, title, text}
 *   alt      bool    Tints the section
 */

$body = $body ?? [];
$checks = $checks ?? [];
$badge = $badge ?? [];
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="pg-intro">
                    <div class="pg-intro__copy">
                        <span class="eyebrow"><?= e($eyebrow ?? '') ?></span>
                        <!-- raw: section headings carry <strong> on the emphasised half -->
                        <h2><?= $title ?? '' ?></h2>
<?php foreach ($body as $paragraph): ?>
                        <p><?= e(is_array($paragraph) ? ($paragraph['paragraph'] ?? $paragraph['text'] ?? '') : $paragraph) ?></p>
<?php endforeach; ?>

                        <ul class="pg-checks">
<?php foreach ($checks as $check): ?>
                            <li><i class="fa-solid fa-circle-check"></i> <?= e(is_array($check) ? ($check['text'] ?? '') : $check) ?></li>
<?php endforeach; ?>
                        </ul>
                    </div>

                    <div class="pg-intro__media">
                        <div class="img-stretch">
                            <img src="<?= e($img ?? '') ?>" alt="<?= e($imgAlt ?? 'Inside Teresa Memorial Hospital') ?>" loading="lazy">
                        </div>
<?php if (!empty($badge['title'])): ?>
                        <div class="pg-badge">
                            <span class="pg-badge__icon"><i class="fa-solid <?= e($badge['icon'] ?? '') ?>"></i></span>
                            <div>
                                <h4><?= e($badge['title']) ?></h4>
                                <p><?= e($badge['text'] ?? '') ?></p>
                            </div>
                        </div>
<?php endif; ?>
                    </div>
                </div>
            </div>
        </section>
