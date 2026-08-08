<?php

/**
 * faqs — §10. Replaces the accordion hardcoded in the prototype's home page.
 *
 * `faq_group` says which accordion the question belongs to; `group` is a
 * reserved word in MySQL.
 */
class FaqsTable extends Migration
{
    public function up()
    {
        $this->create('faqs', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'question VARCHAR(500) NOT NULL',
            'answer TEXT',
            /* home | contact | department */
            "faq_group VARCHAR(40) NOT NULL DEFAULT 'home'",
            'department_id INT',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('faqs', 'public_id', true);
        $this->index('faqs', 'faq_group');
    }

    public function down()
    {
        $this->drop('faqs');
    }
}
