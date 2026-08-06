<?php

/**
 * counters — every animated number on the site, so "210 beds" is one row
 * wherever it appears (docs/02-content-model.md §13).
 *
 * The table has no `status` column: a counter is either in a scope or it is
 * not. Only `deleted_at` filters here.
 */

require_once __DIR__ . '/rows.php';

/**
 * @param string|string[] $scope global | home | about | department. The home
 *                        page's numbers band asks for global and home at once,
 *                        which is one query rather than two.
 */
function counters_for_scope(string|array $scope, int $limit = 0): array
{
    $scopes = array_values(array_filter(array_map('strval', (array) $scope)));

    if (!$scopes) {
        return [];
    }

    $placeholders = implode(', ', array_fill(0, count($scopes), '?'));

    $raws = db_fetch_all(
        "SELECT c.*, d.slug AS departmentId
         FROM counters c
         LEFT JOIN departments d ON d.id = c.department_id AND d.deleted_at IS NULL
         WHERE c.scope IN ({$placeholders}) AND c.deleted_at IS NULL
         ORDER BY c.sort_order, c.id" . model_limit($limit),
        $scopes
    );

    return model_rows($raws, 'counters');
}

/** The stat strip on one department page. */
function counters_for_department(string $slug, int $limit = 0): array
{
    $raws = db_fetch_all(
        "SELECT c.*, d.slug AS departmentId
         FROM counters c
         JOIN departments d ON d.id = c.department_id AND d.deleted_at IS NULL
         WHERE d.slug = ? AND c.scope = 'department' AND c.deleted_at IS NULL
         ORDER BY c.sort_order, c.id" . model_limit($limit),
        [$slug]
    );

    return model_rows($raws, 'counters');
}
