/* Seed: vacancies and applications.
   Replaces window.TMH_JOBS in assets/jobs.js. An empty jobs array is a
   supported state — the careers page then shows its "nothing open" panel. */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    w.TMH_SEED.jobs = [
        {
            id: 'staff-nurse-icu',
            title: 'Staff Nurse — Intensive Care',
            dept: 'Critical Care', type: 'Full time',
            location: 'Bardhaman — main campus', experience: '2+ years',
            postedAt: '2026-07-28', closesAt: '2026-08-31',
            summary: 'The ICU runs 18 beds across two pods with a 1:2 nurse-to-bed ratio on every shift. You will be part of a 24-nurse team that admits roughly 40 patients a month, most of them post-operative or cardiac.',
            responsibilities: [
                { text: 'Take charge of a two-bed pod through the shift, including ventilated and inotrope-dependent patients' },
                { text: 'Run the handover round with the on-duty intensivist at the start and close of every shift' },
                { text: 'Keep the electronic observation chart current — the unit audits completeness weekly' },
                { text: 'Escalate early using the unit’s deterioration protocol; nobody is questioned for calling too soon' },
                { text: 'Support families at the bedside, including the daily evening update call' },
            ],
            requirements: [
                { text: 'B.Sc Nursing or GNM with a valid West Bengal Nursing Council registration' },
                { text: 'At least two years post-registration, of which one is in a critical-care or high-dependency setting' },
                { text: 'Comfortable with ventilator circuits, arterial lines and infusion pumps' },
                { text: 'Current BLS certification; ACLS within six months of joining is funded by the hospital' },
                { text: 'Working Bangla and English — most families here speak Bangla first' },
            ],
            niceToHave: [
                { text: 'Post-basic diploma in critical-care nursing' },
                { text: 'Experience with a cardiac surgical population' },
                { text: 'Preceptor or clinical-teaching experience' },
            ],
            benefits: [
                { text: 'Roster published four weeks ahead, with night-shift differential' },
                { text: 'Fully funded ACLS and post-basic diploma fees' },
                { text: 'Subsidised treatment for you, your spouse, children and parents' },
            ],
            salaryFrom: 28000, salaryTo: 38000, salaryNote: 'Plus night differential',
            applyEmail: 'careers@teresamemorial.org', openings: 4,
            order: 1, status: 'published', updatedAt: '2026-07-28T09:00:00Z',
        },
        {
            id: 'consultant-anaesthetist',
            title: 'Consultant Anaesthetist',
            dept: 'Anaesthesia', type: 'Full time',
            location: 'Bardhaman — main campus', experience: '5+ years',
            postedAt: '2026-07-14', closesAt: '2026-08-14',
            summary: 'Four modular theatres, one always kept free for emergencies. The list is a mix of orthopaedic, general surgical and obstetric work, with an on-call rota of one in four.',
            responsibilities: [
                { text: 'Cover elective lists across general, orthopaedic and obstetric surgery' },
                { text: 'Share the one-in-four emergency on-call rota' },
                { text: 'Run the pre-anaesthetic clinic one session a week' },
            ],
            requirements: [
                { text: 'MD or DNB in Anaesthesiology with WBMC registration' },
                { text: 'Five years post-qualification, including obstetric anaesthesia' },
            ],
            benefits: [
                { text: 'Conference leave and travel funded annually' },
                { text: 'Accommodation available on campus' },
            ],
            salaryFrom: 150000, salaryTo: 220000, salaryNote: 'Negotiable for the right candidate',
            applyEmail: 'careers@teresamemorial.org', openings: 1,
            order: 2, status: 'published', updatedAt: '2026-07-14T09:00:00Z',
        },
        {
            id: 'radiographer',
            title: 'Radiographer — CT & X-ray',
            dept: 'Radiology', type: 'Full time',
            location: 'Bardhaman — main campus', experience: '1+ years',
            postedAt: '2026-08-01', closesAt: '2026-08-10',
            summary: 'Digital X-ray, ultrasound support and a 16-slice CT, with consultant reporting on site.',
            responsibilities: [{ text: 'Run the CT and X-ray lists across a rotating shift' }],
            requirements: [{ text: 'B.Sc or diploma in Radiography with AERB-compliant training' }],
            benefits: [{ text: 'Shift allowance and subsidised staff treatment' }],
            salaryFrom: 22000, salaryTo: 30000, salaryNote: '',
            applyEmail: 'careers@teresamemorial.org', openings: 2,
            order: 3, status: 'published', updatedAt: '2026-08-01T09:00:00Z',
        },
        {
            id: 'front-desk-executive',
            title: 'Front Desk Executive',
            dept: 'Administration', type: 'Full time',
            location: 'Bardhaman — main campus', experience: 'Fresher welcome',
            postedAt: '2026-06-20', closesAt: '2026-07-20',
            summary: 'First point of contact for every patient walking in. Registration, appointment booking and directing families to the right floor.',
            responsibilities: [{ text: 'Register patients and book appointments on the hospital system' }],
            requirements: [{ text: 'Graduate in any discipline, fluent Bangla and workable English' }],
            benefits: [{ text: 'Fixed shift pattern with weekly off' }],
            salaryFrom: 14000, salaryTo: 18000, salaryNote: '',
            applyEmail: 'careers@teresamemorial.org', openings: 2,
            order: 4, status: 'hidden', updatedAt: '2026-07-21T09:00:00Z',
        },
        {
            id: 'physiotherapist',
            title: 'Physiotherapist — Inpatient',
            dept: 'Physiotherapy', type: 'Part time',
            location: 'Bardhaman — main campus', experience: '2+ years',
            postedAt: '2026-08-03', closesAt: '2026-09-15',
            summary: 'Draft — waiting for the head of department to confirm the session count.',
            responsibilities: [], requirements: [], benefits: [],
            salaryFrom: 0, salaryTo: 0, salaryNote: '',
            applyEmail: 'careers@teresamemorial.org', openings: 1,
            order: 5, status: 'draft', updatedAt: '2026-08-03T11:20:00Z',
        },
    ];

    w.TMH_SEED.applications = [
        { id: 'app-001', jobId: 'staff-nurse-icu', name: 'Priya Mukherjee', email: 'priya.m@example.com', phone: '+91 98300 11221', experience: '4 years — Apollo Kolkata ICU', currentEmployer: 'Apollo Gleneagles', cvUrl: '#', cvFile: 'priya-mukherjee-cv.pdf', coverNote: 'I have worked in a mixed medical-surgical ICU for four years and am moving back to Bardhaman for family reasons.', stage: 'shortlisted', rating: 4, appliedAt: '2026-07-30T10:12:00Z', order: 1, status: 'published' },
        { id: 'app-002', jobId: 'staff-nurse-icu', name: 'Rina Das', email: 'rina.das@example.com', phone: '+91 98311 44556', experience: '2 years — district hospital', currentEmployer: 'Burdwan Medical College', cvUrl: '#', cvFile: 'rina-das-cv.pdf', coverNote: '', stage: 'new', rating: 0, appliedAt: '2026-08-01T08:44:00Z', order: 2, status: 'published' },
        { id: 'app-003', jobId: 'staff-nurse-icu', name: 'Sabina Yasmin', email: 'sabina.y@example.com', phone: '+91 90070 22334', experience: '6 years — cardiac ICU', currentEmployer: 'NH Rabindranath Tagore', cvUrl: '#', cvFile: 'sabina-yasmin-cv.pdf', coverNote: 'Cardiac surgical ICU background, ACLS current.', stage: 'interview', rating: 5, appliedAt: '2026-07-29T16:20:00Z', order: 3, status: 'published' },
        { id: 'app-004', jobId: 'consultant-anaesthetist', name: 'Dr. Ashok Nandi', email: 'ashok.nandi@example.com', phone: '+91 98301 77889', experience: '9 years', currentEmployer: 'Private practice, Durgapur', cvUrl: '#', cvFile: 'ashok-nandi-cv.pdf', coverNote: '', stage: 'new', rating: 0, appliedAt: '2026-07-22T12:05:00Z', order: 4, status: 'published' },
        { id: 'app-005', jobId: 'radiographer', name: 'Tanmoy Saha', email: 'tanmoy.saha@example.com', phone: '+91 89100 33445', experience: '1 year', currentEmployer: 'Diagnostic centre, Bardhaman', cvUrl: '#', cvFile: 'tanmoy-saha-cv.pdf', coverNote: '', stage: 'new', rating: 0, appliedAt: '2026-08-02T09:30:00Z', order: 5, status: 'published' },
        { id: 'app-006', jobId: 'radiographer', name: 'Moumita Pal', email: 'moumita.pal@example.com', phone: '+91 87770 55667', experience: '3 years', currentEmployer: 'Peerless Hospital', cvUrl: '#', cvFile: 'moumita-pal-cv.pdf', coverNote: 'Comfortable with 16 and 64 slice CT.', stage: 'shortlisted', rating: 4, appliedAt: '2026-08-02T14:10:00Z', order: 6, status: 'published' },
        { id: 'app-007', jobId: 'front-desk-executive', name: 'Arnab Roy', email: 'arnab.roy@example.com', phone: '+91 90510 99001', experience: 'Fresher', currentEmployer: '', cvUrl: '#', cvFile: 'arnab-roy-cv.pdf', coverNote: '', stage: 'rejected', rating: 2, appliedAt: '2026-07-02T11:00:00Z', order: 7, status: 'published' },
    ];
}(window));
