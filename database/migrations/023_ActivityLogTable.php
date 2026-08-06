<?php

/**
 * activity_log — §23. Every mutation the API performs writes one row.
 *
 * With several people editing the same site and roles deliberately not
 * enforced (docs/php/06-decisions.md §2), this is the only answer to "who
 * changed the emergency number". It is read-only from the panel; nothing
 * offers a delete.
 *
 * `diff` holds the changed fields as JSON — before and after, and only the
 * fields that moved. Storing whole records would make the log larger than the
 * content within a month.
 */
class ActivityLogTable extends Migration
{
    public function up()
    {
        $this->create('activity_log', [
            $this->id(),
            'user_id INT',
            'user_name VARCHAR(160)',
            /* create | update | delete | restore | publish | login | logout */
            'action VARCHAR(40) NOT NULL',
            'entity VARCHAR(60)',
            'entity_id VARCHAR(64)',
            'summary VARCHAR(500)',
            $this->json('diff'),
            'ip VARCHAR(45)',
            'created_at DATETIME',
        ]);

        $this->index('activity_log', 'created_at');
        $this->index('activity_log', 'entity, entity_id');
        $this->index('activity_log', 'user_id');
    }

    public function down()
    {
        $this->drop('activity_log');
    }
}
