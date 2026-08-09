<?php

/**
 * gallery — the photos, uploaded clips and YouTube embeds behind /gallery.
 *
 * Not the `media` table. That one is the panel's asset library: every file
 * anybody has ever uploaded for any screen, addressed by picker. This is a
 * curated, ordered, published list of things meant to be looked at, which is
 * a different lifetime and a different audience — hiding a gallery item must
 * not delete the file a doctor's profile is also using, and uploading a logo
 * must not put the logo on a public wall.
 *
 * One `image` column rather than image + video_poster: every row of every type
 * needs exactly one still, because the grid tile is a poster whatever it opens
 * into. Two columns holding the same picture is the pair that goes stale.
 *
 * `video_path` is root-relative, matching MediaController's `url` — the stored
 * value has to survive the site moving between a staging domain and its own.
 */
class GalleryTable extends Migration
{
    public function up()
    {
        $this->create('gallery', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            /* image | video | youtube — what the lightbox opens. */
            "type VARCHAR(20) NOT NULL DEFAULT 'image'",
            /* Free text, and the filter chips on the page are built from the
               distinct values. A fixed enum here would mean a migration every
               time the hospital held an event worth its own row of photos. */
            'album VARCHAR(80)',
            'title VARCHAR(191) NOT NULL',
            'caption TEXT',
            /* The photo itself, or the poster for a video or a YouTube id. */
            'image VARCHAR(500)',
            'video_path VARCHAR(500)',
            'youtube_id VARCHAR(40)',
            /* Both filled by ffprobe after the transcode, and both only ever
               displayed: the panel shows what an upload actually cost. */
            'duration INT',
            'size_bytes INT',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('gallery', 'slug', true);
        $this->index('gallery', 'status');
        $this->index('gallery', 'album');
    }

    public function down()
    {
        $this->drop('gallery');
    }
}
