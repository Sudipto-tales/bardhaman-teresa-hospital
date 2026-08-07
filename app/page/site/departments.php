<?php

/**
 * The departments listing.
 *
 * The cards are rows; the banner and the referral list are the page's own
 * copy, because `departments` is one of the four pages with no `page_sections`
 * — the panel offers it for its metadata and nothing else
 * (docs/02-content-model.md).
 *
 * $departments  every published department
 * $counters     the stats band
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Departments']],
    'title' => count($departments) . ' Specialities,',
    'strong' => 'One Building',
    'lead' => 'No cross-city referrals for a second opinion. Departments share a floor, a record system and a weekly meeting — so complicated cases are handled by everyone at once.',
    'img' => $bannerImage ?? '',
    'chips' => [
        count($departments) . ' specialities',
        'Shared patient record',
        'Same-day cross referral',
    ],
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment'],
    'ghost' => ['href' => base_url('doctors'), 'icon' => 'fa-user-doctor', 'label' => 'Find a Doctor'],
    'stats' => !empty($counters),
]); ?>

<?php if (!empty($counters)): ?>
<?php App::render('site/block/stats', ['counters' => $counters, 'label' => 'The hospital in numbers']); ?>
<?php endif; ?>

<?php App::render('site/block/cards', [
    'section' => 'Departments',
    'eyebrow' => 'Centres of Excellence',
    'title' => 'Choose A <strong>Department</strong>',
    'items' => array_map(static fn (array $d): array => [
        'icon' => $d['icon'] ?? 'fa-hospital',
        'title' => $d['name'] ?? '',
        /* The lead is rich text and the card prints it escaped, which is
           right — a card is one line, not a paragraph with emphasis in it. */
        'text' => trim(strip_tags((string) ($d['lead'] ?? ''))),
        'href' => base_url((string) ($d['id'] ?? '')),
    ], $departments),
]); ?>

<?php App::render('site/block/conditions', [
    'section' => 'Referrals',
    'title' => 'Not sure which department you need?',
    'lead' => 'Describe the symptom at the front desk and the duty physician will place you in the right clinic the same morning. Nobody is sent away to work it out themselves.',
    'items' => [
        'Chest pain', 'Breathlessness', 'Persistent headache', 'Back or joint pain',
        'Abdominal pain', 'Swelling or lumps', 'Pregnancy care', 'Child illness',
        'Vision problems', 'Toothache', 'Weight concerns', 'Routine check-up',
    ],
    'alt' => true,
]); ?>

<?php App::render('site/block/cta', [
    'title' => 'Book with any department',
    'text' => 'One number, every clinic. Tell us the symptom and we will find the right consultant.',
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => $callAction ?? [],
]); ?>
