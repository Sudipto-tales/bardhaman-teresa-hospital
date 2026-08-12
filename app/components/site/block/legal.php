<?php

/**
 * A legal document — terms, privacy, and anything else that is a dated piece
 * of prose with numbered headings.
 *
 * The contents rail is built from the same array the body is, so a section
 * added to the page is a section in the rail; there is no second list to keep
 * in step. Headings carry the id the rail links to.
 *
 * Props
 *   updated   string  Human date this text last changed
 *   intro     array   Paragraphs above the first heading
 *   sections  array of {id, title, body:[string], list:[string]}
 *   call      array of {href, label, icon} — SiteController's $callAction,
 *             empty when the hospital has no number on file, in which case
 *             only the second button prints
 */

$sections = $sections ?? [];
$intro = $intro ?? [];
?>
    <section class="pg-section" data-section="Document">
        <div class="pg-wrap">
            <div class="lgl">
                <nav class="lgl__toc" aria-label="On this page">
                    <h2 class="lgl__toc-head">On this page</h2>
                    <ol>
<?php foreach ($sections as $i => $section): ?>
                        <li><a href="#<?= e($section['id']) ?>"><span><?= $i + 1 ?>.</span> <?= e($section['title']) ?></a></li>
<?php endforeach; ?>
                    </ol>
                </nav>

                <article class="lgl__doc">
<?php if (!empty($updated)): ?>
                    <p class="lgl__meta">
                        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                        Last updated <?= e($updated) ?>
                    </p>
<?php endif; ?>

<?php foreach ($intro as $paragraph): ?>
                    <p class="lgl__lead"><?= $paragraph ?></p>
<?php endforeach; ?>

<?php foreach ($sections as $i => $section): ?>
                    <section class="lgl__sec" id="<?= e($section['id']) ?>">
                        <h2><span aria-hidden="true"><?= $i + 1 ?>.</span> <?= e($section['title']) ?></h2>
<?php foreach ($section['body'] ?? [] as $paragraph): ?>
                        <p><?= $paragraph ?></p>
<?php endforeach; ?>
<?php if (!empty($section['list'])): ?>
                        <ul>
<?php foreach ($section['list'] as $item): ?>
                            <li><?= $item ?></li>
<?php endforeach; ?>
                        </ul>
<?php endif; ?>
                    </section>
<?php endforeach; ?>

                    <div class="lgl__ask">
                        <h3>Something here unclear?</h3>
                        <p>The front desk would rather answer a question now than sort out a
                            misunderstanding later.</p>
                        <div class="lgl__ask-row">
<?php if (!empty($call['href'])): ?>
                            <a class="btn-primary" href="<?= e($call['href']) ?>" translate="no">
                                <i class="fa-solid <?= e($call['icon'] ?? 'fa-phone') ?>"></i> <?= e($call['label'] ?? '') ?>
                            </a>
<?php endif; ?>
                            <a class="btn-ghost" href="<?= e(base_url('contact')) ?>">
                                <i class="fa-solid fa-envelope"></i> Write to us
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
