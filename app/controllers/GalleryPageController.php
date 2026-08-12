<?php

/**
 * /gallery — the photos, clips and talks.
 *
 * `$active` is 'facilities' rather than a key of its own: the gallery is a row
 * in the Facilities drop-down, and the pill above an open drop-down stays lit
 * on every page it leads to. About Us does the same for three pages.
 *
 * The whole published set goes to the template and the filtering happens in
 * the browser. A gallery is tens of rows, not thousands, and a chip that
 * reloads the page is a chip that loses the visitor's place in the grid.
 *
 * Named GalleryPageController, not GalleryController: the autoloader in
 * config/route.php keys classes on basename across app/controllers and
 * api/controllers, first one wins, and the panel's video-upload endpoint is
 * already the other name.
 */
class GalleryPageController extends SiteController
{
    protected string $active = 'facilities';

    public function index(): void
    {
        $items = gallery_published();

        /* The channel rail's heading is a link, and the URL is already kept
           once — the social repeater the footer reads. Absent from settings,
           the heading is plain text rather than a link to nowhere. */
        $channel = '';
        foreach ($this->social() as $row) {
            if (strcasecmp((string) $row['label'], 'youtube') === 0) {
                $channel = (string) $row['url'];
                break;
            }
        }

        $this->page('gallery', [
            'head' => $this->seoHead('page', 'gallery', [
                'title' => 'Gallery — Photos & Video from Teresa Memorial Hospital',
                'description' => 'Inside the wards, theatres and laboratory at Teresa Memorial Hospital, '
                    . 'Bardhaman (Burdwan) — photographs, video and talks from our consultants.',
                'schema' => [$this->crumbs(['Gallery' => 'gallery'])],
            ]),
            'items' => $items,
            'albums' => gallery_albums($items),
            'channel' => $channel,
            'bannerImage' => media_url('corridor.jpg', $this->defaultImage()),
        ]);
    }
}
