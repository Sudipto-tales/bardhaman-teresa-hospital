<?php

/**
 * The front page.
 *
 * Every band is a `page_sections` row, so this file walks the sections the
 * controller was given rather than listing them in a fixed order — switching
 * one off in the panel drops it here, and dragging it moves it. `$sections`
 * arrives keyed by `section_key` and already sorted (page_by_slug).
 *
 * Each section's `title` is the panel's "Heading" field and is echoed raw:
 * every heading in this design carries <strong> on its emphasised half. It is
 * staff-entered, never a visitor's.
 *
 * The `contact` section is the site footer, which SiteController::page()
 * renders as chrome — the switch below has no arm for it.
 *
 * $sections     [key => row] in render order
 * $hero         the hero section's own data
 * $departments  every published department
 * $doctors      already sliced to the doctors section's limit
 * $labTests     featured tests, sliced
 * $testimonials published quotes — website.js swaps them in the quote card
 * $counters     the numbers band
 * $faqs         the accordion's questions
 * $posts        the latest articles, sliced
 * $postTotal    every published post, for the "we have N more" line
 * $doctorTabs   [slug => label] for the carousel filter
 * $phone        ['number', 'digits']
 */

$heading = static function (array $section, string $fallback): string {
    $title = trim((string) ($section['data']['title'] ?? ''));

    return $title === '' ? $fallback : $title;
};
?>
<?php foreach ($sections as $key => $section): ?>
<?php switch ($key):
    /* ============ HERO ============ */
    case 'hero': ?>
    <section class="hero" id="hero" data-section="Home">
        <div class="hero__bg hero__bg--1"></div>
        <div class="hero__bg hero__bg--2"></div>

        <div class="hero__cards">
            <div class="hero-card hero-card--main">
<?php if (($hero['eyebrow'] ?? '') !== ''): ?>
                <span class="eyebrow"><?= e($hero['eyebrow']) ?></span>
<?php endif; ?>
                <h2><?= e($hero['title'] ?? '') ?><br><?= e($hero['titleStrong'] ?? '') ?></h2>
                <p><?= e($hero['lead'] ?? '') ?></p>
<?php if (($hero['primaryLabel'] ?? '') !== ''): ?>
                <a href="<?= e(site_url($hero['primaryHref'] ?? '', base_url('contact'))) ?>" class="btn-primary">
                    <i class="fa-solid fa-arrow-right"></i> <?= e($hero['primaryLabel']) ?></a>
<?php endif; ?>
            </div>

            <div class="hero-card hero-card--img">
                <img src="<?= e($hero['image'] ?? '') ?>" alt="<?= e($hero['title'] ?? 'Teresa Memorial Hospital') ?>" loading="lazy">
            </div>

            <div class="hero-card hero-card--info">
                <p><strong>Welcome to <?= e(setting('general', 'name', 'Teresa Memorial Hospital')) ?>.</strong><br>
                    We are open <strong>24/7</strong> at your service.</p>
                <p>For online appointments or emergency service at any time.</p>
<?php
/* The secondary action is a phone number in the seed and a link in
   principle, so it goes through site_url() like any other stored href. */
$callHref = trim((string) ($hero['ghostHref'] ?? ''));
$callLabel = trim((string) ($hero['ghostLabel'] ?? ''));
?>
<?php if ($callHref !== '' || $phone['number'] !== ''): ?>
                <a href="<?= e($callHref !== '' ? site_url($callHref) : 'tel:' . $phone['digits']) ?>" class="hero-call">
                    <i class="fa-solid fa-phone"></i>
                    <?= e($callLabel !== '' ? strtoupper($callLabel) : 'CALL') ?>: <?= e($phone['number']) ?>
                </a>
<?php endif; ?>
            </div>
        </div>

        <!-- outline-only capsule, sitting low on the right -->
        <div class="hero__capsule">
            <div class="hero__capsule-ring"></div>
            <div class="hero__capsule-core">
                <button class="hero__capsule-btn" aria-label="Previous slide"><i
                        class="fa-solid fa-arrow-left"></i></button>
                <button class="hero__capsule-btn" aria-label="Next slide"><i
                        class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>

        <div class="hero__scroll">
            <span class="hero__scroll-line"></span> Scroll
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ SERVICES OVERVIEW ============
       Four signposts, not four records: they point at the pages a first-time
       visitor asks for. The panel edits the heading and the standfirst; the
       tiles themselves are navigation and belong to the design. */
    case 'services': ?>
    <section class="svc" id="services" data-section="Services" data-floaters="4">
