<?php

/**
 * The one place a database row becomes a public row.
 *
 * Every function in this directory returns rows in the shape
 * config/resources.php describes — camelCase names, `sort_order` as `order`,
 * the slug or public_id as `id` — because the templates that render them and
 * the panel that edits them read the same field names. Doing that per model
 * would be fifteen copies of the same twenty lines, and the copy that fell
 * behind a schema change would be the one nobody noticed.
 *
 * The integer primary key does not survive this function. It is what foreign
 * keys point at and nothing else; a row that still carries it is a row that
 * eventually puts it in a URL.
 *
 * ---------------------------------------------------------------------------
 * How a foreign key gets here
 *
 * A `ref` field is not read from its `*_id` column. The query that fetched the
 * row is expected to have joined the target already and aliased its public key
 * to the field name:
 *
 *     SELECT p.*, a.slug AS authorId FROM posts p LEFT JOIN doctors a ...
 *
 * so `authorId` arrives as `dr-jonathon-ronan` and `author_id` is dropped with
 * the rest of the integers. A `join` field is filled from the third argument,
 * built once for a whole result set by model_join_map() — a department's team
 * is one extra query for twenty departments, not twenty.
 * ---------------------------------------------------------------------------
 */

/**
 * Tables the resource registry does not describe, in its shorthand.
 *
 * `pages`, `page_sections` and `seo_meta` have no CRUD screen of their own —
 * a page is edited through its own editor and SEO through one polymorphic list
 * — so they are absent from config/resources.php. They still have to come back
 * in the same shape as everything else.
 */
function model_extra_resources(): array
{
    return [
        'pages' => [
            'table' => 'pages',
            'key' => 'slug',
            'ordered' => false,
            'fields' => [
                'title' => 'string',
                'path' => 'string',
            ],
        ],

        'page-sections' => [
            'table' => 'page_sections',
            /* No public_id column: `section_key` is what ties a row to the
               component that renders it, so it is the public key too. */
            'key' => 'section_key',
            'status' => false,
            'fields' => [
                'key' => ['column' => 'section_key', 'type' => 'string'],
                'label' => 'string',
                'enabled' => 'bool',
                'data' => 'json',
            ],
        ],

        'seo-meta' => [
            'table' => 'seo_meta',
            /* Polymorphic and keyless: a meta row is identified by the pair it
               hangs off, which seo_for() puts back on the way out. */
            'key' => null,
            'status' => false,
            'ordered' => false,
            'fields' => [
                'metaTitle' => 'string',
                'metaDescription' => 'string',
                'ogImage' => 'string',
                'canonical' => 'string',
                'noindex' => 'bool',
                'keywords' => 'string',
            ],
        ],
    ];
}

/**
 * The output plan for a resource: what to read, what to call it, how to cast.
 *
 * Built once per request per resource. Registry entries arrive already
 * expanded from ResourceRegistry; the three above arrive in shorthand, and the
 * same three lines normalise both rather than there being two shapes.
 */
function model_plan(string $resource): array
{
    static $plans = [];

    if (isset($plans[$resource])) {
        return $plans[$resource];
    }

    $spec = ResourceRegistry::get($resource) ?? model_extra_resources()[$resource] ?? null;

    if ($spec === null) {
        throw new InvalidArgumentException("No model plan for resource `{$resource}`");
    }

    $fields = [];

    /* The public key first, so `id` leads every row the way the panel and the
       API contract expect. */
    if (($spec['key'] ?? null) !== null) {
        $fields[] = ['name' => 'id', 'column' => $spec['key'], 'type' => 'string'];
    }

    foreach ($spec['fields'] ?? [] as $name => $field) {
        if (is_string($field)) {
            $field = ['type' => $field];
        }

        $type = $field['type'] ?? 'string';

        $fields[] = [
            'name' => $name,
            'column' => $type === 'join' ? null : ($field['column'] ?? ResourceRegistry::snake($name)),
            'type' => $type,
        ];
    }

    if (($spec['ordered'] ?? true) !== false) {
        $fields[] = ['name' => 'order', 'column' => 'sort_order', 'type' => 'int'];
    }

    if (($spec['hasStatus'] ?? ($spec['status'] ?? true)) !== false) {
        $fields[] = ['name' => 'status', 'column' => 'status', 'type' => 'string'];
    }

    $fields[] = ['name' => 'createdAt', 'column' => 'created_at', 'type' => 'datetime'];
    $fields[] = ['name' => 'updatedAt', 'column' => 'updated_at', 'type' => 'datetime'];

    return $plans[$resource] = [
        'table' => $spec['table'],
        'key' => $spec['key'] ?? null,
        'fields' => $fields,
    ];
}

/**
 * One row, or null.
 *
 * A column the query did not select is left out rather than returned as null,
 * so a deliberately slim SELECT — the mega menu wants four columns of a
 * department, not twenty — stays slim instead of growing twenty nulls.
 *
 * $raw is typed loosely because db_fetch_one() answers `false` for a slug
 * nobody has, and every one of these models has to survive that.
 *
 * @param array<string, array<int, string[]>> $joins field => local id => keys
 */
function model_row(mixed $raw, string $resource, array $joins = []): ?array
{
    if (!is_array($raw) || !$raw) {
        return null;
    }

    $plan = model_plan($resource);
    $out = [];

    foreach ($plan['fields'] as $field) {
        $name = $field['name'];

        if ($field['type'] === 'join') {
            /* Absent from $joins means the query never asked, which is not the
               same answer as "nobody". A slim SELECT says nothing rather than
               claiming a department has no team. */
            if (array_key_exists($name, $joins)) {
                $out[$name] = $joins[$name][(int) ($raw['id'] ?? 0)] ?? [];
            }

            continue;
        }

        /* A ref is read from the alias the query gave it, never from the
           integer column beside it. */
        $column = $field['type'] === 'ref' ? $name : $field['column'];

        if (!array_key_exists($column, $raw)) {
            continue;
        }

        $out[$name] = model_cast($raw[$column], $field['type']);
    }

    return $out;
}

