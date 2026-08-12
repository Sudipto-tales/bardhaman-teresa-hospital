<?php

/**
 * The gallery page.
 *
 * $items    every published row, images / uploaded clips / YouTube embeds
 * $albums   the distinct album names, in grid order
 * $channel  the hospital's YouTube channel, from the social settings — the
 *           rail's heading links to it, and is plain text without one
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
 *
 * The grid is a mosaic — tiles of three sizes cut to a four-column module so
 * the block has no ragged edge and no holes in it. The spans are set in the
 * browser rather than here (assets/pages.js §initGallery), because filtering
 * changes which tiles are visible and the pattern has to be measured from the
 * visible run, not from the source order.
 */

$items = $items ?? [];
$albums = $albums ?? [];
$channel = $channel ?? '';

/* Photographs and moving pictures, counted rather than assumed: the type row
   is only worth a chip when the page holds both. YouTube rows and uploaded
   clips are one thing to a visitor — "video" — whatever they are to us. */
$counts = ['image' => 0, 'video' => 0];
foreach ($items as $item) {
    $counts[($item['type'] ?? 'image') === 'image' ? 'image' : 'video']++;
}
$types = $counts['image'] > 0 && $counts['video'] > 0;

/* The rail below the grid. Only YouTube rows: an uploaded clip is not on a
   channel, and this section is the channel. */
$videos = array_values(array_filter(
    $items,
    static fn ($item) => ($item['type'] ?? '') === 'youtube' && ($item['youtubeId'] ?? '') !== ''
));

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
            <div class="gal-filter" id="galTags">
<?php if ($types): ?>
                <div class="blog-tags gal-tags" role="group" aria-label="Filter by media type">
                    <button type="button" class="pg-tag is-active" data-type="">Everything <span><?= count($items) ?></span></button>
                    <button type="button" class="pg-tag" data-type="image"><i class="fa-solid fa-image" aria-hidden="true"></i> Photographs <span><?= $counts['image'] ?></span></button>
                    <button type="button" class="pg-tag" data-type="video"><i class="fa-solid fa-circle-play" aria-hidden="true"></i> Video <span><?= $counts['video'] ?></span></button>
                </div>
<?php endif; ?>
<?php if ($albums): ?>
                <div class="blog-tags gal-tags gal-tags--album" role="group" aria-label="Filter by album">
                    <button type="button" class="pg-tag is-active" data-album="">All albums</button>
<?php foreach ($albums as $album): ?>
                    <button type="button" class="pg-tag" data-album="<?= e($album) ?>"><?= e($album) ?></button>
<?php endforeach; ?>
                </div>
<?php endif; ?>
            </div>

            <!-- The mosaic. The spans come from initGallery(); with no
                 JavaScript every tile keeps the 1×1 default, which is a plain
                 four-column grid and still gapless. -->
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
                        <!-- Over the picture rather than under it: a caption
                             below every tile is a row of white bars, and the
                             mosaic is meant to read as one surface. It rises
                             on hover and on keyboard focus alike. -->
                        <span class="gal-tile__cap">
                            <strong><?= e($title) ?></strong>
<?php if (($item['caption'] ?? '') !== ''): ?>
                            <span><?= e($item['caption']) ?></span>
<?php endif; ?>
                        </span>
                    </span>
                </button>
<?php endforeach; ?>
            </div>

            <div class="gal-none" id="galNone" hidden>
                <i class="fa-solid fa-filter-circle-xmark"></i>
                <h3>Nothing under both of those</h3>
                <p>There is nothing of that kind in this album. Pick another album, or set the media type back to Everything.</p>
            </div>
<?php endif; ?>
        </div>
    </section>

<?php if ($videos): ?>
<?php
    /* The rail is two identical runs of the same cards, and the animation
       carries it exactly one run's width before repeating — which is why the
       seam is invisible and why nothing has to be measured in JavaScript.
       A channel with three videos would otherwise be three cards and a lot of
       empty road, so a short list is repeated until the run is long enough to
       cross the widest viewport. */
    $run = $videos;
    while (count($run) < 6) {
        $run = array_merge($run, $videos);
    }
    /* About five seconds a card, so a long rail is not a fast rail. */
    $seconds = count($run) * 5;
?>
    <!-- ============ THE CHANNEL RAIL ============ -->
    <section class="pg-section gal-yt" data-section="YouTube">
        <div class="pg-wrap">
            <div class="gal-yt__head">
<?php if ($channel !== ''): ?>
                <a class="gal-yt__title" href="<?= e($channel) ?>" target="_blank" rel="noopener">
                    <i class="fa-brands fa-youtube" aria-hidden="true"></i>
                    Our YouTube channel
                    <i class="fa-solid fa-arrow-right gal-yt__arrow" aria-hidden="true"></i>
                </a>
<?php else: ?>
                <h2 class="gal-yt__title">
                    <i class="fa-brands fa-youtube" aria-hidden="true"></i> Our YouTube channel
                </h2>
<?php endif; ?>
                <p class="gal-yt__sub">Talks, walkthroughs and health camps — the questions our consultants are asked often enough to answer on camera.</p>
            </div>
        </div>

        <!-- Edge to edge on purpose: a rail that stops at the text column
             looks like a carousel that ran out, not one that keeps going. -->
        <div class="gal-yt__rail" data-yt-rail style="--yt-time: <?= (int) $seconds ?>s">
            <div class="gal-yt__track">
<?php for ($copy = 0; $copy < 2; $copy++): ?>
<?php foreach ($run as $j => $video): ?>
<?php
    $vTitle = (string) ($video['title'] ?? '');
    $vPoster = site_url((string) ($video['image'] ?? ''));
    if ($vPoster === '') {
        $vPoster = 'https://img.youtube.com/vi/' . rawurlencode((string) $video['youtubeId']) . '/hqdefault.jpg';
    }
?>
                <button type="button" class="yt-card" data-yt-card
                    data-key="<?= (int) ($j % count($videos)) ?>"
<?php if ($copy > 0): ?>
                    data-clone="1" tabindex="-1" aria-hidden="true"
<?php endif; ?>
                    data-type="youtube"
                    data-title="<?= e($vTitle) ?>"
                    data-caption="<?= e((string) ($video['caption'] ?? '')) ?>"
                    data-src="<?= e($vPoster) ?>"
                    data-poster="<?= e($vPoster) ?>"
                    data-youtube="<?= e((string) $video['youtubeId']) ?>"
                    aria-label="Play <?= e($vTitle) ?>">
                    <img src="<?= e($vPoster) ?>" alt="" loading="lazy" decoding="async">
                    <span class="yt-card__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
                    <!-- The title is here for the pointer and for the screen
                         reader's label above; it is not painted until the card
                         is hovered or focused. -->
                    <span class="yt-card__title"><?= e($vTitle) ?></span>
                </button>
<?php endforeach; ?>
<?php endfor; ?>
            </div>
        </div>
    </section>
<?php endif; ?>

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
