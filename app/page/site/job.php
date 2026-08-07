<?php

/**
 * One vacancy, with the application form under it.
 *
 * The description is rendered here rather than by initJob() in
 * assets/pages.js — which is why the wrapper carries no `jobDetail` id: that
 * script bails on its first line when the element is absent, and the two would
 * otherwise fight over the same box.
 *
 * $job           the vacancy row
 * $csrf          the token POST api/public/application checks
 * $action        where the form posts
 * $careersEmail  the mailbox on the panel beside the form
 */

$slug = (string) ($job['id'] ?? '');
$title = (string) ($job['title'] ?? '');

/* '2026-07-28' -> '28 Jul 2026'; anything unparseable passes through, which is
   what a hand-typed "Immediate" in the column should do. */
$niceDate = static function ($value): string {
    if ($value === null || $value === '') {
        return '';
    }

    $stamp = strtotime((string) $value);

    return $stamp ? date('j M Y', $stamp) : (string) $value;
};

/* The list columns are JSON rows of {text}; the panel edits them as a
   repeater. Printing one takes the string out of the row. */
$block = static function (string $heading, $items) use (&$block): void {
    $items = (array) $items;

    if (!$items) {
        return;
    }
    ?>
                <div class="cr-jd__block">
                    <h3><?= e($heading) ?></h3>
                    <ul>
<?php foreach ($items as $item): ?>
                        <li><i class="fa-solid fa-circle-check"></i> <?= e(is_array($item) ? ($item['text'] ?? '') : $item) ?></li>
<?php endforeach; ?>
                    </ul>
                </div>
<?php
};

$facts = array_filter([
    'Department' => (string) ($job['dept'] ?? ''),
    'Employment' => (string) ($job['type'] ?? ''),
    'Location' => (string) ($job['location'] ?? ''),
    'Experience' => (string) ($job['experience'] ?? ''),
    'Openings' => (string) ($job['openings'] ?? ''),
    'Salary' => trim((string) ($job['salaryNote'] ?? '')) !== ''
        ? (string) $job['salaryNote']
        : trim(implode(' – ', array_filter([(string) ($job['salaryFrom'] ?? ''), (string) ($job['salaryTo'] ?? '')])), ' –'),
    'Posted' => $niceDate($job['postedAt'] ?? ''),
    'Applications close' => $niceDate($job['closesAt'] ?? ''),
], static fn (string $value): bool => $value !== '');
?>
<?php App::render('site/block/banner', [
    'crumb' => [
        ['label' => 'Home', 'href' => base_url('/')],
        ['label' => 'Careers', 'href' => base_url('careers')],
        ['label' => $title],
    ],
    'title' => 'A Job Worth',
    'strong' => 'Doing Properly',
    'lead' => 'Read the whole description before you apply &mdash; it is written to be honest about the hours and the pressure as well as the training and the pay.',
    'img' => $bannerImage ?? '',
    'chips' => ['Reply within a week', 'Interviews on campus', 'Travel reimbursed'],
    'primary' => ['href' => '#apply', 'label' => 'Apply For This Role'],
    'ghost' => ['href' => base_url('careers'), 'icon' => 'fa-arrow-left', 'label' => 'All Openings'],
]); ?>

    <section class="pg-section" data-section="The Role">
        <div class="pg-wrap">
            <div class="cr-jd">
                <div>
                    <div class="cr-jd__head">
                        <span class="eyebrow"><?= e($job['dept'] ?? '') ?></span>
                        <h2><?= e($title) ?></h2>
                        <ul class="cr-chips">
                            <li><i class="fa-solid fa-hospital"></i> <?= e($job['dept'] ?? '') ?></li>
                            <li><i class="fa-solid fa-clock"></i> <?= e($job['type'] ?? '') ?></li>
                            <li><i class="fa-solid fa-location-dot"></i> <?= e($job['location'] ?? '') ?></li>
                            <li><i class="fa-solid fa-user-clock"></i> <?= e($job['experience'] ?? '') ?></li>
                        </ul>
                    </div>

<?php if (($job['summary'] ?? '') !== ''): ?>
                    <p class="cr-jd__lead"><?= e($job['summary']) ?></p>
<?php endif; ?>

<?php $block('What you will be doing', $job['responsibilities'] ?? []); ?>
<?php $block('What we need from you', $job['requirements'] ?? []); ?>
<?php $block('Good to have', $job['niceToHave'] ?? []); ?>
<?php $block('What we offer', $job['benefits'] ?? []); ?>
                </div>

                <aside class="cr-jd__aside">
                    <h3>At a glance</h3>
                    <ul class="cr-facts">
<?php foreach ($facts as $label => $value): ?>
                        <li><span><?= e($label) ?></span> <strong><?= e($value) ?></strong></li>
<?php endforeach; ?>
                    </ul>
                    <a href="#apply" class="btn-primary"><i class="fa-solid fa-arrow-down"></i> Apply for this role</a>
                </aside>
            </div>
        </div>
    </section>

    <section class="pg-section pg-section--alt" id="apply" data-section="Apply">
        <div class="pg-wrap">
<?php App::render('site/form/application', [
    'action' => $action ?? '',
    'csrf' => $csrf ?? '',
    'position' => $title,
    'jobSlug' => $slug,
    'applyEmail' => $careersEmail ?? '',
]); ?>
        </div>
    </section>
