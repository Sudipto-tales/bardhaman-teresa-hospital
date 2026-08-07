<?php

/**
 * media — the picture behind a page that has nowhere else to store one.
 *
 * Most images on this site arrive on the record that needs them: a department
 * carries its own banner, a post its own cover. The four listing pages have no
 * `page_sections` row at all (docs/02-content-model.md), so their banner and
 * intro photographs would otherwise be URLs typed into a template — which is
 * the repeated find-and-replace this conversion exists to end.
 *
 * So a template names the file, and the row behind that name supplies the URL
 * and the alt text. Replacing the photograph on the facilities page becomes
 * editing one media record in the panel.
 *
 * Lookup is by `public_id` first and `filename` second, because a template
 * reads better naming `theatre.jpg` than `med-003`, and because the panel
 * shows the filename. A renamed file falls back to the page's default rather
 * than rendering an empty <img>.
 */

require_once __DIR__ . '/rows.php';

/**
 * Every media row this request has asked for, keyed both ways.
 *
 * One query. The facilities page wants two pictures and the about page four,
 * and a query per picture is a query per picture on every page load.
 */
function media_index(): array
{
    static $index = null;

    if ($index !== null) {
        return $index;
    }

    $index = [];

    foreach (db_fetch_all('SELECT public_id, filename, url, alt FROM media WHERE deleted_at IS NULL') as $row) {
        $entry = [
            'url' => (string) $row['url'],
            'alt' => (string) ($row['alt'] ?? ''),
        ];

        $index[(string) $row['public_id']] = $entry;

        /* Filenames are not unique the way public ids are. First wins, so a
           later upload of the same name cannot silently take over the page
           that was already using one. */
        $index['file:' . strtolower((string) $row['filename'])] ??= $entry;
    }

    return $index;
}

/** One row, by public id or filename. */
function media_row(string $key): ?array
{
    $index = media_index();

    return $index[$key] ?? $index['file:' . strtolower($key)] ?? null;
}

/**
 * media_url('theatre.jpg') — the URL, or the fallback where there is no row.
 *
 * Stored URLs are absolute for the seeded library and root-relative for
 * anything uploaded, so both go through site_url().
 */
function media_url(string $key, string $fallback = ''): string
{
    $row = media_row($key);

    return $row === null ? $fallback : site_url($row['url'], $fallback);
}

/** The alt text on that row. Empty is a valid answer for a decorative image. */
function media_alt(string $key, string $fallback = ''): string
{
    $row = media_row($key);

    return $row === null || $row['alt'] === '' ? $fallback : $row['alt'];
}
