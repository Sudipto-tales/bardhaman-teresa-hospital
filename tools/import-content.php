<?php

/**
 * Apply a content pack from the command line.
 *
 *   php tools/import-content.php                       list the packs
 *   php tools/import-content.php <pack> --dry-run      say what would change
 *   php tools/import-content.php <pack>                do it
 *
 * The same ContentPack the HTTP route runs, minus the token: a shell on the
 * server is already the credential. Use this when the plan has SSH, and the
 * route when it does not — see docs/09-deployment.md.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

define('__BASEDIR__', dirname(__DIR__));
require __BASEDIR__ . '/config/bootstrap.php';

$pack = null;
$dryRun = false;

foreach (array_slice($argv, 1) as $argument) {
    if ($argument === '--dry-run' || $argument === '-n') {
        $dryRun = true;
        continue;
    }

    $pack ??= $argument;
}

if ($pack === null) {
    $packs = ContentPack::available();

    echo PHP_EOL . '  Packs in ' . ContentPack::DIR . '/' . PHP_EOL . PHP_EOL;

    foreach ($packs ?: ['(none)'] as $name) {
        echo '    ' . $name . PHP_EOL;
    }

    echo PHP_EOL . '  php tools/import-content.php <pack> [--dry-run]' . PHP_EOL . PHP_EOL;
    exit(0);
}

try {
    $result = ContentPack::apply($pack, $dryRun);
} catch (RuntimeException $e) {
    fwrite(STDERR, '  ! ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

echo PHP_EOL . '  ' . $pack . ($dryRun ? '  (dry run — nothing was written)' : '') . PHP_EOL . PHP_EOL;

printf(
    "    files  %d copied, %d already in place%s" . PHP_EOL,
    $result['files']['copied'],
    $result['files']['present'],
    $dryRun && $result['files']['planned'] ? ', ' . count($result['files']['planned']) . ' would be copied' : ''
);

foreach ($result['rows']['byTable'] as $table => $counts) {
    printf("    %-6s %d inserted, %d updated" . PHP_EOL, $table, $counts['inserted'], $counts['updated']);
}

foreach ($result['warnings'] as $warning) {
    echo '    ! ' . $warning . PHP_EOL;
}

echo PHP_EOL;
