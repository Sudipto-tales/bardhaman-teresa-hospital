<?php

/**
 * The About page.
 *
 * The banner and the stats band are fixed chrome; everything after them is a
 * `page_sections` row, so the switch below walks the sections the controller
 * was given rather than listing them itself — switching one off in the panel
 * drops it here, and dragging it moves it.
 *
 * Each section's `title` is the panel's "Heading" field. Where a block takes
 * markup it is echoed raw, because every heading in this design carries
 * <strong> on its emphasised half; it is staff-entered, never a visitor's.
 *
 * $sections     [key => row] in render order
 * $story        the story section's data — title, body, image
 * $storyBody    that body, already unwrapped into plain paragraphs
 * $purpose      the mission / vision / values pillars
 * $values       the six-card grid
 * $milestones   the year-by-year list
 * $practice     the mosaic's photos and rating
 * $careersCta   the closing band
 * $leadership   leadership rows, already shaped for card/doctor
 * $testimonials published quotes, for the mosaic's carousel
 * $counters     the numbers band
 */

$heading = static function (array $section, string $fallback): string {
    $title = trim((string) ($section['data']['title'] ?? ''));

    return $title === '' ? $fallback : $title;
};
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'About Us']],
    'title' => 'Three Decades Of',
    'strong' => 'Compassionate Care',
    'lead' => 'Teresa Memorial opened in 1994 with forty beds and one operating theatre. It now runs 210 beds across twenty units &mdash; and treats the same first patient the same way.',
    'img' => $bannerImage ?? '',
    'chips' => ['Founded 1994', '210 beds · 20 units', 'Serving 1.2 million people'],
    'primary' => ['href' => base_url('departments'), 'label' => 'Explore Departments'],
    'ghost' => ['href' => base_url('doctors'), 'icon' => 'fa-user-doctor', 'label' => 'Meet the Doctors'],
    'stats' => !empty($counters),
]); ?>

<?php if (!empty($counters)): ?>
<?php App::render('site/block/stats', ['counters' => $counters, 'label' => 'Key figures']); ?>
<?php endif; ?>

<?php foreach ($sections as $key => $section): ?>
<?php switch ($key):
    /* ============ OUR STORY ============ */
    case 'story': ?>
<?php App::render('site/block/intro', [
    'section' => 'Our Story',
    'eyebrow' => 'About Teresa Memorial',
    'title' => $heading($section, 'Built by the district, <strong>for the district</strong>'),
    'body' => $storyBody ?: [
        'The hospital began as a subscription raised by local families who were tired of sending relatives to Kolkata for care that should have been available at home. That origin still shapes how it is run.',
        'Growth has been deliberate. A unit opens when the district needs it and when we can staff it properly — never as a line on a brochure. Cardiology came in 2011, dialysis in 2014, the maternity block in 2017.',
        'What has not changed is the rule the founders wrote into the trust deed: treatment starts before payment is discussed.',
    ],
    'checks' => [
        'Trust-run, not investor-owned', 'Surpluses reinvested in equipment',
        'Free emergency stabilisation', 'Subsidised beds for the district',
        'Monthly clinical audit', 'Complaints answered in 72 hours',
    ],
    'img' => $storyImage ?? '',
    'imgAlt' => 'Inside Teresa Memorial Hospital',
    'badge' => [
        'icon' => 'fa-hand-holding-heart',
        'title' => 'Care before paperwork',
        'text' => 'No emergency is delayed for a payment conversation.',
    ],
]); ?>
<?php break; ?>

<?php /* ============ PURPOSE ============ */
    case 'purpose': ?>
<?php App::render('site/block/purpose', [
    'section' => 'Purpose',
    'eyebrow' => 'Healthcare Solution',
    /* The design breaks this heading with one <span> per line rather than
       letting it wrap, so a stored heading is wrapped the same way. */
    'title' => trim((string) ($purpose['title'] ?? '')) !== ''
        ? '<span>' . e($purpose['title']) . '</span>'
        : '<span>Your Health Is Our</span><span>Top Priority</span>',
    'img' => site_url((string) ($purpose['image'] ?? ''), $bannerImage ?? ''),
    'cta' => ['href' => base_url('departments'), 'label' => 'Learn More'],
    'items' => $purpose['pillars'] ?? [],
]); ?>
<?php break; ?>

