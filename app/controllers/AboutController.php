<?php

/**
 * The About page.
 *
 * Seven bands, and every one of them is a `page_sections` row — so the body
 * walks the sections it is given, in the panel's order, exactly as the home
 * page does. The banner and the stats band above them are not sections: no
 * screen in the panel edits them, and both are the same chrome every inner
 * page carries.
 *
 * The leadership strip is `leadership` rather than `doctors`: a chairman and a
 * head of nursing are not clinicians, and the section stores which category to
 * show. `all` — the seeded value — means every one of them.
 */
class AboutController extends SiteController
{
    protected string $active = 'about';

    public function index(): void
    {
        $page = page_by_slug('about');
        $sections = $page['sections'] ?? [];

        $story = page_section_data($page, 'story');
        $practice = page_section_data($page, 'in-practice');

        /* `all` is a category the table does not have — the model reads it as
           "no filter", and passing it through keeps that decision in one
           place rather than spelling the same special case here. */
        $category = trim((string) (page_section_data($page, 'leadership')['category'] ?? 'all'));

        $this->page('about', [
            'head' => $this->seoHead('page', 'about', [
                'title' => 'About Us',
                'description' => 'Teresa Memorial Hospital — 210 beds, 20 units and three decades of care '
                    . 'for Bardhaman (Burdwan) and the districts around it.',
                'schema' => [$this->crumbs(['About Us' => 'about'])],
            ]),

            'sections' => $sections,
            'story' => $story,
            'storyBody' => $this->paragraphs((string) ($story['body'] ?? '')),
            'purpose' => page_section_data($page, 'purpose'),
            'values' => page_section_data($page, 'values'),
            'milestones' => page_section_data($page, 'milestones'),
            'practice' => $practice,
            'careersCta' => page_section_data($page, 'careers-cta'),

            'leadership' => $this->leadershipCards(leadership_published($category)),
            'testimonials' => testimonials_published(),

            /* The About banner is about the hospital as a whole, so the band
               under it is the global set — the home page's is about a visit. */
            'counters' => counters_for_scope('global', 4) ?: counters_for_scope('home', 4),

            'storyImage' => site_url((string) ($story['image'] ?? ''), $this->defaultImage()),
            'bannerImage' => media_url('corridor.jpg', $this->defaultImage()),
            'careersEmail' => site_email_for('Careers'),
        ]);
    }

    /**
     * A leadership row in the shape card/doctor takes.
     *
     * `title` is the post held, which the card prints where a doctor's
     * speciality goes. The booking link only appears for somebody who also
     * holds a clinic: the card hides it when the slug is empty, and
     * `linkedDoctorId` is empty for everybody who does not.
     */
    private function leadershipCards(array $rows): array
    {
        return array_map(static fn (array $row): array => [
            'name' => (string) ($row['name'] ?? ''),
            'role' => (string) ($row['title'] ?? ''),
            'photo' => site_url((string) ($row['photo'] ?? '')),
            'slug' => (string) ($row['linkedDoctorId'] ?? ''),
            'qual' => '',
        ], $rows);
    }

    /**
     * Rich text from the panel, split back into the plain paragraphs the
     * blocks print.
     *
     * The blocks escape what they are given — they take an array of strings,
     * not markup — so a stored `<p>` has to be unwrapped here rather than
     * echoed and turned into visible tags.
     *
     * @return string[]
     */
    private function paragraphs(string $html): array
    {
        if (trim($html) === '') {
            return [];
        }

        $parts = preg_split('~</p\s*>~i', $html) ?: [];
        $out = [];

        foreach ($parts as $part) {
            $text = trim(html_entity_decode(strip_tags($part), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

            if ($text !== '') {
                $out[] = $text;
            }
        }

        return $out;
    }
}
