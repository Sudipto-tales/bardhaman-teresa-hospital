<?php

/**
 * redirects — §16. What keeps the old static URLs alive: every visitor with
 * /doctors.html bookmarked, and every search result pointing at one, lands on
 * /doctors instead of a 404.
 *
 * `from` and `to` are reserved words, hence the column names. `hits` is
 * incremented on use — a redirect nobody has followed in a year is one that
 * can be retired.
 */
class RedirectsTable extends Migration
{
    public function up()
    {
        $this->create('redirects', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'from_path VARCHAR(500) NOT NULL',
            'to_path VARCHAR(500) NOT NULL',
            'code INT NOT NULL DEFAULT 301',
            'hits INT NOT NULL DEFAULT 0',
            $this->bool('active', true),
            'sort_order INT NOT NULL DEFAULT 0',
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('redirects', 'public_id', true);
        $this->index('redirects', 'from_path');
    }

    public function down()
    {
        $this->drop('redirects');
    }
}
