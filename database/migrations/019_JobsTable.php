<?php

/**
 * jobs — §17. Replaces window.TMH_JOBS in html/assets/jobs.js.
 *
 * `status = hidden` is how a vacancy closes; nothing is deleted, because the
 * applications already attached to it still have to be readable. An empty
 * published set is a real state — the careers page has a panel for it.
 *
 * `apply_email` overrides the careers address from settings for one posting,
 * which is how a department that handles its own hiring gets its own mail.
 */
class JobsTable extends Migration
{
    public function up()
    {
        $this->create('jobs', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'title VARCHAR(191) NOT NULL',
            'dept VARCHAR(160) NOT NULL',
            'type VARCHAR(60)',
            'location VARCHAR(160)',
            'experience VARCHAR(120)',
            'posted_at DATE',
            'closes_at DATE',
            'summary TEXT NOT NULL',
            $this->json('responsibilities'),
            $this->json('requirements'),
            $this->json('benefits'),
            $this->json('nice_to_have'),
            'salary_from INT',
            'salary_to INT',
            'salary_note VARCHAR(255)',
            'apply_email VARCHAR(191)',
            'openings INT',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('jobs', 'slug', true);
        $this->index('jobs', 'status');
    }

    public function down()
    {
        $this->drop('jobs');
    }
}
