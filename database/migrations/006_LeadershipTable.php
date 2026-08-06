<?php

/**
 * leadership — §3.
 *
 * Separate from doctors because a chairman and a head of nursing are not
 * clinicians and have no qualification, schedule or department. The About page
 * currently fakes this strip by reusing four doctor cards.
 *
 * `linked_doctor_id` covers the overlap — a medical director who is also a
 * consultant — without duplicating the clinical record.
 */
class LeadershipTable extends Migration
{
    public function up()
    {
        $this->create('leadership', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'name VARCHAR(160) NOT NULL',
            'title VARCHAR(191)',
            'photo VARCHAR(500)',
            /* board | management | clinical-leadership */
            "category VARCHAR(40) NOT NULL DEFAULT 'management'",
            'message TEXT',
            'linked_doctor_id INT',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('leadership', 'slug', true);
        $this->index('leadership', 'status');
    }

    public function down()
    {
        $this->drop('leadership');
    }
}
