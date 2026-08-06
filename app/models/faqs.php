<?php

/**
 * faqs — the accordions on the home, contact and department pages.
 *
 * `faq_group` says which accordion a question belongs to; `group` is a
 * reserved word in MySQL, and the registry maps the two.
 */

require_once __DIR__ . '/rows.php';

/** @param string $group home | contact | department */
function faqs_for_group(string $group, bool $includeUnpublished = false): array
{
    return faqs_query('f.faq_group = ?', [$group], $includeUnpublished);
}

/**
 * The questions attached to one department.
 *
 * Not filtered on `faq_group`: a question is on a department page because it
 * names that department, whichever accordion the panel filed it under.
 */
function faqs_for_department(string $slug, bool $includeUnpublished = false): array
{
    return faqs_query('d.slug = ?', [$slug], $includeUnpublished);
}

/** $condition is one of the two literals above; only $params is ever a caller's. */
function faqs_query(string $condition, array $params, bool $includeUnpublished): array
{
    $raws = db_fetch_all(
        'SELECT f.*, d.slug AS departmentId
         FROM faqs f
         LEFT JOIN departments d ON d.id = f.department_id AND d.deleted_at IS NULL
         WHERE f.deleted_at IS NULL' . ($includeUnpublished ? '' : " AND f.status = 'published'") . '
           AND ' . $condition . '
         ORDER BY f.sort_order, f.id',
        $params
    );

    return model_rows($raws, 'faqs');
}
