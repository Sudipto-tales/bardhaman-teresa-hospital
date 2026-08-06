<?php

/**
 * The departments drop-down inside the primary nav.
 *
 * Props
 *   departments  array  Rows of {slug, name, menu_note}. `menuNote` is
 *                       accepted too, because the JS sources spell it that way.
 */

$departments = $departments ?? [];
?>
                <div class="nav-mega">
                    <a href="<?= e(base_url('departments')) ?>" class="nav-mega-item">All Departments <span>Overview &amp; Directory</span></a>
<?php foreach ($departments as $department): ?>
                    <a href="<?= e(base_url('departments/' . ($department['slug'] ?? $department['id'] ?? ''))) ?>" class="nav-mega-item"><?= e($department['name'] ?? '') ?> <span><?= e($department['menu_note'] ?? $department['menuNote'] ?? '') ?></span></a>
<?php endforeach; ?>
                </div>
