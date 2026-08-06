<?php

/**
 * applications — §18. What the careers form writes.
 *
 * `cv_file` is the applicant's own filename, kept only for display.
 * `cv_path` is where the file actually sits, under storage/cv/, outside the
 * web root, under a random name. It is served by GET /api/applications/{id}/cv
 * and by nothing else — a CV reachable by URL is a named person's address and
 * phone number reachable by URL.
 *
 * `job_title` duplicates the job's title on purpose. This is somebody's job
 * application; it has to stay readable even if the posting it answered is
 * deleted rather than closed, and that is worth one denormalised column.
 *
 * `notified_at` records the mail to HR and `notify_error` the reason it failed.
 * The row is written before the mail is attempted, so a dead SMTP server
 * costs a notification and never an application.
 *
 * `stage` is the panel's own pipeline. Nothing on the public site can see it,
 * so it costs nothing to keep and saves whoever reads the inbox from tracking
 * candidates somewhere else.
 */
class ApplicationsTable extends Migration
{
    public function up()
    {
        $this->create('applications', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'job_id INT',
            'job_title VARCHAR(191)',
            'name VARCHAR(160) NOT NULL',
            'email VARCHAR(191) NOT NULL',
            'phone VARCHAR(40)',
            'experience VARCHAR(120)',
            'current_employer VARCHAR(191)',
            'cv_file VARCHAR(255)',
            'cv_path VARCHAR(255)',
            'cv_size INT',
            'cover_note TEXT',
            /* new | shortlisted | interview | offered | rejected */
            "stage VARCHAR(20) NOT NULL DEFAULT 'new'",
            'rating INT',
            $this->json('notes'),
            'applied_at DATETIME',
            'notified_at DATETIME',
            'notify_error VARCHAR(500)',
            'ip VARCHAR(45)',
            'sort_order INT NOT NULL DEFAULT 0',
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('applications', 'public_id', true);
        $this->index('applications', 'job_id');
        $this->index('applications', 'stage');
        $this->index('applications', 'applied_at');
    }

    public function down()
    {
        $this->drop('applications');
    }
}
