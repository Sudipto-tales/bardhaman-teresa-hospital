<?php

/**
 * rate_limits — one row per attempt, counted within a fixed window by
 * core/RateLimit.php.
 *
 * Guards the three endpoints anyone can reach without an account: the contact
 * form, the application form and the login screen. Without it the first two
 * are a free mail relay aimed at the hospital's own inbox and the third is an
 * open door to password guessing.
 *
 * `client_key` is the IP, or the IP and an email where limiting a single
 * account matters more than limiting an address.
 *
 * Rows are pruned probabilistically on write, because there is no cron on this
 * deployment and a limiter that needs a scheduled job to stay usable will stop
 * being usable.
 */
class RateLimitsTable extends Migration
{
    public function up()
    {
        $this->create('rate_limits', [
            $this->id(),
            'action VARCHAR(60) NOT NULL',
            'client_key VARCHAR(191) NOT NULL',
            'created_at DATETIME NOT NULL',
        ]);

        $this->index('rate_limits', 'action, client_key, created_at');
    }

    public function down()
    {
        $this->drop('rate_limits');
    }
}
