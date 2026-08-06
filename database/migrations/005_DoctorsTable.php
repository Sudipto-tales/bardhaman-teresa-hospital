<?php

/**
 * doctors — §2. Replaces DOCS and ROSTER in tools/site-data.mjs.
 *
 * Two decisions worth stating:
 *
 * `schedule` is a JSON column, not a doctor_schedules table. The plan listed
 * one, but a schedule is only ever read as a block belonging to one doctor —
 * the site never asks "who is available on Tuesday". A table would buy a query
 * nobody makes and cost a join on every doctor page.
 *
 * `appointment_enabled` decides whether the doctor card carries a link to the
 * contact form (§2, §20). It is not a booking flag — the site takes no
 * bookings at all. Default 1, because a new doctor is contactable unless
 * somebody says otherwise.
 *
 * Media columns across this schema hold a URL rather than a media id: the
 * seeded content is a set of external image URLs, uploaded files resolve to a
 * URL too, and a picker that can only offer uploads would break the seed.
 */
class DoctorsTable extends Migration
{
    public function up()
    {
        $this->create('doctors', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'name VARCHAR(160) NOT NULL',
            'role VARCHAR(191)',
            'qualification VARCHAR(255)',
            'experience_years INT',
            'photo VARCHAR(500)',
            'speciality VARCHAR(191)',
            'registration_no VARCHAR(120)',
            $this->json('languages'),
            'bio TEXT',
            $this->json('schedule'),
            'consultation_fee INT',
            'rating DECIMAL(2,1)',
            'review_count INT',
            $this->bool('is_leadership'),
            $this->bool('appointment_enabled', true),
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('doctors', 'slug', true);
        $this->index('doctors', 'status');
        $this->index('doctors', 'sort_order');
    }

    public function down()
    {
        $this->drop('doctors');
    }
}
