<?php

/**
 * The document shell — <!DOCTYPE> through the opening <body>.
 *
 * Props
 *   title        string  Page title; the site name is appended.
 *   titleFull    string  Overrides the above outright (the home page has no
 *                        "— Teresa Memorial Hospital" suffix, it *is* the name).
 *   description  string
 *   keywords     string
 *   siteName     string
 *   styles       array   Paths under the site root, resolved by base_url().
 *   canonical    string  Absolute URL.
 *   ogImage      string  Absolute URL.
 *   ogType       string  'website' | 'article' | 'profile'.
 *   noindex      bool    Wins over `robots` outright.
 *   robots       string  The policy when there is nothing to hide.
 *   verification string  Google Search Console token.
 *   schema       array   schema.org nodes; encoded as one @graph.
 *   favicon      string
 *   themeColor   string
 *   theme        string  Server default when the visitor has no stored choice.
 */

$siteName = $siteName ?? 'Teresa Memorial Hospital';
$styles = $styles ?? ['assets/website.css', 'assets/pages.css'];

/* The escaped <title> and the raw string og:title needs are the same text; the
   dash is an entity in one and a character in the other. `titleFull` is printed
   into <title> as markup and may carry `&mdash;`, so it is decoded before being
   escaped again — otherwise a shared link reads "&amp;mdash;". */
$shareTitle = html_entity_decode(
    $titleFull ?? (($title ?? '') === '' ? $siteName : $title . ' — ' . $siteName),
    ENT_QUOTES | ENT_HTML5,
    'UTF-8'
);
$documentTitle = $titleFull ?? (($title ?? '') === ''
    ? $siteName
    : e($title) . ' &mdash; ' . e($siteName));

$description = trim((string) ($description ?? ''));
$ogImage = trim((string) ($ogImage ?? ''));
$canonical = trim((string) ($canonical ?? ''));
$jsonLd = Schema::graph((array) ($schema ?? []));
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
    <meta name="description" content="<?= e($description) ?>">
<?php if (trim((string) ($keywords ?? '')) !== ''): ?>
    <meta name="keywords" content="<?= e($keywords) ?>">
<?php endif; ?>
    <meta name="robots" content="<?= e(!empty($noindex) ? 'noindex,nofollow' : ($robots ?? 'index, follow')) ?>">
<?php if (trim((string) ($verification ?? '')) !== ''): ?>
    <meta name="google-site-verification" content="<?= e($verification) ?>">
<?php endif; ?>
<?php if ($canonical !== ''): ?>
    <link rel="canonical" href="<?= e($canonical) ?>">
<?php endif; ?>

    <!-- The link preview. og:image alone gets a picture with a bare URL under
         it, which is what this site had. -->
    <meta property="og:type" content="<?= e($ogType ?? 'website') ?>">
    <meta property="og:title" content="<?= e($shareTitle) ?>">
    <meta property="og:description" content="<?= e($description) ?>">
    <meta property="og:site_name" content="<?= e($siteName) ?>">
    <meta property="og:locale" content="en_IN">
<?php if ($canonical !== ''): ?>
    <meta property="og:url" content="<?= e($canonical) ?>">
<?php endif; ?>
<?php if ($ogImage !== ''): ?>
    <meta property="og:image" content="<?= e($ogImage) ?>">
    <meta property="og:image:alt" content="<?= e($shareTitle) ?>">
<?php endif; ?>

    <meta name="twitter:card" content="<?= e($ogImage !== '' ? 'summary_large_image' : 'summary') ?>">
    <meta name="twitter:title" content="<?= e($shareTitle) ?>">
    <meta name="twitter:description" content="<?= e($description) ?>">
<?php if ($ogImage !== ''): ?>
    <meta name="twitter:image" content="<?= e($ogImage) ?>">
<?php endif; ?>
<?php if (trim((string) ($twitterSite ?? '')) !== ''): ?>
    <meta name="twitter:site" content="<?= e($twitterSite) ?>">
<?php endif; ?>

    <!-- Legacy, and cheap: a single-town hospital is exactly the case they
         were meant for, and they cost four lines. -->
<?php if (trim((string) ($geoPlacename ?? '')) !== ''): ?>
    <meta name="geo.region" content="<?= e($geoRegion ?? 'IN-WB') ?>">
    <meta name="geo.placename" content="<?= e($geoPlacename) ?>">
<?php endif; ?>
<?php if (trim((string) ($geoPosition ?? '')) !== ''): ?>
    <meta name="geo.position" content="<?= e($geoPosition) ?>">
    <meta name="ICBM" content="<?= e(str_replace(';', ', ', (string) $geoPosition)) ?>">
<?php endif; ?>

    <meta name="theme-color" content="<?= e($themeColor ?? '#0d9488') ?>">
<?php if (trim((string) ($favicon ?? '')) !== ''): ?>
    <link rel="icon" href="<?= e($favicon) ?>">
    <link rel="apple-touch-icon" href="<?= e($favicon) ?>">
<?php endif; ?>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">

<?php foreach ($styles as $style): ?>
    <link rel="stylesheet" href="<?= e(base_url($style)) ?>">
<?php endforeach; ?>
<?php if ($jsonLd !== ''): ?>

    <!-- One graph, not one block per node: the nodes reference each other by
         @id, and a crawler reading them separately would see the hospital
         repeated on every page instead of pointed at. -->
    <script type="application/ld+json"><?= $jsonLd ?></script>
<?php endif; ?>
</head>

<body>
