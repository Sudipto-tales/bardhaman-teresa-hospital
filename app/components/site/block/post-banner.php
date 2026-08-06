<?php

/**
 * The single-article banner. block/banner puts its copy *on* the photo; this
 * one runs the photo as a band and lifts a card over its foot, with the
 * utility row (call, print, mail, share) parked on the right.
 *
 * Props
 *   crumb  array of {label, href}
 *   title  string
 *   lead   string
 *   img    string
 *   flags  array  Category, date and read time; the first renders as the category
 *   tel    string  Digits for the tel: URI
 *   phone  string  The same number, formatted for reading
 */

$crumb = $crumb ?? [];
$flags = $flags ?? [];
$title = $title ?? '';
$last = count($crumb) - 1;
?>
        <!-- ============ ARTICLE BANNER ============ -->
        <section class="post-hero">
            <div class="post-hero__media">
                <img class="post-hero__img" src="<?= e($img ?? '') ?>" alt="" aria-hidden="true">
                <div class="post-hero__scrim"></div>
            </div>

            <div class="post-hero__panel">
                <div class="post-hero__card">
                    <div class="post-hero__intro">
                        <div class="post-hero__flags">
<?php foreach ($flags as $i => $flag): ?>
                            <span class="post-hero__flag<?= $i === 0 ? ' post-hero__flag--cat' : '' ?>"><?= e(is_array($flag) ? ($flag['text'] ?? '') : $flag) ?></span>
<?php endforeach; ?>
                        </div>

                        <h1 class="post-hero__title"><?= e($title) ?></h1>
                        <p class="post-hero__lead"><?= e($lead ?? '') ?></p>

                        <nav class="pg-crumb pg-crumb--ink" aria-label="Breadcrumb">
<?php foreach ($crumb as $i => $item): ?>
<?php if ($i === $last): ?>
                            <span aria-current="page"><?= e($item['label'] ?? '') ?></span>
<?php else: ?>
                            <a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a>
                            <i class="fa-solid fa-chevron-right"></i>
<?php endif; ?>
<?php endforeach; ?>
                        </nav>
                    </div>

                    <div class="post-hero__side">
                        <a class="post-hero__call" href="tel:<?= e($tel ?? '+913423254567') ?>" translate="no">
                            <span class="post-hero__call-ic"><i class="fa-solid fa-phone-volume"></i></span>
                            <span>Call: <strong><?= e($phone ?? '+91 342 325 4567') ?></strong></span>
                        </a>

                        <!-- wired in pages.js. Without JS the mail link still
                             works and the two buttons are inert rather than broken -->
                        <div class="post-hero__tools" role="group" aria-label="Print or share this article">
                            <button type="button" class="post-hero__tool" data-post-tool="print"
                                aria-label="Print this article"><i class="fa-solid fa-print"></i></button>
                            <a class="post-hero__tool" data-post-tool="mail"
                                href="mailto:?subject=<?= e(rawurlencode(html_entity_decode(strip_tags($title), ENT_QUOTES, 'UTF-8'))) ?>"
                                aria-label="Email this article"><i class="fa-solid fa-envelope"></i></a>
                            <button type="button" class="post-hero__tool" data-post-tool="share"
                                aria-label="Share this article"><i class="fa-solid fa-share-nodes"></i></button>
                        </div>

                        <p class="post-hero__flash" id="postFlash" role="status" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        </section>
