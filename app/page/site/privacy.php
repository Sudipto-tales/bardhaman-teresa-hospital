<?php

/**
 * Privacy Policy.
 *
 * Describes what this website collects — forms, logs, embedded video. It is
 * deliberately silent on the detail of clinical record-keeping, which is the
 * hospital's own policy and not a website matter. Have a lawyer read it
 * before treating it as a published commitment.
 */
?>
<?php App::render('site/block/banner', [
    'crumb' => [['label' => 'Home', 'href' => base_url('/')], ['label' => 'Privacy Policy']],
    'title' => 'Privacy',
    'strong' => 'Policy',
    'lead' => 'What this website collects, why we need it, who ever sees it, and how to have it corrected or removed.',
    'img' => $bannerImage ?? '',
    'chips' => ['DPDP Act, 2023', 'No data sold', 'Updated August 2026'],
    'primary' => ['href' => base_url('terms'), 'label' => 'Terms & Conditions'],
    'ghost' => ['href' => base_url('contact'), 'icon' => 'fa-envelope', 'label' => 'Ask a Question'],
]); ?>

<?php App::render('site/block/legal', [
    'updated' => '12 August 2026',
    'call' => $callAction ?? [],
    'intro' => [
        '<strong>Teresa Memorial Hospital</strong>, G.T. Road, Bardhaman, West Bengal 713101, is responsible for the personal data collected through this website.',
        'This policy covers the website only — enquiry forms, appointment requests, job applications and the ordinary technical records a web server keeps. Your <strong>medical records</strong> are held separately under the hospital\'s clinical records policy and the confidentiality rules that bind its doctors.',
    ],
    'sections' => [
        [
            'id' => 'collect',
            'title' => 'What we collect',
            'body' => [
                'Only what a form asks for, plus what any web server records automatically:',
            ],
            'list' => [
                '<strong>Enquiries and appointment requests</strong> — your name, phone number, email address, the department or doctor you asked for, a preferred date, and whatever you write in the message box.',
                '<strong>Job applications</strong> — your name, contact details, the post applied for, and the CV or documents you attach.',
                '<strong>Technical records</strong> — IP address, browser and device type, the pages you opened and when. These are kept in server logs.',
                '<strong>Cookies</strong> — a small number, described below.',
            ],
        ],
        [
            'id' => 'sensitive',
            'title' => 'Health details in a message box',
            'body' => [
                'You do not have to describe a condition to get an appointment. A department name is enough.',
                'If you do write about symptoms or a diagnosis in an enquiry, we treat it as confidential and pass it only to the clinical staff who need it to answer you. <strong>Please do not send reports, scans or prescriptions through the website</strong> — bring them, or hand them to the desk.',
            ],
        ],
        [
            'id' => 'why',
            'title' => 'Why we use it',
            'body' => [
                'For the purpose you gave it to us and nothing else:',
            ],
            'list' => [
                'To answer your enquiry, or to confirm and arrange an appointment.',
                'To consider a job application and contact you about it.',
                'To keep the site working, to spot abuse, and to count visits so we can see which pages people actually need.',
                'To meet a legal or regulatory obligation when one applies.',
            ],
        ],
        [
            'id' => 'never',
            'title' => 'What we never do',
            'body' => [
                'We do not sell your details. We do not rent or trade them, and we do not pass them to advertisers or to anyone building a marketing list.',
                'You will not be added to a promotional list because you asked for an appointment.',
            ],
        ],
        [
            'id' => 'cookies',
            'title' => 'Cookies and embedded video',
            'body' => [
                'The site sets cookies needed to keep a session working and to remember a preference such as a dismissed banner. We may use a visitor-counting service that stores an anonymous identifier.',
                'The gallery embeds video hosted by <strong>YouTube</strong>. When a video loads, Google may set its own cookies and see your IP address under <em>its</em> privacy policy, not ours.',
                'Your browser can block or clear cookies. Blocking them may break parts of the site that depend on a session.',
            ],
        ],
        [
            'id' => 'sharing',
            'title' => 'Who sees your details',
            'body' => [
                'Inside the hospital: only the desk staff, department or doctor your message concerns, and for applications the people handling recruitment.',
            ],
            'list' => [
                '<strong>Service providers</strong> — the company hosting this website and, where used, an email or SMS provider. They act on our instructions and may not use your details for their own purposes.',
                '<strong>Insurers or payers</strong> — only where you have asked us to arrange a cashless approval on your behalf.',
                '<strong>Authorities</strong> — where a law, a court, or a public-health requirement obliges us to disclose.',
            ],
        ],
        [
            'id' => 'keep',
            'title' => 'How long we keep it',
            'body' => [
                'Enquiries and appointment requests are kept while we deal with them and for a reasonable period afterwards, so we have a record of what was asked and answered.',
                'Applications are kept for the recruitment cycle and a short period after it, unless you ask us to delete them sooner. Server logs are kept briefly, for security and diagnosis.',
                'Where a law fixes a retention period — as it does for clinical records — that period governs.',
            ],
        ],
        [
            'id' => 'security',
            'title' => 'How it is protected',
            'body' => [
                'The site is served over an encrypted connection. Access to submitted enquiries is limited to staff who need it, through individual accounts.',
                'No system is perfectly secure. If a breach ever affects your personal data, we will act on it and inform you and the authorities as the law requires.',
            ],
        ],
        [
            'id' => 'rights',
            'title' => 'Your rights',
            'body' => [
                'Under the <strong>Digital Personal Data Protection Act, 2023</strong>, you may ask us to:',
            ],
            'list' => [
                'tell you what personal data of yours we hold and who it has gone to;',
                'correct anything inaccurate, incomplete, or out of date;',
                'erase data we no longer need for the purpose you gave it for;',
                'withdraw a consent you gave — which stops future use, without unmaking what was lawfully done before;',
                'nominate someone to exercise these rights if you cannot.',
            ],
        ],
        [
            'id' => 'grievance',
            'title' => 'Complaints and grievances',
            'body' => [
                'Write to the hospital through the <a href="' . base_url('contact') . '">contact page</a>, or call the front desk, marking the message for the <strong>Grievance Officer</strong>. Please say what you want done and give enough detail for us to find your records.',
                'If our answer does not satisfy you, you may take the matter to the Data Protection Board of India.',
            ],
        ],
        [
            'id' => 'children',
            'title' => 'Children',
            'body' => [
                'This website is meant for adults. Where an appointment concerns a child, we expect a parent or guardian to be the one filling in the form.',
            ],
        ],
        [
            'id' => 'changes',
            'title' => 'Changes to this policy',
            'body' => [
                'When this policy changes, the date at the top of the page changes with it. The version published here is always the one in force.',
            ],
        ],
    ],
]); ?>

<?php App::render('site/block/cta', [
    'title' => 'Want something corrected or removed?',
    'text' => 'Tell the front desk what you want changed and we will deal with it — no form to hunt for.',
    'primary' => ['href' => base_url('contact'), 'label' => 'Contact the Hospital', 'icon' => 'fa-envelope'],
    'secondary' => $callAction ?? [],
]); ?>
