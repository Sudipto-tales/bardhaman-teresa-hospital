<?php

/**
 * counters — §13. Every animated number on the site in one table, so "640
 * beds" is changed once instead of in the home page block and in four
 * department stat strips.
 *
 * `scope` says where a counter appears; when it is `department`,
 * `department_id` names which one, and that pair replaces the stats[] array
 * that used to sit inside each DEPARTMENTS record.
 *
 * `value` is text, not a number: the site prints "4.8" and "24/7" as well as
 * "640", and the counter animation parses what it can and prints the rest.
 */
class CountersTable extends Migration
{
    public function up()
    {
        $this->create('counters', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'counter_key VARCHAR(120) NOT NULL',
            'icon VARCHAR(80)',
            'label VARCHAR(191) NOT NULL',
            'value VARCHAR(40) NOT NULL',
            'suffix VARCHAR(20)',
            'note VARCHAR(191)',
            /* global | home | about | department */
            "scope VARCHAR(20) NOT NULL DEFAULT 'global'",
            'department_id INT',
            'sort_order INT NOT NULL DEFAULT 0',
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('counters', 'public_id', true);
        $this->index('counters', 'scope, department_id');
    }

    public function down()
    {
        $this->drop('counters');
    }
}
