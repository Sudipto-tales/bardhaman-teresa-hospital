<?php

/**
 * The database connection and the query helpers everything else uses.
 *
 * SQLite in development, MySQL in production, chosen by DB_TYPE and nothing
 * else. The MongoDB branch the framework shipped with has been removed: it is
 * unused here, and its helpers took a different shape from the SQL ones, which
 * is how a codebase ends up with two ways to read a row.
 */

$db_type = env('DB_TYPE', 'sqlite');

$pdoOptions = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

switch ($db_type) {
    case 'sqlite':
        $sqliteFile = env('DB_DATABASE', '');
        if ($sqliteFile === '' || $sqliteFile === null) {
            $sqliteFile = dirname(__DIR__) . '/database/database.sqlite';
        }

        $directory = dirname($sqliteFile);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $pdo = new PDO('sqlite:' . $sqliteFile, null, null, $pdoOptions);

        /* Off by default in SQLite, which means a stale doctor_id in
           department_doctors would sit there unnoticed until a page rendered
           a blank card. */
        $pdo->exec('PRAGMA foreign_keys = ON');
        break;

    case 'mysql':
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            env('DB_HOST', '127.0.0.1'),
            env('DB_PORT', '3306'),
            env('DB_DATABASE', '')
        );

        $pdo = new PDO($dsn, env('DB_USERNAME', ''), env('DB_PASSWORD', ''), $pdoOptions);
        break;

    default:
        throw new RuntimeException("Unsupported DB_TYPE: {$db_type}. Use sqlite or mysql.");
}

/* Published explicitly rather than left to scope. bootstrap.php is required
   from inside a method by the console commands, which would otherwise make
   $pdo local to that method and leave every `global $pdo` below reading null. */
$GLOBALS['pdo'] = $pdo;

/**
 * Every helper below goes through a prepared statement. There is no
 * string-interpolating variant on purpose — the moment one exists, it gets
 * used.
 */
function db_query(string $sql, array $params = []): PDOStatement
{
    global $pdo;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt;
}

function db_fetch_all(string $sql, array $params = []): array
{
    return db_query($sql, $params)->fetchAll();
}

function db_fetch_one(string $sql, array $params = [])
{
    return db_query($sql, $params)->fetch();
}

/** Returns the number of rows affected. */
function db_execute(string $sql, array $params = []): int
{
    return db_query($sql, $params)->rowCount();
}

/** A single scalar — counts, sums, one column of one row. */
function db_scalar(string $sql, array $params = [], $default = null)
{
    $value = db_query($sql, $params)->fetchColumn();

    return $value === false ? $default : $value;
}

function db_last_insert_id(): string
{
    global $pdo;

    return $pdo->lastInsertId();
}

/**
 * Runs $work inside a transaction, rolling back if it throws.
 *
 * Used where a write is really several — an application row plus its CV
 * record, a reorder that renumbers a span — and half of it landing is worse
 * than none of it.
 */
function db_transaction(callable $work)
{
    global $pdo;

    $pdo->beginTransaction();

    try {
        $result = $work();
        $pdo->commit();
        return $result;
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}
