<?php

/**
 * users — §21. Panel accounts. Nobody on the public site has one.
 *
 * `password` holds a bcrypt hash and is the only column the API never returns.
 * `remember_token` holds a sha256 of the cookie token, not the token itself
 * (core/Auth.php).
 *
 * `role_id` points at roles rather than repeating a role name here, so
 * renaming a role is one row. Auth joins for the readable name.
 */
class UsersTable extends Migration
{
    public function up()
    {
        $this->create('users', [
            $this->id(),
            'public_id VARCHAR(64) NOT NULL',
            'name VARCHAR(160) NOT NULL',
            'email VARCHAR(191) NOT NULL',
            'password VARCHAR(255) NOT NULL',
            'avatar VARCHAR(255)',
            'role_id INT',
            'phone VARCHAR(40)',
            $this->bool('two_factor'),
            /* active | suspended | invited */
            "status VARCHAR(20) NOT NULL DEFAULT 'active'",
            'last_active_at DATETIME',
            'remember_token VARCHAR(255)',
            'reset_token VARCHAR(255)',
            'reset_expires_at DATETIME',
            'sort_order INT NOT NULL DEFAULT 0',
            $this->timestamps(),
        ]);

        $this->index('users', 'email', true);
        $this->index('users', 'public_id', true);
        $this->index('users', 'role_id');
    }

    public function down()
    {
        $this->drop('users');
    }
}
