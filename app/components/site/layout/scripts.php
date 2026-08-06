<?php

/**
 * The shared script block and the closing tags.
 *
 * Order is safe either way — they are classic, non-deferred scripts, so page
 * scripts all run before pages.js boots on DOMContentLoaded. The one thing
 * that is *not* safe is rendering the popup widgets after this: popups.js
 * reads window.TMH_POPUPS once, at parse time, so the widgets have to be
 * echoed above this component.
 *
 * Props
 *   extra   array   Page-specific script paths, resolved by base_url().
 *   pages   bool    Whether assets/pages.js is needed — the home page is
 *                   driven entirely by website.js.
 *   popups  bool    Set false when neither popup widget was rendered.
 */

$extra = $extra ?? [];
?>
    <!-- ============ SCRIPTS ============ -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
    <script src="<?= e(base_url('assets/website.js')) ?>"></script>
<?php if ($pages ?? true): ?>
    <script src="<?= e(base_url('assets/pages.js')) ?>"></script>
<?php endif; ?>
<?php if ($popups ?? true): ?>
    <!-- panel-controlled overlays; popups.js inserts nothing when they are off -->
    <script src="<?= e(base_url('assets/popups.js')) ?>"></script>
<?php endif; ?>
<?php foreach ($extra as $src): ?>
    <script src="<?= e(base_url($src)) ?>"></script>
<?php endforeach; ?>
</body>

</html>
