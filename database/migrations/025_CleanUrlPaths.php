<?php

/**
 * The stored link spellings, cleaned once.
 *
 * The panel's rows were seeded from a static prototype, so a link in the
 * database still reads `contact.html` and a logo still reads
 * `../../assets/logo-teresa.png` — the path relative to the folder the
 * picker was standing in. site_url() (app/models/links.php) has been
 * translating those at render time ever since, which is why nothing was
 * broken; but every one of them was a redirect the visitor paid for, and the
 * panel taught the next person to type the same thing.
 *
 * Nothing here is a compat shim being removed. `redirects.from_path` is the
 * spelling a crawler still asks for and is deliberately untouched, and
 * ErrorController's `.html` fallback stays. This is only the outbound side:
 * what this application prints into an href.
 *
 * Safe to run twice. clean() returns null when a value is already correct
 * and every writer skips on null, so a second pass changes no rows.
 */
class CleanUrlPaths extends Migration
{
    /**
     * Design filenames that are not simply their own stem. Mirrors
     * SITE_PAGE_ROUTES in app/models/links.php — if one changes, so does the
     * other, because they answer the same question at different moments.
     */
    private const STEMS = [
        'website' => '/',
        'index' => '/',
        'blog-post' => '/blog',
        'job' => '/careers',
    ];

    public function up()
    {
        $this->column('nav_items', 'href');
        $this->column('pages', 'path');

        /* to_path only. from_path is matched literally against the incoming
           request (app/models/redirects.php), so rewriting it would switch
           off every legacy redirect on the site and report nothing. */
        $this->column('redirects', 'to_path');

        $this->settings();
        $this->pageSections();
        $this->landingPages();
    }

    /**
     * Reversing this would mean putting broken links back. A normalisation
     * has no meaningful inverse, and saying so is more honest than a down()
     * that pretends.
     */
    public function down()
    {
    }

    /* ---------------------------------------------------------
       Writers
       --------------------------------------------------------- */

    /** A plain VARCHAR column of stored paths. */
    private function column(string $table, string $column): void
    {
        $rows = $this->pdo
            ->query("SELECT id, {$column} AS value FROM {$table} WHERE {$column} LIKE '%.html%' OR {$column} LIKE '../%'")
            ->fetchAll(PDO::FETCH_ASSOC);

        $update = $this->pdo->prepare("UPDATE {$table} SET {$column} = ? WHERE id = ?");

        foreach ($rows as $row) {
            $clean = $this->clean($row['value']);

            if ($clean !== null) {
                $update->execute([$clean, $row['id']]);
            }
        }
    }

    /**
     * The five settings that hold a link.
     *
     * Named rather than scanned: `value` is a JSON-encoded scalar and the
     * table also holds prose, where a sentence mentioning a filename is copy
     * rather than a link. A migration that edits copy is a migration that
     * rewrote somebody's content.
     */
    private function settings(): void
    {
        $targets = [
            ['popups', 'cookiePolicyUrl'],
            ['popups', 'adsLink'],
            ['general', 'logo'],
            ['general', 'logoDark'],
            ['general', 'favicon'],
        ];

        $read = $this->pdo->prepare('SELECT value FROM settings WHERE group_name = ? AND setting_key = ?');
        $write = $this->pdo->prepare('UPDATE settings SET value = ? WHERE group_name = ? AND setting_key = ?');

        foreach ($targets as [$group, $key]) {
            $read->execute([$group, $key]);
            $raw = $read->fetchColumn();

            if ($raw === false || $raw === null) {
                continue;
            }

            $decoded = json_decode((string) $raw, true);

            if (!is_string($decoded)) {
                continue;
            }

            $clean = $this->clean($decoded);

            if ($clean !== null) {
                $write->execute([json_encode($clean), $group, $key]);
            }
        }
    }

    /**
     * The href-shaped keys inside `page_sections.data`.
     *
     * Decoded and re-encoded in PHP rather than edited in SQL: the column is
     * TEXT on SQLite and native JSON on MySQL, so JSON_SET would be fatal on
     * one and REPLACE() would be rejected on the other. Both drivers hand
     * back a string, and json_encode() with no flags matches what
     * database/Seeder.php writes, so a migrated row and a seeded row stay
     * byte-comparable.
     */
    private function pageSections(): void
    {
        $rows = $this->pdo
            ->query("SELECT id, data FROM page_sections WHERE data LIKE '%.html%' OR data LIKE '%../%'")
            ->fetchAll(PDO::FETCH_ASSOC);

        $update = $this->pdo->prepare('UPDATE page_sections SET data = ? WHERE id = ?');

        foreach ($rows as $row) {
            $data = json_decode((string) $row['data'], true);

            if (!is_array($data)) {
                continue;
            }

            $changed = false;

            foreach (['primaryHref', 'ghostHref', 'secondaryHref', 'href', 'link', 'ctaHref'] as $key) {
                if (!isset($data[$key]) || !is_string($data[$key])) {
                    continue;
                }

                $clean = $this->clean($data[$key]);

                if ($clean !== null) {
                    $data[$key] = $clean;
                    $changed = true;
                }
            }

            if ($changed) {
                $update->execute([json_encode($data), $row['id']]);
            }
        }
    }

    /**
     * `users.landing_page` — an admin screen name, not a site path.
     *
     * clean() is the wrong tool here: it would turn `dashboard.html` into
     * `/dashboard`, and AdminController matches a bare screen name against
     * the shells on disk. Only the extension goes. REPLACE() is one of the
     * few string functions SQLite and MySQL spell the same way.
     */
    private function landingPages(): void
    {
        $this->pdo->exec(
            "UPDATE users SET landing_page = REPLACE(landing_page, '.html', '') WHERE landing_page LIKE '%.html'"
        );
    }

    /* ---------------------------------------------------------
       The rule
       --------------------------------------------------------- */

    /**
     * `contact.html#book` → `/contact#book`, `../../assets/x.png` →
     * `/assets/x.png`. The same decision site_url() makes when it renders a
     * stored value, made once against the value itself.
     *
     * Returns null when nothing changed — which is what lets this migration
     * run twice without writing anything the second time.
     */
    private function clean(?string $value): ?string
    {
        $original = trim((string) $value);

        if ($original === '') {
            return null;
        }

        /* Absolute, a scheme of its own (mailto:, tel:) or an anchor on the
           current page — all already final, and mangling one is worse than
           leaving a stale extension alone. */
        if (preg_match('#^([a-z][a-z0-9+.-]*:|//|\#)#i', $original)) {
            return null;
        }

        /* Every leading traversal is dropped rather than resolved: there is
           nothing above the document root to resolve to, and what remains is
           always a path from it. */
        $value = preg_replace('#^(?:\.\./)+#', '', $original) ?? $original;
        $value = '/' . ltrim($value, '/');

        /* Split the query and fragment off before touching the extension, so
           `contact.html#book` keeps its anchor. */
        $suffix = '';

        if (($cut = strcspn($value, '?#')) < strlen($value)) {
            $suffix = substr($value, $cut);
            $value = substr($value, 0, $cut);
        }

        if (str_ends_with(strtolower($value), '.html')) {
            $stem = substr(ltrim($value, '/'), 0, -5);
            $value = self::STEMS[$stem] ?? '/' . $stem;
        }

        $result = ($value === '/' ? '/' : rtrim($value, '/')) . $suffix;

        return $result === $original ? null : $result;
    }
}
