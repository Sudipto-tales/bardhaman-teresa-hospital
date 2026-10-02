<?php
// Isolated policy regression checks; no application database is opened.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../core/Permissions.php';
require __DIR__ . '/../config/migration.php';
require __DIR__ . '/../database/migrations/028_UserPermissions.php';

class Auth {
    public static array $record;
    public static function user(): array { return self::$record; }
}
class Api {
    public static function forbidden(string $message): never { throw new RuntimeException('403'); }
    public static function unauthenticated(): never { throw new RuntimeException('401'); }
}
class ApiRequest {
    public static array $payload = [];
    public static function body(): array { return self::$payload; }
}
function json_column($value): array { return is_array($value) ? $value : (json_decode($value ?? '{}', true) ?: []); }
function db_scalar($sql, $params) { return $GLOBALS['rolePermissions']; }
function check(bool $ok, string $label): void {
    if (!$ok) throw new RuntimeException('Failed: ' . $label);
    echo "PASS {$label}\n";
}
function requestAllowed(string $route, string $method, array $params, string $action, array $body = []): bool {
    ApiRequest::$payload = $body;
    try { Permissions::enforceApi($route, $method, $params, $action); return true; }
    catch (RuntimeException $e) { if (!in_array($e->getMessage(), ['401', '403'], true)) throw $e; return false; }
}
$roles = json_decode(file_get_contents(__DIR__ . '/../database/seeds/roles.json'), true)['rows'];
foreach ($roles as $role) {
    Auth::$record = ['public_id' => 'self', 'role_id' => 1, 'role_key' => $role['public_id'], 'status' => 'active'];
    $GLOBALS['rolePermissions'] = $role['permissions'];
    foreach (Permissions::RESOURCES as $name => $module) {
        $expected = $role['public_id'] === 'role-super' || ($module !== 'system' && in_array('view', $role['permissions'][$module] ?? [], true));
        check(requestAllowed('api/' . $name, 'GET', ['resource' => $name], 'index') === $expected, $role['name'] . ' reads ' . $name);
    }
    check(requestAllowed('api/users/self', 'PATCH', ['resource' => 'users', 'id' => 'self'], 'update', ['name' => 'Updated']), $role['name'] . ' edits own profile');
    if ($role['public_id'] !== 'role-super') {
        check(!requestAllowed('api/users/self', 'PATCH', ['resource' => 'users', 'id' => 'self'], 'update', ['roleId' => 'role-super']), 'blocks self elevation');
    }
    if ($role['public_id'] === 'role-hr') {
        check(Permissions::landing() === 'jobs', 'HR lands on vacancies');
        foreach (Permissions::SCREENS as $screen => $module) {
            check(Permissions::screen($screen) === in_array($module, ['careers', 'account'], true), 'HR screen ' . $screen);
        }
        check(requestAllowed('api/applications/a/cv', 'GET', ['id' => 'a'], 'cv'), 'HR downloads CV');
        check(!requestAllowed('api/dashboard/summary', 'GET', [], 'summary'), 'HR cannot read dashboard');
        Auth::$record['custom_permissions'] = true;
        Auth::$record['permissions'] = ['careers' => ['view']];
        foreach ([['PATCH', 'update', ['status' => 'published']], ['DELETE', 'destroy', []], ['POST', 'bulk', ['action' => 'delete']], ['POST', 'restore', []]] as [$method, $action, $body]) {
            check(!requestAllowed('api/jobs/a', $method, ['resource' => 'jobs', 'id' => 'a'], $action, $body), 'view-only blocks ' . $action);
        }
        Auth::$record['permissions'] = ['careers' => ['view', 'edit']];
        check(requestAllowed('api/jobs/a', 'PATCH', ['resource' => 'jobs', 'id' => 'a'], 'update', ['title' => 'Draft']), 'edit permitted');
        check(!requestAllowed('api/jobs/a', 'PATCH', ['resource' => 'jobs', 'id' => 'a'], 'update', ['status' => 'published']), 'publish requires separate permission');
    }
}
check(!requestAllowed('api/unknown', 'GET', ['resource' => 'unknown'], 'index'), 'unknown resource denied');
Auth::$record['status'] = 'suspended';
check(!requestAllowed('api/auth/me', 'GET', [], 'me'), 'suspended session denied');
$pdo = new PDO('sqlite::memory:');
$pdo->exec('CREATE TABLE users (id INTEGER PRIMARY KEY)');
$migration = new UserPermissions($pdo);
$migration->up();
$migration->up();
check(count($pdo->query('PRAGMA table_info(users)')->fetchAll()) === 3, 'migration adds columns and safely repeats');
echo "Permission checks complete.\n";
