<?php

/**
 * departments — one row fills one public page, plus the mega menu and the
 * cards on the departments listing.
 *
 * `doctorIds` comes back as slugs. The team itself is doctors_for_department(),
 * which returns whole doctor rows; the slug list is here for the pages that
 * only need to know who, not to render them.
 */

require_once __DIR__ . '/rows.php';

function departments_published(bool $includeUnpublished = false): array
{
    $raws = db_fetch_all(
        'SELECT * FROM departments
         WHERE deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'") . '
         ORDER BY sort_order, id'
    );

    return departments_hydrate($raws);
}

/** One department, or null. */
function department_by_slug(string $slug, bool $includeUnpublished = false): ?array
{
    $raw = db_fetch_one(
        'SELECT * FROM departments
         WHERE slug = ? AND deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'"),
        [$slug]
    );

    if (!$raw) {
        return null;
    }

    return departments_hydrate([$raw])[0];
}

/**
 * The mega menu and the footer's department column.
 *
 * A deliberately narrow SELECT — the menu needs four values and a department
 * row is twenty columns of page content, most of it JSON that would be decoded
 * on every request for nothing.
 */
function departments_for_menu(): array
{
    $raws = db_fetch_all(
        "SELECT slug, name, icon, menu_note, show_in_menu, sort_order, status
         FROM departments
         WHERE deleted_at IS NULL AND status = 'published' AND show_in_menu = 1
         ORDER BY sort_order, id"
    );

    return model_rows($raws, 'departments');
}

/** Each department's team, in one query for the whole set. */
function departments_hydrate(array $raws): array
{
    if (!$raws) {
        return [];
    }

    $joins = [
        'doctorIds' => model_join_map(
            'departments',
            'doctorIds',
            model_ids($raws),
            "t.deleted_at IS NULL AND t.status = 'published'"
        ),
    ];

    return model_rows($raws, 'departments', $joins);
}
