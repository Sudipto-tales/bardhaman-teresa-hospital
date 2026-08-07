<?php

/**
 * The departments listing, and the eleven pages behind it.
 *
 * One template for all eleven. Every difference between cardiology and
 * nutrition is a column on the row — the banner photo, the intro, the
 * procedure cards, the conditions list — which is what makes a twelfth
 * department a row in the panel rather than a file in this directory.
 */
class DepartmentController extends SiteController
{
    protected string $active = 'departments';

    public function index(): void
    {
        $departments = departments_published();

        $this->page('departments', [
            'head' => $this->seoHead('page', 'departments', [
                'title' => 'Our Departments',
                'description' => 'Every speciality at Teresa Memorial Hospital, and the consultants behind it.',
            ]),
            'departments' => $departments,
            'counters' => counters_for_scope('home', 4),
            'bannerImage' => (string) setting('seo', 'defaultOgImage', ''),
        ]);
    }

    /**
     * One department.
     *
     * This is also the site's catch-all: `{slug}` is the last route, so an
     * unknown one-segment path lands here. A slug that is not a published
     * department is handed to the redirect table and then to the 404, which is
     * the same answer any other unknown path gets.
     */
    public function show(): void
    {
        $slug = (string) $this->param('slug', '');
        $department = $slug === '' ? null : department_by_slug($slug);

        if ($department === null) {
            (new ErrorController())->redirectOr404();
            return;
        }

        $this->page('department', [
            'head' => $this->seoHead('department', $slug, [
                'title' => $department['name'] ?? '',
                'description' => $this->summarise($department['lead'] ?? ''),
                'ogImage' => $department['banner'] ?? '',
            ]),
            'department' => $department,
            /* A department's own numbers where it has them; the hospital's
               where it does not, so the band never renders as an empty strip. */
            'counters' => counters_for_department($slug, 4) ?: counters_for_scope('home', 4),
            'doctors' => doctors_for_department($slug),
            'faqs' => faqs_for_department($slug),
        ]);
    }
}
