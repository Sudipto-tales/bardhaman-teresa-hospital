<?php

/**
 * settings — the singleton, stored as one row per key.
 *
 * `docs/02-content-model.md` §1 describes six groups (general, contact,
 * social, integrations, theme, popups) but one record. A row per key rather
 * than a row per group means a PATCH to one field writes one row, so two
 * editors saving different settings screens at the same time cannot overwrite
 * each other's work.
 *
 * `value` is always JSON, even for a plain string. A repeater like `phones`
 * and a scalar like `name` then read back the same way, and a field that grows
 * from a string into a group does not need a migration.
 *
 * `group` and `key` are both reserved words in MySQL, hence the column names.
 */
class SettingsTable extends Migration
{
    public function up()
    {
        $this->create('settings', [
            $this->id(),
            'group_name VARCHAR(64) NOT NULL',
            'setting_key VARCHAR(128) NOT NULL',
            'value TEXT',
            'updated_by INT',
            'updated_at DATETIME',
        ]);

        $this->index('settings', 'group_name, setting_key', true);
    }

    public function down()
    {
        $this->drop('settings');
    }
}
