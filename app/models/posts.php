<?php

/**
 * posts — the blog listing, the article page and the related strip.
 *
 * Beyond the registry's fields, a post row carries two things the cards need
 * on every render and that cost nothing to fetch alongside it:
 *
 *     categoryName   what the card's badge prints, for the slug in categoryId
 *     author         ['id', 'name', 'role', 'photo'], or null
 *
 * `author` is null where the doctor has left — `author_id` deliberately has no
 * foreign key (docs/php/02-schema.md), and the article stays up. The renderer
 * falls back to the hospital name.
 */

require_once __DIR__ . '/rows.php';

/**
 * The listing.
 *
 * @param array $opts category|tag|author slug, featured bool, limit, offset,
 *                    sort (a key config/resources.php allows), direction
 */
function posts_published(array $opts = [], bool $includeUnpublished = false): array
{
    $where = ['p.deleted_at IS NULL'];
    $params = [];

    if (!$includeUnpublished) {
        $where[] = "p.status = 'published'";
    }

    if (!empty($opts['category'])) {
        $where[] = 'c.slug = ?';
        $params[] = (string) $opts['category'];
    }

    if (!empty($opts['author'])) {
        $where[] = 'a.slug = ?';
        $params[] = (string) $opts['author'];
    }

    if (isset($opts['featured'])) {
        $where[] = 'p.featured = ?';
        $params[] = $opts['featured'] ? 1 : 0;
    }

    if (!empty($opts['tag'])) {
        /* A subquery rather than a join: joining post_tags would return the
           post once per matching tag. */
        $where[] = 'p.id IN (SELECT pt.post_id FROM post_tags pt
                             JOIN categories t ON t.id = pt.category_id
                             WHERE t.slug = ?)';
        $params[] = (string) $opts['tag'];
    }

    $raws = db_fetch_all(
        posts_select() . ' WHERE ' . implode(' AND ', $where)
        . ' ORDER BY ' . model_order('posts', $opts['sort'] ?? null, $opts['direction'] ?? null, 'p.published_at DESC', 'p')
        . ', p.sort_order, p.id'
        . model_limit((int) ($opts['limit'] ?? 0), (int) ($opts['offset'] ?? 0)),
        $params
    );

    return posts_hydrate($raws);
}

/** One article, or null. */
function post_by_slug(string $slug, bool $includeUnpublished = false): ?array
{
    $raw = db_fetch_one(
        posts_select() . ' WHERE p.slug = ? AND p.deleted_at IS NULL'
        . ($includeUnpublished ? '' : " AND p.status = 'published'"),
        [$slug]
    );

    if (!$raw) {
        return null;
    }

    return posts_hydrate([$raw])[0];
}

/**
 * The related strip at the foot of an article.
 *
 * Sorted rather than filtered, which is the behaviour tools/build-pages.mjs
 * settled on: only one Cardiology article exists, and a strict filter would
 * leave a single card alone in a three-up grid. Posts sharing this one's
 * category or any of its tags come first, then the most recent of the rest so
 * the row is never short.
 *
 * Each returned row carries `isRelated`, saying whether it is a genuine topic
 * match — the heading only names the topic when every card in the row
 * actually carries it.
 */
function posts_related(string $slug, int $limit = 3): array
{
    $post = post_by_slug($slug);

    if ($post === null) {
        return [];
    }

    $keys = array_map(
        'strtolower',
        array_filter(array_merge([$post['categoryId'] ?? null], $post['tags'] ?? []))
    );
    $keys = array_flip($keys);

    $matched = [];
    $rest = [];

    foreach (posts_published() as $candidate) {
        if ($candidate['id'] === $post['id']) {
            continue;
        }

        $topics = array_map(
            'strtolower',
            array_filter(array_merge([$candidate['categoryId'] ?? null], $candidate['tags'] ?? []))
        );
        $hit = (bool) array_intersect_key($keys, array_flip($topics));

        $candidate['isRelated'] = $hit;

        if ($hit) {
            $matched[] = $candidate;
        } else {
            $rest[] = $candidate;
        }
    }

    return array_slice(array_merge($matched, $rest), 0, max(0, $limit));
}

/**
 * Blog categories, or tags, with the number of published posts under each.
 *
 * One function for both because `categories` is one table split by `type`, and
 * the listing needs the tag rail and the category filter from the same shape.
 * The count is a correlated subquery rather than a second pass — twelve rows,
 * one query.
 */
function post_categories(string $type = 'category'): array
{
    $raws = db_fetch_all(
        "SELECT c.*,
                (SELECT COUNT(*) FROM posts p
                 WHERE p.category_id = c.id AND p.status = 'published' AND p.deleted_at IS NULL)
                + (SELECT COUNT(*) FROM post_tags pt
                   JOIN posts p2 ON p2.id = pt.post_id
                   WHERE pt.category_id = c.id AND p2.status = 'published' AND p2.deleted_at IS NULL)
                AS post_count
         FROM categories c
         WHERE c.type = ? AND c.deleted_at IS NULL AND c.status = 'published'
         ORDER BY c.sort_order, c.id",
        [$type]
    );

    $out = [];

    foreach ($raws as $index => $raw) {
        $out[$index] = model_row($raw, 'categories');
        $out[$index]['postCount'] = (int) $raw['post_count'];
    }

    return $out;
}

/**
 * The one SELECT every post query starts from.
 *
 * The two refs are resolved here, in the same statement, so a listing of ten
 * articles is one query and not twenty-one. The author join carries
 * `deleted_at IS NULL` rather than a status test: a doctor who has been hidden
 * from the roster still wrote the article.
 */
function posts_select(): string
{
    return 'SELECT p.*,
                   c.slug AS categoryId,
                   c.name AS categoryName,
                   a.slug AS authorId,
                   a.name AS author_name,
                   a.role AS author_role,
                   a.photo AS author_photo
            FROM posts p
            LEFT JOIN categories c ON c.id = p.category_id AND c.deleted_at IS NULL
            LEFT JOIN doctors a ON a.id = p.author_id AND a.deleted_at IS NULL';
}

/** Tags for the whole set in one query, plus the author each row carries. */
function posts_hydrate(array $raws): array
{
    if (!$raws) {
        return [];
    }

    $joins = [
        'tags' => model_join_map(
            'posts',
            'tags',
            model_ids($raws),
            "t.deleted_at IS NULL AND t.status = 'published'"
        ),
    ];

    $out = [];

    foreach ($raws as $index => $raw) {
        $post = model_row($raw, 'posts', $joins);

        $post['categoryName'] = $raw['categoryName'] === null ? null : (string) $raw['categoryName'];

        $post['author'] = $raw['authorId'] === null ? null : [
            'id' => (string) $raw['authorId'],
            'name' => (string) $raw['author_name'],
            'role' => (string) ($raw['author_role'] ?? ''),
            'photo' => $raw['author_photo'] === null ? null : (string) $raw['author_photo'],
        ];

        $out[$index] = $post;
    }

    return $out;
}
