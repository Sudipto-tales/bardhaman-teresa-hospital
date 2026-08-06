<?php

/**
 * lab_tests — §6. Individual tests and health packages in one table,
 * separated by `category`, because they are listed together, priced the same
 * way and differ only in whether `includes` has anything in it.
 *
 * Prices are integers in paise-free rupees — the site quotes whole rupees and
 * a float would eventually print ₹1199.9999.
 */
class LabTestsTable extends Migration
{
    public function up()
    {
        $this->create('lab_tests', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'name VARCHAR(191) NOT NULL',
            /* test | package */
            "category VARCHAR(20) NOT NULL DEFAULT 'test'",
            'icon VARCHAR(80)',
            'description TEXT',
            $this->json('includes'),
            'price INT',
            'discount_price INT',
            'prep_instructions TEXT',
            'report_time VARCHAR(120)',
            $this->bool('home_collection'),
            $this->bool('featured'),
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('lab_tests', 'slug', true);
        $this->index('lab_tests', 'status');
        $this->index('lab_tests', 'featured');
    }

    public function down()
    {
        $this->drop('lab_tests');
    }
}
