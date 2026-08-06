<?php

/**
 * Interlocking tiles: two photos, the Google rating, a testimonial carousel
 * (driven by initQuotes in pages.js) and the accreditation card. Placement
 * lives in the .ab-mosaic grid-template-areas.
 *
 * Props
 *   section  string
 *   photoA   array of {src, alt}
 *   photoB   array of {src, alt}
 *   rating   array of {label, score}
 *   quotes   array   Rows for card/testimonial
 *   cred     array of {icon, label, title, href, link}
 *   alt      bool
 */

$photoA = $photoA ?? [];
$photoB = $photoB ?? [];
$rating = $rating ?? [];
$quotes = $quotes ?? [];
$cred = $cred ?? [];

/* initQuotes swaps the footer from the active slide's data-*; this is only
   the first paint, so an empty set costs the attribution and nothing else. */
$first = $quotes[0] ?? [];
?>
        <section class="pg-section<?= !empty($alt) ? ' pg-section--alt' : '' ?>" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="ab-mosaic">
                    <figure class="ab-tile ab-tile--a">
                        <img src="<?= e($photoA['src'] ?? '') ?>" alt="<?= e($photoA['alt'] ?? '') ?>" loading="lazy">
                    </figure>

                    <div class="ab-rating">
                        <span class="eyebrow"><?= e($rating['label'] ?? '') ?></span>
                        <p class="ab-rating__score"><i class="fa-solid fa-star"></i><span class="pg-stat__value"
                                data-count="<?= e($rating['score'] ?? '') ?>"><?= e($rating['score'] ?? '') ?></span></p>
                    </div>

                    <figure class="ab-tile ab-tile--b">
                        <img src="<?= e($photoB['src'] ?? '') ?>" alt="<?= e($photoB['alt'] ?? '') ?>" loading="lazy">
                    </figure>

                    <div class="ab-quote" id="abQuote">
                        <span class="ab-quote__mark" aria-hidden="true">&rdquo;</span>

                        <!-- attribution rides on each slide as data-*; the footer
                             below shows one set and initQuotes swaps it -->
                        <div class="ab-quote__track" aria-live="polite">
<?php foreach ($quotes as $i => $quote): ?>
<?= App::component('site/card/testimonial', ['quote' => $quote, 'active' => $i === 0]) ?>
<?php endforeach; ?>
                        </div>

                        <div class="ab-quote__foot">
                            <div class="ab-quote__who">
                                <img class="ab-quote__avatar" src="<?= e($first['photo'] ?? $first['img'] ?? '') ?>" alt="" loading="lazy">
                                <div>
                                    <span class="ab-quote__name"><?= e($first['name'] ?? '') ?></span>
                                    <span class="ab-quote__role"><?= e($first['role'] ?? '') ?></span>
                                </div>
                            </div>

                            <div class="ab-quote__nav">
                                <button type="button" data-quote="prev" aria-label="Previous testimonial"><i
                                        class="fa-solid fa-arrow-left"></i></button>
                                <button type="button" data-quote="next" aria-label="Next testimonial"><i
                                        class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="ab-cred">
                        <span class="ab-cred__icon"><i class="fa-solid <?= e($cred['icon'] ?? '') ?>"></i></span>
                        <div>
                            <span class="eyebrow"><?= e($cred['label'] ?? '') ?></span>
                            <h3><?= e($cred['title'] ?? '') ?></h3>
<?php if (!empty($cred['href'])): ?>
                            <a href="<?= e($cred['href']) ?>" class="arrow-link arrow-link--cool"><i class="fa-solid fa-arrow-right"></i> <?= e($cred['link'] ?? 'Learn More') ?></a>
<?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </section>
