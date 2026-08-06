<?php

/**
 * redirects — what keeps /doctors.html alive after the conversion.
 *
 * The one write in this directory. `hits` is incremented on a match, because a
 * redirect nobody has followed in a year is one that can be retired, and the
 * panel's list is unreadable without it. Nothing else here writes anything.
 */

require_once __DIR__ . '/rows.php';

/**
 * The redirect for a request path, or null.
 *
 * @param bool $countHit false when resolving a path for any reason other than
 *                       actually serving the redirect
 */
function redirect_for_path(string $path, bool $countHit = true): ?array
{
    $path = redirect_normalise_path($path);

    if ($path === '') {
        return null;
    }

    /* Stored paths are inconsistent about the trailing slash — they were typed
       by hand — so both forms are matched rather than the table being tidied
       under whoever edits it next. */
    $raw = db_fetch_one(
        'SELECT * FROM redirects
         WHERE (from_path = ? OR from_path = ?) AND active = 1 AND deleted_at IS NULL
         ORDER BY sort_order, id',
        [$path, $path . '/']
    );

    $redirect = model_row($raw, 'redirects');

    if ($redirect === null) {
        return null;
    }

    if ($countHit) {
        db_execute('UPDATE redirects SET hits = hits + 1 WHERE id = ?', [(int) $raw['id']]);
        $redirect['hits']++;
    }

    return $redirect;
}

/** A request path in the form the table stores: leading slash, no query, no trailing slash. */
function redirect_normalise_path(string $path): string
{
    $path = explode('?', trim($path), 2)[0];
    $path = explode('#', $path, 2)[0];

    if ($path === '') {
        return '';
    }

    if ($path[0] !== '/') {
        $path = '/' . $path;
    }

    return $path === '/' ? '/' : rtrim($path, '/');
}
