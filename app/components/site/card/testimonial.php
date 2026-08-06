<?php

/**
 * One slide of the testimonial carousel. The attribution rides on the element
 * as data-* because initQuotes in pages.js lifts it into the shared footer
 * rather than duplicating the block per slide.
 *
 * Props
 *   quote   array of {text, name, role, photo|img}
 *   active  bool  The slide painted first
 */

$quote = $quote ?? [];
?>
                            <blockquote class="ab-quote__slide<?= !empty($active) ? ' is-active' : '' ?>" data-name="<?= e($quote['name'] ?? '') ?>"
                                data-role="<?= e($quote['role'] ?? '') ?>" data-img="<?= e($quote['photo'] ?? $quote['img'] ?? '') ?>">&ldquo;<?= e($quote['text'] ?? '') ?>&rdquo;</blockquote>
