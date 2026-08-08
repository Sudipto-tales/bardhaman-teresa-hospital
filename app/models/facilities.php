<?php

/**
 * facilities — the twelve cards on /facilities and the strip on the home
 * page.
 */

require_once __DIR__ . '/rows.php';

/** @param int $limit 0 for all; the home page shows the first six */
function facilities_published(int $limit = 0, bool $includeUnpublished = false): array
{
    $raws = db_fetch_all(
        'SELECT * FROM facilities
         WHERE deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'") . '
         ORDER BY sort_order, id' . model_limit($limit)
    );

    return model_rows($raws, 'facilities');
}