/** @return array<int, array> */
function model_rows(array $raws, string $resource, array $joins = []): array
{
    $out = [];

    foreach ($raws as $raw) {
        $out[] = model_row($raw, $resource, $joins);
    }

    return $out;
}

/**
 * A column value in the type the API contract promises.
 *
 * Nulls stay null rather than becoming 0 or '': an unpriced lab test and a
 * free one are different things, and a template that prints `₹0` for the first
 * is worse than one that prints nothing.
 */
function model_cast(mixed $value, string $type): mixed
{
    /* json and csv are the same column with two editors; both read back as an
       array, and json_column() turns anything malformed into an empty one. */
    if ($type === 'json' || $type === 'csv') {
        return json_column($value);
    }

    if ($value === null) {
        return null;
    }

    return match ($type) {
        'int' => (int) $value,
        'float' => (float) $value,
        'bool' => (bool) (int) $value,
        default => (string) $value,
    };
}

/**
 * The far side of a many-to-many, for a whole result set, in one query.
 *
 * A department page lists its team and a doctor card lists their departments;
 * asking that per row is one query per card. This asks it once for every row
 * already fetched and hands back a map the mapper stitches in.
 *
 * The table and column names come from the registry's join spec, never from a
 * caller — the only bound values are the ids.
 *
 * @param int[]  $ids   integer keys of the rows already fetched
 * @param string $where an extra literal condition on the target, aliased `t`
 * @return array<int, string[]> local id => the target's public keys
 */
function model_join_map(string $resource, string $field, array $ids, string $where = ''): array
{
    $ids = array_values(array_unique(array_map('intval', $ids)));

    if (!$ids) {
        return [];
    }

    $spec = ResourceRegistry::get($resource)['fields'][$field] ?? null;

    if (($spec['type'] ?? '') !== 'join') {
        throw new InvalidArgumentException("`{$resource}.{$field}` is not a join");
    }

    $target = ResourceRegistry::get($spec['target']);
    $placeholders = implode(', ', array_fill(0, count($ids), '?'));

    /* Ordered by the target's own sort position: a department's team should
       read in the order the doctors list is arranged, and the join table's
       sort_order is only filled in where somebody has dragged one. */
    $rows = db_fetch_all(
        "SELECT j.{$spec['local']} AS local_id, t.{$target['key']} AS public_key
         FROM {$spec['table']} j
         JOIN {$target['table']} t ON t.id = j.{$spec['foreign']}
         WHERE j.{$spec['local']} IN ({$placeholders})"
        . ($where === '' ? '' : " AND {$where}")
        . ' ORDER BY t.sort_order, t.id',
        $ids
    );

    $map = [];

    foreach ($rows as $row) {
        $map[(int) $row['local_id']][] = (string) $row['public_key'];
    }

    return $map;
}

/**
 * public key => display label for a whole resource, cached for the request.
 *
 * Joins come back as slugs, which is what the API contract wants and what a
 * link needs, but a tag row and a team card print names. This is the lookup
 * that turns one into the other without every model growing a parallel
 * `*Names` field.
 */
function model_label_map(string $resource): array
{
    static $maps = [];

    if (isset($maps[$resource])) {
        return $maps[$resource];
    }

    $spec = ResourceRegistry::get($resource);

    if ($spec === null) {
        return $maps[$resource] = [];
    }

    $label = $spec['label'] ?? $spec['key'];
    $rows = db_fetch_all(
        "SELECT {$spec['fields'][$label]['column']} AS label, {$spec['key']} AS public_key
         FROM {$spec['table']}
         WHERE deleted_at IS NULL"
    );

    $map = [];

    foreach ($rows as $row) {
        $map[(string) $row['public_key']] = (string) $row['label'];
    }

    return $maps[$resource] = $map;
}

/** The integer keys of a raw result set, for the join queries that follow it. */
function model_ids(array $raws): array
{
    return array_map(static fn (array $raw): int => (int) ($raw['id'] ?? 0), $raws);
}

/**
 * A LIMIT clause, or nothing.
 *
 * Cast rather than bound: MySQL with native prepared statements rejects a
 * string-bound LIMIT, and an integer cast of a caller's value is not an
 * interpolation — there is no string left to inject.
 *
 * An offset without a limit is ignored. SQLite spells that `LIMIT -1 OFFSET n`
 * and MySQL will not have it at all, and no page here pages without a size.
 */
function model_limit(int $limit, int $offset = 0): string
{
    if ($limit <= 0) {
        return '';
    }

    return ' LIMIT ' . $limit . ($offset > 0 ? ' OFFSET ' . $offset : '');
}

/**
 * A sort clause a caller asked for, checked against the registry.
 *
 * ResourceRegistry::sortColumn() returns null for anything the resource does
 * not list, which is what keeps a query string out of the SQL; the fallback is
 * used whenever it does.
 *
 * $alias is the table's alias in the query. It is not optional in practice —
 * `status`, `sort_order` and `updated_at` exist on both sides of every join
 * these models make, and an unqualified one is an ambiguous-column error.
 */
function model_order(string $resource, ?string $key, ?string $direction, string $fallback, string $alias = ''): string
{
    $column = $key === null ? null : ResourceRegistry::sortColumn(ResourceRegistry::get($resource), $key);

    if ($column === null) {
        return $fallback;
    }

    return ($alias === '' ? '' : $alias . '.') . $column
        . (strtoupper((string) $direction) === 'ASC' ? ' ASC' : ' DESC');
}
