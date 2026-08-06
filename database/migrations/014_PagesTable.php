<?php

/**
 * pages + page_sections — §12. One row per public page, one child row per
 * section of it.
 *
 * Sections are a table and not a JSON array on the page because they are
 * reordered and toggled individually, and a drag-to-reorder that rewrites the
 * whole page record loses whatever another editor saved in the meantime.
 *
 * `data` is JSON per section, because every section has a different shape —
 * the About page's milestones and the home page's hero have nothing in common
 * and giving them shared columns would mean thirty nullable ones.
 *
 * This is deliberately not a generic block builder. Each public page has a
 * fixed, known layout and a purpose-built editor screen; `section_key` is what
 * ties a row to the component that renders it.
 */
class PagesTable extends Migration
{
    public function up()
    {
        $this->create('pages', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'title VARCHAR(191) NOT NULL',
            'path VARCHAR(191) NOT NULL',
            "status VARCHAR(20) NOT NULL DEFAULT 'published'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('pages', 'slug', true);

        $this->create('page_sections', [
            $this->id(),
            'page_id INT NOT NULL',
            'section_key VARCHAR(64) NOT NULL',
            'label VARCHAR(160)',
            $this->bool('enabled', true),
            'sort_order INT NOT NULL DEFAULT 0',
            $this->json('data'),
            'updated_by INT',
            $this->timestamps(),
            'FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE',
        ]);

        $this->index('page_sections', 'page_id, section_key', true);
    }

    public function down()
    {
        $this->drop('page_sections');
        $this->drop('pages');
    }
}
