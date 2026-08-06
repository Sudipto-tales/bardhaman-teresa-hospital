<?php

/**
 * testimonials — the quote carousel.
 *
 * `status = draft` is the moderation queue, so the published filter here is
 * the only thing standing between a submitted quote and the home page.
 */

require_once __DIR__ . '/rows.php';

/**
 * @param array $opts department slug, featured bool, source, limit
 */
function testimonials_published(array $opts = [], bool $includeUnpublished = false): array
{
    $where = ['t.deleted_at IS NULL'];
    $params = [];

    if (!$includeUnpublished) {
        $where[] = "t.status = 'published'";
    }

    if (!empty($opts['department'])) {
        $where[] = 'd.slug = ?';
        $params[] = (string) $opts['department'];
    }

    if (isset($opts['featured'])) {
        $where[] = 't.featured = ?';
        $params[] = $opts['featured'] ? 1 : 0;
    }

    if (!empty($opts['source'])) {
        $where[] = 't.source = ?';
        $params[] = (string) $opts['source'];
    }

    $raws = db_fetch_all(
        'SELECT t.*, d.slug AS departmentId
         FROM testimonials t
         LEFT JOIN departments d ON d.id = t.department_id AND d.deleted_at IS NULL
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY t.sort_order, t.id' . model_limit((int) ($opts['limit'] ?? 0)),
        $params
    );

    return model_rows($raws, 'testimonials');
}
