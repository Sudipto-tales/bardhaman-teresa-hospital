<?php

/**
 * The fixed wordmark rail. translate="no" throughout the brand and contact
 * chrome: the Google widget would otherwise transliterate the wordmark and,
 * worse, rewrite the digits of the emergency number into Bengali numerals.
 *
 * Props
 *   home      string  Route the mark links to.
 *   logo      string  Image URL; falls back to the CSS wordmark when it 404s.
 *   siteName  string
 */

$siteName = $siteName ?? 'Teresa Memorial Hospital';
?>
    <!-- ============ BRAND RAIL (fixed — never scrolls away) ============ -->
    <div class="brand-rail" id="brandRail" translate="no">
        <a href="<?= e($home ?? base_url('/')) ?>" class="brand-rail__link">
            <img src="<?= e($logo ?? base_url('assets/logo-teresa.png')) ?>" alt="<?= e($siteName) ?>" class="brand-rail__logo"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <span class="brand-rail__fallback" style="display:none">
                <span class="brand-rail__mark"><i class="fa-solid fa-plus"></i></span>
                <span class="brand-rail__word">TERESA<span>MEMORIAL</span></span>
            </span>
        </a>
    </div>