<?php /* ============ VALUES ============ */
    case 'values': ?>
<?php App::render('site/block/cards', [
    'section' => 'Values',
    'eyebrow' => 'How We Work',
    'title' => $heading($section, 'The Six Things We <strong>Refuse To Compromise</strong>'),
    'items' => $values['values'] ?? [],
    'alt' => true,
]); ?>
<?php break; ?>

<?php /* ============ MILESTONES ============ */
    case 'milestones': ?>
<?php App::render('site/block/conditions', [
    'section' => 'Milestones',
    'title' => $heading($section, 'Thirty-two years, unit by unit'),
    'lead' => 'Every entry below is a service the district did not have the year before. The list is the clearest answer to what the hospital is for.',
    /* The panel stores the year and the line separately so a year can be
       corrected without retyping the sentence; the list prints them joined. */
    'items' => array_map(
        static fn (array $row): string => trim(
            ((string) ($row['year'] ?? '')) . ' — ' . ((string) ($row['text'] ?? '')),
            ' —'
        ),
        (array) ($milestones['milestones'] ?? [])
    ),
    'cta' => ['href' => base_url('contact'), 'label' => 'Book an appointment'],
]); ?>
<?php break; ?>

<?php /* ============ LEADERSHIP ============ */
    case 'leadership':
        /* Switched off at the client's request: the About page shows no
           leadership strip. The `case` stays so the section is matched and
           produces nothing — deleting it would drop the row through to no
           branch at all, which is the same output by accident rather than
           on purpose.

           Nothing behind it was touched. AboutController still queries
           `leadership`, the rows are still published, and the panel still
           edits them, so this is one comment away from coming back:

               if (!empty($leadership)) {
                   App::render('site/block/team', [
                       'section' => 'Leadership',
                       'eyebrow' => 'Leadership',
                       'title' => $heading($section, 'The People <strong>Accountable For It</strong>'),
                       'doctors' => $leadership,
                       'alt' => true,
                   ]);
               }

           Hiding the section in the panel (Pages → About → Leadership) does
           the same thing without a deploy, and is the better switch if this
           is ever meant to be temporary. */
        break; ?>

<?php /* ============ IN PRACTICE ============ */
    case 'in-practice': ?>
<?php App::render('site/block/mosaic', [
    'section' => 'In Practice',
    'photoA' => [
        'src' => site_url((string) ($practice['photoA'] ?? '')),
        'alt' => 'A consultation at Teresa Memorial Hospital',
    ],
    'photoB' => [
        'src' => site_url((string) ($practice['photoB'] ?? '')),
        'alt' => 'The surgical team in a modular theatre',
    ],
    'rating' => [
        'label' => 'Average Google Ratings',
        'score' => (string) ($practice['rating'] ?? ''),
    ],
    'quotes' => $testimonials ?? [],
    'cred' => [
        'icon' => 'fa-award',
        'label' => 'NABH Accredited',
        'title' => 'Teresa Memorial provides award-winning quality care',
        'href' => base_url('facilities'),
        'link' => 'Learn More',
    ],
]); ?>
<?php break; ?>

<?php /* ============ CAREERS ============ */
    case 'careers-cta': ?>
<?php App::render('site/block/cta', [
    'id' => 'careers',
    'section' => 'Careers',
    'title' => $heading($section, 'Work with us'),
    'text' => (string) ($careersCta['body'] ?? 'Consultant, nursing, technician and volunteer roles open through the year. Send a CV and we will call you within a week.'),
    'primary' => ['href' => base_url('careers'), 'label' => 'See Open Roles', 'icon' => 'fa-briefcase'],
    'secondary' => ($careersEmail ?? '') !== ''
        ? ['href' => 'mailto:' . $careersEmail, 'label' => $careersEmail, 'icon' => 'fa-paper-plane']
        : [],
]); ?>
<?php break; ?>
<?php endswitch; ?>
<?php endforeach; ?>
