<?php
require_once __DIR__ . '/bootstrap.php';

/* Controllers and models are loaded by directory rather than named one by
   one: adding a controller should be adding a file, not adding a file and
   remembering to require it here. Recursive, so app/controllers/Admin/ and
   api/controllers/Public/ work without another glob. */
foreach (['app/models', 'app/controllers', 'api/controllers'] as $dir) {
    $path = __BASEDIR__ . '/' . $dir;
    if (!is_dir($path)) {
        continue;
    }

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($files as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            require_once $file->getPathname();
        }
    }
}

RouteManager::dispatch($routes);
