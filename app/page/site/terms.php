<?php

/**
 * Terms & Conditions.
 *
 * Boilerplate written for this hospital rather than lifted from a generator,
 * but it is still boilerplate: have it read by the hospital's own lawyer
 * before it is treated as binding. Paragraphs are printed raw so they can
 * carry <strong> and links.
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Terms & Conditions']],
    /* Escaped by the component, so the ampersand is written plainly here. */
    'title' => 'Terms &',
    'strong' => 'Conditions',
    'lead' => 'The rules this website is offered under — what it promises, what it does not, and where to take a question it does not answer.',
    'img' => $bannerImage ?? '',
    'chips' => ['Plain language', 'Indian law', 'Updated August 2026'],
    'primary' => ['href' => base_url('privacy'), 'label' => 'Privacy Policy'],
    'ghost' => ['href' => base_url('contact'), 'icon' => 'fa-envelope', 'label' => 'Ask a Question'],
]); ?>

<?php App::render('site/block/legal', [
    'updated' => '12 August 2026',
    'call' => $callAction ?? [],
    'intro' => [
        'This website is published by <strong>Teresa Memorial Hospital</strong>, G.T. Road, Bardhaman, West Bengal 713101. Using it — reading a page, sending an enquiry, requesting an appointment — means you accept the terms below.',
        'If you do not accept them, please use the phone number at the top of the page instead. Nothing here limits any right you have under Indian law that cannot be given up by agreement.',
    ],
    'sections' => [
        [
            'id' => 'purpose',
            'title' => 'What this website is for',
            'body' => [
                'It exists to tell you what the hospital does, who works here, and how to reach us. It is an information service and an enquiry channel — not the hospital itself.',
                'Departments, doctors, facilities and articles are described in general terms. Individual care always depends on an examination, and nothing on this site can substitute for one.',
            ],
        ],
        [
            'id' => 'not-advice',
            'title' => 'Not medical advice',
            'body' => [
                'Articles, department pages and health information here are <strong>general information only</strong>. They are not a diagnosis, a prescription, or advice for your situation.',
                'Never delay seeing a doctor, or ignore something a doctor has told you, because of something you read on this website.',
            ],
        ],
        [
            'id' => 'emergency',
            'title' => 'Emergencies',
            'body' => [
                'This website is not monitored around the clock, and a form is not a way to reach a doctor quickly.',
                'In an emergency, call the hospital directly or come to the Emergency department, which is open 24 hours. Ambulance and emergency numbers are on the <a href="' . base_url('contact') . '#emergency">contact page</a>.',
            ],
        ],
        [
            'id' => 'appointments',
            'title' => 'Appointment requests',
            'body' => [
                'An appointment form is a <strong>request</strong>. It is confirmed only when someone from the hospital confirms it by phone or message.',
                'Consulting hours, doctor availability and clinic days change — for leave, emergencies and theatre lists. We publish them in good faith and update them as fast as we can, but a listing on this site is not a guarantee that a particular doctor will be available on a particular day.',
            ],
        ],
        [
            'id' => 'your-details',
            'title' => 'The details you send',
            'body' => [
                'Please send accurate details, and only your own — or those of someone you are entitled to act for, such as your child or a patient in your care.',
                'Do not use the forms on this site to send abusive content, advertising, or anything unlawful. What happens to the details you send is set out in the <a href="' . base_url('privacy') . '">Privacy Policy</a>.',
            ],
        ],
        [
            'id' => 'fees',
            'title' => 'Charges, packages and insurance',
            'body' => [
                'Any charge, package or insurance arrangement mentioned on this site is indicative. The amount payable depends on the treatment actually given, the room category, consumables and your insurer\'s approval.',
                'The billing desk is the only authority on what a treatment costs. Ask them before you rely on a figure.',
            ],
        ],
        [
            'id' => 'careers',
            'title' => 'Job applications',
            'body' => [
                'Applying through the careers pages does not create an offer, an interview entitlement, or any obligation on the hospital to fill an advertised post.',
                'Documents you send with an application are handled as described in the Privacy Policy.',
            ],
        ],
        [
            'id' => 'content',
            'title' => 'Content and trademarks',
            'body' => [
                'The text, photographs, layout and the hospital\'s name and logo belong to Teresa Memorial Hospital or to the people who licensed them to us.',
                'You may read, print and share pages for your own non-commercial use, with the source named. You may not republish, sell, or use our name or logo to suggest an association that does not exist.',
            ],
        ],
        [
            'id' => 'third-party',
            'title' => 'Links and embedded media',
            'body' => [
                'Some pages link to other websites, and the gallery embeds video hosted on YouTube. Those services are run by other people under their own terms and privacy policies.',
                'We do not control them and are not responsible for what they publish or collect.',
            ],
        ],
        [
            'id' => 'availability',
            'title' => 'Availability and changes',
            'body' => [
                'The site is offered as it is. We do not promise it will be uninterrupted, error-free, or available during maintenance.',
                'We may change these terms. The date at the top of this page is the date of the current version, and continuing to use the site after a change means you accept the new version.',
            ],
        ],
        [
            'id' => 'liability',
            'title' => 'Limits of liability',
            'body' => [
                'To the extent Indian law allows, the hospital is not liable for indirect or consequential loss arising from use of this website — for example loss caused by relying on a published consulting time, or by a form that failed to reach us.',
                'Nothing in this clause limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.',
            ],
        ],
        [
            'id' => 'law',
            'title' => 'Governing law',
            'body' => [
                'These terms are governed by the laws of India. The courts at Bardhaman, West Bengal have jurisdiction over any dispute arising from this website.',
            ],
        ],
        [
            'id' => 'contact',
            'title' => 'Contacting us',
            'body' => [
                'Questions about these terms, or about anything published here, can go to the front desk by phone, or through the <a href="' . base_url('contact') . '">contact page</a>.',
            ],
        ],
    ],
]); ?>

<?php App::render('site/block/cta', [
    'title' => 'Still need a person, not a page?',
    'text' => 'The front desk answers around the clock, and can put you through to the department you actually need.',
    'primary' => ['href' => base_url('contact') . '#book', 'label' => 'Book an Appointment', 'icon' => 'fa-calendar-check'],
    'secondary' => $callAction ?? [],
]); ?>
