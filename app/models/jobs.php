<?php

/**
 * jobs — the careers listing and one page per vacancy.
 *
 * A vacancy closes by going `hidden`, never by being deleted, because the
 * applications attached to it still have to be readable. `closes_at` is
 * printed, not enforced: a posting past its date stays up until somebody
 * hides it, and the panel is where that decision belongs.
 */

require_once __DIR__ . '/rows.php';

/**
 * @param array $opts dept, type, limit, sort (a key config/resources.php
 *                    allows), direction
 */
function jobs_open(array $opts = [], bool $includeUnpublished = false): array
{
    $where = ['deleted_at IS NULL'];
    $params = [];

    if (!$includeUnpublished) {
        $where[] = "status = 'published'";
    }

    if (!empty($opts['dept'])) {
        $where[] = 'dept = ?';
        $params[] = (string) $opts['dept'];
    }

    if (!empty($opts['type'])) {
        $where[] = 'type = ?';
        $params[] = (string) $opts['type'];
    }

    $raws = db_fetch_all(
        'SELECT * FROM jobs WHERE ' . implode(' AND ', $where)
        . ' ORDER BY ' . model_order('jobs', $opts['sort'] ?? null, $opts['direction'] ?? null, 'sort_order ASC')
        . ', id' . model_limit((int) ($opts['limit'] ?? 0)),
        $params
    );

    return model_rows($raws, 'jobs');
}

/** One vacancy, or null. */
function job_by_slug(string $slug, bool $includeUnpublished = false): ?array
{
    $raw = db_fetch_one(
        'SELECT * FROM jobs
         WHERE slug = ? AND deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'"),
        [$slug]
    );

    return model_row($raw, 'jobs');
}
