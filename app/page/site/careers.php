<?php

/**
 * The careers page.
 *
 * Four bands, each a `page_sections` row, so the switch walks the sections it
 * was given rather than listing them itself.
 *
 * The openings list is rendered here and marked `data-server`, which is what
 * tells initCareers() in assets/pages.js to filter the rows in place rather
 * than rebuild them from window.TMH_JOBS. #jobFilter, #jobCount and #jobEmpty
 * are the other ids that script looks for.
 *
 * $sections     [key => row] in render order
 * $whyUs        the tick list beside the photo
 * $offer        the benefit cards
 * $openings     the vacancies band's heading and its empty message
 * $contactHr    the closing band
 * $jobs         open vacancies
 * $careersEmail the mailbox HR reads
 */

$heading = static function (array $section, string $fallback): string {
    $title = trim((string) ($section['data']['title'] ?? ''));

    return $title === '' ? $fallback : $title;
};
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Careers']],
    'title' => 'Work Where The',
    'strong' => 'Work Still Counts',
    'lead' => 'Two hundred and forty people run this hospital. Nobody here is a resource number, and nobody is asked to do unpaid overtime to cover a gap in the roster.',
    'img' => $bannerImage ?? '',
    'chips' => ['240 staff', 'Internal-first promotion', 'Course fees funded'],
    'primary' => ['href' => '#openings', 'label' => 'See Open Roles'],
    'ghost' => ($careersEmail ?? '') !== ''
        ? ['href' => 'mailto:' . $careersEmail, 'icon' => 'fa-paper-plane', 'label' => 'Email HR']
        : [],
]); ?>

<?php foreach ($sections as $key => $section): ?>
<?php switch ($key):
    /* ============ WHY US ============ */
    case 'why-us': ?>
<?php App::render('site/block/intro', [
    'section' => 'Why Us',
    'eyebrow' => 'Working Here',
    'title' => $heading($section, 'A small hospital that <strong>keeps its promises</strong>'),
    'body' => [
        'Teresa Memorial is trust-run, so surpluses go back into equipment and pay rather than out to shareholders. That is the whole reason the rota is honest and the training budget survives a bad year.',
        'You will not be anonymous. Two hundred and forty staff means the medical director knows your name, and it also means a mistake gets discussed with you rather than filed about you.',
        'Most of our senior nursing posts were filled from inside. Every vacancy is advertised internally before it reaches this page.',
    ],
    'checks' => $whyUs['checks'] ?? [],
    'img' => $introImage ?? '',
    'imgAlt' => 'Inside Teresa Memorial Hospital',
    'badge' => [
        'icon' => 'fa-user-nurse',
        'title' => 'Two thirds promoted from within',
        'text' => 'Senior nursing posts go to our own staff first.',
    ],
]); ?>
<?php break; ?>

<?php /* ============ WHAT WE OFFER ============ */
    case 'what-we-offer': ?>
<?php App::render('site/block/cards', [
    'section' => 'What We Offer',
    'eyebrow' => 'The Package',
    'title' => $heading($section, 'What You Actually <strong>Get In Return</strong>'),
    'items' => $offer['benefits'] ?? [],
    'alt' => true,
]); ?>
<?php break; ?>

<?php /* ============ OPEN ROLES ============ */
    case 'openings': ?>
    <section class="pg-section" id="openings" data-section="Open Roles">
        <div class="pg-wrap">
            <div class="section-head">
                <span class="eyebrow">Current Vacancies</span>
                <!-- raw: section headings carry <strong> on the emphasised half -->
                <h2><?= trim((string) ($openings['title'] ?? '')) !== ''
                    ? e($openings['title'])
                    : 'Open <strong>Positions</strong>' ?></h2>
            </div>

            <div class="cr-toolbar">
                <span class="cr-toolbar__count" id="jobCount" role="status"><?= count($jobs) ?> open role<?= count($jobs) === 1 ? '' : 's' ?></span>
                <div class="cr-filter">
                    <label for="jobFilter">Department</label>
                    <!-- initCareers() adds one option per department it finds
                         on the rows below -->
                    <select id="jobFilter">
                        <option value="">All departments</option>
                    </select>
                </div>
            </div>

            <ul class="cr-jobs" id="jobList" data-server<?= $jobs ? '' : ' hidden' ?>>
<?php foreach ($jobs as $job): ?>
<?php App::render('site/card/job', ['job' => $job + ['slug' => $job['id'] ?? '', 'posted' => $job['postedAt'] ?? '', 'closes' => $job['closesAt'] ?? '']]); ?>
<?php endforeach; ?>
            </ul>

            <div class="cr-empty" id="jobEmpty"<?= $jobs ? ' hidden' : '' ?>>
                <i class="fa-solid fa-inbox"></i>
                <h3>Nothing open right now</h3>
                <p><?= e($openings['emptyMessage'] ?? 'We post roles here as soon as they are approved. Send your CV anyway — speculative applications are kept on file for six months and matched against new vacancies.') ?></p>
<?php if (($careersEmail ?? '') !== ''): ?>
                <a href="mailto:<?= e($careersEmail) ?>?subject=<?= e(rawurlencode('Speculative application')) ?>" class="btn-primary"><i
                        class="fa-solid fa-paper-plane"></i> Email your CV</a>
<?php endif; ?>
            </div>
        </div>
    </section>
<?php break; ?>

<?php /* ============ CONTACT HR ============ */
    case 'contact-hr': ?>
<?php App::render('site/block/cta', [
    'section' => 'Contact HR',
    'title' => $heading($section, 'Not seeing your role?'),
    'text' => 'Send a CV with a line about what you want to do. HR reads every one and replies within a week, even when the answer is no.',
    'primary' => ($careersEmail ?? '') !== ''
        ? ['href' => 'mailto:' . $careersEmail, 'label' => $careersEmail, 'icon' => 'fa-paper-plane']
        : [],
    'secondary' => ['href' => base_url('contact'), 'label' => 'Contact HR', 'icon' => 'fa-arrow-right'],
]); ?>
<?php break; ?>
<?php endswitch; ?>
<?php endforeach; ?>
