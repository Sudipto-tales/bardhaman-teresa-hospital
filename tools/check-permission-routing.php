<?php
// Run one real routed GET against an isolated in-memory HR fixture.
// The application database supplies only table definitions, never account data.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../config/bootstrap.php';
if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'sqlite') {
    throw new RuntimeException('This isolated routing check requires the development SQLite schema');
}
$schema = $pdo->query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);
$pdo = new PDO('sqlite::memory:', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
foreach ($schema as $sql) $pdo->exec($sql);
require_once __DIR__ . '/../app/models/settings.php';
(require_once __DIR__ . '/../config/migration.php');
require_once __DIR__ . '/../database/migrations/028_UserPermissions.php';
(new UserPermissions($pdo))->up();
$roles = json_decode(file_get_contents(__DIR__ . '/../database/seeds/roles.json'), true)['rows'];
$role = array_values(array_filter($roles, static fn ($r) => $r['public_id'] === 'role-hr'))[0];
db_execute('INSERT INTO roles (id, public_id, name, permissions) VALUES (1, ?, ?, ?)', ['role-hr', 'HR', json_encode($role['permissions'])]);
db_execute("INSERT INTO users (id, public_id, name, email, role_id, status) VALUES (1, 'probe-hr', 'HR fixture', 'hr@example.invalid', 1, 'active')");
spl_autoload_register(static function ($class) {
    $path = __DIR__ . '/../api/controllers/' . $class . '.php';
    if (is_file($path)) require $path;
});
Auth::start();
$_SESSION['user_id'] = 1;
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['route'] = $argv[1] ?? 'api/bootstrap';
$_GET['q'] = 'vacancy';
RouteManager::dispatch(ApiGatewayProvider::routes());