<?php if (($section['data']['title'] ?? '') !== ''): ?>
        <div class="section-head section-head--center">
            <span class="eyebrow">How We Help</span>
            <h2><?= $section['data']['title'] ?></h2>
<?php if (($section['data']['lead'] ?? '') !== ''): ?>
            <p><?= e($section['data']['lead']) ?></p>
<?php endif; ?>
        </div>
<?php endif; ?>

        <div class="svc__grid">
            <div class="svc__card svc__card--navy">
                <div class="svc__card-head">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <h3>Visitor Information</h3>
                </div>
                <p>View all information for visitors and the terms &amp; conditions of your stay.</p>
                <a href="<?= e(base_url('facilities') . '#visiting') ?>" class="arrow-link arrow-link--cool"><i
                        class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>

            <div class="svc__card svc__card--blue">
                <div class="svc__card-head">
                    <i class="fa-solid fa-stethoscope"></i>
                    <h3>Find a Doctor</h3>
                </div>
                <p>Search our consultants by speciality, availability and department.</p>
                <a href="<?= e(base_url('doctors')) ?>" class="arrow-link arrow-link--cool"><i
                        class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>

            <div class="svc__card svc__card--crimson">
                <div class="svc__card-head">
                    <i class="fa-solid fa-truck-medical"></i>
                    <h3>Our Locations</h3>
                </div>
                <p>Find directions, parking and ward-wise access for every campus.</p>
                <a href="<?= e(base_url('contact') . '#location') ?>" class="arrow-link"><i
                        class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>

            <div class="svc__card svc__card--magenta">
                <div class="svc__card-head">
                    <i class="fa-solid fa-phone-volume"></i>
                    <h3>Connect With Us</h3>
                </div>
                <p>Reach our help desk, book a call back or start a WhatsApp chat.</p>
                <a href="<?= e(base_url('contact')) ?>" class="arrow-link"><i
                        class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ ABOUT ============ */
    case 'about': ?>
    <section class="about" id="about" data-section="About" data-floaters="3">
        <div class="about__content">
            <span class="eyebrow">About <?= e(setting('general', 'shortName', 'Teresa Memorial')) ?></span>
            <h2><?= $heading($section, 'We Provide the Finest Patient<br>Care &amp; Amenities') ?></h2>
            <p class="about__desc"><?= e($section['data']['body'] ?? '') ?></p>

            <ul class="about__features">
                <li><i class="fa-solid fa-check-double"></i> Seamless Care</li>
                <li><i class="fa-solid fa-check-double"></i> Patient-Centered Care</li>
                <li><i class="fa-solid fa-check-double"></i> Warm, Welcoming Environment</li>
                <li><i class="fa-solid fa-check-double"></i> Personalised Approach</li>
                <li><i class="fa-solid fa-check-double"></i> Comprehensive Care</li>
                <li><i class="fa-solid fa-check-double"></i> Cutting-Edge Technology</li>
                <li><i class="fa-solid fa-check-double"></i> Expert Doctors</li>
                <li><i class="fa-solid fa-check-double"></i> Positive Reviews</li>
            </ul>

            <p class="about__desc-sm">Our wards, day-care units and diagnostic suites are built around a single
                principle &mdash; the shortest possible distance between a patient and the right specialist.</p>

            <a href="<?= e(base_url('about')) ?>" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> More About Us</a>
        </div>

        <div class="about__visuals">
            <div class="about__frame">
                <div class="img-stretch about__media">
                    <img src="<?= e(($section['data']['image'] ?? '') !== '' ? $section['data']['image'] : $bannerImage) ?>"
                        alt="Inside Teresa Memorial Hospital" class="about__img" loading="lazy">
                </div>

                <div class="about__stat about__stat--tr">
                    <h4><?= e(count($departments)) ?></h4>
                    <span>DIFFERENT<br>SECTIONS</span>
                </div>

                <div class="about__stat about__stat--bl">
                    <h4>5K+</h4>
                    <span>PATIENT<br>REVIEWS</span>
                </div>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ SPECIALITIES ============
       The menu, the featured card and the conditions list are all one
       department row. initSpecialities() in website.js swaps them on click,
       reading window.TMH_SPECIALITIES — which the block below prints. The
       first department is painted server-side so the panel is not empty
       before the script runs. */
    case 'specialities':
        $spec = [];

        foreach ($departments as $department) {
            $slug = (string) ($department['id'] ?? '');

            if ($slug === '') {
                continue;
            }

            $spec[$slug] = [
                'title' => (string) ($department['name'] ?? ''),
                'img' => (string) ($department['banner'] ?? ''),
                'desc' => trim(strip_tags((string) ($department['lead'] ?? ''))),
                'href' => base_url($slug),
                'icon' => (string) ($department['icon'] ?? 'fa-hospital'),
                'procedures' => array_values(array_filter(array_map(
                    static fn (array $row): string => trim((string) ($row['title'] ?? '')),
                    (array) ($department['procedures'] ?? [])
                ))),
                'conditions' => array_values(array_filter(array_map(
                    static fn ($row): string => trim((string) (is_array($row) ? ($row['text'] ?? '') : $row)),
                    (array) ($department['conditions'] ?? [])
                ))),
            ];
        }

        $firstKey = array_key_first($spec);
        $first = $firstKey === null ? null : $spec[$firstKey];
