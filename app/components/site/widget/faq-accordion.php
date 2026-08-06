<?php

/**
 * The FAQ accordion. aria-expanded="false" on every question is the closed
 * state initFaq() in assets/website.js expects to toggle from; the answers are
 * revealed by height, not by hidden, so they stay in the document for search.
 *
 * Props
 *   faqs  array of {question, answer}
 */

$faqs = $faqs ?? [];
?>
                <div class="faq__accordion">
<?php foreach ($faqs as $faq): ?>
                    <div class="faq__item">
                        <button class="faq__q" aria-expanded="false">
                            <?= e($faq['question'] ?? '') ?>

                            <i class="fa-solid fa-caret-down"></i>
                        </button>
                        <div class="faq__a">
                            <!-- raw: an answer is stored as rich text (§10) -->
                            <?= $faq['answer'] ?? '' ?>
                        </div>
                    </div>
<?php endforeach; ?>
                </div>
