<?php

/**
 * A lab test or health package, as it appears in the home page slider.
 *
 * The discount badge is derived rather than stored: the panel edits a price
 * and a discounted price, and a percentage kept alongside them would be the
 * field that goes stale.
 *
 * Props
 *   test       array of {name, description, icon, price, discount_price, href, slug}
 *   colour     string  A CSS custom property name for the icon; the reference
 *                      cycles crimson / magenta / blue / navy down the row
 *   showPrice  bool    The home page slider prints no money: a figure there is
 *                      a quote the desk then has to walk back, because the
 *                      final bill depends on the panel booked. The price stays
 *                      in the record and in the panel either way.
 */

$test = $test ?? [];
$showPrice = ($showPrice ?? true) !== false;
$price = $test['price'] ?? null;
$discount = $test['discountPrice'] ?? $test['discount_price'] ?? null;
$from = ($discount !== null && $discount !== '') ? $discount : $price;

$off = 0;
if ($price > 0 && $discount !== null && $discount !== '' && $discount < $price) {
    $off = (int) round((($price - $discount) / $price) * 100);
}

$href = $test['href'] ?? (base_url('contact') . '#book');
$colour = $colour ?? '';
?>
                        <div class="lab__card">
<?php if ($showPrice && $off > 0): ?>
                            <span class="lab__badge"><?= e($off) ?>% Off</span>
<?php endif; ?>
                            <div class="lab__card-icon"<?= $colour !== '' ? ' style="color:var(--' . e($colour) . ')"' : '' ?>><i
                                    class="fa-solid <?= e($test['icon'] ?? '') ?>"></i></div>
                            <h3><?= e($test['name'] ?? '') ?></h3>
                            <p><?= e($test['description'] ?? '') ?></p>
<?php if ($showPrice && $from !== null && $from !== ''): ?>
                            <div class="lab__price">STARTING FROM <strong>&#8377;<?= e(number_format((float) $from)) ?></strong></div>
<?php endif; ?>
                            <a href="<?= e($href) ?>" class="lab__btn"><i class="fa-solid fa-arrow-right"></i> Schedule a
                                Test</a>
                        </div>
