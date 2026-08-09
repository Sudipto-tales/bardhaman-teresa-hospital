<?php

/**
 * gallery — the tiles on /gallery.
 *
 * Photos, uploaded clips and YouTube embeds in one ordered list; the page
 * filters between them in the browser rather than re-querying, so this returns
 * the whole published set and the album list beside it.
 */

require_once __DIR__ . '/rows.php';

/**
 * @param string $album '' for every album
 * @param int    $limit 0 for all
 */
function gallery_published(string $album = '', int $limit = 0, bool $includeUnpublished = false): array
{
    $sql = 'SELECT * FROM gallery WHERE deleted_at IS NULL';
    $args = [];

    if (!$includeUnpublished) {
        $sql .= " AND status = 'published'";
    }

    if ($album !== '') {
        $sql .= ' AND album = ?';
        $args[] = $album;
    }

    $raws = db_fetch_all($sql . ' ORDER BY sort_order, id' . model_limit($limit), $args);

    return model_rows($raws, 'gallery');
}

/**
 * The album names, in the order their first item appears.
 *
 * Not alphabetical and not a GROUP BY: the chips on the page read left to
 * right in the same sequence as the grid below them, so an editor who drags a
 * new album to the top has moved its chip too. A row with no album is not a
 * chip — it lands under "All" and nowhere else.
 *
 * @return string[]
 */
function gallery_albums(array $items): array
{
    $albums = [];

    foreach ($items as $item) {
        $album = trim((string) ($item['album'] ?? ''));

        if ($album !== '' && !in_array($album, $albums, true)) {
            $albums[] = $album;
        }
    }

    return $albums;
}
