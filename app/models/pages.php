<?php

/**
 * pages + page_sections — the eight fixed public pages and the blocks each is
 * built from.
 *
 * This is not a block builder. Every page has a known layout and a
 * purpose-built editor screen; `section_key` is what ties a stored row to the
 * component that renders it, which is why the sections come back keyed by it
 * rather than as a list. A template asks for the section it draws, never for
 * the fourth one.
 */

require_once __DIR__ . '/rows.php';

/**
 * One page with its sections, or null.
 *
 * $includeUnpublished covers both halves: a panel preview wants the disabled
 * sections too, and a public render must never see either.
 */
function page_by_slug(string $slug, bool $includeUnpublished = false): ?array
{
    $raw = db_fetch_one(
        'SELECT * FROM pages
         WHERE slug = ? AND deleted_at IS NULL' . ($includeUnpublished ? '' : " AND status = 'published'"),
        [$slug]
    );

    $page = model_row($raw, 'pages');

    if ($page === null) {
        return null;
    }

    $sections = db_fetch_all(
        'SELECT * FROM page_sections
         WHERE page_id = ? AND deleted_at IS NULL' . ($includeUnpublished ? '' : ' AND enabled = 1') . '
         ORDER BY sort_order, id',
        [(int) $raw['id']]
    );

    $page['sections'] = [];

    foreach (model_rows($sections, 'page-sections') as $section) {
        $page['sections'][$section['key']] = $section;
    }

    return $page;
}

/** One section of a page, or null where it is missing or switched off. */
function page_section(?array $page, string $key): ?array
{
    return $page['sections'][$key] ?? null;
}

/**
 * The `data` blob of one section, or [].
 *
 * What a template actually wants, and safe on a page that does not exist —
 * a section removed from the panel should cost that block, not the render.
 */
function page_section_data(?array $page, string $key): array
{
    return $page['sections'][$key]['data'] ?? [];
}
