<?php

/**
 * nav_items — the header, the mega menu, the four footer columns and the
 * mobile dock, all from one table split by `location`.
 *
 * There is no `status` here: a menu entry is `visible` or it is not.
 */

require_once __DIR__ . '/rows.php';

/**
 * One menu, nested. Every item carries `children`, empty where it has none.
 *
 * @param string $location header | mega | footer-1..4 | dock | mobile
 */
function nav_for_location(string $location, bool $includeHidden = false): array
{
    $raws = db_fetch_all(
        'SELECT n.*, p.public_id AS parentId
         FROM nav_items n
         LEFT JOIN nav_items p ON p.id = n.parent_id AND p.deleted_at IS NULL
         WHERE n.location = ? AND n.deleted_at IS NULL' . ($includeHidden ? '' : ' AND n.visible = 1') . '
         ORDER BY n.sort_order, n.id',
        [$location]
    );

    return nav_nest(model_rows($raws, 'nav-items'));
}

/**
 * Children under their parent, in the order they arrived.
 *
 * An item whose parent is hidden, deleted or in another menu is promoted to
 * the top rather than dropped: a link nobody can reach is worse than one in
 * the wrong place.
 */
function nav_nest(array $items): array
{
    $present = [];

    foreach ($items as $item) {
        $present[$item['id']] = true;
    }

    $roots = [];
    $children = [];

    foreach ($items as $item) {
        $parent = $item['parentId'] ?? null;

        if ($parent !== null && $parent !== $item['id'] && isset($present[$parent])) {
            $children[$parent][] = $item;
            continue;
        }

        $roots[] = $item;
    }

    /* Every item claiming a parent that is itself claimed means the menu
       points at itself in a loop. Flatten rather than render nothing. */
    if (!$roots && $items) {
        $roots = $items;
        $children = [];
    }

    return nav_attach($roots, $children, 0);
}

/** Depth is capped because a parent chain that loops would recurse until PHP stops it. */
function nav_attach(array $items, array $children, int $depth): array
{
    foreach ($items as $index => $item) {
        $kids = $children[$item['id']] ?? [];

        $items[$index]['children'] = ($kids && $depth < 4)
            ? nav_attach($kids, $children, $depth + 1)
            : [];
    }

    return $items;
}
