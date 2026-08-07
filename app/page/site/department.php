<?php

/**
 * One department page — the shape tools/build-pages.mjs generated eleven
 * copies of, now read from the row.
 *
 * Every block below is skipped when the column behind it is empty. A
 * department the panel has only half filled in renders as the half that is
 * there, not as a page with three empty section headings in it.
 *
 * $department  the row
 * $counters    the stats band
 * $doctors     the team strip
 * $faqs        this department's questions, if any
 */

$d = $department;
$name = (string) ($d['name'] ?? '');
?>
<?php App::render('site/block/banner', [
    'crumb' => [
        ['label' => 'Home', 'href' => base_url('/')],
        ['label' => 'Departments', 'href' => base_url('departments')],
        ['label' => $name],
    ],
    'title' => $d['titleLead'] ?? '',
    'strong' => $d['titleStrong'] ?? '',
    'lead' => $d['lead'] ?? '',
    'img' => $d['banner'] ?? '',
    'chips' => $d['chips'] ?? [],
    'primary' => ($d['primaryCta'] ?? []) ?: ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment'],
    'ghost' => ($d['ghostCta'] ?? []) ?: ['href' => base_url('doctors'), 'icon' => 'fa-user-doctor', 'label' => 'Meet the Doctors'],
    /* The band rides up over the banner's foot, so the chips need the extra
       clearance only when there is a band to ride under. */
    'stats' => !empty($counters),
]); ?>

<?php if (!empty($counters)): ?>
<?php App::render('site/block/stats', ['counters' => $counters, 'label' => $name . ' in numbers']); ?>
<?php endif; ?>

<?php if (!empty($d['introTitle']) || !empty($d['introBody'])): ?>
<?php App::render('site/block/intro', [
    'section' => 'Overview',
    'eyebrow' => $name,
    'title' => $d['introTitle'] ?? '',
    'body' => $d['introBody'] ?? [],
    'checks' => $d['checks'] ?? [],
    'img' => $d['introImg'] ?? '',
    'imgAlt' => $name . ' at Teresa Memorial Hospital',
    'badge' => $d['badge'] ?? [],
]); ?>
<?php endif; ?>

<?php if (!empty($d['procedures'])): ?>
<?php App::render('site/block/cards', [
    'section' => 'Procedures',
    'eyebrow' => 'What We Do',
    'title' => 'Procedures &amp; <strong>Services</strong>',
    'items' => $d['procedures'],
    'alt' => true,
]); ?>
<?php endif; ?>

<?php if (!empty($d['conditions'])): ?>
<?php App::render('site/block/conditions', [
    'section' => 'Conditions',
    'title' => $d['conditionsTitle'] ?? ('Conditions the ' . $name . ' team treats'),
    'lead' => $d['conditionsLead'] ?? '',
    'items' => $d['conditions'],
]); ?>
<?php endif; ?>

<?php if (!empty($doctors)): ?>
<?php App::render('site/block/team', [
    'section' => 'Doctors',
    'eyebrow' => 'The Team',
    'title' => 'Consultants In <strong>' . e($name) . '</strong>',
    'doctors' => $doctors,
    'alt' => true,
]); ?>
<?php endif; ?>

<?php if (!empty($faqs)): ?>
        <section class="pg-section" data-section="Questions">
            <div class="pg-section__head">
                <span class="pg-eyebrow">Before You Come</span>
                <h2>Questions we are <strong>asked most</strong></h2>
            </div>
<?php App::render('site/widget/faq-accordion', ['faqs' => $faqs]); ?>
        </section>
<?php endif; ?>

<?php App::render('site/block/cta', [
    'title' => 'Speak to the ' . e($name) . ' team',
    'text' => 'Appointments are confirmed the same day. Emergencies do not need one — walk in at any hour.',
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
]); ?>
