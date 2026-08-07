<?php

/**
 * The contact page.
 *
 * Four bands, each a `page_sections` row, so the switch walks the sections it
 * was given rather than listing them itself. The tiles, the aside and the map
 * are this page's own markup — no other page has them, which is why they were
 * never made components (docs/php/PROGRESS.md, 6.1).
 *
 * The anchors matter as much as the markup: the header's Emergency link goes
 * to `#emergency`, and every doctor card on the site goes to `#book`. Both ids
 * live in this file.
 *
 * $sections     [key => row] in render order
 * $reachUs      the tiles' heading and lead
 * $appointment  the form section — headings, which questions to ask, the
 *               confirmation line
 * $location     the map section's heading
 * $cta          the closing band
 * $departments  every published department, for the form's select
 * $doctors      only those who accept appointments
 * $selectedDoctor / $selectedDepartment  what ?doctor= resolved to
 * $csrf         the token POST api/public/enquiry checks
 * $action       where the form posts
 * $phone        ['number', 'digits'] — reception
 * $emergency    same shape — the emergency line, or reception without one
 * $email        the address the header shows
 * $whatsapp     digits only, for the wa.me link
 * $address      the address lines, as the settings screen has them
 * $hours        [{label, value}] — opening hours, days already collapsed
 * $mapQuery     what the map iframe searches for
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Contact']],
    'title' => 'Book, Ask,',
    'strong' => 'Or Just Come In',
    'lead' => 'Appointments are confirmed the same day. Emergencies need no appointment at all &mdash; the department is staffed every hour of the year.',
    'img' => $bannerImage ?? '',
    'chips' => ['Same-day confirmation', 'Emergency 24/7', 'Cashless with 30+ insurers'],
    'primary' => ['href' => '#book', 'label' => 'Book an Appointment'],
    'ghost' => ($phone['number'] ?? '') !== ''
        ? ['href' => 'tel:' . $phone['digits'], 'icon' => 'fa-phone', 'label' => $phone['number']]
        : [],
]); ?>

<?php foreach ($sections as $key => $section): ?>
<?php switch ($key):
    /* ============ REACH US ============ */
    case 'reach-us': ?>
    <section class="pg-section" data-section="Reach Us">
        <div class="pg-wrap">
            <div class="ct-tiles">
<?php if (!empty($address)): ?>
                <article class="ct-tile">
                    <span class="ct-tile__icon"><i class="fa-solid fa-location-dot"></i></span>
                    <h3>Visit Us</h3>
                    <p><?= implode('<br>', array_map('e', array_slice($address, 1) ?: $address)) ?></p>
                    <a href="#map"><i class="fa-solid fa-arrow-right"></i> See on the map</a>
                </article>
<?php endif; ?>

<?php if (($phone['number'] ?? '') !== ''): ?>
                <article class="ct-tile">
                    <span class="ct-tile__icon"><i class="fa-solid fa-phone"></i></span>
                    <h3>Call Us</h3>
                    <p>Reception and appointments, 8 AM &ndash; 9 PM.</p>
                    <a href="tel:<?= e($phone['digits']) ?>" translate="no"><?= e($phone['number']) ?></a>
                </article>
<?php endif; ?>

<?php if (($email ?? '') !== ''): ?>
                <article class="ct-tile">
                    <span class="ct-tile__icon"><i class="fa-solid fa-envelope"></i></span>
                    <h3>Email Us</h3>
                    <p>General enquiries answered within one working day.</p>
                    <a href="mailto:<?= e($email) ?>"><?= e($email) ?></a>
                </article>
<?php endif; ?>

<?php if (($whatsapp ?? '') !== ''): ?>
                <article class="ct-tile">
                    <span class="ct-tile__icon"><i class="fa-brands fa-whatsapp"></i></span>
                    <h3>WhatsApp</h3>
                    <p>Reports, prescriptions and appointment changes.</p>
                    <a href="https://wa.me/<?= e($whatsapp) ?><?= ($whatsappMessage ?? '') !== '' ? '?text=' . rawurlencode($whatsappMessage) : '' ?>"
                        target="_blank" rel="noopener">Message us</a>
                </article>
<?php endif; ?>
            </div>
        </div>
    </section>
<?php break; ?>

<?php /* ============ APPOINTMENT ============ */
    case 'appointment': ?>
    <section class="pg-section pg-section--alt" id="book" data-section="Appointment">
        <div class="pg-wrap">
            <div class="ct-split">
