<?php

/**
 * The blog listing.
 *
 * The grid is server-rendered and the sidebar filters it in place —
 * initBlogFilter() in assets/pages.js hides cards that do not match, reading
 * the chips from `data-cat` and the search box from the card's own text. Both
 * hooks are ids the script looks for: #blogSearch, #blogTags, #blogCount,
 * #blogClear and #blogEmpty.
 *
 * $posts       every published article, shaped for card/blog
 * $categories  the tag chips, with their post counts
 * $recent      the five newest, for the sidebar
 * $counters    the numbers band
 * $phone       ['number', 'digits']
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Blog']],
    'title' => 'Health Writing By',
    'strong' => 'The People Treating You',
    'lead' => 'Every article here is written or reviewed by a consultant on staff. No syndicated filler, no advice we would not give in the clinic.',
    'img' => $bannerImage ?? '',
    'chips' => ['Written by consultants', 'Reviewed before publishing', 'Updated when guidance changes'],
    'primary' => ['href' => base_url('contact'), 'label' => 'Ask a Doctor'],
    'ghost' => ['href' => base_url('departments'), 'icon' => 'fa-hospital', 'label' => 'Browse Departments'],
    'stats' => !empty($counters),
]); ?>

<?php if (!empty($counters)): ?>
<?php App::render('site/block/stats', ['counters' => $counters, 'label' => 'The library in numbers']); ?>
<?php endif; ?>

    <section class="pg-section" data-section="Articles">
        <div class="pg-wrap">
            <div class="section-head section-head--center">
                <span class="eyebrow">Blog &amp; Articles</span>
                <h2>Read Top Articles From <strong>Expert Doctors</strong></h2>
            </div>

            <!-- borrows .pg-post from the article page: same main + sticky
                 aside grid, same collapse at 1024px -->
            <div class="pg-post blog__layout" style="margin-top:clamp(28px,3vw,44px)">
                <div>
                    <div class="blog__toolbar">
                        <span id="blogCount" role="status"><?= count($posts) ?> article<?= count($posts) === 1 ? '' : 's' ?></span>
                        <button type="button" class="blog__clear" id="blogClear" hidden><i
                                class="fa-solid fa-xmark"></i> Clear filters</button>
                    </div>

                    <div class="blog__grid">
<?php foreach ($posts as $post): ?>
<?php App::render('site/card/blog', ['post' => $post]); ?>
<?php endforeach; ?>
                    </div>

                    <div class="blog__empty" id="blogEmpty"<?= $posts ? ' hidden' : '' ?>>
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <h3>Nothing matches that</h3>
                        <p>Try a shorter word, or clear the filters and browse the lot. If you are looking for
                            advice on something we have not written about, ask and we will.</p>
                    </div>
                </div>

                <aside class="pg-post__aside">
                    <div class="ct-panel ct-panel--light">
                        <h3>Search articles</h3>
                        <div class="blog-search">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="search" id="blogSearch" autocomplete="off"
                                placeholder="Chest pain, fever, diet&hellip;" aria-label="Search articles">
                        </div>
                    </div>

<?php if (!empty($categories)): ?>
                    <div class="ct-panel ct-panel--light">
                        <h3>Browse by tag</h3>
                        <div class="blog-tags" id="blogTags">
                            <button type="button" class="pg-tag is-active" data-tag="">All</button>
<?php foreach ($categories as $category): ?>
                            <!-- data-tag is the name, not the slug: the chips are
                                 matched against each card's data-cat, which the
                                 card prints as the name the reader sees -->
                            <button type="button" class="pg-tag" data-tag="<?= e($category['name'] ?? '') ?>"><?= e($category['name'] ?? '') ?></button>
<?php endforeach; ?>
                        </div>
                    </div>
<?php endif; ?>

<?php if (!empty($recent)): ?>
                    <div class="ct-panel">
                        <h3>Recent articles</h3>
                        <ul class="pg-related">
<?php foreach ($recent as $post): ?>
                            <li><a href="<?= e(base_url('blog/' . rawurlencode((string) ($post['slug'] ?? '')))) ?>"><span><?= e($post['category'] ?? '') ?></span> <?= e($post['title'] ?? '') ?></a></li>
<?php endforeach; ?>
                        </ul>
                    </div>
<?php endif; ?>
                </aside>
            </div>
        </div>
    </section>

<?php App::render('site/block/cta', [
    'title' => 'A question the article did not answer?',
    'text' => 'Book a consultation and ask the doctor who wrote it. Second opinions are welcome here.',
    'primary' => ['href' => base_url('contact'), 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => ($phone['number'] ?? '') !== ''
        ? ['href' => 'tel:' . $phone['digits'], 'label' => $phone['number'], 'icon' => 'fa-phone']
        : [],
]); ?>
