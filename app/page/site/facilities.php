<?php

/**
 * The facilities page.
 *
 * $facilities      the service tiles
 * $counters        the stats band
 * $labDiagnostics  whether that department exists to link the banner's second
 *                  action at; without it the button would be a 404
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Facilities']],
    'title' => 'Everything Needed,',
    'strong' => 'On One Campus',
    'lead' => 'Emergency, theatre, ICU, laboratory, imaging and pharmacy sit inside the same building — so a deteriorating patient never leaves the premises to get what they need.',
    'img' => $bannerImage ?? '',
    'chips' => ['24/7 Emergency', 'Intensive care', 'Modular theatres'],
    'primary' => ['href' => base_url('contact'), 'label' => 'Plan Your Visit'],
    'ghost' => !empty($labDiagnostics)
        ? ['href' => base_url('lab-diagnostics'), 'icon' => 'fa-flask-vial', 'label' => 'Book a Test']
        : [],
    'stats' => !empty($counters),
]); ?>

<?php if (!empty($counters)): ?>
<?php App::render('site/block/stats', ['counters' => $counters, 'label' => 'The campus in numbers']); ?>
<?php endif; ?>

<?php App::render('site/block/intro', [
    'section' => 'Overview',
    'eyebrow' => 'Our Facilities',
    'title' => 'Infrastructure that <strong>keeps the clock on your side</strong>',
    'body' => [
        'Most avoidable harm in a hospital comes from waiting — for a scan, a theatre, a bed. The building is laid out to remove those gaps: Emergency opens directly onto radiology, and radiology onto the theatre corridor.',
        'A generator and water-treatment plant keep dialysis, ICU and theatre running through any outage, which in this district is not a theoretical concern.',
    ],
    'checks' => [
        'Emergency next to radiology', 'Backup power for critical areas',
        'Reverse-osmosis water plant', 'Central oxygen and suction',
        'Lifts sized for trolleys', 'Accessible on every floor',
    ],
    'img' => $introImage ?? '',
    'imgAlt' => 'A modular operating theatre at Teresa Memorial Hospital',
    'badge' => ['icon' => 'fa-bolt', 'title' => 'Never off', 'text' => 'Generator cover for ICU, theatre and dialysis.'],
]); ?>

<?php if (!empty($facilities)): ?>
<?php App::render('site/block/cards', [
    'section' => 'Facilities',
    'eyebrow' => 'What Is On Site',
    'title' => count($facilities) . ' Services <strong>Under One Roof</strong>',
    'items' => $facilities,
    'alt' => true,
]); ?>
<?php endif; ?>

<?php App::render('site/block/conditions', [
    'section' => 'Visiting',
    'id' => 'visiting',
    'title' => 'Visiting and admission, in plain terms',
    'lead' => 'Bring a photo ID, any previous reports and your insurance card. Everything below is what people most often ask at the front desk.',
    'items' => [
        'General visiting: 4 PM – 7 PM', 'ICU visiting: 11 AM & 5 PM',
        'One attendant per bed', 'Photo ID required',
        'Admission desk open 24/7', 'Insurance desk: 9 AM – 8 PM',
        'Cashless with 30+ insurers', 'Free Wi-Fi throughout',
        'Cafeteria: 7 AM – 10 PM', 'Pharmacy open 24 hours',
        'Attendant lounge on ground floor', 'Prayer room on first floor',
    ],
]); ?>

<?php App::render('site/block/cta', [
    'title' => 'Planning an admission?',
    'text' => 'Call ahead and the admission desk will have your paperwork and insurance pre-approval ready before you arrive.',
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => $callAction ?? [],
]); ?>
