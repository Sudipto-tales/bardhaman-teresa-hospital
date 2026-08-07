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

/* Empty rather than the design's own number — see the note in header.php. A
   dock button with nothing to dial is not rendered. */
$tel = trim((string) ($tel ?? ''));
$whatsapp = trim((string) ($whatsapp ?? ''));
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
<?php if ($tel !== ''): ?>
            <a href="tel:<?= e($tel) ?>" class="dock__btn" aria-label="Connect With Us">
                <i class="fa-solid fa-phone"></i>
                <span class="dock__tip">Connect With Us</span>
            </a>
<?php endif; ?>
<?php if ($whatsapp !== ''): ?>
            <a href="https://wa.me/<?= e($whatsapp) ?>" class="dock__btn dock__btn--wa" aria-label="WhatsApp" target="_blank"
                rel="noopener">
                <i class="fa-brands fa-whatsapp"></i>
                <span class="dock__tip">WhatsApp</span>
            </a>
<?php endif; ?>
        </div>
    </aside>
