<?php

/**
 * An article card. data-cat rather than a baked-in search string: attributes
 * survive the Google Translate widget untouched, so the tag chips keep
 * matching in Bengali while free-text search reads the (translated)
 * textContent instead.
 *
 * Props
 *   post  array of {title, excerpt, image|cover_image, category, date|published_at,
 *                   read|read_minutes, href|slug}
 */

$post = $post ?? [];
$title = $post['title'] ?? '';
$category = $post['category'] ?? '';
$excerpt = $post['excerpt'] ?? '';
$slug = $post['slug'] ?? $post['id'] ?? '';
$href = $post['href'] ?? ($slug !== '' ? base_url('blog/' . rawurlencode($slug)) : base_url('blog'));

/* Either a display string the caller has already made, or the raw column. */
$date = $post['date'] ?? '';
$published = $post['publishedAt'] ?? $post['published_at'] ?? '';
if ($date === '' && $published !== '') {
    $stamp = strtotime($published);
    $date = $stamp ? date('F j, Y', $stamp) : $published;
}

$read = $post['read'] ?? '';
$minutes = $post['readMinutes'] ?? $post['read_minutes'] ?? '';
if ($read === '' && $minutes !== '') {
    $read = $minutes . ' MINS READ';
}
?>
                    <article class="blog__card" data-cat="<?= e($category) ?>">
                        <div class="blog__card-img img-stretch">
                            <img src="<?= e($post['image'] ?? $post['coverImage'] ?? $post['cover_image'] ?? '') ?>" alt="<?= e($title) ?>" loading="lazy">
<?php if ($category !== ''): ?>
                            <span class="blog__cat"><?= e($category) ?></span>
<?php endif; ?>
                        </div>
                        <div class="blog__meta">
                            <span><?= e($date) ?></span> &ndash; <span><?= e($read) ?></span>
                        </div>
                        <h3><?= e($title) ?></h3>
<?php if ($excerpt !== ''): ?>
                        <p class="pg-post__excerpt"><?= e($excerpt) ?></p>
<?php endif; ?>
                        <a href="<?= e($href) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Read More</a>
                    </article>
