<?php

/**
 * seo_meta — the title, description and og:image for one record.
 *
 * The table is polymorphic, so it carries an integer `entity_id` and no
 * foreign key. Nothing outside this file needs to know that: the lookup takes
 * the public key a page already has — seo_for('post', 'blog-post') — and the
 * row comes back naming the same key it was asked with.
 */

require_once __DIR__ . '/rows.php';

/**
 * The entity types seo_meta may describe, and where their public keys live.
 *
 * A whitelist, not a convention: `entity_type` is a plain string column and
 * this is the only thing that stops one reaching a table name.
 */
function seo_entities(): array
{
    return [
        'doctor' => ['doctors', 'slug'],
        'department' => ['departments', 'slug'],
        'post' => ['posts', 'slug'],
        'page' => ['pages', 'slug'],
    ];
}

/**
 * Metadata for one record, or null where there is none.
 *
 * A page without a row here is normal — the renderer falls back to the
 * record's own title and excerpt — so null is an answer, not a failure.
 *
 * @param string $entityId the record's slug, never its integer id
 */
function seo_for(string $entityType, string $entityId): ?array
{
    $entity = seo_entities()[$entityType] ?? null;

    if ($entity === null) {
        return null;
    }

    [$table, $key] = $entity;

    /* $table and $key come from the whitelist above; both bound values are
       the caller's. */
    $raw = db_fetch_one(
        "SELECT m.*
         FROM seo_meta m
         JOIN {$table} e ON e.id = m.entity_id AND e.deleted_at IS NULL
         WHERE m.entity_type = ? AND e.{$key} = ? AND m.deleted_at IS NULL",
        [$entityType, $entityId]
    );

    $meta = model_row($raw, 'seo-meta');

    if ($meta === null) {
        return null;
    }

    return ['entityType' => $entityType, 'entityId' => $entityId] + $meta;
}
