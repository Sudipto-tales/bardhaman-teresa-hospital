<?php

/**
 * The consultant roster.
 *
 * One screen, no detail page: a doctor's record is a card, and the design
 * never gave one a page of its own. What a card links to is the contact form
 * with `?doctor=` on it, which is the booking route the site actually has —
 * docs/02-content-model.md §20.
 */
class DoctorController extends SiteController
{
    /* The design lights "Our Department" for this page: a doctor is reached
       through a speciality, and the nav has no Doctors link of its own. */
    protected string $active = 'departments';

    public function index(): void
    {
        $doctors = doctors_published();

        $this->page('doctors', [
            'head' => $this->seoHead('page', 'doctors', [
                'title' => 'Our Doctors',
                'description' => 'Meet the consultants of Teresa Memorial Hospital — cardiology, '
                    . 'neurosurgery, orthopedics, obstetrics, nephrology, pediatrics and more.',
            ]),
            'doctors' => $doctors,
            'counters' => counters_for_scope('home', 4),
            'bannerImage' => (string) setting('seo', 'defaultOgImage', ''),
            'phone' => site_primary_phone()['number'],
        ]);
    }
}
