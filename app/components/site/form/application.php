<?php

/**
 * The job application form. Everything above the .cr-optional divider is
 * required; the rest helps HR shortlist faster but is never the reason an
 * application is rejected.
 *
 * The mailto panel below the form stays whether or not the form is used: a
 * mailto: cannot carry a CV, so it is a second route rather than a fallback.
 *
 * Props
 *   action      string
 *   csrf        string
 *   position    string  The role, prefilled into the read-only field
 *   applyEmail  string  Omit it and the mailto panel is not rendered
 *   eyebrow, heading, lead   `heading` is markup
 *   noticeOptions, sourceOptions  array
 *   note        string
 */

$position = $position ?? '';
$applyEmail = $applyEmail ?? '';

$noticeOptions = $noticeOptions ?? ['Immediate', '15 days', '1 month', '2 months', '3 months or more'];
$sourceOptions = $sourceOptions ?? [
    'This website',
    'A colleague at the hospital',
    'Job portal',
    'Nursing college or institute',
    'Newspaper or notice board',
    'Other',
];
?>
                <div class="ct-form">
                    <div class="ct-form__head">
                        <span class="eyebrow"><?= e($eyebrow ?? 'Application') ?></span>
                        <!-- raw: the heading carries <strong> on the emphasised half -->
                        <h2><?= $heading ?? 'Apply For <strong>This Role</strong>' ?></h2>
                        <p><?= e($lead ?? 'Everything above the divider is required. The rest helps HR shortlist faster but will never be the reason an application is rejected.') ?></p>
                    </div>

                    <form id="applyForm" class="ct-grid" method="post" action="<?= e($action ?? '') ?>" enctype="multipart/form-data" novalidate>
<?php if (!empty($csrf)): ?>
                        <input type="hidden" name="_token" value="<?= e($csrf) ?>">
<?php endif; ?>
<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apName', 'name' => 'name', 'label' => 'Full name', 'required' => true, 'autocomplete' => 'name']) ?>

<?= App::component('site/form/field', ['type' => 'tel', 'id' => 'apPhone', 'name' => 'phone', 'label' => 'Phone', 'required' => true, 'autocomplete' => 'tel']) ?>

<?= App::component('site/form/field', ['type' => 'email', 'id' => 'apEmail', 'name' => 'email', 'label' => 'Email', 'required' => true, 'autocomplete' => 'email']) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apRole', 'name' => 'position', 'label' => 'Position applied for', 'required' => true, 'readonly' => true, 'value' => $position]) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apExp', 'name' => 'experience', 'label' => 'Total experience', 'required' => true, 'placeholder' => 'e.g. 3 years 6 months']) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apCity', 'name' => 'location', 'label' => 'Current location', 'required' => true, 'placeholder' => 'City or district']) ?>

<?= App::component('site/form/field', [
    'type' => 'file',
    'id' => 'apResume',
    'name' => 'resume',
    'label' => 'Resume / CV',
    'required' => true,
    'full' => true,
    'accept' => '.pdf,.doc,.docx',
    'icon' => 'fa-file-arrow-up',
    'hint' => 'PDF, DOC or DOCX — 5 MB maximum',
]) ?>

                        <p class="cr-optional">Optional &mdash; tell us more</p>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apEmployer', 'name' => 'employer', 'label' => 'Current employer']) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apQual', 'name' => 'qualification', 'label' => 'Highest qualification', 'placeholder' => 'e.g. B.Sc Nursing']) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apReg', 'name' => 'registration', 'label' => 'Council / registration number']) ?>

<?= App::component('site/form/field', ['type' => 'select', 'id' => 'apNotice', 'name' => 'notice', 'label' => 'Notice period', 'placeholder' => 'Select', 'options' => $noticeOptions]) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apCtc', 'name' => 'ctc', 'label' => 'Current CTC (per annum)', 'placeholder' => '₹']) ?>

<?= App::component('site/form/field', ['type' => 'text', 'id' => 'apEctc', 'name' => 'expectedCtc', 'label' => 'Expected CTC (per annum)', 'placeholder' => '₹']) ?>

<?= App::component('site/form/field', ['type' => 'date', 'id' => 'apAvail', 'name' => 'availableFrom', 'label' => 'Available from']) ?>

<?= App::component('site/form/field', ['type' => 'url', 'id' => 'apLink', 'name' => 'link', 'label' => 'LinkedIn or portfolio', 'placeholder' => 'https://']) ?>

<?= App::component('site/form/field', ['type' => 'select', 'id' => 'apSource', 'name' => 'source', 'label' => 'How did you hear about us?', 'placeholder' => 'Select', 'options' => $sourceOptions]) ?>

<?= App::component('site/form/field', [
    'type' => 'textarea',
    'id' => 'apLetter',
    'name' => 'coverLetter',
    'label' => 'Cover letter',
    'full' => true,
    'placeholder' => 'Why this role, and what you would bring to the unit. A few honest sentences beat a page of template.',
]) ?>

<?= App::component('site/form/field', [
    'type' => 'file',
    'id' => 'apLetterFile',
    'name' => 'coverLetterFile',
    'label' => 'Cover letter as a file (instead of the box above)',
    'full' => true,
    'accept' => '.pdf,.doc,.docx',
    'icon' => 'fa-paperclip',
    'fileLabel' => 'Attach a cover letter',
    'hint' => 'PDF, DOC or DOCX — 5 MB maximum',
]) ?>

<?= App::component('site/form/field', [
    'type' => 'checkbox',
    'name' => 'consent',
    'required' => true,
    'label' => 'I confirm the details above are true and agree that Teresa Memorial Hospital may hold them for six months to consider me for this and similar roles.',
]) ?>

                        <div class="ct-form__foot">
                            <button type="submit" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> Submit Application</button>
                            <span class="ct-note" id="applyNote"><i class="fa-solid fa-circle-check"></i> <?= e($note ?? 'Thank you — HR will be in touch within a week.') ?></span>
                        </div>
                    </form>
                </div>
<?php if ($applyEmail !== ''): ?>

                <!-- a mailto: cannot carry the CV, so the direct route stays on
                     the page whether or not the form above was used -->
                <div class="cr-mail">
                    <i class="fa-solid fa-envelope-open-text"></i>
                    <p><strong>Prefer to email it?</strong>Send your CV and cover letter straight to HR. Attachments
                        are safest that way &mdash; put the role name in the subject line.</p>
                    <a href="mailto:<?= e($applyEmail) ?>" class="btn-primary" id="applyMailto"><i
                            class="fa-solid fa-paper-plane"></i> <?= e($applyEmail) ?></a>
                </div>
<?php endif; ?>
