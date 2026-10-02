<?php

class UserPermissions extends Migration
{
    public function up()
    {
        $columns = $this->isSqlite()
            ? $this->pdo->query('PRAGMA table_info(users)')->fetchAll(PDO::FETCH_ASSOC)
            : $this->pdo->query('SHOW COLUMNS FROM users')->fetchAll(PDO::FETCH_ASSOC);
        $names = array_map(static fn ($r) => $r['name'] ?? $r['Field'], $columns);
        if (!in_array('custom_permissions', $names, true)) {
            $this->pdo->exec('ALTER TABLE users ADD COLUMN ' . $this->bool('custom_permissions'));
        }
        if (!in_array('permissions', $names, true)) {
            $this->pdo->exec('ALTER TABLE users ADD COLUMN ' . $this->json('permissions'));
        }
    }
}
