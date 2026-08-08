<?php

/**
 * Careers — the openings list, and one vacancy with its application form.
 *
 * The list is rendered here rather than left to initCareers() in
 * assets/pages.js: the vacancies are rows in the panel, and a list built from
 * a JavaScript global is a list a search engine never sees. The script keeps
 * the department filter, which now hides the rendered rows instead of
 * rebuilding them.
 *
 * The application form posts to POST api/public/application, which checks a
 * token — hence Csrf::token() here — and reads the CV as a file upload, so the
 * form is multipart and the page has to be the thing that issues both.
 */
class CareersController extends SiteController
{
    protected string $active = 'careers';

    public function index(): void
    {
        $page = page_by_slug('careers');
        $sections = $page['sections'] ?? [];

        $this->page('careers', [
            'head' => $this->seoHead('page', 'careers', [
                'title' => 'Careers',
                'schema' => [$this->crumbs(['Careers' => 'careers'])],
                'description' => 'Consultant, nursing, technician and administrative roles at '
                    . 'Teresa Memorial Hospital — funded training, honest rosters, internal-first promotion.',
            ]),

            'sections' => $sections,
            'whyUs' => page_section_data($page, 'why-us'),
            'offer' => page_section_data($page, 'what-we-offer'),
            'openings' => page_section_data($page, 'openings'),
            'contactHr' => page_section_data($page, 'contact-hr'),

            'jobs' => jobs_open(),
            'bannerImage' => media_url('team.jpg', $this->defaultImage()),
            'introImage' => media_url('consult.jpg', $this->defaultImage()),
            'careersEmail' => $this->hrEmail($page),
        ]);
    }

    /**
     * One vacancy.
     *
     * A closed or unknown slug goes to the redirect table and then to the 404,
     * the same answer any other unknown path gets — an expired link should not
     * sit there collecting applications for a role nobody is hiring for.
     */
    public function show(): void
    {
        $slug = (string) $this->param('slug', '');
        $job = $slug === '' ? null : job_by_slug($slug);

        if ($job === null) {
            (new ErrorController())->redirectOr404();
            return;
        }

        $page = page_by_slug('careers');
        $email = (string) ($job['applyEmail'] ?? '') ?: $this->hrEmail($page);

        $this->page('job', [
            'head' => $this->seoHead('job', $slug, [
                'title' => (string) ($job['title'] ?? ''),
                'description' => $this->summarise($job['summary'] ?? ''),
                'schema' => [
                    Schema::jobPosting($job, Schema::siteUrl('careers/' . $slug)),
                    $this->crumbs(['Careers' => 'careers', (string) ($job['title'] ?? '') => 'careers/' . $slug]),
                ],
            ]),

            'job' => $job,
            'csrf' => Csrf::token(),
            'action' => base_url('api/public/application'),
            'careersEmail' => $email,
            'bannerImage' => media_url('team.jpg', $this->defaultImage()),
        ]);
    }

    /**
     * The mailbox HR reads.
     *
     * The Contact HR section carries one, because whoever writes that band is
     * the person who knows it; the settings screen's Careers row is the
     * fallback, and the reception address the last resort.
     */
    private function hrEmail(?array $page): string
    {
        $stored = trim((string) (page_section_data($page, 'contact-hr')['email'] ?? ''));

        return $stored !== '' ? $stored : site_email_for('Careers');
    }
}
