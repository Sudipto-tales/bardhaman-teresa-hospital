<?php

/**
 * Loads database/seeds/*.json — written by `node tools/seed-export.mjs` —
 * into the database. Run by `php vayu seed`.
 *
 * This class deliberately knows nothing about the content. Every decision
 * about what a column is called, which source won a merge and how a display
 * label became a stored value was made in the exporter, in JavaScript, next to
 * the data. What is left here is: read a file, resolve its foreign keys,
 * insert its rows.
 *
 * Each seed file carries its own instructions:
 *
 *   table   where the rows go
 *   key     the row's public key column, used to report duplicates usefully
 *   refs    {column: [table, keyColumn]} — the exporter has no database and
 *           writes foreign keys as the target's public key; they are resolved
 *           here by lookup
 *   json    columns to encode on the way in
 *   rows    the rows
 *
 * Seeding is destructive and says so: each table is emptied before it is
 * filled, because a seeder that appends turns a second run into duplicate
 * content.
 */
class Seeder
{
    private PDO $pdo;
    /** @var callable */
    private $out;

    private array $warnings = [];
    private string $password = '';

    public function __construct(PDO $pdo, callable $out)
    {
        $this->pdo = $pdo;
        $this->out = $out;
    }

    public function run(): int
    {
        $dir = __BASEDIR__ . '/database/seeds';
        $manifest = $dir . '/order.json';

        if (!is_file($manifest)) {
            ($this->out)('  ! database/seeds is empty — run: node tools/seed-export.mjs');
            return 0;
        }

        /* The exporter writes the files in dependency order: a table is listed
           after everything it points at, so a foreign key always resolves
           against rows that are already in. */
        $tables = json_decode((string) file_get_contents($manifest), true) ?: [];
        $total = 0;

        $this->password = $this->generatePassword();

        foreach ($tables as $table) {
            $file = $dir . '/' . $table . '.json';

            if (!is_file($file)) {
                $this->warn("{$table}.json is in order.json but not on disk");
                continue;
            }

            $count = $this->load(json_decode((string) file_get_contents($file), true) ?: []);
            ($this->out)(sprintf('  %4d  %s', $count, $table));
            $total += $count;
        }

        $this->report();

        return $total;
    }

    /* ---------------------------------------------------------
       One file
       --------------------------------------------------------- */

    private function load(array $seed): int
    {
        $table = $seed['table'] ?? '';
        $rows = $seed['rows'] ?? [];
        $refs = $seed['refs'] ?? [];
        $json = $seed['json'] ?? [];

        if ($table === '') {
            return 0;
        }

        $this->pdo->exec("DELETE FROM {$table}");

        $now = now_iso();
        $inserted = 0;

        foreach ($rows as $row) {
            foreach ($refs as $column => $target) {
                $row[$column] = $this->resolve($table, $column, $row, $target);
            }

            foreach ($json as $column) {
                if (array_key_exists($column, $row)) {
                    $row[$column] = $row[$column] === null ? null : json_encode($row[$column]);
                }
            }

            $row = $this->stamp($table, $row, $now);

            $columns = array_keys($row);
            $sql = "INSERT INTO {$table} (" . implode(', ', $columns) . ') VALUES ('
                . implode(', ', array_fill(0, count($columns), '?')) . ')';

            $this->pdo->prepare($sql)->execute(array_values($row));
            $inserted++;
        }

        return $inserted;
    }

    /**
     * A foreign key written as the target's public key becomes the target's
     * integer id.
     *
     * `seo_meta` is the awkward one: it is polymorphic, so its target table
     * depends on another column of the same row. Its `refs` entry is a map of
     * discriminator value to [table, keyColumn] plus the name of the
     * discriminator column, and this is where that is unpacked.
     */
    private function resolve(string $table, string $column, array $row, array $target): ?int
    {
        $value = $row[$column] ?? null;

        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($target[0])) {
            [$byType, $discriminator] = $target;
            $type = $row[$discriminator] ?? null;

            if (!isset($byType[$type])) {
                $this->warn("{$table}.{$column}: no table registered for {$discriminator} \"{$type}\"");
                return null;
            }

            $target = $byType[$type];
        }

        [$targetTable, $targetKey] = $target;

        $id = db_scalar(
            "SELECT id FROM {$targetTable} WHERE {$targetKey} = ?",
            [$value]
        );

        if ($id === null || $id === false) {
            $this->warn("{$table}.{$column}: \"{$value}\" does not exist in {$targetTable}");
            return null;
        }

        return (int) $id;
    }

    /**
     * Fills in what the exporter could not know: timestamps, and the one thing
     * that must never come from a file in the repository.
     */
    private function stamp(string $table, array $row, string $now): array
    {
        if ($this->hasColumn($table, 'created_at') && empty($row['created_at'])) {
            $row['created_at'] = $now;
        }

        if ($this->hasColumn($table, 'updated_at') && empty($row['updated_at'])) {
            $row['updated_at'] = $row['created_at'] ?? $now;
        }

        /* Seeded accounts get one generated password, printed once at the end
           of the run and stored nowhere. A hash committed to the repository is
           a hash that ends up on a production box. */
        if ($table === 'users') {
            $row['password'] = Auth::hash($this->password);
        }

        return $row;
    }

    private array $columns = [];

    private function hasColumn(string $table, string $column): bool
    {
        if (!isset($this->columns[$table])) {
            $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

            $rows = $driver === 'sqlite'
                ? $this->pdo->query("PRAGMA table_info({$table})")->fetchAll()
                : $this->pdo->query("SHOW COLUMNS FROM {$table}")->fetchAll();

            $this->columns[$table] = array_map(
                static fn ($r) => $r['name'] ?? $r['Field'] ?? '',
                $rows
            );
        }

        return in_array($column, $this->columns[$table], true);
    }

    /* ---------------------------------------------------------
       Reporting
       --------------------------------------------------------- */

    private function warn(string $message): void
    {
        $this->warnings[] = $message;
    }

    private function report(): void
    {
        if ($this->warnings) {
            ($this->out)('');
            ($this->out)("  \033[33mUnresolved references\033[0m");

            /* Deduplicated: one missing department referenced by nine rows is
               one problem, and printing it nine times buries the others. */
            foreach (array_count_values($this->warnings) as $message => $times) {
                ($this->out)('  ! ' . $message . ($times > 1 ? " (×{$times})" : ''));
            }
        }

        ($this->out)('');
        ($this->out)("  \033[32mSign in with any seeded address and this password:\033[0m");
        ($this->out)("      admin@teresamemorialhospital.com");
        ($this->out)("      {$this->password}");
        ($this->out)('');
        ($this->out)('  It is generated per run and stored nowhere else. Change it after');
        ($this->out)('  the first sign-in, and never seed a production database.');
    }

    private function generatePassword(): string
    {
        /* No l, I, 1, O or 0 — this gets read off a terminal and typed. */
        $alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $password = '';

        for ($i = 0; $i < 16; $i++) {
            $password .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }

        return $password;
    }
}
