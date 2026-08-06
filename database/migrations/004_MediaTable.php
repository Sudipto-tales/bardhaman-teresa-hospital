<?php

/**
 * media — §11. Every uploaded image, and the pool the whole panel picks from.
 *
 * There is no `used_by` column. The content model lists it as a read-only
 * back-reference, and a stored copy of it would be wrong the moment any record
 * that points at a file is edited by something that forgets to update it.
 * MediaController computes it on demand from the tables that reference media,
 * which is the only version that cannot go stale — and it is only ever needed
 * on one screen and one confirm dialog.
 *
 * `url` is what every other table stores and every template renders. `path` is
 * where an uploaded file sits under assets/uploads/, and is null for anything
 * hosted elsewhere — the seeded library is a set of external image URLs, and a
 * table that could only describe uploads would have nothing to say about them.
 * Deleting a row only removes a file from disk when `path` is set.
 */
class MediaTable extends Migration
{
    public function up()
    {
        $this->create('media', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'url VARCHAR(500) NOT NULL',
            'path VARCHAR(255)',
            'filename VARCHAR(255) NOT NULL',
            'mime VARCHAR(120)',
            'alt VARCHAR(255)',
            'caption VARCHAR(500)',
            'folder VARCHAR(120)',
            'width INT',
            'height INT',
            'size_bytes INT',
            'uploaded_by INT',
            $this->timestamps(),
        ]);

        $this->index('media', 'public_id', true);
        $this->index('media', 'folder');
    }

    public function down()
    {
        $this->drop('media');
    }
}
