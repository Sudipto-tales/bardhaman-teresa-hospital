<?php

/**
 * The "keep reading" strip under an article. Same card as the blog listing,
 * so a reader recognises the row for what it is.
 *
 * The caller decides what "related" means and names the topic only when every
 * card in the row actually carries it — otherwise the heading promises
 * "Cardiology" over two maternity cards.
 *
 * Props
 *   section  string
 *   eyebrow  string
 *   title    string  Markup
 *   items    array   Rows for card/blog
 *   allHref  string  The "All articles" link
 */

$items = $items ?? [];
?>
        <section class="pg-section pg-section--alt post-related" data-section="<?= e($section ?? 'Related') ?>">
            <div class="pg-wrap">
                <div class="post-related__head">
                    <div class="section-head">
                        <span class="eyebrow"><?= e($eyebrow ?? '') ?></span>
                        <!-- raw: section headings carry <strong> on the emphasised half -->
                        <h2><?= $title ?? '' ?></h2>
                    </div>
                    <a href="<?= e($allHref ?? base_url('blog')) ?>" class="arrow-link arrow-link--cool"><i class="fa-solid fa-arrow-right"></i> All articles</a>
                </div>

                <div class="blog__grid">
<?php foreach ($items as $post): ?>
<?= App::component('site/card/blog', ['post' => $post]) ?>
<?php endforeach; ?>
                </div>
            </div>
        </section>
