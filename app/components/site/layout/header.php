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

/* No literal fallback. A number written here is a number nobody edits in the
   panel and nobody finds when it changes — which is the thing this conversion
   set out to remove. Absent, the strip prints one item or none rather than a
   stale one. */
$email = trim((string) ($email ?? ''));
$phone = trim((string) ($phone ?? ''));
?>
<?= App::component('site/layout/brand-rail', [
    'logo' => $logo ?? null,
    'siteName' => $siteName ?? null,
]) ?>

    <!-- ============ NAV (separate element — hides on scroll-down) ============ -->
    <div class="nav-shell" id="navShell">
        <div class="nav-topbar" translate="no">
<?php if ($email !== ''): ?>
            <span><i class="fa-solid fa-envelope"></i> <?= e($email) ?></span>
<?php endif; ?>
<?php if ($phone !== ''): ?>
            <span><i class="fa-solid fa-phone"></i> <?= e($phone) ?></span>
<?php endif; ?>
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
        <!-- the same three the desktop About drop carries; flat and indented
             rather than collapsible, because the overlay has the room -->
        <a href="<?= e(base_url('about')) ?>" class="is-sub">Our Story</a>
        <a href="<?= e(base_url('doctors')) ?>" class="is-sub">Our Doctors</a>
        <a href="<?= e(base_url('blog')) ?>" class="is-sub is-sub-end">Our Blog</a>
        <a href="<?= e(base_url('departments')) ?>">Our Department</a>
        <a href="<?= e(base_url('facilities')) ?>">Facilities</a>
        <!-- the Facilities drop, flattened the same way -->
        <a href="<?= e(base_url('facilities')) ?>" class="is-sub">Our Facilities</a>
        <a href="<?= e(base_url('/')) ?>#lab" class="is-sub">Lab Test</a>
        <a href="<?= e(base_url('gallery')) ?>" class="is-sub is-sub-end">Our Gallery</a>
        <a href="<?= e(base_url('careers')) ?>">Careers</a>
        <a href="<?= e(base_url('contact')) ?>">Contact</a>
    </div>

<?= App::component('site/layout/mobile-dock', [
    'tel' => $tel ?? null,
    'whatsapp' => $whatsapp ?? null,
]) ?>

<?= App::component('site/layout/scroll-spy') ?>
