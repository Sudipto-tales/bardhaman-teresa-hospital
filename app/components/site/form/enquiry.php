<?php

/**
 * The appointment request form. It does not book anything — it lands as an
 * enquiry with source = appointment and the desk calls back (§19, §20).
 *
 * The doctor list carries only doctors who accept appointments, and each
 * option carries its own department on data-dept so preselectDoctor() in
 * assets/pages.js can set the department select to match.
 *
 * Props
 *   action              string
 *   csrf                string  Token; the hidden input is omitted without one
 *   source              string  What the enquiry is filed as. This form is the
 *                               appointment request, so that is the default
 *   departments         array of {slug, name}
 *   doctors             array of {slug, name, role, department}
 *   selectedDepartment  string  Prefills the select
 *   selectedDoctor      string  What ?doctor= resolved to
 *   eyebrow, heading, lead      The form's own header; `heading` is markup
 *   times               array   Preferred-time options
 *   note                string  The success line pages.js reveals
 *   ask                 array   Which optional questions to put — department,
 *                               doctor, date, reason. The panel's Appointment
 *                               section has a switch per row and a form that
 *                               ignored them would make those switches a lie.
 *                               Absent, every question is asked
 */

$departments = $departments ?? [];
$doctors = $doctors ?? [];

$ask = ($ask ?? []) + ['department' => true, 'doctor' => true, 'date' => true, 'reason' => true];

$departmentOptions = [];
foreach ($departments as $department) {
    $departmentOptions[] = [
        'value' => $department['slug'] ?? $department['id'] ?? '',
        'label' => $department['name'] ?? '',
    ];
}
$departmentOptions[] = ['value' => 'other', 'label' => 'Not sure / other'];

$doctorOptions = [];
foreach ($doctors as $doctor) {
    $slug = $doctor['slug'] ?? $doctor['id'] ?? '';
    if ($slug === '') {
        continue;
    }

    /* A doctor's own department, not one inferred from the team strips —
       those list guests as well as owners, so deriving from them files an
       interventional cardiologist under nephrology.

       The models return every department the doctor belongs to; the select
       can carry one, and the first is the one they are listed under. */
    $dept = $doctor['department'] ?? $doctor['dept'] ?? '';
    if ($dept === '' && !empty($doctor['departments'])) {
        $dept = (string) reset($doctor['departments']);
    }

    $doctorOptions[] = [
        'value' => $slug,
        'label' => trim(($doctor['name'] ?? '') . ' — ' . ($doctor['role'] ?? ''), ' —'),
        'attrs' => $dept !== '' ? ['data-dept' => $dept] : [],
    ];
}

$times = $times ?? [
    ['value' => 'morning', 'label' => 'Morning (8 AM – 12 PM)'],
    ['value' => 'afternoon', 'label' => 'Afternoon (12 PM – 4 PM)'],
    ['value' => 'evening', 'label' => 'Evening (4 PM – 8 PM)'],
];
?>
                    <div class="ct-form">
                        <div class="ct-form__head">
                            <span class="eyebrow"><?= e($eyebrow ?? 'Appointments') ?></span>
                            <!-- raw: the heading carries <strong> on the emphasised half -->
                            <h2><?= $heading ?? 'Request An <strong>Appointment</strong>' ?></h2>
                            <p><?= e($lead ?? 'Send this and the desk will call you back to confirm a slot, usually within the hour.') ?></p>
                        </div>

                        <form id="appointmentForm" class="ct-grid" method="post" action="<?= e($action ?? base_url('contact')) ?>" novalidate>
<?php if (!empty($csrf)): ?>
                            <input type="hidden" name="_token" value="<?= e($csrf) ?>">
<?php endif; ?>
                            <input type="hidden" name="source" value="<?= e($source ?? 'appointment') ?>">

                            <!-- The honeypot. Off-screen rather than
                                 display:none, which some bots check for, and
                                 out of the tab order and the accessibility
                                 tree so nobody using this form ever meets it.
                                 Anything typed here is a bot, and the server
                                 answers a filled one with a cheerful success. -->
                            <div class="ct-hp" aria-hidden="true"
                                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
                                <label for="ctWebsite">Website</label>
                                <input type="text" id="ctWebsite" name="website" tabindex="-1" autocomplete="off">
                            </div>
<?= App::component('site/form/field', ['type' => 'text', 'id' => 'ctName', 'name' => 'name', 'label' => 'Full name', 'required' => true, 'autocomplete' => 'name']) ?>

<?= App::component('site/form/field', ['type' => 'tel', 'id' => 'ctPhone', 'name' => 'phone', 'label' => 'Phone', 'required' => true, 'autocomplete' => 'tel']) ?>

<?= App::component('site/form/field', ['type' => 'email', 'id' => 'ctEmail', 'name' => 'email', 'label' => 'Email', 'autocomplete' => 'email']) ?>

<?php if ($ask['department']): ?>
<?= App::component('site/form/field', [
    'type' => 'select',
    'id' => 'ctDept',
    'name' => 'department',
    'label' => 'Department',
    'required' => true,
    'placeholder' => 'Select a department',
    'options' => $departmentOptions,
    'value' => $selectedDepartment ?? '',
]) ?>
<?php endif; ?>

<?php if ($ask['doctor']): ?>
<?= App::component('site/form/field', [
    'type' => 'select',
    'id' => 'ctDoctor',
    'name' => 'doctor',
    'label' => 'Doctor',
    'optional' => true,
    'placeholder' => 'No preference',
    'options' => $doctorOptions,
    'value' => $selectedDoctor ?? '',
    'help' => 'Doctors not listed here do not take booked appointments.',
]) ?>
<?php endif; ?>

<?php if ($ask['date']): ?>
<?= App::component('site/form/field', ['type' => 'date', 'id' => 'ctDate', 'name' => 'date', 'label' => 'Preferred date']) ?>

<?= App::component('site/form/field', ['type' => 'select', 'id' => 'ctTime', 'name' => 'time', 'label' => 'Preferred time', 'options' => $times]) ?>
<?php endif; ?>

<?php if ($ask['reason']): ?>
<?= App::component('site/form/field', [
    'type' => 'textarea',
    'id' => 'ctMsg',
    'name' => 'message',
    'label' => 'What is the problem?',
    'full' => true,
    'placeholder' => 'Describe the symptom in your own words — you do not need medical terms.',
]) ?>
<?php endif; ?>

<?= App::component('site/form/field', [
    'type' => 'checkbox',
    'name' => 'consent',
    'required' => true,
    'label' => 'I agree to be contacted about this request. My details will not be shared outside the hospital.',
]) ?>

                            <div class="ct-form__foot">
                                <button type="submit" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> Request Appointment</button>
                                <span class="ct-note" id="formNote"><i class="fa-solid fa-circle-check"></i> <?= e($note ?? 'Thank you — the desk will call you shortly.') ?></span>
                            </div>
                        </form>
                    </div>
