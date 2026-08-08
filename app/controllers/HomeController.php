<?php

/**
 * The front page.
 *
 * Eleven bands, and every one of them is a row in `page_sections` — so a band
 * is switched off in the panel rather than deleted from a template. `page()`
 * only ever sees the enabled ones (page_by_slug filters), which is why the
 * template asks `isset($sections['care'])` rather than reading a flag.
 *
 * Order comes from `sort_order` too — the panel's Home screen says "drag a
 * card to move a section" and "save to apply it to the public page", so the
 * template walks the sections it is given rather than listing them itself.
 * page_by_slug already returns them ordered.
 *
 * The twelfth section, `contact`, is the site footer. That is chrome and
 * SiteController::page() renders it either way, so the body skips it.
 */
class HomeController extends SiteController
{
    protected string $active = 'home';

    public function index(): void
    {
        $page = page_by_slug('home');
        $sections = $page['sections'] ?? [];

        $doctorLimit = (int) (page_section_data($page, 'doctors')['limit'] ?? 6);
        $labLimit = (int) (page_section_data($page, 'lab-tests')['limit'] ?? 6);
        $postLimit = (int) (page_section_data($page, 'articles')['limit'] ?? 3);

        /* The panel labels the accordions Home / Contact / Department and
           stores the label; the column holds the lowercase key those labels
           map to (tools/seed-export.mjs, `vocab('faqs.group', …)`). Folding
           the case here is what stops "Home" from finding nothing. */
        $faqGroup = strtolower(trim((string) (page_section_data($page, 'faq')['group'] ?? 'home')));

        $departments = departments_published();
        $doctors = doctors_published($doctorLimit);
        $faqs = faqs_for_group($faqGroup);

        $this->page('home', [
            'head' => $this->seoHead('page', 'home', [
                /* The home page is not "Home — Teresa Memorial Hospital", it
                   is the hospital. head.php takes titleFull verbatim. */
                'titleFull' => (string) setting('general', 'name', 'Teresa Memorial Hospital')
                    . ' &mdash; ' . (string) setting('general', 'tagline', 'Bardhaman'),
                'description' => 'A 210-bed multispeciality hospital and nursing home in Bardhaman (Burdwan) '
                    . 'with a 24/7 emergency, twelve departments and a same-day laboratory.',
                /* website.html loads no pages.css — every rule the home page
                   needs is in website.css, and pages.css restyles some of the
                   same class names for the inner pages. */
                'styles' => ['assets/website.css'],

                /* No breadcrumb: the home page is the root, and a trail of
                   itself is what Schema::breadcrumbs() refuses to build. */
                'schema' => [Schema::faqPage($faqs, Schema::siteUrl())],
            ]),

            /* The home page is driven entirely by website.js; pages.js is for
               the inner pages and its initialisers would find no hooks here. */
            'scripts' => ['pages' => false],

            'sections' => $sections,
            'hero' => page_section_data($page, 'hero'),
            'departments' => $departments,
            'doctors' => $doctors,
            'labTests' => lab_tests_featured($labLimit),
            'testimonials' => testimonials_published(),
            'counters' => counters_for_scope('home', 4),
            'faqs' => $faqs,
            'posts' => posts_published(['limit' => $postLimit]),
            'postTotal' => count(posts_published()),

            /* The doctor tabs filter on data-specialty, and a department is
               the only grouping every doctor actually has. Built from the
               doctors on the page rather than from all eleven departments, so
               a tab can never come up empty. */
            'doctorTabs' => $this->doctorTabs($doctors, $departments),

            'bannerImage' => $this->defaultImage(),
        ]);
    }

    /**
     * [slug => label] for the carousel's filter row, in the departments' own
     * order, covering only the departments the rendered doctors belong to.
     *
     * @param array $doctors     Rows carrying a `departments` array of slugs
     * @param array $departments Every published department, in sort order
     */
    private function doctorTabs(array $doctors, array $departments): array
    {
        $used = [];

        foreach ($doctors as $doctor) {
            foreach ((array) ($doctor['departments'] ?? []) as $slug) {
                $used[(string) $slug] = true;
            }
        }

        $tabs = [];

        foreach ($departments as $department) {
            $slug = (string) ($department['id'] ?? '');

            if ($slug !== '' && isset($used[$slug])) {
                $tabs[$slug] = (string) ($department['name'] ?? $slug);
            }
        }

        return $tabs;
    }
}
