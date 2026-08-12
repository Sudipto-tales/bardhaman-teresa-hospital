<?php

/**
 * doctors — the consultant roster, and the team strip on every department
 * page.
 *
 * Rows carry `departments` as an array of department slugs. Names for those
 * slugs come from model_label_map('departments'), which is one query for the
 * whole request rather than a lookup per card.
 */

require_once __DIR__ . '/rows.php';

/**
 * The roster, in the order the panel arranged it.
 *
 * @param int  $limit               0 for all; the home page strip asks for six
 * @param bool $includeUnpublished  panel only — a draft doctor is not a doctor
 */
function doctors_published(int $limit = 0, bool $includeUnpublished = false): array
{
    $raws = db_fetch_all(
        'SELECT * FROM doctors
         WHERE deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'") . '
         ORDER BY sort_order, id' . model_limit($limit)
    );

    return doctors_hydrate($raws);
}

/** One doctor, or null for a slug nobody has. */
function doctor_by_slug(string $slug, bool $includeUnpublished = false): ?array
{
    $raw = db_fetch_one(
        'SELECT * FROM doctors
         WHERE slug = ? AND deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'"),
        [$slug]
    );

    if (!$raw) {
        return null;
    }

    return doctors_hydrate([$raw])[0];
}

/**
 * The team of one department.
 *
 * Ordered by the join row first, so a department that has dragged its team
 * into a deliberate order keeps it, and by the doctor's own position where it
 * has not.
 */
function doctors_for_department(string $slug, int $limit = 0): array
{
    $raws = db_fetch_all(
        "SELECT d.*
         FROM doctors d
         JOIN department_doctors dd ON dd.doctor_id = d.id
         JOIN departments dept ON dept.id = dd.department_id AND dept.deleted_at IS NULL
         WHERE dept.slug = ? AND d.deleted_at IS NULL AND d.status = 'published'
         ORDER BY dd.sort_order, d.sort_order, d.id" . model_limit($limit),
        [$slug]
    );

    return doctors_hydrate($raws);
}

/**
 * Consultants flagged as leadership.
 *
 * Not the same list as leadership_published(): that table holds a chairman and
 * a head of nursing, who are not clinicians. This is the clinical half.
 */
function doctors_leadership(int $limit = 0): array
{
    $raws = db_fetch_all(
        "SELECT * FROM doctors
         WHERE is_leadership = 1 AND deleted_at IS NULL AND status = 'published'
         ORDER BY sort_order, id" . model_limit($limit)
    );

    return doctors_hydrate($raws);
}

/**
 * The degree tokens inside a qualification line, for the doctors page filter.
 *
 * A whitelist rather than a split on the commas: the column also carries
 * fellowships and teaching posts — "Fellowship in Spine Surgery", "Asst
 * Professor in Medinipore Medical College" — which are not degrees and would
 * each become a filter option matching exactly one doctor.
 *
 * Matching is word-bounded, so MS does not fire on MSc and MD does not fire on
 * MDS.
 */
function doctor_degrees(?string $qualification): array
{
    $qualification = (string) $qualification;
    if ($qualification === '') {
        return [];
    }

    $found = [];
    foreach (['MBBS', 'MD', 'MS', 'MCh', 'DM', 'DNB', 'MDS', 'MPT', 'MSc', 'PhD', 'DGO', 'DCH', 'FRCP'] as $degree) {
        if (preg_match('/\b' . preg_quote($degree, '/') . '\b/i', $qualification)) {
            $found[] = $degree;
        }
    }

    return $found;
}

/**
 * Attach each doctor's departments in one query for the whole set.
 *
 * A draft or deleted department is left out: it has no page for the chip to
 * link to.
 */
function doctors_hydrate(array $raws): array
{
    if (!$raws) {
        return [];
    }

    $joins = [
        'departments' => model_join_map(
            'doctors',
            'departments',
            model_ids($raws),
            "t.deleted_at IS NULL AND t.status = 'published'"
        ),
    ];

    return model_rows($raws, 'doctors', $joins);
}
