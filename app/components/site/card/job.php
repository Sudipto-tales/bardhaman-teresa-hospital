<?php

/**
 * A vacancy row on the careers list. Matches the markup initCareers() in
 * assets/pages.js builds from window.TMH_JOBS, so the CSS and the filter
 * behave the same whether the list is rendered here or there.
 *
 * Props
 *   job  array of {title, dept, type, location, experience,
 *                  posted|posted_at, closes|closes_at, slug, href}
 */

$job = $job ?? [];
$slug = $job['slug'] ?? $job['id'] ?? '';
$href = $job['href'] ?? (base_url('careers/' . rawurlencode($slug)));

/* '2026-07-28' -> '28 Jul 2026'; anything unparseable passes through, which is
   what a hand-typed "Immediate" in the column should do. */
$niceDate = static function ($value): string {
    if ($value === null || $value === '') {
        return '';
    }
    $stamp = strtotime((string) $value);

    return $stamp ? date('j M Y', $stamp) : (string) $value;
};

$posted = $niceDate($job['posted'] ?? $job['postedAt'] ?? $job['posted_at'] ?? '');
$closes = $niceDate($job['closes'] ?? $job['closesAt'] ?? $job['closes_at'] ?? '');
?>
            <li class="cr-job">
                <div>
                    <h3><?= e($job['title'] ?? '') ?></h3>
                    <ul class="cr-chips">
                        <li><i class="fa-solid fa-hospital"></i> <?= e($job['dept'] ?? '') ?></li>
                        <li><i class="fa-solid fa-clock"></i> <?= e($job['type'] ?? '') ?></li>
                        <li><i class="fa-solid fa-location-dot"></i> <?= e($job['location'] ?? '') ?></li>
                        <li><i class="fa-solid fa-user-clock"></i> <?= e($job['experience'] ?? '') ?></li>
                    </ul>
<?php if ($posted !== ''): ?>
                    <span class="cr-job__posted">Posted <?= e($posted) ?><?= $closes !== '' ? ' &middot; closes ' . e($closes) : '' ?></span>
<?php endif; ?>
                </div>
                <a class="arrow-link" href="<?= e($href) ?>"><i
                        class="fa-solid fa-arrow-right"></i> View &amp; apply</a>
            </li>
