<?php

/**
 * categories — §8. Blog categories and tags in one table, split by `type`.
 *
 * They are the same shape and the same screen edits both; two tables would
 * mean two of every query on the blog listing. The unique index is on
 * (type, slug) so a "Cardiology" category and a "cardiology" tag can coexist,
 * which they do today.
 */
class CategoriesTable extends Migration
{
    public function up()
    {
        $this->create('categories', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'name VARCHAR(160) NOT NULL',
            /* category | tag */
            "type VARCHAR(20) NOT NULL DEFAULT 'category'",
            'description VARCHAR(500)',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('categories', 'type, slug', true);
    }

    public function down()
    {
        $this->drop('categories');
    }
}
