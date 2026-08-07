<?php

/**
 * Stored paths → URLs on this site.
 *
 * The panel stores links as a person typed them, and what a person typed was
 * usually one of the design's filenames: `contact.html` in the cookie policy
 * field, `website.html` in a nav item, `../../assets/logo-teresa.png` in the
 * logo field — that last one relative to `html/admin/`, where it was picked.
 * None of those resolve on the live site, which serves `/contact`, `/` and
 * `/assets/logo-teresa.png`.
 *
 * Rewriting the rows is 6.4 and only fixes the rows that exist today; a person
 * types `contact.html` again next week. So the translation lives here, at the
 * moment a stored value becomes an href, and the rows are tidied separately.
 *
 * Nothing here guesses. A path that is already absolute, already a scheme, or
 * already an anchor is returned untouched — the one thing worse than a stale
 * link is a helper that mangles a working one.
 */

/** Filenames the design used that are now routes. Everything else keeps its stem. */
const SITE_PAGE_ROUTES = [
    'website' => '/',
    'index' => '/',
    'blog-post' => 'blog',
    'job' => 'careers',
];

/**
 * site_url('contact.html')       → https://host/contact
 * site_url('cardiology.html#x')  → https://host/cardiology#x
 * site_url('../../assets/a.png') → https://host/assets/a.png
 * site_url('https://x.test/a')   → unchanged
 * site_url('#book')              → unchanged
 */
function site_url(?string $stored, string $fallback = ''): string
{
    $value = trim((string) ($stored ?? ''));

    if ($value === '') {
        return $fallback;
    }

    /* Absolute, a scheme of its own (mailto:, tel:, wa.me via https) or an
       anchor on the current page — all already final. */
    if (preg_match('#^([a-z][a-z0-9+.-]*:|//|\#)#i', $value)) {
        return $value;
    }

    /* `../../assets/x.png` was written from inside html/admin/. Every leading
       traversal is dropped rather than resolved: there is nothing above the
       document root to resolve to, and the remainder is always a path from it. */
    $value = preg_replace('#^(?:\.\./)+#', '', $value) ?? $value;
    $value = ltrim($value, '/');

    if ($value === '') {
        return base_url('/');
    }

    /* Split the fragment and query off before touching the extension, so
       `contact.html#book` keeps its anchor. */
    $suffix = '';

    if (($cut = strcspn($value, '?#')) < strlen($value)) {
        $suffix = substr($value, $cut);
        $value = substr($value, 0, $cut);
    }

    if (str_ends_with(strtolower($value), '.html')) {
        $stem = substr($value, 0, -5);
        $value = SITE_PAGE_ROUTES[$stem] ?? $stem;
    }

    return $value === '/' ? base_url('/') . ltrim($suffix, '/') : base_url($value) . $suffix;
}

/**
 * The first phone number the header should show, and its digits.
 *
 * `phones` is a repeater — reception, emergency, ambulance, and a line per
 * department. The header has room for one, and which one is the row marked
 * primary, or failing that the first that says it belongs in the header.
 *
 * @return array{number: string, digits: string}
 */
function site_primary_phone(): array
{
    $phones = (array) setting('contact', 'phones', []);
    $chosen = null;

    foreach ($phones as $row) {
        if (!is_array($row) || trim((string) ($row['number'] ?? '')) === '') {
            continue;
        }

        if (!empty($row['isPrimary'])) {
            $chosen = $row;
            break;
        }

        if ($chosen === null && !empty($row['showInHeader'])) {
            $chosen = $row;
        }

        $chosen ??= $row;
    }

    $number = (string) ($chosen['number'] ?? '');

    return ['number' => $number, 'digits' => site_digits($number)];
}

/**
 * The address filed under a label — "Careers", "Billing" — falling back to the
 * primary one.
 *
 * The About and Careers pages both print a specific mailbox rather than the
 * reception address, and the panel's Contact screen is where somebody changes
 * it. Matching on the label means the row can be reordered or its address
 * changed without touching a template.
 */
function site_email_for(string $label): string
{
    foreach ((array) setting('contact', 'emails', []) as $row) {
        if (!is_array($row)) {
            continue;
        }

        if (strcasecmp(trim((string) ($row['label'] ?? '')), $label) === 0) {
            $address = trim((string) ($row['address'] ?? ''));

            if ($address !== '') {
                return $address;
            }
        }
    }

    return site_primary_email();
}

/** The first address the header should show. Same rule as the phones. */
function site_primary_email(): string
{
    foreach ((array) setting('contact', 'emails', []) as $row) {
        $address = trim((string) (is_array($row) ? ($row['address'] ?? '') : $row));

        if ($address !== '' && (!is_array($row) || !empty($row['showInHeader']))) {
            return $address;
        }
    }

    foreach ((array) setting('contact', 'emails', []) as $row) {
        $address = trim((string) (is_array($row) ? ($row['address'] ?? '') : $row));

        if ($address !== '') {
            return $address;
        }
    }

    return '';
}

/** '+91 342 325 4567' → '+913423254567'. tel: and wa.me both want this. */
function site_digits(?string $value): string
{
    $digits = preg_replace('/[^\d+]/', '', (string) $value) ?? '';

    return $digits;
}

/**
 * The postal address as the footer prints it: one array entry per line.
 *
 * City, state and pincode are separate columns because the panel edits them
 * separately, and the last line reads as an address only when they are joined
 * back up.
 */
function site_address_lines(): array
{
    $lines = [];

    foreach ((array) setting('contact', 'addressLines', []) as $row) {
        $line = trim((string) (is_array($row) ? ($row['line'] ?? '') : $row));

        if ($line !== '') {
            $lines[] = $line;
        }
    }

    $tail = trim(implode(' ', array_filter([
        trim((string) setting('contact', 'city', '')),
        trim((string) setting('contact', 'state', '')),
        trim((string) setting('contact', 'pincode', '')),
    ])));

    if ($tail !== '') {
        $lines[] = $tail;
    }

    return $lines;
}