?>
<?php if ($first !== null): ?>
    <section class="spec" id="specialities" data-section="Specialities" data-floaters="4">
        <script>window.TMH_SPECIALITIES = <?= json_encode($spec, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;</script>

        <div class="spec__header">
            <div>
                <span class="eyebrow">Centres of Excellence</span>
                <h2><?= $heading($section, 'Discover Our Top<br><strong>Specialities</strong>') ?></h2>
            </div>
            <p>Experience world-class healthcare at our specialised centres of medical excellence, where innovation
                and expert care set new standards in clinical outcomes.</p>
        </div>

        <div class="spec__grid">
            <div class="spec__menu" data-lenis-prevent>
                <ul class="spec__list" id="specialtyList" role="tablist" aria-label="Specialities">
<?php foreach ($spec as $slug => $row): $isFirst = $slug === $firstKey; ?>
                    <li<?= $isFirst ? ' class="is-active"' : '' ?> data-target="<?= e($slug) ?>" role="tab"
                        tabindex="<?= $isFirst ? '0' : '-1' ?>" aria-selected="<?= $isFirst ? 'true' : 'false' ?>">
                        <i class="fa-solid <?= e($row['icon']) ?>"></i> <?= e($row['title']) ?>
                        <i class="fa-solid fa-arrow-right-long arrow"></i>
                    </li>
<?php endforeach; ?>
                </ul>
            </div>

            <div class="spec__featured">
                <div class="spec__card">
                    <div class="spec__card-img">
                        <img id="featImage" src="<?= e($first['img']) ?>" alt="<?= e($first['title']) ?>" loading="lazy">
                        <div class="spec__card-overlay">
                            <h3 id="featTitle"><?= e($first['title']) ?></h3>
                        </div>
                    </div>

                    <div class="spec__card-body">
                        <p id="featDesc"><?= e($first['desc']) ?></p>
                        <span class="spec__proc-label">Our Procedures</span>
                        <div class="spec__proc-tags" id="featProcedures">
<?php foreach ($first['procedures'] as $procedure): ?>
                            <span class="spec__proc-tag"><?= e($procedure) ?></span>
<?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <a href="<?= e($first['href']) ?>" class="spec__btn" id="featBtn">
                    Meet Our <?= e($first['title']) ?> Experts <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>

            <div class="spec__conditions">
                <ul class="spec__cond-list" id="conditionsList" aria-label="Conditions we treat" data-lenis-prevent>
<?php foreach ($first['conditions'] as $condition): ?>
                    <li><?= e($condition) ?></li>
<?php endforeach; ?>
                </ul>
            </div>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php
    /* ============ SERVICES REVEAL (sticky video) ============
       One box per department, so a twelfth department appears here without
       anybody editing a template. */
    case 'care': ?>
    <div class="reveal-wrap" id="care" data-section="Care">
        <div class="reveal__video">
            <div class="reveal__overlay"></div>
            <!-- Swap this source for your own hospital footage when you have it.
                 If it fails to load, the poster and the section background show instead. -->
            <video autoplay muted loop playsinline class="reveal__vid"
                poster="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop">
                <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4"
                    type="video/mp4">
            </video>
        </div>

        <section class="reveal__content" data-floaters="4" data-floaters-dark>
            <div class="section-head section-head--center">
                <span class="eyebrow eyebrow--onDark">Our Services</span>
                <h2><?= $heading($section, 'We Serve in Different <strong>Areas for<br>Our Patients</strong>') ?></h2>
            </div>

            <div class="reveal__grid">
<?php foreach (array_slice($departments, 0, 8) as $department): ?>
                <div class="reveal__box">
                    <i class="fa-solid <?= e($department['icon'] ?? 'fa-hospital') ?> reveal__box-icon"></i>
                    <h4><?= e($department['name'] ?? '') ?></h4>
                    <p><?= e($department['menuNote'] ?? '') ?></p>
                    <a href="<?= e(base_url((string) ($department['id'] ?? ''))) ?>" class="reveal__more">
                        <i class="fa-solid fa-arrow-right"></i> Read More</a>
                </div>
<?php endforeach; ?>
            </div>

<?php $rest = max(0, count($departments) - 8); ?>
            <div class="reveal__foot">
                <p><?= $rest > 0
                        ? 'We have ' . e($rest) . '+ more care services including our Emergency Department.'
                        : 'Every department, and our round-the-clock Emergency.' ?>
                    <a href="<?= e(base_url('departments')) ?>">View All <i class="fa-solid fa-arrow-right"></i></a>
                </p>
            </div>
        </section>
    </div>
<?php break; ?>

<?php
    /* ============ TRACK RECORD ============
       The quote card is swapped by initTestimonials(); the block prints the
       first slide so the card is never blank, and hands the rest over on
       window.TMH_TESTIMONIALS. */
    case 'testimonials':
        $quotes = array_values(array_map(static fn (array $row): array => [
            'quote' => (string) ($row['text'] ?? ''),
            'name' => mb_strtoupper((string) ($row['name'] ?? '')),
            'role' => (string) ($row['role'] ?? ''),
            'img' => (string) ($row['photo'] ?? ''),
        ], $testimonials));
        $lead = $quotes[0] ?? null;
?>
    <section class="track" id="testimonials" data-section="Testimonials" data-floaters="3">
<?php if ($quotes): ?>
        <script>window.TMH_TESTIMONIALS = <?= json_encode($quotes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;</script>
<?php endif; ?>

        <div class="track__spring">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M20 80 C 10 50, 90 50, 80 20" stroke="currentColor" stroke-width="8" stroke-linecap="round"
                    stroke-dasharray="10 15" />
                <path d="M30 90 C 20 60, 100 60, 90 30" stroke="currentColor" stroke-width="6" stroke-linecap="round"
                    stroke-dasharray="8 12" opacity=".55" />
            </svg>
        </div>

        <div class="track__header">
            <span class="eyebrow">Your Health Is Our Top Priority</span>
            <h2><?= $heading($section, 'Our track record speaks for itself. Many individuals have chosen
                <span class="track__faded">our medical centre and have had positive, transformative
                    experiences.</span>') ?></h2>
        </div>

        <div class="track__bento">
            <div class="track__col">
                <div class="track__item track__img track__img--tall img-stretch">
                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
                        alt="Doctor consulting a patient" loading="lazy">
                </div>

                <!-- auto-advancing; content is swapped by initTestimonials() -->
                <div class="track__item track__quote" id="testimonialCard" aria-live="polite">
                    <i class="fa-solid fa-quote-left track__quote-mark"></i>
                    <p class="track__quote-text" id="tQuote"><?= e($lead['quote'] ?? '') ?></p>

                    <div class="track__quote-foot">
                        <div class="track__author">
                            <img id="tAvatar" src="<?= e($lead['img'] ?? '') ?>" alt="<?= e($lead['name'] ?? '') ?>" loading="lazy">
                            <div>
                                <h4 id="tName"><?= e($lead['name'] ?? '') ?></h4>
                                <span id="tRole"><?= e($lead['role'] ?? '') ?></span>
                            </div>
                        </div>
                        <div class="track__nav">
                            <div class="track__dots" id="tDots" role="tablist" aria-label="Choose testimonial"></div>
                            <button class="track__nav-btn" id="tPrev" aria-label="Previous testimonial"><i
                                    class="fa-solid fa-arrow-left"></i></button>
                            <button class="track__nav-btn" id="tNext" aria-label="Next testimonial"><i
                                    class="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="track__col">
                <div class="track__item track__rating">
<?= App::component('site/widget/google-rating', [
    'label' => 'AVERAGE GOOGLE RATING',
    'variant' => 'track',
    'fallback' => '4.9',
]) ?>
                </div>

                <div class="track__item track__img track__img--mid img-stretch">
                    <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop"
                        alt="Surgical team operating" loading="lazy">
                </div>

                <div class="track__item track__award">
                    <div class="track__award-icon">
                        <i class="fa-solid fa-staff-snake"></i>
                    </div>
                    <div>
                        <span class="track__award-label">NABH ACCREDITED</span>
                        <h4>Award-winning quality care,<br>independently verified</h4>
                        <a href="<?= e(base_url('about')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ WHY CHOOSE ============
       The panel calls this the numbers band and links it to the counters
       screen, so the three cards carry the hospital's own figures. */
    case 'why-us': ?>
    <section class="why" id="why" data-section="Why Us" data-floaters="3">
        <div class="why__header section-head">
            <span class="eyebrow">Why Choose <?= e(setting('general', 'shortName', 'Teresa Memorial')) ?></span>
            <h2><?= $heading($section, 'We Are Different To <strong>Protect<br>Your Health</strong>') ?></h2>
        </div>

<?php if ($counters): ?>
        <?php App::render('site/block/stats', ['counters' => $counters, 'label' => 'The hospital in numbers', 'flow' => true]); ?>
<?php endif; ?>

        <div class="why__grid">
            <div class="why__card">
                <div class="why__star">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop"
                        alt="Doctor portrait" loading="lazy">
                </div>
                <h3>Not Just Better Care,<br>But a Better Experience</h3>
                <p>We believe in providing not just better care but a better experience overall. We understand that
                    your journey to health matters as much as the destination.</p>
                <a href="<?= e(base_url('about')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>

            <div class="why__card">
                <div class="why__star">
                    <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=300&auto=format&fit=crop"
                        alt="Medical team" loading="lazy">
                </div>
                <h3>Serving All People<br>Through Exemplary Care</h3>
                <p>Every patient is treated with the same standard of clinical rigour and human warmth, regardless of
                    where they have come from.</p>
                <a href="<?= e(base_url('about')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>

            <div class="why__card">
                <div class="why__star">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop"
                        alt="Doctor examining a patient" loading="lazy">
                </div>
                <h3>Specialty Medicine with<br>Compassion and Care</h3>
                <p>Sub-speciality expertise backed by multidisciplinary review, so complex cases get more than one
                    expert opinion by default.</p>
                <a href="<?= e(base_url('departments')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ LAB FACILITIES ============ */
    case 'lab-tests': ?>
    <section class="lab" id="lab" data-section="Lab Tests" data-floaters="3">
        <div class="lab__grid">
            <div class="lab__visual">
                <div class="img-stretch" style="border-radius:var(--r-lg)">
                    <img src="<?= e(media_url('lab.jpg', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop')) ?>"
                        alt="Lab technician at work" class="lab__img" loading="lazy">
                </div>

                <div class="lab__pill">
                    <div class="lab__pill-icon">
                        <i class="fa-solid fa-award"></i>
                    </div>
                    <div class="lab__pill-text">
                        <h4>PRECISION PROFICIENCY AWARD</h4>
                        <p>Awarded to our lab for consistently achieving unparalleled precision in test results.</p>
                    </div>
                    <button class="lab__pill-btn" aria-label="Read more"><i
                            class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>

            <div class="lab__slider">
                <span class="eyebrow">Lab Test</span>
                <h2><?= $heading($section, 'We Have Lab Test Facilities<br><strong>Book Yours Today</strong>') ?></h2>
<?php if (($section['data']['lead'] ?? '') !== ''): ?>
                <p><?= e($section['data']['lead']) ?></p>
<?php endif; ?>

                <div class="lab__viewport">
                    <div class="lab__track" id="labSlider">
<?php
/* The reference cycles four accents down the row; card/lab-test takes the
   custom property name rather than choosing one itself. */
$accents = ['crimson', 'magenta', 'blue', 'navy'];
?>
<?php foreach ($labTests as $i => $test): ?>
                        <?php App::render('site/card/lab-test', [
                            'test' => $test,
                            'colour' => $accents[$i % count($accents)],
                            /* No figures on the home page — see card/lab-test */
                            'showPrice' => false,
                        ]); ?>
<?php endforeach; ?>
                    </div>
                </div>

                <div class="lab__progress">
                    <div class="lab__progress-bar" id="labProgressBar"></div>
                </div>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ DOCTORS ============
       The tabs filter on data-specialty, which card/doctor reads off the row.
       The doctors here carry departments, not a single speciality slug, so the
       card is given the one its tab matches. */
    case 'doctors': ?>
    <section class="doc" id="doctors" data-section="Doctors" data-floaters="3">
        <div class="doc__header section-head">
            <span class="eyebrow">Doctors</span>
            <h2><?= $heading($section, 'Our Expert Doctors <strong>For<br>The Patients</strong>') ?></h2>
        </div>

<?php if ($doctorTabs): ?>
        <div class="doc__tabs">
            <button class="doc__tab is-active" data-filter="all">ALL</button>
<?php foreach ($doctorTabs as $slug => $label): ?>
            <button class="doc__tab" data-filter="<?= e($slug) ?>"><?= e(mb_strtoupper($label)) ?></button>
<?php endforeach; ?>
        </div>
<?php endif; ?>

        <div class="doc__carousel">
            <button class="doc__nav" id="docPrev" aria-label="Previous doctors"><i
                    class="fa-solid fa-arrow-left"></i></button>

            <div class="doc__viewport">
                <div class="doc__track" id="docTrack">
<?php foreach ($doctors as $doctor): ?>
                    <?php App::render('site/card/doctor', [
                        'variant' => 'carousel',
                        /* data-specialty is one value and a doctor can sit in
                           several departments; the first is the one the row is
                           ordered under, which is the tab a visitor expects. */
                        'doctor' => $doctor + ['specialty' => (string) (($doctor['departments'] ?? [''])[0] ?? '')],
                    ]); ?>
<?php endforeach; ?>
                </div>
            </div>

            <button class="doc__nav" id="docNext" aria-label="Next doctors"><i
                    class="fa-solid fa-arrow-right"></i></button>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ FAQ ============ */
    case 'faq': ?>
<?php if ($faqs): ?>
    <section class="faq" id="faq" data-section="FAQ" data-floaters="3">
        <div class="faq__grid">
            <div class="img-stretch" style="border-radius:var(--r-lg)">
                <img src="<?= e(media_url('team.jpg', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop')) ?>"
                    alt="Medical team smiling" class="faq__img" loading="lazy">
            </div>

            <div class="faq__content">
                <span class="eyebrow">FAQ</span>
                <h2><?= $heading($section, 'We Are Here <strong>To Answer Your<br>Questions</strong>') ?></h2>

                <?php App::render('site/widget/faq-accordion', ['faqs' => $faqs]); ?>
            </div>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php
    /* ============ BLOG ============ */
    case 'articles': ?>
<?php if ($posts): ?>
    <section class="blog" id="blog" data-section="Articles" data-floaters="3">
        <div class="blog__header section-head">
            <span class="eyebrow">Blog &amp; Articles</span>
            <h2><?= $heading($section, 'Read Top Articles From<br><strong>Expert Doctors</strong>') ?></h2>
        </div>

        <div class="blog__grid">
<?php foreach ($posts as $post): ?>
            <?php App::render('site/card/blog', ['post' => $post]); ?>
<?php endforeach; ?>
        </div>

<?php $more = max(0, $postTotal - count($posts)); ?>
        <div class="blog__footer">
            <a href="<?= e(base_url('blog')) ?>" class="blog__viewall">
                <?= $more > 0 ? 'We have ' . e($more) . ' more articles.' : 'Every article we have published.' ?>
                <span>View All <i class="fa-solid fa-arrow-right"></i></span>
            </a>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php endswitch; ?>
<?php endforeach; ?>
