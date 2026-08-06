<?php

/**
 * The four claim cards above the footer.
 *
 * Props
 *   cards  array of {text, href, label} — `label` is the arrow's aria-label,
 *          because the arrow itself has no text to read out.
 */

$cards = $cards ?? [
    ['text' => 'Teresa Memorial operates more than 20 units, including specialist day-care centres.', 'href' => base_url('departments'), 'label' => 'See our departments'],
    ['text' => 'Delivering an exceptional care experience for every kind of patient.', 'href' => base_url('about'), 'label' => 'About the hospital'],
    ['text' => 'It is our privilege to care for more than a million people across the district.', 'href' => base_url('about'), 'label' => 'Our reach'],
    ['text' => 'Driven by a desire to help, we collaborate and support one another.', 'href' => base_url('doctors'), 'label' => 'Meet the team'],
];
?>
    <!-- ============ PRE-FOOTER ============ -->
    <div class="prefooter" id="prefooter">
<?php foreach ($cards as $card): ?>
        <div class="prefooter__card">
            <p><?= e($card['text'] ?? '') ?></p>
            <a class="prefooter__btn" href="<?= e($card['href'] ?? '#') ?>" aria-label="<?= e($card['label'] ?? '') ?>"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
<?php endforeach; ?>
    </div>
