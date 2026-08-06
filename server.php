<?php

/**
 * Router script for PHP's built-in server — `php vayu run`.
 *
 * Apache is the real target, and there the .htaccess rewrite hands the path to
 * index.php as ?route=. This does the same thing by hand, for one reason: with
 * a router script the built-in server sets SCRIPT_NAME to the *requested*
 * path, so RouteManager's base-path strip — which exists for subdirectory
 * installs — would eat the route. Asking for /api/v1/users would arrive as
 * "users". Setting $_GET['route'] here takes the same short-circuit the
 * rewrite does, so both servers resolve routes identically.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');

/* Files that exist are served as-is — stylesheets, scripts, images. Except
   the ones that must never be served, which Apache refuses in .htaccess and
   the dev server would happily hand over as plain text. */
$denied = ['/.env', '/.env.example', '/composer.json', '/composer.lock', '/vayu', '/server.php'];
$deniedPrefixes = ['/storage/', '/database/', '/config/', '/core/', '/app/', '/api/', '/vendor/', '/tools/'];

foreach ($denied as $path) {
    if ($uri === $path) {
        http_response_code(403);
        exit('Forbidden');
    }
}

foreach ($deniedPrefixes as $prefix) {
    if (str_starts_with($uri, $prefix) && is_file(__DIR__ . $uri)) {
        http_response_code(403);
        exit('Forbidden');
    }
}

$publicPath = __DIR__ . $uri;
if ($uri !== '/' && is_file($publicPath)) {
    return false;
}

$_GET['route'] = trim($uri, '/');

require __DIR__ . '/index.php';
