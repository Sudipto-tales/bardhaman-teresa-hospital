<?php

/**
 * The floating glass dock. Fixed to the left on the desktop and the primary
 * set of actions on a phone, which is why it is not inside the nav shell —
 * that element hides on scroll-down and these four must not.
 *
 * Props
 *   tel       string  Digits for the tel: URI, no spaces.
 *   whatsapp  string  Digits for wa.me, no spaces.
 */

$tel = $tel ?? '+913423254567';
$whatsapp = $whatsapp ?? '913423254567';
?>
    <!-- ============ FLOATING GLASS DOCK (left) ============ -->
    <aside class="dock" aria-label="Quick actions">
        <div class="dock__inner" id="dock">
            <a href="<?= e(base_url('doctors')) ?>" class="dock__btn" aria-label="Find a Doctor">
                <i class="fa-solid fa-stethoscope"></i>
                <span class="dock__tip">Find a Doctor</span>
            </a>
            <a href="<?= e(base_url('contact') . '#map') ?>" class="dock__btn" aria-label="Our Location">
                <i class="fa-solid fa-truck-medical"></i>
                <span class="dock__tip">Our Location</span>
            </a>
            <a href="tel:<?= e($tel) ?>" class="dock__btn" aria-label="Connect With Us">
                <i class="fa-solid fa-phone"></i>
                <span class="dock__tip">Connect With Us</span>
            </a>
            <a href="https://wa.me/<?= e($whatsapp) ?>" class="dock__btn dock__btn--wa" aria-label="WhatsApp" target="_blank"
                rel="noopener">
                <i class="fa-brands fa-whatsapp"></i>
                <span class="dock__tip">WhatsApp</span>
            </a>
        </div>
    </aside>
