<?php

/**
 * testimonials — §9. Replaces QUOTES in site-data.mjs.
 *
 * `status` doubles as the moderation queue: anything arriving from the website
 * form lands as draft and is not on the site until somebody publishes it.
 */
class TestimonialsTable extends Migration
{
    public function up()
    {
        $this->create('testimonials', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'text TEXT',
            'name VARCHAR(160) NOT NULL',
            'role VARCHAR(191)',
            'photo VARCHAR(500)',
            'rating INT',
            'department_id INT',
            /* website | google | manual */
            "source VARCHAR(20) NOT NULL DEFAULT 'manual'",
            $this->bool('featured'),
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('testimonials', 'public_id', true);
        $this->index('testimonials', 'status');
    }

    public function down()
    {
        $this->drop('testimonials');
    }
}
