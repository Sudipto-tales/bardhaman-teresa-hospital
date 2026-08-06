<?php

/**
 * lab_tests — individual tests and health packages, one table split by
 * `category`. A package is a test with something in `includes`.
 */

require_once __DIR__ . '/rows.php';

/**
 * @param string|null $category 'test' or 'package'; null for both, which is
 *                              how the price list renders them
 */
function lab_tests_published(?string $category = null, bool $includeUnpublished = false): array
{
    $where = ['deleted_at IS NULL'];
    $params = [];

    if (!$includeUnpublished) {
        $where[] = "status = 'published'";
    }

    if ($category !== null) {
        $where[] = 'category = ?';
        $params[] = $category;
    }

    $raws = db_fetch_all(
        'SELECT * FROM lab_tests WHERE ' . implode(' AND ', $where) . ' ORDER BY sort_order, id',
        $params
    );

    return model_rows($raws, 'lab-tests');
}

/** The block on the home page. */
function lab_tests_featured(int $limit = 0): array
{
    $raws = db_fetch_all(
        "SELECT * FROM lab_tests
         WHERE featured = 1 AND deleted_at IS NULL AND status = 'published'
         ORDER BY sort_order, id" . model_limit($limit)
    );

    return model_rows($raws, 'lab-tests');
}
