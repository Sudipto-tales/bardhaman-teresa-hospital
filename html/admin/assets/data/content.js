/* Seed: leadership, facilities, lab tests, testimonials, FAQs.
   Replaces FACILITIES / QUOTES in tools/site-data.mjs, the leadership strip
   faked at about.html:378, and the FAQ accordion and lab block hardcoded in
   website.html (lines 803 and 604). */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    const IMG = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=500&auto=format&fit=crop`;

    w.TMH_SEED.leadership = [
        {
            id: 'medical-director', name: 'Dr. Jonathon Ronan', title: 'Medical Director',
            photo: IMG('1622253692010-333f2da6031d'), category: 'management',
            message: '<p>We measure ourselves on the things families actually notice — how long you wait, whether anyone explained the plan, and whether the bill matched what you were told.</p>',
            linkedDoctorId: 'dr-jonathon-ronan', order: 1, status: 'published',
            updatedAt: '2026-07-14T10:00:00Z',
        },
        {
            id: 'chairman', name: 'Debashish Teresa', title: 'Chairman, Board of Trustees',
            photo: IMG('1612349317150-e413f6a5b16d'), category: 'board',
            message: '<p>The hospital was opened in 1994 with forty beds and one promise: nobody is turned away at the door for want of a deposit.</p>',
            order: 2, status: 'published', updatedAt: '2026-06-02T10:00:00Z',
        },
        {
            id: 'nursing-head', name: 'Sister Maria Fernandes', title: 'Head of Nursing',
            photo: IMG('1594824436998-d40d9b4b0870'), category: 'clinical-leadership',
            message: '', order: 3, status: 'published', updatedAt: '2026-05-18T10:00:00Z',
        },
        {
            id: 'operations-head', name: 'Sanjay Bhattacharya', title: 'Chief Operating Officer',
            photo: IMG('1537368910025-702800faa86b'), category: 'management',
            message: '', order: 4, status: 'published', updatedAt: '2026-05-18T10:00:00Z',
        },
        {
            id: 'quality-head', name: 'Dr. Victor James', title: 'Head of Clinical Quality',
            photo: IMG('1612349317150-e413f6a5b16d'), category: 'clinical-leadership',
            message: '', linkedDoctorId: 'dr-victor-james', order: 5, status: 'draft',
            updatedAt: '2026-08-01T10:00:00Z',
        },
    ];

    w.TMH_SEED.facilities = [
        { id: 'fac-001', icon: 'fa-truck-medical', title: '24/7 Emergency', text: 'A resuscitation bay, triage nurse and duty physician on site every hour of the year.', order: 1, status: 'published' },
        { id: 'fac-002', icon: 'fa-bed-pulse', title: 'Intensive Care', text: '34 ICU beds across general, cardiac, neuro and neonatal units with one-to-one nursing.', order: 2, status: 'published' },
        { id: 'fac-003', icon: 'fa-hospital', title: 'Modular Operating Theatres', text: 'Four laminar-flow theatres, one kept free at all times for emergencies.', order: 3, status: 'published' },
        { id: 'fac-004', icon: 'fa-flask-vial', title: 'Laboratory', text: 'Pathology, microbiology and histopathology with same-day reporting on routine work.', order: 4, status: 'published' },
        { id: 'fac-005', icon: 'fa-x-ray', title: 'Radiology & Imaging', text: 'Digital X-ray, ultrasound, colour Doppler and CT with consultant reporting.', order: 5, status: 'published' },
        { id: 'fac-006', icon: 'fa-droplet', title: 'Blood Bank Link', text: 'Licensed storage with a direct line to the district blood bank for rare groups.', order: 6, status: 'published' },
        { id: 'fac-007', icon: 'fa-pills', title: '24-Hour Pharmacy', text: 'In-house pharmacy stocking every drug on the hospital formulary, day and night.', order: 7, status: 'published' },
        { id: 'fac-008', icon: 'fa-person-walking', title: 'Physiotherapy Unit', text: 'A gym-equipped department running inpatient rounds and outpatient courses.', order: 8, status: 'published' },
        { id: 'fac-009', icon: 'fa-ambulance', title: 'Ambulance Fleet', text: 'Six vehicles, two of them advanced life support with a paramedic on board.', order: 9, status: 'published' },
        { id: 'fac-010', icon: 'fa-wheelchair', title: 'Accessible Throughout', text: 'Ramps, lifts and accessible toilets on every floor of the building.', order: 10, status: 'published' },
        { id: 'fac-011', icon: 'fa-utensils', title: 'Hospital Kitchen', text: 'Therapeutic diets cooked on site — renal, cardiac, diabetic and post-surgical.', order: 11, status: 'published' },
        { id: 'fac-012', icon: 'fa-wifi', title: 'Visitor Amenities', text: 'Free Wi-Fi, a cafeteria, prayer room and an attendant lounge on the ground floor.', order: 12, status: 'published' },
    ];

    w.TMH_SEED['lab-tests'] = [
        { id: 'lab-001', name: 'Complete Blood Count', category: 'Test', icon: 'fa-droplet', description: 'Haemoglobin, white cells and platelets.', includes: [], price: 350, discountPrice: 299, prepInstructions: 'No fasting needed', reportTime: 'Same day', homeCollection: true, featured: true, order: 1, status: 'published' },
        { id: 'lab-002', name: 'Lipid Profile', category: 'Test', icon: 'fa-heart-pulse', description: 'Total, HDL, LDL cholesterol and triglycerides.', includes: [], price: 700, discountPrice: 599, prepInstructions: 'Fasting 12 hours', reportTime: 'Same day', homeCollection: true, featured: true, order: 2, status: 'published' },
        { id: 'lab-003', name: 'HbA1c', category: 'Test', icon: 'fa-vial', description: 'Three-month average blood sugar.', includes: [], price: 550, discountPrice: 0, prepInstructions: 'No fasting needed', reportTime: 'Same day', homeCollection: true, featured: true, order: 3, status: 'published' },
        { id: 'lab-004', name: 'Thyroid Profile (T3 T4 TSH)', category: 'Test', icon: 'fa-flask', description: 'Full thyroid function panel.', includes: [], price: 800, discountPrice: 699, prepInstructions: 'Morning sample preferred', reportTime: 'Next day', homeCollection: true, featured: true, order: 4, status: 'published' },
        { id: 'lab-005', name: 'Liver Function Test', category: 'Test', icon: 'fa-flask-vial', description: 'Enzymes, bilirubin and proteins.', includes: [], price: 750, discountPrice: 0, prepInstructions: 'Fasting 8 hours', reportTime: 'Same day', homeCollection: true, featured: true, order: 5, status: 'published' },
        { id: 'lab-006', name: 'Kidney Function Test', category: 'Test', icon: 'fa-droplet', description: 'Urea, creatinine and electrolytes.', includes: [], price: 750, discountPrice: 0, prepInstructions: 'No fasting needed', reportTime: 'Same day', homeCollection: true, featured: true, order: 6, status: 'published' },
        {
            id: 'pkg-basic', name: 'Basic Health Check', category: 'Health package', icon: 'fa-clipboard-check',
            description: 'An annual screen for adults with no known condition.',
            includes: [{ item: 'Complete blood count' }, { item: 'Blood sugar (fasting)' }, { item: 'Lipid profile' }, { item: 'Urine routine' }, { item: 'ECG' }, { item: 'Physician consultation' }],
            price: 2400, discountPrice: 1799, prepInstructions: 'Fasting 12 hours', reportTime: 'Same day',
            homeCollection: false, featured: false, order: 7, status: 'published',
        },
        {
            id: 'pkg-cardiac', name: 'Cardiac Screening Package', category: 'Health package', icon: 'fa-heart-circle-check',
            description: 'For anyone over 40, or with a family history of heart disease.',
            includes: [{ item: 'Lipid profile' }, { item: 'ECG' }, { item: 'Echocardiogram' }, { item: 'Treadmill test' }, { item: 'Cardiologist consultation' }],
            price: 6500, discountPrice: 4999, prepInstructions: 'Fasting 12 hours, wear comfortable shoes', reportTime: 'Same day',
            homeCollection: false, featured: false, order: 8, status: 'published',
        },
        {
            id: 'pkg-diabetic', name: 'Diabetic Care Package', category: 'Health package', icon: 'fa-syringe',
            description: 'Quarterly monitoring for a diagnosed diabetic.',
            includes: [{ item: 'HbA1c' }, { item: 'Fasting and post-meal sugar' }, { item: 'Kidney function' }, { item: 'Eye screening' }, { item: 'Diet consultation' }],
            price: 3200, discountPrice: 2499, prepInstructions: 'Fasting 12 hours', reportTime: 'Next day',
            homeCollection: false, featured: false, order: 9, status: 'draft',
        },
    ];

    w.TMH_SEED.testimonials = [
        { id: 'tst-001', text: 'I was seen within twenty minutes of walking into emergency, and the doctor explained every step in Bangla before anything was signed.', name: 'Anjali Das', role: 'Patient — Cardiology', photo: IMG('1594824436998-d40d9b4b0870'), rating: 5, departmentId: 'cardiology', source: 'Website form', featured: true, order: 1, status: 'published' },
        { id: 'tst-002', text: 'My father spent eleven days in the ICU. Somebody from the team called us with an update every single evening, unprompted.', name: 'Rakesh Sarkar', role: 'Attendant — Critical Care', photo: IMG('1612349317150-e413f6a5b16d'), rating: 5, departmentId: '', source: 'Manual', featured: true, order: 2, status: 'published' },
        { id: 'tst-003', text: 'The maternity block staff stayed past their shift until my daughter was born. I have never been treated like that in a hospital.', name: 'Farida Begum', role: 'Patient — Maternity', photo: IMG('1559839734-2b71ea197ec2'), rating: 5, departmentId: 'prenatal-care', source: 'Google', featured: true, order: 3, status: 'published' },
        { id: 'tst-004', text: 'Knee replacement in March, walking unaided by May. The physio team called every week to check I was doing the exercises.', name: 'Prabir Ghosh', role: 'Patient — Orthopedics', photo: '', rating: 5, departmentId: 'orthopedics', source: 'Website form', featured: false, order: 4, status: 'published' },
        { id: 'tst-005', text: 'Billing desk came to the bed rather than making us queue downstairs. Small thing, but it mattered that day.', name: 'Nasreen Khatun', role: 'Attendant', photo: '', rating: 4, departmentId: '', source: 'Website form', featured: false, order: 5, status: 'draft' },
        { id: 'tst-006', text: 'Waited over an hour past my appointment slot in the eye clinic. Staff were apologetic but nobody told me until I asked.', name: 'Sujoy Mondal', role: 'Patient — Ophthalmology', photo: '', rating: 3, departmentId: 'ophthalmology', source: 'Website form', featured: false, order: 6, status: 'draft' },
    ];

    w.TMH_SEED.faqs = [
        { id: 'faq-001', question: 'Do I need an appointment for the emergency department?', answer: '<p>No. Emergency is open every hour of the year and works on clinical triage, not appointments. Come straight in.</p>', group: 'Home', departmentId: '', order: 1, status: 'published' },
        { id: 'faq-002', question: 'Which insurance companies are you empanelled with?', answer: '<p>We are empanelled with all major TPAs and with Swasthya Sathi. Bring your card and a photo ID to the insurance desk on the ground floor.</p>', group: 'Home', departmentId: '', order: 2, status: 'published' },
        { id: 'faq-003', question: 'Can I book a doctor’s appointment online?', answer: '<p>Yes — use the booking form on the contact page, or call reception. You will get a confirmation call within two working hours.</p>', group: 'Home', departmentId: '', order: 3, status: 'published' },
        { id: 'faq-004', question: 'What are the visiting hours?', answer: '<p>General wards: 5pm to 7pm daily. ICU: one attendant, 6pm to 6.30pm. Maternity has its own arrangement — ask the ward sister.</p>', group: 'Home', departmentId: '', order: 4, status: 'published' },
        { id: 'faq-005', question: 'Is treatment started before payment?', answer: '<p>Yes. Emergency treatment begins before any payment discussion. The billing desk comes to you afterwards.</p>', group: 'Home', departmentId: '', order: 5, status: 'published' },
        { id: 'faq-006', question: 'Do you offer home sample collection?', answer: '<p>For most routine blood tests, yes, within Bardhaman town. Book by phone before 9am for a same-day visit.</p>', group: 'Contact', departmentId: 'lab-diagnostics', order: 6, status: 'published' },
        { id: 'faq-007', question: 'Where can I park?', answer: '<p>There is free parking for sixty cars behind the main block, with an ambulance-only lane at the front entrance.</p>', group: 'Contact', departmentId: '', order: 7, status: 'published' },
    ];
}(window));
