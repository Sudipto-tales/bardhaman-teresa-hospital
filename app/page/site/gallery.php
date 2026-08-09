<?php

/**
 * The gallery page.
 *
 * $items   every published row, images / uploaded clips / YouTube embeds
 * $albums  the distinct album names, in grid order
 *
 * Every tile is a poster image, whatever it opens into. That is what makes a
 * YouTube row show its thumbnail, and it is also what keeps a page of thirty
 * items from opening thirty iframes and thirty video streams before anyone has
 * clicked anything — initGallery() in assets/pages.js builds the player when
 * the lightbox opens and takes it away again when it closes.
 *
 * The tile is a <button>, not a link with an onclick. It opens a dialog rather
 * than navigating, so a keyboard reaches it, Enter and Space both work, and
 * nothing has to be added for either.
 */

$items = $items ?? [];
$albums = $albums ?? [];

/* 91 → 1:31. Printed server-side rather than in the browser because it is a
   caption, not a countdown. */
$clock = static function ($seconds): string {
    $seconds = (int) $seconds;

    return $seconds <= 0 ? '' : sprintf('%d:%02d', intdiv($seconds, 60), $seconds % 60);
};
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Gallery']],
    'title' => 'The Hospital,',
    'strong' => 'As It Actually Looks',
    'lead' => 'Photographs and video from inside the wards, theatres and laboratory — and the talks our consultants give when they are asked the same question often enough.',
    'img' => $bannerImage ?? '',
    'chips' => ['Photographs', 'Video', 'Talks'],
    'primary' => ['href' => base_url('facilities'), 'label' => 'See the Facilities'],
    'ghost' => ['href' => base_url('contact'), 'icon' => 'fa-calendar-check', 'label' => 'Plan Your Visit'],
]); ?>

    <section class="pg-section" id="gallery" data-section="Gallery">
        <div class="pg-wrap">
            <div class="section-head section-head--center">
                <span class="eyebrow">Our Gallery</span>
                <!-- raw: section headings carry <strong> on the emphasised half -->
                <h2>A Look <strong>Around The Building</strong></h2>
            </div>

<?php if (!$items): ?>
            <div class="gal-empty">
                <i class="fa-solid fa-images"></i>
                <h3>Nothing here yet</h3>
                <p>Photographs and video are added from the hospital's own camera as departments are refitted. Check back, or come and see the place — the front desk is happy to show visitors around.</p>
                <a href="<?= e(base_url('contact')) ?>" class="btn-primary"><i class="fa-solid fa-location-dot"></i> Plan a visit</a>
            </div>
<?php else: ?>
<?php if ($albums): ?>
            <div class="blog-tags gal-tags" id="galTags" role="group" aria-label="Filter the gallery">
                <button type="button" class="pg-tag is-active" data-album="">All</button>
<?php foreach ($albums as $album): ?>
                <button type="button" class="pg-tag" data-album="<?= e($album) ?>"><?= e($album) ?></button>
<?php endforeach; ?>
            </div>
<?php endif; ?>

            <div class="gal-grid" id="galGrid">
<?php foreach ($items as $i => $item): ?>
<?php
    $type = (string) ($item['type'] ?? 'image');
    $title = (string) ($item['title'] ?? '');
    $poster = site_url((string) ($item['image'] ?? ''));

    /* A YouTube row that was never given a poster still has one: the
       thumbnail is derivable from the id, and a blank tile is not. */
    if ($poster === '' && $type === 'youtube' && ($item['youtubeId'] ?? '') !== '') {
        $poster = 'https://img.youtube.com/vi/' . rawurlencode((string) $item['youtubeId']) . '/hqdefault.jpg';
    }

    $duration = $clock($item['duration'] ?? 0);
?>
                <button type="button" class="gal-tile" data-i="<?= (int) $i ?>"
                    data-type="<?= e($type) ?>"
                    data-album="<?= e((string) ($item['album'] ?? '')) ?>"
                    data-title="<?= e($title) ?>"
                    data-caption="<?= e((string) ($item['caption'] ?? '')) ?>"
                    data-src="<?= e($type === 'video' ? site_url((string) ($item['videoPath'] ?? '')) : $poster) ?>"
                    data-poster="<?= e($poster) ?>"
                    data-youtube="<?= e((string) ($item['youtubeId'] ?? '')) ?>"
                    aria-label="Open <?= e($title) ?>">
                    <span class="gal-tile__frame">
                        <img src="<?= e($poster) ?>" alt="<?= e($title) ?>" loading="lazy" decoding="async">
<?php if ($type !== 'image'): ?>
                        <span class="gal-tile__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
<?php endif; ?>
<?php if ($type === 'youtube'): ?>
                        <span class="gal-tile__badge" aria-hidden="true"><i class="fa-brands fa-youtube"></i> Video</span>
<?php elseif ($type === 'video' && $duration !== ''): ?>
                        <span class="gal-tile__badge" aria-hidden="true"><i class="fa-solid fa-clapperboard"></i> <?= e($duration) ?></span>
<?php endif; ?>
                    </span>
                    <span class="gal-tile__txt">
                        <strong><?= e($title) ?></strong>
<?php if (($item['caption'] ?? '') !== ''): ?>
                        <span><?= e($item['caption']) ?></span>
<?php endif; ?>
                    </span>
                </button>
<?php endforeach; ?>
            </div>

            <div class="gal-none" id="galNone" hidden>
                <i class="fa-solid fa-filter-circle-xmark"></i>
                <h3>Nothing in that album yet</h3>
                <p>Pick another, or choose All to see everything.</p>
            </div>
<?php endif; ?>
        </div>
    </section>

<?php if ($items): ?>
    <!-- ============ LIGHTBOX ============ -->
    <!-- Empty until something is opened. The <figure> is filled by
         initGallery() and emptied on close, which is what stops a closed
         YouTube iframe going on playing its audio behind the page. -->
    <div class="lb" id="galLightbox" role="dialog" aria-modal="true" aria-label="Gallery viewer" hidden>
        <button type="button" class="lb__close" id="lbClose" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        <button type="button" class="lb__nav lb__nav--prev" id="lbPrev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
        <button type="button" class="lb__nav lb__nav--next" id="lbNext" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>

        <figure class="lb__figure">
            <div class="lb__stage" id="lbStage"></div>
            <figcaption class="lb__cap">
                <strong id="lbTitle"></strong>
                <span id="lbCaption"></span>
                <span class="lb__count" id="lbCount"></span>
            </figcaption>
        </figure>
    </div>
<?php endif; ?>
