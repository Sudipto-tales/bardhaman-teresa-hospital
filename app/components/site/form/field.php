<?php

/**
 * One form control, chosen by `type`. The wrappers differ enough between an
 * input, a select, a file drop and a consent checkbox that the alternative is
 * four near-identical components — and four places for a class to drift.
 *
 * Props
 *   type         string  text | tel | email | url | date | number |
 *                        select | textarea | file | checkbox
 *   name         string
 *   id           string  Defaults to `name`; the <label for> needs one
 *   label        string
 *   value        string  Also the selected option
 *   required     bool
 *   full         bool    Spans both columns of .ct-grid
 *   optional     bool    Prints the "optional" pill beside the label
 *   placeholder  string  On a select, the empty first option's text
 *   autocomplete string
 *   readonly     bool
 *   options      array   Select rows: plain strings, or {value, label, attrs}
 *   help         string  A line under the control
 *   accept       string  file
 *   hint         string  file — the accepted formats and size
 *   fileLabel    string  file — the text inside the drop zone
 *   icon         string  file
 */

$type = $type ?? 'text';
$name = $name ?? '';
$id = $id ?? $name;
$label = $label ?? '';
$value = $value ?? '';
$required = !empty($required) ? ' required' : '';
$wrapper = 'ct-field' . (!empty($full) ? ' ct-field--full' : '');

/* A select's option can be `{value, label}` or a bare string — the notice and
   source lists print their own text as the value, exactly as the reference
   markup does, so a stored answer reads without a lookup table. */
$optionAttrs = static function (array $row): string {
    $out = '';
    foreach ($row['attrs'] ?? [] as $key => $attr) {
        $out .= ' ' . e($key) . '="' . e($attr) . '"';
    }

    return $out;
};
?>
<?php if ($type === 'checkbox'): ?>
                            <label class="ct-consent">
                                <input type="checkbox" name="<?= e($name) ?>"<?= $required ?><?= $value !== '' ? ' value="' . e($value) . '"' : '' ?>>
                                <span><?= e($label) ?></span>
                            </label>
<?php elseif ($type === 'file'): ?>
                        <div class="<?= $wrapper ?>">
                            <label for="<?= e($id) ?>"><?= e($label) ?></label>
                            <div class="cr-file" id="<?= e($id) ?>Box">
                                <input type="file" id="<?= e($id) ?>" name="<?= e($name) ?>"<?= $required ?><?= !empty($accept) ? ' accept="' . e($accept) . '"' : '' ?>
                                    aria-describedby="<?= e($id) ?>Hint">
                                <i class="fa-solid <?= e($icon ?? 'fa-file-arrow-up') ?>"></i>
                                <span class="cr-file__label"><?= e($fileLabel ?? 'Choose a file or drop it here') ?></span>
                                <span class="cr-file__hint" id="<?= e($id) ?>Hint"><?= e($hint ?? '') ?></span>
                                <span class="cr-file__name" data-file-name></span>
                            </div>
                            <span class="cr-file__err" data-file-err><i class="fa-solid fa-circle-exclamation"></i></span>
                        </div>
<?php else: ?>
                            <div class="<?= $wrapper ?>">
                                <label for="<?= e($id) ?>"><?= e($label) ?><?= !empty($optional) ? ' <span class="ct-optional">optional</span>' : '' ?></label>
<?php if ($type === 'select'): ?>
                                <select id="<?= e($id) ?>" name="<?= e($name) ?>"<?= $required ?>>
<?php if (isset($placeholder)): ?>
                                    <option value=""><?= e($placeholder) ?></option>
<?php endif; ?>
<?php foreach ($options ?? [] as $option): ?>
<?php if (is_array($option)): ?>
                                    <option value="<?= e($option['value'] ?? '') ?>"<?= $optionAttrs($option) ?><?= (string) ($option['value'] ?? '') === (string) $value && $value !== '' ? ' selected' : '' ?>><?= e($option['label'] ?? '') ?></option>
<?php else: ?>
                                    <option<?= (string) $option === (string) $value && $value !== '' ? ' selected' : '' ?>><?= e($option) ?></option>
<?php endif; ?>
<?php endforeach; ?>
                                </select>
<?php elseif ($type === 'textarea'): ?>
                                <textarea id="<?= e($id) ?>" name="<?= e($name) ?>"<?= $required ?><?= isset($placeholder) ? "\n                                    placeholder=\"" . e($placeholder) . '"' : '' ?>><?= e($value) ?></textarea>
<?php else: ?>
                                <input type="<?= e($type) ?>" id="<?= e($id) ?>" name="<?= e($name) ?>"<?= $required ?><?= !empty($readonly) ? ' readonly' : '' ?><?= !empty($autocomplete) ? ' autocomplete="' . e($autocomplete) . '"' : '' ?><?= isset($placeholder) ? ' placeholder="' . e($placeholder) . '"' : '' ?><?= $value !== '' ? ' value="' . e($value) . '"' : '' ?>>
<?php endif; ?>
<?php if (!empty($help)): ?>
                                <small class="ct-help"><?= e($help) ?></small>
<?php endif; ?>
                            </div>
<?php endif; ?>

