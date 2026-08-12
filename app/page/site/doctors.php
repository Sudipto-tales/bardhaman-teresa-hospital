<?php

/**
 * The doctors listing.
 *
 * The roster is rows; the banner and the appointment list are the page's own
 * copy — `doctors` has no page_sections.
 *
 * $doctors     every published consultant, in the order the panel arranged them
 * $counters    the stats band
 * $phone       ['number', 'digits'] — the reception number, so the "how to see
 *              one of them" list is not a second place a number is kept
 * $callAction  the same number as the closing band's second button
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Doctors']],
    'title' => 'The People Who',
    'strong' => 'Will Treat You',
    'lead' => 'You are seen by the person named on your appointment, not whoever is free. Consultant-led clinics, and a follow-up with the same doctor.',
    'img' => $bannerImage ?? '',
    'chips' => [
        count($doctors) . ' consultants listed',
        'Consultant-led clinics',
        'Same-day appointments',
    ],
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment'],
    'ghost' => ['href' => base_url('departments'), 'icon' => 'fa-hospital', 'label' => 'Browse Departments'],
    'stats' => !empty($counters),
]); ?>

<?php if (!empty($counters)): ?>
<?php App::render('site/block/stats', ['counters' => $counters, 'label' => 'The team in numbers']); ?>
<?php endif; ?>

<?php App::render('site/block/team', [
    'section' => 'Doctors',
    'eyebrow' => 'Our Doctors',
    'title' => 'Consultants Across <strong>Every Department</strong>',
    'doctors' => $doctors,
    'filter' => true,
]); ?>

<?php App::render('site/block/conditions', [
    'section' => 'Appointments',
    'title' => 'How to see one of them',
    'lead' => 'Appointments open fourteen days ahead. Call, WhatsApp or use the form — all three reach the same desk and are confirmed the same day.',
    'items' => array_values(array_filter([
        ($phone['number'] ?? '') !== '' ? 'Call ' . $phone['number'] : '',
        ($phone['number'] ?? '') !== '' ? 'WhatsApp the same number' : '',
        'Use the online form',
        'Walk in for Emergency',
        'Bring previous reports',
        'Carry a photo ID',
        'Insurance card if cashless',
        'Arrive 15 minutes early',
        'Reschedule free of charge',
        'Follow-up within 14 days free',
        'Second opinions welcome',
        'Teleconsult on request',
    ])),
    'alt' => true,
]); ?>

<?php App::render('site/block/cta', [
    'title' => 'Find the right consultant',
    'text' => 'Tell us the symptom rather than the speciality — the desk will match you to the correct clinic.',
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => $callAction ?? [],
]); ?>
