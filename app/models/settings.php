<?php

/**
 * settings — the hospital's own details, read by every page.
 *
 * One row per key (docs/php/02-schema.md), and `value` is always JSON, even
 * for a plain string. That means a scalar setting and a repeater read back the
 * same way, so json_column() is deliberately not used here: it answers `[]` for
 * `"Teresa Memorial Hospital"`, which is a valid stored value.
 *
 * The whole table is 78 rows and the header alone touches a dozen of them, so
 * it is read once per request and answered from memory afterwards. A getter
 * that queried would be forty queries before the first section renders.
 */

require_once __DIR__ . '/rows.php';

/**
 * Every setting, grouped: ['contact' => ['phones' => [...], ...], ...].
 *
 * @param bool $fresh re-read the table; only the panel, after a write, needs it
 */
function all_settings(bool $fresh = false): array
{
    static $settings = null;

    if ($settings !== null && !$fresh) {
        return $settings;
    }

    $settings = [];

    foreach (db_fetch_all('SELECT group_name, setting_key, value FROM settings ORDER BY group_name, id') as $row) {
        $settings[(string) $row['group_name']][(string) $row['setting_key']] = setting_value($row['value']);
    }

    return $settings;
}

/** One group, or [] for a group that does not exist. */
function settings_group(string $group): array
{
    return all_settings()[$group] ?? [];
}

/** One setting: setting('contact', 'phones'). */
function setting(string $group, string $key, mixed $default = null): mixed
{
    $value = all_settings()[$group][$key] ?? null;

    /* A stored null is as absent as a missing row — the panel writes one when
       a field is cleared, and a caller asking for a default wants it either
       way. */
    return $value ?? $default;
}

/**
 * Decode a stored value.
 *
 * Anything that will not parse is returned as it stands rather than thrown
 * away: a setting hand-edited into plain text should print itself, not turn
 * the header blank.
 */
function setting_value(mixed $raw): mixed
{
    if (!is_string($raw) || $raw === '') {
        return $raw === '' ? '' : null;
    }

    $decoded = json_decode($raw, true);

    return json_last_error() === JSON_ERROR_NONE ? $decoded : $raw;
}
