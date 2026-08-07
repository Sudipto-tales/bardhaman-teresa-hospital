<?php

/**
 * One article.
 *
 * The body is the panel's rich-text column and is echoed raw — it is written
 * by staff in the editor, and escaping it would print the markup instead of
 * the article. Nothing a visitor sends reaches this page.
 *
 * $post       the article row
 * $category   its category's name
 * $date       publishedAt, as the design prints it
 * $read       "6 MINS READ", or empty
 * $author     {name, role, photo}
 * $tags       tag names, already resolved from their ids
 * $related    the cards under the article
 * $recent     the sidebar list, this article excluded
 * $phone      ['number', 'digits'] — reception
 * $emergency  the same shape, for the aside
 */

$slug = (string) ($post['id'] ?? '');
$byline = array_filter([$author['role'] ?? '', $date ?? '', $read ?? '']);
?>
<?php App::render('site/block/post-banner', [
    'crumb' => [
        ['label' => 'Home', 'href' => base_url('/')],
        ['label' => 'Blog', 'href' => base_url('blog')],
        ['label' => $category !== '' ? $category : ($post['title'] ?? '')],
    ],
    /* `heading` is the headline written for the article's own page; `title` is
       the shorter line the cards and the <title> carry. */
    'title' => (string) ($post['heading'] ?? $post['title'] ?? ''),
    'lead' => (string) ($post['excerpt'] ?? ''),
    'img' => (string) ($post['coverImage'] ?? ''),
    'flags' => array_filter([$category, $date ?? '', $read ?? '']),
    'tel' => $phone['digits'] ?? '',
    'phone' => $phone['number'] ?? '',
]); ?>

    <section class="pg-section" data-section="Article">
        <div class="pg-wrap">
            <div class="pg-post">
                <article class="pg-post__body">
<?php if (!empty($author['name'])): ?>
                    <div class="pg-post__byline">
                        <img src="<?= e($author['photo'] ?? '') ?>" alt="<?= e($author['name']) ?>" loading="lazy">
                        <div>
                            <h4><?= e($author['name']) ?></h4>
                            <p><?= implode(' &middot; ', array_map('e', $byline)) ?></p>
                        </div>
                    </div>
<?php endif; ?>

<?php if (($post['excerpt'] ?? '') !== ''): ?>
                    <p class="pg-post__standfirst"><?= e($post['excerpt']) ?></p>
<?php endif; ?>

                    <!-- raw: the article body is rich text from the panel's editor -->
<?= $post['body'] ?? '' ?>

<?php if ($category !== '' || !empty($tags)): ?>
                    <!-- ?tag= is read by initBlogFilter() on the listing, so the
                         category lands on the filtered view. The tags are
                         descriptive only and stay unlinked rather than pointing
                         at a filter that would match nothing. -->
                    <div class="pg-tags">
<?php if ($category !== ''): ?>
                        <a class="pg-tag" href="<?= e(base_url('blog') . '?tag=' . rawurlencode($category)) ?>"><?= e($category) ?></a>
<?php endif; ?>
<?php foreach ($tags as $tag): ?>
                        <span class="pg-tag"><?= e($tag) ?></span>
<?php endforeach; ?>
                    </div>
<?php endif; ?>
                </article>

                <aside class="pg-post__aside">
<?php if (($emergency['number'] ?? '') !== ''): ?>
                    <div class="ct-emergency">
                        <h3>Something urgent right now?</h3>
                        <p>Do not finish this article. Call, and do not drive yourself.</p>
                        <a class="ct-emergency__num" href="tel:<?= e($emergency['digits']) ?>" translate="no"><i
                                class="fa-solid fa-truck-medical"></i> <?= e($emergency['number']) ?></a>
                    </div>
<?php endif; ?>

<?php if (!empty($recent)): ?>
                    <div class="ct-panel">
                        <h3>More from the blog</h3>
                        <ul class="pg-related">
<?php foreach ($recent as $item): ?>
                            <li><a href="<?= e(base_url('blog/' . rawurlencode((string) ($item['slug'] ?? '')))) ?>"><span><?= e($item['category'] ?? '') ?></span> <?= e($item['title'] ?? '') ?></a></li>
<?php endforeach; ?>
                        </ul>
                    </div>
<?php endif; ?>
                </aside>
            </div>
        </div>
    </section>

<?php if (!empty($related)): ?>
<?php App::render('site/block/related', [
    'section' => 'Related',
    'eyebrow' => 'Keep reading',
    'title' => 'More From <strong>Our Health Library</strong>',
    'items' => $related,
    'allHref' => base_url('blog'),
]); ?>
<?php endif; ?>

<?php App::render('site/block/cta', [
    'title' => 'A question this article did not answer?',
    'text' => 'Book a consultation and ask the doctor who wrote it. Second opinions are welcome here.',
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => ($phone['number'] ?? '') !== ''
        ? ['href' => 'tel:' . $phone['digits'], 'label' => $phone['number'], 'icon' => 'fa-phone']
        : [],
]); ?>
