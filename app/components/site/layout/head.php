<?php

/**
 * The document shell — <!DOCTYPE> through the opening <body>.
 *
 * Props
 *   title        string  Page title; the site name is appended.
 *   titleFull    string  Overrides the above outright (the home page has no
 *                        "— Teresa Memorial Hospital" suffix, it *is* the name).
 *   description  string
 *   siteName     string
 *   styles       array   Paths under the site root, resolved by base_url().
 *   canonical    string  Absolute URL.
 *   ogImage      string  Absolute URL.
 *   noindex      bool
 *   theme        string  Server default when the visitor has no stored choice.
 */

$siteName = $siteName ?? 'Teresa Memorial Hospital';
$styles = $styles ?? ['assets/website.css', 'assets/pages.css'];
$documentTitle = $titleFull ?? (($title ?? '') === ''
    ? $siteName
    : e($title) . ' &mdash; ' . e($siteName));
?>
<!DOCTYPE html>
<html lang="en" data-theme="<?= e($theme ?? 'light') ?>">

<head>
    <meta charset="UTF-8">

    <!-- Theme resolved before the stylesheet so the first paint is already
         correct — a deferred script would flash the light page first.
         Stored choice wins; with none, follow the OS. -->
    <script>
        (function () {
            try {
                var stored = localStorage.getItem('tmh-theme');
                document.documentElement.dataset.theme = stored
                    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            } catch (e) { /* private mode — stay on the light default */ }

            /* Language rides on the googtrans cookie because that is what the
               Google Translate widget reads at init — see initLang() in
               assets/website.js. Resolving it here rather than in that file
               matters for one reason: Inter and Sora carry no Bengali glyphs,
               so the font has to be requested before first paint or the
               translated page renders in whatever the OS falls back to. */
            if (/(^|;\s*)googtrans=[^;]*\/bn/.test(document.cookie)) {
                var el = document.documentElement;
                el.lang = 'bn';
                el.dataset.lang = 'bn';

                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap';
                document.head.appendChild(link);
            }
        })();
    </script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $documentTitle ?></title>
    <meta name="description" content="<?= e($description ?? '') ?>">
<?php if (!empty($noindex)): ?>
    <meta name="robots" content="noindex,nofollow">
<?php endif; ?>
<?php if (!empty($canonical)): ?>
    <link rel="canonical" href="<?= e($canonical) ?>">
<?php endif; ?>
<?php if (!empty($ogImage)): ?>
    <meta property="og:image" content="<?= e($ogImage) ?>">
<?php endif; ?>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">

<?php foreach ($styles as $style): ?>
    <link rel="stylesheet" href="<?= e(base_url($style)) ?>">
<?php endforeach; ?>
</head>

<body>
