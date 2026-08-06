<?php

/**
 * The primary nav pill: links, search, theme and language toggles, the
 * emergency button and the burger.
 *
 * Props
 *   active             string  home | about | departments | facilities | careers | contact
 *   departments        array   Passed straight to the mega menu.
 *   emergencyHref      string
 *   searchPlaceholder  string  The home page searches the whole site; an inner
 *                              page only has its own sections to offer.
 */

$active = $active ?? '';
$searchPlaceholder = $searchPlaceholder ?? 'Search this page — sections, doctors, tests…';

/* Rendered rather than concatenated so the active class cannot drift between
   the six links. */
$link = static function (string $key, string $path, string $label) use ($active): string {
    $class = 'nav-link' . ($active === $key ? ' is-active' : '');

    return '<a href="' . e(base_url($path)) . '" class="' . $class . '">' . $label . '</a>';
};
?>
        <nav class="nav-bar" aria-label="Primary">
            <?= $link('home', '/', 'Home') ?>

            <?= $link('about', 'about', 'About Us') ?>


            <div class="nav-drop">
                <a href="<?= e(base_url('departments')) ?>" class="nav-link<?= $active === 'departments' ? ' is-active' : '' ?>">Our Department <i class="fa-solid fa-chevron-down"></i></a>
<?= App::component('site/layout/mega-menu', ['departments' => $departments ?? []]) ?>
            </div>

            <?= $link('facilities', 'facilities', 'Facilities') ?>

            <?= $link('careers', 'careers', 'Careers') ?>

            <?= $link('contact', 'contact', 'Contact') ?>


            <button type="button" class="nav-search-toggle" id="navSearchBtn" aria-label="Search the site"
                aria-expanded="false" aria-controls="navSearch"><i class="fa-solid fa-magnifying-glass"></i></button>

            <!-- borrows .nav-search-toggle so it picks up the same shape and
                 the same over-hero / is-compact colour states -->
            <button type="button" class="nav-search-toggle nav-theme-toggle" id="themeBtn" aria-pressed="false"
                aria-label="Switch to dark theme"><i class="fa-solid fa-moon"></i><i
                    class="fa-solid fa-sun"></i></button>

            <!-- sits here rather than in .nav-topbar because that bar is
                 display:none below 640px; the nav pill survives every width -->
            <div class="nav-lang" id="navLang" role="group" aria-label="Language" translate="no">
                <button type="button" data-lang="en" aria-pressed="true">EN</button>
                <button type="button" data-lang="bn" aria-pressed="false" lang="bn">বাং</button>
            </div>

            <a href="<?= e($emergencyHref ?? base_url('contact') . '#emergency') ?>" class="nav-emergency"><i class="fa-solid fa-truck-medical"></i> Emergency</a>

            <!-- takes over the whole bar while open; see .nav-bar.is-searching -->
            <div class="nav-search" id="navSearch" role="search">
                <i class="fa-solid fa-magnifying-glass nav-search__icon"></i>
                <input type="text" id="navSearchInput" class="nav-search__input" autocomplete="off" spellcheck="false"
                    placeholder="<?= e($searchPlaceholder) ?>" aria-label="Search the site"
                    aria-autocomplete="list" aria-controls="navSearchResults">
                <button type="button" class="nav-search__close" id="navSearchClose" aria-label="Close search"><i
                        class="fa-solid fa-xmark"></i></button>
                <div class="nav-search__panel" id="navSearchResults" role="listbox" aria-label="Search results"></div>
            </div>

            <button class="nav-burger" id="navBurger" aria-label="Open menu" aria-controls="mobileMenu"><span></span></button>
        </nav>
