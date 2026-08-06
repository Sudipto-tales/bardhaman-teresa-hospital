<?php

/**
 * Everything above <main>: the brand rail, the nav shell, the mobile overlay,
 * the quick-action dock and the (empty) scroll-spy rail.
 *
 * The overlay menu lives here rather than in its own file because it is the
 * burger's target — the two only make sense together.
 *
 * Props
 *   active, departments, searchPlaceholder  Forwarded to the nav bar.
 *   email, phone                            The top bar.
 *   logo, siteName                          Forwarded to the brand rail.
 *   tel, whatsapp                           Forwarded to the dock.
 */

$email = $email ?? 'contact@teresamemorial.org';
$phone = $phone ?? '+91 342 325 4567';
?>
<?= App::component('site/layout/brand-rail', [
    'logo' => $logo ?? null,
    'siteName' => $siteName ?? null,
]) ?>

    <!-- ============ NAV (separate element — hides on scroll-down) ============ -->
    <div class="nav-shell" id="navShell">
        <div class="nav-topbar" translate="no">
            <span><i class="fa-solid fa-envelope"></i> <?= e($email) ?></span>
            <span><i class="fa-solid fa-phone"></i> <?= e($phone) ?></span>
        </div>

<?= App::component('site/layout/nav-bar', [
    'active' => $active ?? '',
    'departments' => $departments ?? [],
    'searchPlaceholder' => $searchPlaceholder ?? null,
]) ?>
    </div>

    <!-- mobile overlay menu -->
    <div class="mobile-menu" id="mobileMenu">
        <a href="<?= e(base_url('/')) ?>">Home</a>
        <a href="<?= e(base_url('about')) ?>">About Us</a>
        <a href="<?= e(base_url('departments')) ?>">Our Department</a>
        <a href="<?= e(base_url('facilities')) ?>">Facilities</a>
        <a href="<?= e(base_url('doctors')) ?>">Doctors</a>
        <a href="<?= e(base_url('blog')) ?>">Blog</a>
        <a href="<?= e(base_url('careers')) ?>">Careers</a>
        <a href="<?= e(base_url('contact')) ?>">Contact</a>
    </div>

<?= App::component('site/layout/mobile-dock', [
    'tel' => $tel ?? null,
    'whatsapp' => $whatsapp ?? null,
]) ?>

<?= App::component('site/layout/scroll-spy') ?>
