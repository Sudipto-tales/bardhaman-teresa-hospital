<?php

/**
 * The two documents the footer has to link somewhere: the terms this website
 * is offered under, and what happens to the details a visitor types into it.
 *
 * Both are static prose, so neither reads a table. The text itself lives in
 * the page templates, next to the markup that shapes it.
 */
class LegalController extends SiteController
{
    public function terms(): void
    {
        $this->page('terms', [
            'head' => $this->seoHead('page', 'terms', [
                'title' => 'Terms & Conditions',
                'description' => 'The terms this website is offered under, and what it does and does not '
                    . 'promise, at Teresa Memorial Hospital, Bardhaman.',
                'schema' => [$this->crumbs(['Terms & Conditions' => 'terms'])],
            ]),
            'bannerImage' => media_url('reception.jpg', $this->defaultImage()),
        ]);
    }

    public function privacy(): void
    {
        $this->page('privacy', [
            'head' => $this->seoHead('page', 'privacy', [
                'title' => 'Privacy Policy',
                'description' => 'What Teresa Memorial Hospital collects through this website, why, '
                    . 'how long it is kept and how to have it corrected or erased.',
                'schema' => [$this->crumbs(['Privacy Policy' => 'privacy'])],
            ]),
            'bannerImage' => media_url('reception.jpg', $this->defaultImage()),
        ]);
    }
}
