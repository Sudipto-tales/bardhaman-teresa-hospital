<?php

/**
 * roles — §22.
 *
 * `permissions` is a JSON map of module → allowed verbs. It is stored, edited
 * and displayed, and deliberately not enforced anywhere: see
 * docs/php/06-decisions.md §2. Storing it now means turning enforcement on
 * later is a middleware change and not a data migration.
 */
class RolesTable extends Migration
{
    public function up()
    {
        $this->create('roles', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'name VARCHAR(120) NOT NULL',
            'description VARCHAR(255)',
            $this->json('permissions'),
            'sort_order INT NOT NULL DEFAULT 0',
            $this->timestamps(),
        ]);

        $this->index('roles', 'public_id', true);
    }

    public function down()
    {
        $this->drop('roles');
    }
}
