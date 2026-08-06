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
 * `path` is relative to storage/uploads/. The public URL is derived from it,
 * so moving the upload directory does not rewrite every row.
 */
class MediaTable extends Migration
{
    public function up()
    {
        $this->create('media', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'path VARCHAR(255) NOT NULL',
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
