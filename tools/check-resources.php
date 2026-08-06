<?php

/**
 * Checks config/resources.php against the database.
 *
 *     php tools/check-resources.php
 *
 * The registry is the whole API — twenty screens' worth of behaviour written
 * as data. A typo in it is not a syntax error and not a test failure; it is
 * one field that silently stops saving, on one screen, noticed weeks later.
 * This walks every column, ref, join and filter it names and reports anything
 * the schema does not have.
 *
 * Run it after editing the registry or a migration.
 */

require_once __DIR__ . '/../config/bootstrap.php';

$problems = [];
$checked = 0;

function columns(PDO $pdo, string $table): array
{
    static $cache = [];

    if (isset($cache[$table])) {
        return $cache[$table];
    }

    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

    try {
        $rows = $driver === 'sqlite'
            ? $pdo->query("PRAGMA table_info({$table})")->fetchAll()
            : $pdo->query("SHOW COLUMNS FROM {$table}")->fetchAll();
    } catch (PDOException $e) {
        return $cache[$table] = [];
    }

    return $cache[$table] = array_map(static fn ($r) => $r['name'] ?? $r['Field'] ?? '', $rows);
}

foreach (array_keys(ResourceRegistry::all()) as $name) {
    $resource = ResourceRegistry::get($name);
    $table = $resource['table'];
    $cols = columns($pdo, $table);

    $fail = function (string $message) use (&$problems, $name) {
        $problems[] = "{$name}: {$message}";
    };

    if (!$cols) {
        $fail("table `{$table}` does not exist");
        continue;
    }

    /* The public key, and the columns the controller writes on every row. */
    foreach ([$resource['key'], 'created_at', 'updated_at'] as $column) {
        if (!in_array($column, $cols, true)) {
            $fail("`{$table}` has no `{$column}`");
        }
    }

    if ($resource['hasStatus'] && !in_array('status', $cols, true)) {
        $fail("`{$table}` has no `status`, but the resource declares one");
    }

    if (!$resource['hasStatus'] && in_array('status', $cols, true)) {
        $fail("`{$table}` has a `status` column the resource says it has not");
    }

    foreach ($resource['fields'] as $field) {
        $checked++;

        if ($field['type'] === 'join') {
            $joinCols = columns($pdo, $field['table']);

            if (!$joinCols) {
                $fail("{$field['name']}: join table `{$field['table']}` does not exist");
                continue;
            }

            foreach ([$field['local'], $field['foreign']] as $column) {
                if (!in_array($column, $joinCols, true)) {
                    $fail("{$field['name']}: `{$field['table']}` has no `{$column}`");
                }
            }

            if (!ResourceRegistry::has($field['target'])) {
                $fail("{$field['name']}: joins to `{$field['target']}`, which is not a resource");
            }

            continue;
        }

        if (!in_array($field['column'], $cols, true)) {
            $fail("{$field['name']}: `{$table}` has no `{$field['column']}`");
        }

        if ($field['type'] === 'ref' && !ResourceRegistry::has($field['target'] ?? '')) {
            $fail("{$field['name']}: refers to `" . ($field['target'] ?? '?') . "`, which is not a resource");
        }
    }

    foreach ($resource['filters'] as $filter) {
        $checked++;

        if ($filter['type'] === 'join') {
            if (!isset($resource['fields'][$filter['field']])) {
                $fail("filter {$filter['name']}: no field named `{$filter['field']}`");
            }
            continue;
        }

        if (!in_array($filter['column'], $cols, true)) {
            $fail("filter {$filter['name']}: `{$table}` has no `{$filter['column']}`");
        }
    }

    foreach ($resource['sort'] ?? [] as $key) {
        $checked++;
        $column = ResourceRegistry::sortColumn($resource, $key);

        if ($column === null || !in_array($column, $cols, true)) {
            $fail("sort `{$key}`: `{$table}` has no `" . ($column ?? '?') . "`");
        }
    }

    foreach ($resource['search'] ?? [] as $key) {
        $checked++;
        $column = $resource['fields'][$key]['column'] ?? $key;

        if (!in_array($column, $cols, true)) {
            $fail("search `{$key}`: `{$table}` has no `{$column}`");
        }
    }

    foreach ($resource['required'] as $key) {
        if (!isset($resource['fields'][$key])) {
            $fail("required `{$key}` is not a field");
        }
    }

    foreach ($resource['dependents'] as $dep) {
        $checked++;
        $depCols = columns($pdo, $dep['table']);

        if (!$depCols) {
            $fail("dependent check: table `{$dep['table']}` does not exist");
        } elseif (!in_array($dep['column'], $depCols, true)) {
            $fail("dependent check: `{$dep['table']}` has no `{$dep['column']}`");
        }
    }
}

echo "\n";

if ($problems) {
    echo "  \033[31m" . count($problems) . " problem(s)\033[0m\n\n";
    foreach ($problems as $problem) {
        echo "  ! {$problem}\n";
    }
    echo "\n";
    exit(1);
}

printf("  \033[32m%d resources, %d references, all resolve\033[0m\n\n", count(ResourceRegistry::all()), $checked);
