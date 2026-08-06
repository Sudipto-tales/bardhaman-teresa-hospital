<?php

/**
 * nav_items — §15. Replaces navBar() and megaMenu() in build-pages.mjs and
 * the four footer link columns.
 *
 * `location` selects the menu; `parent_id` nests within it. Both the header
 * dropdowns and the mega menu are one level deep today, but the column costs
 * nothing and a second level would otherwise be a migration.
 */
class NavItemsTable extends Migration
{
    public function up()
    {
        $this->create('nav_items', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            /* header | mega | footer-1..4 | dock | mobile */
            'location VARCHAR(40) NOT NULL',
            'label VARCHAR(160) NOT NULL',
            'href VARCHAR(500) NOT NULL',
            'icon VARCHAR(80)',
            'target VARCHAR(20)',
            'parent_id INT',
            'sort_order INT NOT NULL DEFAULT 0',
            $this->bool('visible', true),
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('nav_items', 'public_id', true);
        $this->index('nav_items', 'location, sort_order');
    }

    public function down()
    {
        $this->drop('nav_items');
    }
}
