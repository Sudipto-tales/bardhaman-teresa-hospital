<?php

/**
 * seo_meta — §14. Attached to doctors, departments, posts and pages.
 *
 * One polymorphic table rather than six columns repeated on four tables,
 * because the SEO screen edits every entity's metadata in one list — and that screen
 * is a single query here and a four-way UNION otherwise.
 *
 * The trade is the usual one: no foreign key can span entity types, so a
 * deleted record leaves its meta row behind. The resource controller deletes
 * the pair together, and an orphan is one unread row rather than a broken
 * page.
 */
class SeoMetaTable extends Migration
{
    public function up()
    {
        $this->create('seo_meta', [
            $this->id(),
            /* doctor | department | post | page */
            'entity_type VARCHAR(40) NOT NULL',
            'entity_id INT NOT NULL',
            'meta_title VARCHAR(255)',
            'meta_description VARCHAR(500)',
            'og_image VARCHAR(500)',
            'canonical VARCHAR(500)',
            $this->bool('noindex'),
            'keywords VARCHAR(500)',
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('seo_meta', 'entity_type, entity_id', true);
    }

    public function down()
    {
        $this->drop('seo_meta');
    }
}
