<?php

/**
 * enquiries — §19. What the contact form writes, and what the contact page's
 * appointment-request form writes too, with source = appointment (§20). The
 * hospital does not book online; the desk calls back.
 *
 * `replies` and `internal_notes` are JSON arrays rather than a messages table.
 * They are appended to and read as a block on one screen, never searched
 * across enquiries, and a table would be two joins for something that renders
 * as a thread on a single record.
 *
 * `doctor_id` is set when the enquiry came from a doctor card's link — the
 * form preselects them and the desk knows who to route it to.
 */
class EnquiriesTable extends Migration
{
    public function up()
    {
        $this->create('enquiries', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'name VARCHAR(160) NOT NULL',
            'email VARCHAR(191)',
            'phone VARCHAR(40)',
            'subject VARCHAR(255)',
            'message TEXT',
            /* contact | appointment | chat | phone | landing */
            "source VARCHAR(40) NOT NULL DEFAULT 'contact'",
            'department_id INT',
            'doctor_id INT',
            'preferred_date DATE',
            'assigned_to INT',
            /* new | replied | closed | spam */
            "status VARCHAR(20) NOT NULL DEFAULT 'new'",
            "priority VARCHAR(20) NOT NULL DEFAULT 'normal'",
            $this->json('replies'),
            $this->json('internal_notes'),
            'received_at DATETIME',
            'notified_at DATETIME',
            'notify_error VARCHAR(500)',
            'ip VARCHAR(45)',
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('enquiries', 'public_id', true);
        $this->index('enquiries', 'status');
        $this->index('enquiries', 'received_at');
    }

    public function down()
    {
        $this->drop('enquiries');
    }
}
