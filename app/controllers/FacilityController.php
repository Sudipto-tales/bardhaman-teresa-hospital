<?php

/**
 * What is on the campus — the twelve service tiles, and the visiting rules
 * people ask the front desk for.
 */
class FacilityController extends SiteController
{
    protected string $active = 'facilities';

    public function index(): void
    {
        $this->page('facilities', [
            'head' => $this->seoHead('page', 'facilities', [
                'title' => 'Facilities — ICU, Theatres & Lab in Bardhaman',
                'description' => 'Emergency, intensive care, modular theatres, laboratory, imaging, pharmacy '
                    . 'and ambulance services at Teresa Memorial Hospital, Bardhaman (Burdwan).',
                'schema' => [$this->crumbs(['Facilities' => 'facilities'])],
            ]),
            'facilities' => facilities_published(),
            'counters' => counters_for_scope('global', 4) ?: counters_for_scope('home', 4),
            'bannerImage' => media_url('ward.jpg', $this->defaultImage()),
            'introImage' => media_url('theatre.jpg', $this->defaultImage()),
            'introImageAlt' => media_alt('theatre.jpg', 'A modular operating theatre at Teresa Memorial Hospital'),
            'labDiagnostics' => department_by_slug('pathology') !== null,
        ]);
    }
}
