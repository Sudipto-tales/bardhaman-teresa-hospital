<?php

/**
 * The doctors listing's search bar and filter row.
 *
 * Every option is derived from the rows on the page, never hardcoded: a
 * department with nobody in it is not offered, and a degree nobody holds is
 * not offered either. Counts come from the same pass, so the menu says how
 * many each option will leave you with before you pick it.
 *
 * The filtering itself is client side — assets/pages.js §initDoctorFilter —
 * because the whole roster is already in the page and a round trip per
 * keystroke would be slower and would lose the scroll position.
 *
 * Props
 *   doctors  array  The same rows the grid below is rendering
 */

$doctors = $doctors ?? [];

$departments = [];   /* slug => ['name' => …, 'count' => …] */
$degrees = [];       /* token => count */
$bookable = 0;

/* `departments` on a doctor row is an array of slugs — doctors_hydrate() —
   so the names come from the request's one label map. */
$departmentLabels = model_label_map('departments');

foreach ($doctors as $doctor) {
    foreach ($doctor['departments'] ?? [] as $department) {
        $slug = is_array($department)
            ? (string) ($department['slug'] ?? $department['id'] ?? '')
            : (string) $department;
        if ($slug === '') {
            continue;
        }
        $departments[$slug] ??= ['name' => $departmentLabels[$slug] ?? $slug, 'count' => 0];
        $departments[$slug]['count']++;
    }

    foreach (doctor_degrees($doctor['qualification'] ?? $doctor['qual'] ?? '') as $degree) {
        $degrees[$degree] = ($degrees[$degree] ?? 0) + 1;
    }

    $enabled = $doctor['appointmentEnabled'] ?? $doctor['appointment_enabled'] ?? true;
    if (!in_array($enabled, [false, 0, '0', '', null], true)) {
        $bookable++;
    }
}

uasort($departments, static fn ($a, $b) => strcasecmp($a['name'], $b['name']));

/* A degree two people hold is a filter that empties the page for a rounding
   error. Three is the floor. */
$degrees = array_filter($degrees, static fn ($count) => $count >= 3);

$filters = [
    [
        'key' => 'dept',
        'icon' => 'fa-stethoscope',
        'label' => 'Department',
        'all' => 'All departments',
        'options' => array_map(
            static fn ($slug, $row) => ['value' => $slug, 'label' => $row['name'], 'count' => $row['count']],
            array_keys($departments),
            $departments
        ),
    ],
    [
        'key' => 'degree',
        'icon' => 'fa-graduation-cap',
        'label' => 'Qualification',
        'all' => 'Any qualification',
        'options' => array_map(
            static fn ($token, $count) => ['value' => $token, 'label' => $token, 'count' => $count],
            array_keys($degrees),
            $degrees
        ),
    ],
    [
        'key' => 'book',
        'icon' => 'fa-calendar-check',
        'label' => 'Availability',
        'all' => 'Everyone',
        'options' => [
            ['value' => '1', 'label' => 'Takes appointments', 'count' => $bookable],
        ],
    ],
];
?>
                <div class="dfind" data-doc-find>
                    <div class="dfind__search">
                        <i class="fa-solid fa-magnifying-glass dfind__icon" aria-hidden="true"></i>
                        <input type="search" class="dfind__input" id="docFindQ" autocomplete="off"
                            placeholder="Search by name, speciality or department"
                            aria-label="Search doctors by name, speciality or department" data-find-q>
                        <button type="button" class="dfind__clear" data-find-clear aria-label="Clear search" hidden>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="dfind__row">
<?php foreach ($filters as $filter): ?>
<?php if (!$filter['options']) { continue; } ?>
                        <div class="dfind__sel" data-find-sel="<?= e($filter['key']) ?>">
                            <button type="button" class="dfind__pill" aria-expanded="false" aria-haspopup="true">
                                <i class="fa-solid <?= e($filter['icon']) ?>" aria-hidden="true"></i>
                                <span class="dfind__pill-txt">
                                    <span class="dfind__pill-key"><?= e($filter['label']) ?></span>
                                    <span class="dfind__pill-val" data-find-val><?= e($filter['all']) ?></span>
                                </span>
                                <i class="fa-solid fa-chevron-down dfind__chev" aria-hidden="true"></i>
                            </button>
                            <div class="dfind__menu" role="menu">
                                <button type="button" role="menuitemradio" aria-checked="true" class="is-on" data-value="">
                                    <?= e($filter['all']) ?>
                                </button>
<?php foreach ($filter['options'] as $option): ?>
                                <button type="button" role="menuitemradio" aria-checked="false" data-value="<?= e($option['value']) ?>">
                                    <?= e($option['label']) ?> <span><?= (int) $option['count'] ?></span>
                                </button>
<?php endforeach; ?>
                            </div>
                        </div>
<?php endforeach; ?>

                        <button type="button" class="dfind__reset" data-find-reset>
                            <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset
                        </button>
                    </div>

                    <p class="dfind__count" data-find-count aria-live="polite"><?= count($doctors) ?> consultants</p>
                </div>
