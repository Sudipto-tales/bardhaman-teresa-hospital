<?php

/**
 * The icon tile behind block/cards — a facility, a procedure, a value, a
 * careers benefit. One record shape, one tile.
 *
 * A tile with a href is a link and a tile without one is an <article>, so a
 * card that goes nowhere is not announced as something to click.
 *
 * Props
 *   item  array of {icon, title, text, href}
 */

$item = $item ?? [];
$href = $item['href'] ?? '';
?>
                    <?php if ($href !== ''): ?><a class="pg-card" href="<?= e($href) ?>"><?php else: ?><article class="pg-card"><?php endif; ?>

                        <span class="pg-card__icon"><i class="fa-solid <?= e($item['icon'] ?? '') ?>"></i></span>
                        <h3><?= e($item['title'] ?? $item['name'] ?? '') ?></h3>
                        <p><?= e($item['text'] ?? '') ?></p>
                    <?php if ($href !== ''): ?></a><?php else: ?></article><?php endif; ?>

