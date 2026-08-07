<?php

/**
 * The departments drop-down inside the primary nav.
 *
 * Props
 *   departments  array  Rows of {slug, name, menu_note}. `menuNote` is
 *                       accepted too, because the JS sources spell it that way.
 *
 * A department's page is at the root — /cardiology, not /departments/cardiology
 * — which is what the route table serves, what the canonical tag declares and
 * what every other link on the site points at. This menu was the one place
 * still building the nested form, so eleven links in the primary nav answered
 * 404. `departments/{slug}` now 301s here rather than being served twice.
 */

$departments = $departments ?? [];
?>
                <div class="nav-mega">
                    <a href="<?= e(base_url('departments')) ?>" class="nav-mega-item">All Departments <span>Overview &amp; Directory</span></a>
<?php foreach ($departments as $department): ?>
                    <a href="<?= e(base_url((string) ($department['slug'] ?? $department['id'] ?? ''))) ?>" class="nav-mega-item"><?= e($department['name'] ?? '') ?> <span><?= e($department['menu_note'] ?? $department['menuNote'] ?? '') ?></span></a>
<?php endforeach; ?>
                </div>
