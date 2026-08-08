<?php

/**
 * `/sitemap.xml` and `/robots.txt`.
 *
 * Both were already promised by the settings — `seo.sitemapUrl` has been seeded
 * as `/sitemap.xml` and `seo.robots` as `index, follow` since phase 3 — and
 * neither file existed. The panel's SEO screen edited two values nothing read.
 *
 * Generated per request rather than written to disk. A file would need
 * something to rewrite it every time the panel publishes a department, and a
 * sitemap that is regenerated nightly is a sitemap that is wrong all day. The
 * whole thing is four queries.
 *
 * Neither path exists on disk, so Apache's `RewriteCond !-f` and the dev
 * server's file check both fall through to the router, and an exact route key
 * matches before any pattern.
 */
class SitemapController extends SiteController
{
    /**
     * The fixed pages, and how often each is worth re-crawling.
     *
     * `changefreq` and `priority` are hints Google has said outright it
     * ignores; they are here because Bing and several smaller crawlers still
     * read them, and they cost one attribute each.
     */
    private const FIXED = [
        '' => ['daily', '1.0'],
        'about' => ['monthly', '0.7'],
        'departments' => ['weekly', '0.9'],
        'doctors' => ['weekly', '0.9'],
        'facilities' => ['monthly', '0.7'],
        'blog' => ['daily', '0.8'],
        'careers' => ['daily', '0.7'],
        'contact' => ['monthly', '0.8'],
    ];

    public function index(): void
    {
        $urls = [];

        foreach (self::FIXED as $path => [$frequency, $priority]) {
            $urls[] = [
                'loc' => Schema::siteUrl($path),
                'lastmod' => null,
                'changefreq' => $frequency,
                'priority' => $priority,
            ];
        }

        foreach ($this->collections() as [$rows, $prefix, $frequency, $priority]) {
            foreach ($rows as $row) {
                $slug = (string) ($row['id'] ?? $row['slug'] ?? '');

                if ($slug === '') {
                    continue;
                }

                $urls[] = [
                    'loc' => Schema::siteUrl($prefix . $slug),
                    'lastmod' => $this->lastmod($row),
                    'changefreq' => $frequency,
                    'priority' => $priority,
                ];
            }
        }

        header('Content-Type: application/xml; charset=UTF-8');
        echo $this->xml($urls);
    }

    /**
     * robots.txt.
     *
     * The three disallowed paths are the ones .htaccess already refuses or the
     * router already guards. Saying so here is not a second lock — it stops a
     * crawler spending its budget on 403s, and stops the panel's screens
     * turning up in an index because somebody linked one.
     *
     * A `noindex` policy in the settings disallows everything, because a site
     * that has asked not to be indexed has asked not to be crawled either.
     */
    public function robots(): void
    {
        $policy = strtolower(trim((string) setting('seo', 'robots', 'index, follow')));
        $sitemap = trim((string) setting('seo', 'sitemapUrl', '/sitemap.xml'));

        $lines = ['User-agent: *'];

        if (str_contains($policy, 'noindex')) {
            $lines[] = 'Disallow: /';
        } else {
            foreach (['/admin/', '/api/', '/storage/'] as $path) {
                $lines[] = 'Disallow: ' . $path;
            }

            $lines[] = 'Allow: /';
        }

        if ($sitemap !== '') {
            $lines[] = '';
            $lines[] = 'Sitemap: ' . (str_starts_with($sitemap, 'http')
                ? $sitemap
                : Schema::siteUrl(ltrim($sitemap, '/')));
        }

        header('Content-Type: text/plain; charset=UTF-8');
        echo implode("\n", $lines) . "\n";
    }

    /**
     * The rows with a page of their own.
     *
     * No doctors: the roster is one page, and a URL per doctor would be a
     * sitemap entry that 404s.
     *
     * @return array<int, array{0: array, 1: string, 2: string, 3: string}>
     */
    private function collections(): array
    {
        return [
            [departments_published(), '', 'monthly', '0.9'],
            [posts_published(), 'blog/', 'monthly', '0.6'],
            [jobs_open(), 'careers/', 'weekly', '0.5'],
        ];
    }

    /** A row's own timestamp, as the W3C date the spec asks for. */
    private function lastmod(array $row): ?string
    {
        foreach (['updatedAt', 'publishedAt', 'createdAt'] as $field) {
            $stamp = strtotime((string) ($row[$field] ?? '')) ?: null;

            if ($stamp !== null) {
                return date(DATE_ATOM, $stamp);
            }
        }

        return null;
    }

    private function xml(array $urls): string
    {
        $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $url) {
            $out .= '    <url>' . "\n"
                . '        <loc>' . htmlspecialchars($url['loc'], ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>' . "\n";

            if ($url['lastmod'] !== null) {
                $out .= '        <lastmod>' . $url['lastmod'] . '</lastmod>' . "\n";
            }

            $out .= '        <changefreq>' . $url['changefreq'] . '</changefreq>' . "\n"
                . '        <priority>' . $url['priority'] . '</priority>' . "\n"
                . '    </url>' . "\n";
        }

        return $out . '</urlset>' . "\n";
    }
}
