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
    /* "About Us", which is where the nav now reaches this page from — its drop
       carries Our Doctors. It used to light "Our Department" instead, on the
       reasoning that a doctor is reached through a speciality; the roster has
       its own nav item now, so the pill follows it. */
    protected string $active = 'about';

    public function index(): void
    {
        $doctors = doctors_published();

        $this->page('doctors', [
            'head' => $this->seoHead('page', 'doctors', [
                'title' => 'Our Doctors — Consultants in Bardhaman',
                'description' => 'Meet the consultants of Teresa Memorial Hospital, Bardhaman (Burdwan) — '
                    . 'cardiology, neurosurgery, orthopedics, obstetrics, nephrology and pediatrics.',
                'schema' => [$this->crumbs(['Doctors' => 'doctors'])],
            ]),
            'doctors' => $doctors,
            'counters' => counters_for_scope('home', 4),
            'bannerImage' => (string) setting('seo', 'defaultOgImage', ''),
        ]);
    }
}
