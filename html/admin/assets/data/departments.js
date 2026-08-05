/* Seed: departments.
   Replaces DEPARTMENTS in tools/site-data.mjs (lines 57–470). The two
   fully-populated records (cardiology, neuro-surgery) carry every nested
   field so the tabbed form has real content on every tab; the rest carry
   the shape a copywriter would fill in. */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    const IMG = (id, wd) => `https://images.unsplash.com/photo-${id}?q=80&w=${wd || 1600}&auto=format&fit=crop`;
    const THEATRE = IMG('1628348068343-c6a848d2b6dd');
    const WARD = IMG('1587351021759-3e566b6af7cc');

    /* A department with no page content yet — still a valid record, it just
       renders the "not filled in" state on its tabs. */
    const stub = (slug, name, icon, menuNote, lead, order, status) => ({
        id: slug, name, icon, menuNote, showInMenu: true,
        banner: THEATRE,
        titleLead: `${name} &`, titleStrong: 'Care',
        lead,
        chips: [], stats: [], introTitle: '', introBody: [], checks: [],
        introImg: WARD, procedures: [], conditions: [],
        conditionsTitle: `Conditions the ${name.toLowerCase()} team treats`,
        conditionsLead: '',
        doctorIds: [], order, status,
        updatedAt: '2026-06-12T09:00:00Z',
    });

    w.TMH_SEED.departments = [
        {
            id: 'cardiology',
            name: 'Cardiology',
            icon: 'fa-heart-pulse',
            menuNote: '6+ Doctors Available',
            showInMenu: true,
            banner: THEATRE,
            titleLead: 'Cardiology &',
            titleStrong: 'Heart Care',
            lead: 'A round-the-clock cath lab, non-invasive diagnostics and a heart-failure clinic — under one roof, staffed by six consultants.',
            chips: [
                { text: '24/7 Cath Lab' },
                { text: 'Door-to-balloon under 60 min' },
                { text: 'Cardiac ICU — 12 beds' },
            ],
            stats: [
                { icon: 'fa-heart-pulse', count: 4200, suffix: '+', label: 'Procedures a year', note: '18% more than 2024' },
                { icon: 'fa-user-doctor', count: 6, suffix: '', label: 'Cardiologists on staff', note: 'Two on call nightly' },
                { icon: 'fa-stopwatch', count: 52, suffix: ' min', label: 'Median door-to-balloon', note: 'Below the 90 min target' },
                { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Patient rating', note: '1,900 reviews' },
            ],
            introTitle: 'Every minute of a cardiac event <strong>is treated like one</strong>',
            introBody: [
                { paragraph: 'Chest pain is triaged the moment it reaches our door. ECG within ten minutes, troponin at the bedside, and a cath lab team that is already gowning while the report prints.' },
                { paragraph: 'Beyond emergencies, the department runs scheduled clinics for hypertension, arrhythmia, valve disease and post-bypass rehabilitation — so the care does not stop at discharge.' },
            ],
            checks: [
                { text: '24/7 interventional cover' },
                { text: 'On-site cardiac ICU' },
                { text: 'Bedside echo and Doppler' },
                { text: 'Structured cardiac rehab' },
                { text: 'Pacemaker & device clinic' },
                { text: 'Insurance desk on the floor' },
            ],
            introImg: IMG('1587351021759-3e566b6af7cc', 1000),
            badgeIcon: 'fa-truck-medical',
            badgeTitle: 'Chest pain?',
            badgeText: 'Call +91 342 325 4567 — do not drive yourself.',
            procedures: [
                { icon: 'fa-heart-circle-bolt', title: 'Primary Angioplasty', text: 'Emergency stenting for a heart attack in progress, available every hour of the year.' },
                { icon: 'fa-diagram-project', title: 'Coronary Angiography', text: 'Radial-access diagnostic imaging with same-day discharge for most patients.' },
                { icon: 'fa-wave-square', title: 'Echocardiography', text: 'Transthoracic, transesophageal and stress echo reported by the consultant who scanned you.' },
                { icon: 'fa-microchip', title: 'Pacemaker Implantation', text: 'Single, dual-chamber and biventricular devices, with a lifelong follow-up clinic.' },
                { icon: 'fa-person-running', title: 'TMT & Holter', text: 'Treadmill testing and 24-hour rhythm monitoring booked within 48 hours.' },
                { icon: 'fa-heart', title: 'Heart Failure Clinic', text: 'Weekly review, drug titration and fluid management to keep readmissions down.' },
            ],
            conditionsTitle: 'Conditions the cardiology team treats',
            conditionsLead: 'If your symptom is on this list, book the cardiology clinic directly — you do not need a referral from another department first.',
            conditions: [
                { text: 'Coronary artery disease' }, { text: 'Heart attack (STEMI / NSTEMI)' },
                { text: 'Angina' }, { text: 'Hypertension' }, { text: 'Heart failure' },
                { text: 'Atrial fibrillation' }, { text: 'Valve disease' }, { text: 'Cardiomyopathy' },
                { text: 'High cholesterol' }, { text: 'Congenital heart defects' },
                { text: 'Palpitations' }, { text: 'Post-bypass follow-up' },
            ],
            doctorIds: ['dr-jonathon-ronan', 'dr-anita-sharma'],
            metaTitle: 'Cardiology & Heart Care — Teresa Memorial Hospital',
            metaDescription: '24/7 cath lab, cardiac ICU and a heart-failure clinic in Bardhaman. Six consultant cardiologists, median door-to-balloon of 52 minutes.',
            order: 1, status: 'published',
            updatedAt: '2026-07-29T11:20:00Z',
        },
        {
            id: 'neuro-surgery',
            name: 'Neuro Surgery',
            icon: 'fa-brain',
            menuNote: '2+ Doctors Available',
            showInMenu: true,
            banner: THEATRE,
            titleLead: 'Neuro Surgery &',
            titleStrong: 'Spine Care',
            lead: 'Microsurgery, neuro-navigation and a dedicated neuro ICU for brain, spine and nerve conditions.',
            chips: [
                { text: 'Neuro ICU — 8 beds' },
                { text: 'Operating microscope' },
                { text: 'Stroke pathway 24/7' },
            ],
            stats: [
                { icon: 'fa-brain', count: 640, suffix: '+', label: 'Neuro procedures a year', note: '12% more than 2024' },
                { icon: 'fa-user-doctor', count: 2, suffix: '', label: 'Neurosurgeons', note: 'Plus 3 neurologists' },
                { icon: 'fa-bed-pulse', count: 8, suffix: '', label: 'Neuro ICU beds', note: 'One-to-one nursing' },
                { icon: 'fa-star', count: 4.7, suffix: '/5', label: 'Patient rating', note: '620 reviews' },
            ],
            introTitle: 'Precision work, <strong>on the most delicate tissue there is</strong>',
            introBody: [
                { paragraph: 'Neurosurgery leaves no margin for approximation. Every case is planned on thin-slice imaging, executed under the microscope and recovered in an ICU staffed by nurses trained only in neuro care.' },
                { paragraph: 'Suspected stroke bypasses the queue entirely: CT within twenty minutes of arrival, thrombolysis decision made by the consultant on call.' },
            ],
            checks: [
                { text: 'Neuro-navigation system' }, { text: 'Intra-operative monitoring' },
                { text: '24/7 stroke pathway' }, { text: 'Minimally invasive spine surgery' },
                { text: 'Epilepsy and headache clinic' }, { text: 'On-site physiotherapy' },
            ],
            introImg: THEATRE,
            badgeIcon: 'fa-bolt',
            badgeTitle: 'Stroke is time-critical',
            badgeText: 'Face drooping or slurred speech — come straight to Emergency.',
            procedures: [
                { icon: 'fa-brain', title: 'Craniotomy', text: 'Tumour, haematoma and aneurysm surgery under the operating microscope.' },
                { icon: 'fa-bone', title: 'Spine Fixation', text: 'Instrumented fusion for trauma, deformity and degenerative disease.' },
                { icon: 'fa-diagram-project', title: 'Microdiscectomy', text: 'Minimally invasive relief for a prolapsed disc, most patients home in 48 hours.' },
                { icon: 'fa-droplet', title: 'Shunt Surgery', text: 'Ventriculoperitoneal shunts for hydrocephalus in children and adults.' },
            ],
            conditionsTitle: 'Conditions the neuro team treats',
            conditionsLead: '',
            conditions: [
                { text: 'Stroke' }, { text: 'Brain tumour' }, { text: 'Head injury' },
                { text: 'Slipped disc' }, { text: 'Spinal stenosis' }, { text: 'Epilepsy' },
                { text: 'Hydrocephalus' }, { text: 'Trigeminal neuralgia' },
            ],
            doctorIds: ['dr-sourav-mitra'],
            metaTitle: 'Neuro Surgery & Spine Care — Teresa Memorial Hospital',
            metaDescription: 'Microsurgery, neuro-navigation and an eight-bed neuro ICU, with a 24/7 stroke pathway.',
            order: 2, status: 'published',
            updatedAt: '2026-07-21T09:40:00Z',
        },

        stub('orthopedics', 'Orthopedics', 'fa-bone', '4+ Doctors Available',
            'Trauma, joint replacement and sports injury care, with an on-site physiotherapy gym.', 3, 'published'),
        stub('general-surgery', 'General Surgery', 'fa-user-doctor', '3+ Doctors Available',
            'Elective and emergency general surgery, most of it laparoscopic.', 4, 'published'),
        stub('pediatric-surgery', 'Pediatric Surgery', 'fa-child', '2+ Doctors Available',
            'Neonatal and childhood surgery, with a nursery team on the same floor.', 5, 'published'),
        stub('prenatal-care', 'Prenatal Care', 'fa-baby', '3+ Doctors Available',
            'Antenatal clinics, a high-risk pathway and a maternity block with 24/7 cover.', 6, 'published'),
        stub('nephrology', 'Nephrology', 'fa-droplet', '2+ Doctors Available',
            'A twelve-station dialysis unit and a chronic kidney disease clinic.', 7, 'published'),
        stub('ophthalmology', 'Ophthalmology', 'fa-eye', '2+ Doctors Available',
            'Cataract surgery, retina care and diabetic retinopathy screening.', 8, 'published'),
        stub('dental-care', 'Dental Care', 'fa-tooth', '2+ Doctors Available',
            'Routine dentistry plus oral and maxillofacial surgery.', 9, 'published'),
        stub('lab-diagnostics', 'Lab & Diagnostics', 'fa-flask-vial', 'Same-day reporting',
            'Pathology, microbiology, histopathology and imaging under one roof.', 10, 'published'),
        stub('nutrition', 'Nutrition', 'fa-apple-whole', '1 Doctor Available',
            'Therapeutic diets cooked on site and an outpatient diet clinic.', 11, 'published'),
        stub('facilities', 'Physiotherapy', 'fa-person-walking', 'New',
            'Inpatient rounds and outpatient rehabilitation courses.', 12, 'draft'),
    ];
}(window));