<?php App::render('site/form/enquiry', [
    'action' => $action ?? '',
    'csrf' => $csrf ?? '',
    'source' => 'appointment',
    'departments' => $departments ?? [],
    'doctors' => $doctors ?? [],
    'selectedDepartment' => $selectedDepartment ?? '',
    'selectedDoctor' => $selectedDoctor ?? '',
    'eyebrow' => 'Appointments',
    /* raw: the heading carries <strong> on its emphasised half */
    'heading' => trim((string) ($appointment['title'] ?? '')) !== ''
        ? e($appointment['title'])
        : 'Request An <strong>Appointment</strong>',
    'lead' => (string) ($appointment['lead'] ?? 'Send this and the desk will call you back to confirm a slot, usually within the hour.'),
    'note' => (string) ($appointment['confirmation'] ?? 'Thank you — the desk will call you shortly.'),
    /* The panel's Appointment section has a switch per question. */
    'ask' => [
        'department' => !isset($appointment['askDepartment']) || (bool) $appointment['askDepartment'],
        'doctor' => !isset($appointment['askDoctor']) || (bool) $appointment['askDoctor'],
        'date' => !isset($appointment['askDate']) || (bool) $appointment['askDate'],
        'reason' => !isset($appointment['askReason']) || (bool) $appointment['askReason'],
    ],
]); ?>

                <aside class="ct-aside">
<?php if (!empty($hours)): ?>
                    <div class="ct-panel">
                        <h3>Opening Hours</h3>
                        <ul class="ct-hours">
                            <li><span>Emergency</span> <strong>24 hours</strong></li>
<?php foreach ($hours as $row): ?>
                            <!-- raw: openingHours() joins a range with &ndash; -->
                            <li><span>OPD &mdash; <?= $row['label'] ?? '' ?></span> <strong><?= $row['value'] ?? '' ?></strong></li>
<?php endforeach; ?>
                        </ul>
                    </div>
<?php endif; ?>

                    <div class="ct-emergency" id="emergency">
                        <h3>Emergency &amp; Ambulance</h3>
                        <p>Do not wait for an appointment and do not drive yourself. Call and an ambulance is
                            dispatched immediately.</p>
<?php if (($emergency['number'] ?? '') !== ''): ?>
                        <a class="ct-emergency__num" href="tel:<?= e($emergency['digits']) ?>" translate="no"><i
                                class="fa-solid fa-truck-medical"></i> <?= e($emergency['number']) ?></a>
<?php endif; ?>
                    </div>
                </aside>
            </div>
        </div>
    </section>
<?php break; ?>

<?php /* ============ LOCATION ============ */
    case 'location': ?>
    <section class="pg-section" id="map" data-section="Location">
        <div class="pg-wrap">
            <div class="section-head section-head--center">
                <span class="eyebrow">Find Us</span>
                <!-- raw: section headings carry <strong> on the emphasised half -->
                <h2><?= trim((string) ($location['title'] ?? '')) !== ''
                    ? e($location['title'])
                    : 'On G.T. Road, <strong>Bardhaman</strong>' ?></h2>
            </div>

            <div class="ct-map" style="margin-top:clamp(24px,3vw,40px)">
                <iframe src="https://www.google.com/maps?q=<?= e(rawurlencode($mapQuery ?? '')) ?>&amp;output=embed"
                    title="Map to <?= e($address[0] ?? 'the hospital') ?>" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                <div class="ct-map__card">
                    <h4><?= e($address[0] ?? '') ?></h4>
                    <p><?= implode(', ', array_map('e', array_slice($address ?? [], 1))) ?></p>
                    <p>Parking on site &middot; Ambulance bay at the north gate</p>
                </div>
            </div>
        </div>
    </section>
<?php break; ?>

<?php /* ============ CLOSING BAND ============ */
    case 'cta': ?>
<?php App::render('site/block/cta', [
    'title' => (string) ($cta['title'] ?? 'Still not sure who to ask for?'),
    'text' => (string) ($cta['body'] ?? 'Describe the symptom on the phone. The duty physician will route you to the right clinic — that is the desk’s job, not yours.'),
    'primary' => ['href' => '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => ($emergency['number'] ?? '') !== ''
        ? ['href' => 'tel:' . $emergency['digits'], 'label' => $emergency['number'], 'icon' => 'fa-phone']
        : [],
]); ?>
<?php break; ?>
<?php endswitch; ?>
<?php endforeach; ?>
