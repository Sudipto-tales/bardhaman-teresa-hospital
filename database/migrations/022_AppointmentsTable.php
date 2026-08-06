<?php

/**
 * appointments — §20. Read-only.
 *
 * The hospital does not take bookings online, so nothing in this application
 * writes this table: there is no create endpoint and no status-change
 * endpoint. The table exists because the records that already exist still have
 * to be readable, and the panel screen that lists them still has to render.
 *
 * What the site does instead is in enquiries, with source = appointment.
 *
 * If bookings ever become real, this is the table they land in — which is why
 * the columns describe a booking properly rather than being trimmed to what
 * the read-only screen happens to show today.
 */
class AppointmentsTable extends Migration
{
    public function up()
    {
        $this->create('appointments', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'patient_name VARCHAR(160) NOT NULL',
            'phone VARCHAR(40)',
            'email VARCHAR(191)',
            'department_id INT',
            'doctor_id INT',
            'preferred_date DATE',
            'preferred_slot VARCHAR(60)',
            'reason TEXT',
            /* pending | confirmed | cancelled | completed */
            "status VARCHAR(20) NOT NULL DEFAULT 'pending'",
            'confirmed_slot VARCHAR(60)',
            'cancel_reason VARCHAR(500)',
            'confirmed_at DATETIME',
            $this->timestamps(),
        ]);

        $this->index('appointments', 'public_id', true);
        $this->index('appointments', 'status');
        $this->index('appointments', 'preferred_date');
    }

    public function down()
    {
        $this->drop('appointments');
    }
}
