<?php

/**
 * The health library — the listing and one article.
 *
 * The listing renders every published post rather than paginating: the filter
 * beside it is client-side (initBlogFilter in assets/pages.js hides cards that
 * do not match), and a filter that only searches the page it is on is a filter
 * that lies. When the library outgrows one page that becomes a server-side
 * query, and the chips have to go with it.
 *
 * `blog` has no row in `pages`, so nothing here is section-driven — the panel
 * edits the posts, not the shape of the page.
 */
class BlogController extends SiteController
{
    /* No Blog link in the primary nav — the design reaches the library from
       the home page and the footer, so no header item lights up here. */
    protected string $active = '';

    public function index(): void
    {
        $posts = posts_published();
        $categories = post_categories();

        $this->page('blog', [
            'head' => $this->seoHead('page', 'blog', [
                'title' => 'Blog',
                'description' => 'Health writing by the consultants of Teresa Memorial Hospital — '
                    . 'written or reviewed in the clinic, not syndicated.',
            ]),

            'posts' => array_map([$this, 'card'], $posts),
            'categories' => $categories,
            'recent' => array_slice(array_map([$this, 'card'], $posts), 0, 5),
            'counters' => $this->counters($posts, $categories),
            'bannerImage' => media_url('consult.jpg', $this->defaultImage()),
        ]);
    }

    /**
     * One article.
     *
     * An unknown slug goes to the redirect table and then to the 404, the same
     * answer any other unknown path gets — a renamed post keeps its inbound
     * links that way.
     */
    public function show(): void
    {
        $slug = (string) $this->param('slug', '');
        $post = $slug === '' ? null : post_by_slug($slug);

        if ($post === null) {
            (new ErrorController())->redirectOr404();
            return;
        }

        $category = (string) ($post['categoryName'] ?? '');

        $this->page('blog-post', [
            'head' => $this->seoHead('post', $slug, [
                'title' => (string) ($post['title'] ?? ''),
                'description' => (string) ($post['excerpt'] ?? '') ?: $this->summarise($post['body'] ?? ''),
                'ogImage' => (string) ($post['coverImage'] ?? ''),
            ]),

            'post' => $post,
            'category' => $category,
            'date' => $this->date((string) ($post['publishedAt'] ?? '')),
            'read' => ($post['readMinutes'] ?? '') !== '' ? $post['readMinutes'] . ' MINS READ' : '',
            'author' => $post['author'] ?? [],
            'tags' => $this->tagLabels((array) ($post['tags'] ?? [])),

            /* Named "More from our health library" rather than after the
               category: posts_related falls back to recent posts when the
               category is thin, and a heading that says "Cardiology" over two
               maternity cards is worse than a general one. */
            'related' => array_map([$this, 'card'], posts_related($slug)),
            'recent' => array_map(
                [$this, 'card'],
                array_values(array_filter(
                    posts_published(['limit' => 5]),
                    static fn (array $row): bool => (string) ($row['id'] ?? '') !== $slug
                ))
            ),

            'emergency' => $this->emergency(),
        ]);
    }

    /**
     * A post row in the shape card/blog takes.
     *
     * The card prints the category's name and links on the slug; the model
     * returns the name under `categoryName` and the slug as `id`. Mapping it
     * here keeps the card usable by anything else that has a post.
     */
    private function card(array $post): array
    {
        return $post + [
            'category' => (string) ($post['categoryName'] ?? ''),
            'slug' => (string) ($post['id'] ?? ''),
            'image' => (string) ($post['coverImage'] ?? ''),
        ];
    }

    /**
     * The band under the banner, counted from the library itself.
     *
     * Real figures rather than the reference page's — a number on a hospital's
     * own site should be one somebody can check.
     */
    private function counters(array $posts, array $categories): array
    {
        $authors = [];
        $views = 0;

        foreach ($posts as $post) {
            $author = (string) ($post['authorId'] ?? '');

            if ($author !== '') {
                $authors[$author] = true;
            }

            $views += (int) ($post['views'] ?? 0);
        }

        return [
            ['icon' => 'fa-newspaper', 'value' => (string) count($posts), 'label' => 'Articles published'],
            ['icon' => 'fa-user-doctor', 'value' => (string) count($authors), 'label' => 'Contributing doctors'],
            ['icon' => 'fa-eye', 'value' => (string) $views, 'label' => 'Reads so far'],
            ['icon' => 'fa-tags', 'value' => (string) count($categories), 'label' => 'Topics covered'],
        ];
    }

    /**
     * Tag ids resolved to the names they are filed under.
     *
     * A post stores `tag-heart-attack`; the chip has to read "Heart Attack".
     * An id with no row left is dropped rather than printed raw — a deleted
     * tag should disappear, not appear as a slug.
     *
     * @return string[]
     */
    private function tagLabels(array $ids): array
    {
        if (!$ids) {
            return [];
        }

        $names = [];

        foreach (post_categories('tag') as $tag) {
            $names[(string) ($tag['id'] ?? '')] = (string) ($tag['name'] ?? '');
        }

        $out = [];

        foreach ($ids as $id) {
            $label = $names[(string) $id] ?? '';

            if ($label !== '') {
                $out[] = $label;
            }
        }

        return $out;
    }

    /** The emergency line, or reception where none is set. */
    private function emergency(): array
    {
        $number = trim((string) setting('contact', 'emergencyNumber', ''));

        return $number === ''
            ? site_primary_phone()
            : ['number' => $number, 'digits' => site_digits($number)];
    }

    /** A stored timestamp as the design prints it. */
    private function date(string $published): string
    {
        $stamp = $published === '' ? false : strtotime($published);

        return $stamp ? date('F j, Y', $stamp) : $published;
    }
}
