<?php

/**
 * leadership — the About page's strip of who runs the hospital.
 *
 * Separate from doctors because a chairman and a head of nursing are not
 * clinicians. `linkedDoctorId` comes back as a doctor slug where the same
 * person also holds a clinic, so the card can link to their consultant page.
 */

require_once __DIR__ . '/rows.php';

/** @param string|null $category board | management | clinical-leadership */
function leadership_published(?string $category = null, bool $includeUnpublished = false): array
{
    $where = ['l.deleted_at IS NULL'];
    $params = [];

    if (!$includeUnpublished) {
        $where[] = "l.status = 'published'";
    }

    if ($category !== null && $category !== '' && $category !== 'all') {
        $where[] = 'l.category = ?';
        $params[] = $category;
    }

    $raws = db_fetch_all(
        'SELECT l.*, d.slug AS linkedDoctorId
         FROM leadership l
         LEFT JOIN doctors d ON d.id = l.linked_doctor_id AND d.deleted_at IS NULL
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY l.sort_order, l.id',
        $params
    );

    return model_rows($raws, 'leadership');
}
