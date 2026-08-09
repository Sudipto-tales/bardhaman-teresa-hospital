<?php

/**
 * A consultant card.
 *
 * The site takes no bookings. A doctor who accepts appointments gets a link to
 * the contact form with themselves preselected — assets/pages.js reads the
 * ?doctor= slug — and the desk calls back. A doctor who does not gets no link
 * at all, because offering one and then refusing is worse than saying so.
 * See docs/02-content-model.md §20.
 *
 * Props
 *   doctor   array of {name, role, qualification|qual, experience_years,
 *                      photo|img, slug, appointment_enabled|appointmentEnabled}
 *   variant  string  'strip' (default) for the .pg-doc grid used on the
 *                    department, doctors and about pages; 'carousel' for the
 *                    home page's .doc__card, which is a different shape and a
 *                    different filter hook
 *   href     string  Overrides the appointment link
 */

$doctor = $doctor ?? [];
$variant = $variant ?? 'strip';

$name = $doctor['name'] ?? '';
/* The models return the public key as `id` (docs/php/02-schema.md); the
   static sources called it `slug`. Both spellings arrive here. */
$slug = $doctor['slug'] ?? $doctor['id'] ?? '';
$photo = $doctor['photo'] ?? $doctor['img'] ?? '';

/* The static sources carry the years inside the qualification string; the
   doctors table splits them. Either arrives here as one line. */
$qualification = $doctor['qual'] ?? $doctor['qualification'] ?? '';
$years = $doctor['experienceYears'] ?? $doctor['experience_years'] ?? null;
if ($qualification !== '' && $years !== null && $years !== '' && !isset($doctor['qual'])) {
    $qualification .= ' · ' . $years . ' yrs';
}

$role = $doctor['role'] ?? '';

/* There are no consultant photographs yet, and an empty frame reads as a
   broken image rather than as a card still being filled in. A row with no
   photo gets a monogram instead — the first letter of the name with the
   honorific stripped off, over the doctor's title. */
$bare = preg_replace('/^\s*(?:dr|prof|mr|mrs|ms)\.?\s+/iu', '', $name);
$initial = mb_strtoupper(mb_substr($bare !== '' ? $bare : $name, 0, 1));

$enabled = $doctor['appointmentEnabled'] ?? $doctor['appointment_enabled'] ?? $doctor['appt'] ?? true;
$canBook = $slug !== '' && !in_array($enabled, [false, 0, '0', '', null], true);
$appointment = $href ?? (base_url('contact') . '?doctor=' . rawurlencode($slug) . '#book');
?>
<?php if ($variant === 'carousel'): ?>
                    <div class="doc__card" data-specialty="<?= e($doctor['specialty'] ?? $doctor['speciality'] ?? '') ?>">
                        <div class="doc__card-img">
<?php if ($photo !== ''): ?>
                            <img src="<?= e($photo) ?>" alt="<?= e($name) ?>" loading="lazy">
<?php else: ?>
                            <div class="doc-mono" role="img" aria-label="<?= e($name) ?>">
                                <span class="doc-mono__letter" aria-hidden="true"><?= e($initial) ?></span>
<?php if ($role !== ''): ?>
                                <span class="doc-mono__title" aria-hidden="true"><?= e($role) ?></span>
<?php endif; ?>
                            </div>
<?php endif; ?>
<?php if ($canBook): ?>
                            <a href="<?= e($appointment) ?>" class="doc__book">
                                <span class="doc__book-icon"><i class="fa-solid fa-arrow-right"></i></span>
                                Book an Appointment
                            </a>
<?php endif; ?>
                        </div>
                        <div class="doc__card-info">
                            <h4><?= e($name) ?></h4>
                            <p><?= e($doctor['role'] ?? '') ?></p>
                        </div>
                    </div>
<?php else: ?>
                    <article class="pg-doc">
                        <div class="pg-doc__img img-stretch">
<?php if ($photo !== ''): ?>
                            <img src="<?= e($photo) ?>" alt="<?= e($name) ?>" loading="lazy">
<?php else: ?>
                            <div class="doc-mono doc-mono--tall" role="img" aria-label="<?= e($name) ?>">
                                <span class="doc-mono__letter" aria-hidden="true"><?= e($initial) ?></span>
<?php if ($role !== ''): ?>
                                <span class="doc-mono__title" aria-hidden="true"><?= e($role) ?></span>
<?php endif; ?>
                            </div>
<?php endif; ?>
                        </div>
                        <div class="pg-doc__body">
                            <h4><?= e($name) ?></h4>
                            <p><?= e($role) ?></p>
                            <span class="pg-doc__qual"><?= e($qualification) ?></span>
<?php if ($canBook): ?>
                            <a class="pg-doc__appt" href="<?= e($appointment) ?>">
                                <i class="fa-solid fa-calendar-check"></i> Book an appointment</a>
<?php endif; ?>
                        </div>
                    </article>
<?php endif; ?>

