<?php

/**
 * facilities — §5. Replaces FACILITIES in site-data.mjs and facilities.html.
 */
class FacilitiesTable extends Migration
{
    public function up()
    {
        $this->create('facilities', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'icon VARCHAR(80)',
            'title VARCHAR(191) NOT NULL',
            'text TEXT',
            'image VARCHAR(500)',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('facilities', 'slug', true);
        $this->index('facilities', 'status');
    }

    public function down()
    {
        $this->drop('facilities');
    }
}
