/* =========================================================
   Teresa Memorial Hospital — content for the inner pages.

   Everything the generator needs that a copywriter might want
   to change lives here; tools/build-pages.mjs owns the markup.
   ========================================================= */

/* Photo pool. Every id below is already used somewhere on the
   home page, so they are known-good and the two builds stay
   visually of a piece. */
const U = (id, w) => `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMG = {
    ward: (w = 1600) => U('1587351021759-3e566b6af7cc', w),
    corridor: (w = 1600) => U('1551076805-e1869033e561', w),
    theatre: (w = 1600) => U('1628348068343-c6a848d2b6dd', w),
    team: (w = 1600) => U('1579684385127-1ef15d508118', w),
    lab: (w = 1600) => U('1579154204601-01588f351e67', w),
    consult: (w = 1600) => U('1531746020798-e6953c6e8e04', w),
    maternity: (w = 1600) => U('1555252333-9f8e92e65df9', w),
    newborn: (w = 1600) => U('1522771739844-6a9f6d5f14af', w),
    stress: (w = 1600) => U('1498551172505-8ee7ad69f235', w),
};

/* `slug` is the doctor's stable key — it is what the "Book an appointment"
   link passes to the contact page so the form lands preselected.
   `appt: false` means the hospital does not take appointments for this
   doctor at all, and the card carries no link. The site never books
   anybody; the desk calls back. Mirrors the Appointments-available toggle
   on the admin doctor form. */
export const DOCS = {
    ronan: { slug: 'dr-jonathon-ronan', dept: 'cardiology', name: 'Dr. Jonathon Ronan', role: 'Head of Cardiology', qual: 'MD, DM (Cardiology) · 22 yrs', img: U('1622253692010-333f2da6031d', 500) },
    anita: { slug: 'dr-anita-sharma', dept: 'cardiology', name: 'Dr. Anita Sharma', role: 'Interventional Cardiologist', qual: 'MD, DNB (Cardiology) · 14 yrs', img: U('1559839734-2b71ea197ec2', 500) },
    victor: { slug: 'dr-victor-james', dept: 'orthopedics', name: 'Dr. Victor James', role: 'Head of Orthopedics', qual: 'MS (Ortho), FRCS · 25 yrs', img: U('1612349317150-e413f6a5b16d', 500) },
    rahul: { slug: 'dr-rahul-dey', dept: 'orthopedics', name: 'Dr. Rahul Dey', role: 'Joint Replacement Surgeon', qual: 'MS (Ortho), Fellowship Arthroplasty · 12 yrs', img: U('1581056771107-24ca5f033842', 500) },
    philips: { slug: 'dr-philips-rownd', dept: 'prenatal-care', name: 'Dr. Philips Rownd', role: 'Gynaecologist & Obstetrician', qual: 'MS (OBG), FICOG · 18 yrs', img: U('1537368910025-702800faa86b', 500) },
    jane: { slug: 'dr-jane-ronan', dept: 'nutrition', name: 'Dr. Jane Ronan', role: 'Pediatric Nutritionist', qual: 'MSc, RD (Clinical Nutrition) · 11 yrs', img: U('1594824436998-d40d9b4b0870', 500) },
};

/* The roster the /doctors page renders in full. Reuses the six
   portraits above — a placeholder site should not pretend to
   have licensed sixteen headshots. */
export const ROSTER = [
    DOCS.ronan,
    DOCS.victor,
    DOCS.philips,
    DOCS.anita,
    DOCS.rahul,
    DOCS.jane,
    /* Two of them take no appointments — theatre-only lists — so their cards
       render without the link. A site that offers to book everybody and then
       turns half of them away is worse than one that says so up front. */
    { slug: 'dr-sourav-mitra', dept: 'neuro-surgery', name: 'Dr. Sourav Mitra', role: 'Consultant Neurosurgeon', qual: 'MCh (Neurosurgery) · 16 yrs', img: DOCS.ronan.img, appt: false },
    { slug: 'dr-debjani-roy', dept: 'nephrology', name: 'Dr. Debjani Roy', role: 'Consultant Nephrologist', qual: 'MD, DM (Nephrology) · 13 yrs', img: DOCS.anita.img },
    { slug: 'dr-arindam-basu', dept: 'general-surgery', name: 'Dr. Arindam Basu', role: 'General & Laparoscopic Surgeon', qual: 'MS (General Surgery) · 19 yrs', img: DOCS.victor.img },
    { slug: 'dr-meera-chatterjee', dept: 'pediatric-surgery', name: 'Dr. Meera Chatterjee', role: 'Pediatric Surgeon', qual: 'MCh (Pediatric Surgery) · 10 yrs', img: DOCS.jane.img },
    { slug: 'dr-imran-haque', dept: 'ophthalmology', name: 'Dr. Imran Haque', role: 'Consultant Ophthalmologist', qual: 'MS (Ophthalmology) · 15 yrs', img: DOCS.rahul.img },
    { slug: 'dr-sneha-pal', dept: 'dental-care', name: 'Dr. Sneha Pal', role: 'Dental & Maxillofacial Surgeon', qual: 'BDS, MDS · 9 yrs', img: DOCS.philips.img, appt: false },
];

/* ---------------------------------------------------------
   Departments. `slug` doubles as the filename and as the key
   the mega-menu links to, so adding one here is enough to get
   a page, a nav entry and a card on /departments.
   --------------------------------------------------------- */
export const DEPARTMENTS = [
    {
        slug: 'cardiology',
        name: 'Cardiology',
        menuNote: '6+ Doctors Available',
        icon: 'fa-heart-pulse',
        banner: IMG.theatre(),
        titleLead: 'Cardiology &',
        titleStrong: 'Heart Care',
        lead: 'A round-the-clock cath lab, non-invasive diagnostics and a heart-failure clinic — under one roof, staffed by six consultants.',
        chips: ['24/7 Cath Lab', 'Door-to-balloon under 60 min', 'Cardiac ICU — 12 beds'],
        stats: [
            { icon: 'fa-heart-pulse', count: 4200, suffix: '+', label: 'Procedures a year', note: '18% more than 2024' },
            { icon: 'fa-user-doctor', count: 6, suffix: '', label: 'Cardiologists on staff', note: 'Two on call nightly' },
            { icon: 'fa-stopwatch', count: 52, suffix: ' min', label: 'Median door-to-balloon', note: 'Below the 90 min target' },
            { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Patient rating', note: '1,900 reviews' },
        ],
        introTitle: 'Every minute of a cardiac event <strong>is treated like one</strong>',
        introBody: [
            'Chest pain is triaged the moment it reaches our door. ECG within ten minutes, troponin at the bedside, and a cath lab team that is already gowning while the report prints.',
            'Beyond emergencies, the department runs scheduled clinics for hypertension, arrhythmia, valve disease and post-bypass rehabilitation — so the care does not stop at discharge.',
        ],
        checks: ['24/7 interventional cover', 'On-site cardiac ICU', 'Bedside echo and Doppler', 'Structured cardiac rehab', 'Pacemaker & device clinic', 'Insurance desk on the floor'],
        introImg: IMG.ward(1000),
        badge: { icon: 'fa-truck-medical', title: 'Chest pain?', text: 'Call +91 90460 05557 — do not drive yourself.' },
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
        conditions: ['Coronary artery disease', 'Heart attack (STEMI / NSTEMI)', 'Angina', 'Hypertension', 'Heart failure', 'Atrial fibrillation', 'Valve disease', 'Cardiomyopathy', 'High cholesterol', 'Congenital heart defects', 'Palpitations', 'Post-bypass follow-up'],
        team: [DOCS.ronan, DOCS.anita, DOCS.victor],
    },
    {
        slug: 'neuro-surgery',
        name: 'Neuro Surgery',
        menuNote: '2+ Doctors Available',
        icon: 'fa-brain',
        banner: IMG.theatre(),
        titleLead: 'Neuro Surgery &',
        titleStrong: 'Spine Care',
        lead: 'Microsurgery, neuro-navigation and a dedicated neuro ICU for brain, spine and nerve conditions.',
        chips: ['Neuro ICU — 8 beds', 'Operating microscope', 'Stroke pathway 24/7'],
        stats: [
            { icon: 'fa-brain', count: 640, suffix: '+', label: 'Neuro procedures a year', note: '12% more than 2024' },
            { icon: 'fa-user-doctor', count: 2, suffix: '', label: 'Neurosurgeons', note: 'Plus 3 neurologists' },
            { icon: 'fa-bed-pulse', count: 8, suffix: '', label: 'Neuro ICU beds', note: 'One-to-one nursing' },
            { icon: 'fa-star', count: 4.7, suffix: '/5', label: 'Patient rating', note: '620 reviews' },
        ],
        introTitle: 'Precision work, <strong>on the most delicate tissue there is</strong>',
        introBody: [
            'Neurosurgery leaves no margin for approximation. Every case is planned on thin-slice imaging, executed under the microscope and recovered in an ICU staffed by nurses trained only in neuro care.',
            'Suspected stroke bypasses the queue entirely: CT within twenty minutes of arrival, thrombolysis decision made by the consultant on call.',
        ],
        checks: ['Neuro-navigation system', 'Intra-operative monitoring', '24/7 stroke pathway', 'Minimally invasive spine surgery', 'Epilepsy and headache clinic', 'On-site physiotherapy'],
        introImg: IMG.theatre(1000),
        badge: { icon: 'fa-bolt', title: 'Stroke is time-critical', text: 'Face drooping or slurred speech — come straight to Emergency.' },
        procedures: [
            { icon: 'fa-brain', title: 'Craniotomy', text: 'Tumour, haematoma and aneurysm surgery under the operating microscope.' },
            { icon: 'fa-bone', title: 'Spinal Fusion', text: 'Instrumented fusion for instability, deformity and degenerative collapse.' },
            { icon: 'fa-scissors', title: 'Microdiscectomy', text: 'Keyhole removal of a herniated disc, most patients walking the same evening.' },
            { icon: 'fa-droplet', title: 'VP Shunt', text: 'Hydrocephalus management for infants and adults, with a programmable valve.' },
            { icon: 'fa-hand-dots', title: 'Nerve Decompression', text: 'Carpal tunnel, ulnar nerve and other entrapment releases as day surgery.' },
            { icon: 'fa-head-side-virus', title: 'Head Injury Care', text: 'Trauma protocol from resuscitation through ICU to rehabilitation.' },
        ],
        conditionsTitle: 'Conditions the neuro team treats',
        conditionsLead: 'Brain, spine and peripheral nerve — assessed by the same team that will operate, if surgery turns out to be the answer.',
        conditions: ['Brain tumours', 'Stroke', 'Slipped disc', 'Spinal stenosis', 'Head injury', 'Hydrocephalus', 'Epilepsy', 'Trigeminal neuralgia', 'Sciatica', 'Spinal cord injury', 'Aneurysm', 'Chronic headache'],
        team: [DOCS.ronan, DOCS.victor, DOCS.anita],
    },
    {
        slug: 'nephrology',
        name: 'Medicine & Nephrology',
        menuNote: '2+ Doctors Available',
        icon: 'fa-kidneys',
        banner: IMG.ward(),
        titleLead: 'Medicine &',
        titleStrong: 'Nephrology',
        lead: 'General internal medicine alongside a 16-station dialysis unit, running three shifts a day.',
        chips: ['16 dialysis stations', 'Three shifts daily', 'Transplant work-up'],
        stats: [
            { icon: 'fa-droplet', count: 18000, suffix: '+', label: 'Dialysis sessions a year', note: 'Up from 15,400' },
            { icon: 'fa-user-doctor', count: 2, suffix: '', label: 'Nephrologists', note: 'Plus 5 physicians' },
            { icon: 'fa-bed', count: 16, suffix: '', label: 'Dialysis stations', note: 'Four reserved for isolation' },
            { icon: 'fa-star', count: 4.6, suffix: '/5', label: 'Patient rating', note: '1,100 reviews' },
        ],
        introTitle: 'Chronic care that <strong>fits around a working life</strong>',
        introBody: [
            'Dialysis is not a one-off event, it is a schedule someone lives with for years. We run early-morning, afternoon and evening shifts so treatment can sit around a job rather than replace it.',
            'The general medicine side handles diabetes, thyroid, infection and the long tail of conditions that do not belong to any single organ specialty.',
        ],
        checks: ['Three dialysis shifts daily', 'Isolation stations available', 'AV fistula creation on site', 'Transplant work-up and referral', 'Diabetes and thyroid clinics', 'Dietician attached to the unit'],
        introImg: IMG.ward(1000),
        badge: { icon: 'fa-calendar-check', title: 'Regular slot guaranteed', text: 'Fixed weekly chair times for every long-term patient.' },
        procedures: [
            { icon: 'fa-droplet', title: 'Haemodialysis', text: 'Bicarbonate dialysis on reverse-osmosis water, with single-use dialysers on request.' },
            { icon: 'fa-house-medical', title: 'Peritoneal Dialysis', text: 'Home-based CAPD, including catheter insertion and family training.' },
            { icon: 'fa-syringe', title: 'Kidney Biopsy', text: 'Ultrasound-guided biopsy with same-day histopathology dispatch.' },
            { icon: 'fa-link', title: 'AV Fistula Surgery', text: 'Access creation and salvage, planned so it matures before you need it.' },
            { icon: 'fa-vial', title: 'Diabetes Clinic', text: 'HbA1c-led review, insulin titration and foot screening in one visit.' },
            { icon: 'fa-notes-medical', title: 'General Medicine OPD', text: 'Fever, infection, thyroid, anaemia — the everyday work of a physician.' },
        ],
        conditionsTitle: 'Conditions the medicine team treats',
        conditionsLead: 'Kidney disease rarely arrives alone. The physicians and nephrologists share a floor so a single visit covers both.',
        conditions: ['Chronic kidney disease', 'Acute kidney injury', 'Diabetes mellitus', 'Hypertension', 'Nephrotic syndrome', 'Kidney stones', 'Urinary infection', 'Thyroid disorders', 'Anaemia', 'Electrolyte imbalance', 'Fever of unknown origin', 'Post-transplant follow-up'],
        team: [DOCS.anita, DOCS.ronan, DOCS.philips],
    },
    {
        slug: 'orthopedics',
        name: 'Orthopedic Surgery',
        menuNote: '2+ Doctors Available',
        icon: 'fa-bone',
        banner: IMG.corridor(),
        titleLead: 'Orthopedic',
        titleStrong: 'Surgery',
        lead: 'Joint replacement, sports injury and trauma care — with physiotherapy starting the day after surgery.',
        chips: ['Laminar-flow theatre', 'Day-one physiotherapy', 'Trauma cover 24/7'],
        stats: [
            { icon: 'fa-bone', count: 1450, suffix: '+', label: 'Surgeries a year', note: '9% more than 2024' },
            { icon: 'fa-user-doctor', count: 2, suffix: '', label: 'Orthopedic surgeons', note: 'Plus 4 physiotherapists' },
            { icon: 'fa-person-walking', count: 92, suffix: '%', label: 'Walking within 24 hrs', note: 'After joint replacement' },
            { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Patient rating', note: '1,400 reviews' },
        ],
        introTitle: 'The operation is half the job — <strong>walking again is the other half</strong>',
        introBody: [
            'A replaced joint only counts once it is being used. Physiotherapy is booked before surgery, starts the morning after it, and continues as an outpatient course until you are back to your own stairs.',
            'Trauma is covered around the clock: fractures are plated or nailed the same admission wherever the soft tissue allows.',
        ],
        checks: ['Laminar-flow operating theatre', 'Computer-navigated knee replacement', 'Arthroscopic sports surgery', 'On-site physiotherapy gym', 'Fracture clinic twice weekly', 'Digital X-ray in the department'],
        introImg: IMG.corridor(1000),
        badge: { icon: 'fa-person-cane', title: 'Free gait assessment', text: 'Walk-in screening every Saturday morning, no appointment.' },
        procedures: [
            { icon: 'fa-joint', title: 'Total Knee Replacement', text: 'Navigated implant positioning, with a rehabilitation plan agreed before admission.' },
            { icon: 'fa-person-walking', title: 'Hip Replacement', text: 'Primary and revision arthroplasty using cemented or uncemented implants.' },
            { icon: 'fa-camera', title: 'Arthroscopy', text: 'Keyhole ACL reconstruction, meniscus and rotator-cuff repair.' },
            { icon: 'fa-bone', title: 'Fracture Fixation', text: 'Plating, nailing and external fixation for trauma of any complexity.' },
            { icon: 'fa-hand', title: 'Hand & Wrist Surgery', text: 'Carpal tunnel release, tendon repair and small-joint reconstruction.' },
            { icon: 'fa-child-reaching', title: 'Pediatric Orthopedics', text: 'Club foot, growth-plate injury and limb deformity correction.' },
        ],
        conditionsTitle: 'Conditions the orthopedic team treats',
        conditionsLead: 'Bone, joint, ligament and tendon — from a weekend sports tear to decades of wear.',
        conditions: ['Osteoarthritis', 'Fractures', 'ACL tear', 'Rotator cuff injury', 'Frozen shoulder', 'Slipped disc', 'Sciatica', 'Osteoporosis', 'Club foot', 'Sports injuries', 'Tennis elbow', 'Carpal tunnel syndrome'],
        team: [DOCS.victor, DOCS.rahul, DOCS.anita],
    },
    {
        slug: 'dental-care',
        name: 'Dental Care',
        menuNote: '1+ Doctors Available',
        icon: 'fa-tooth',
        banner: IMG.team(),
        titleLead: 'Dental &',
        titleStrong: 'Oral Health',
        lead: 'Preventive, restorative and surgical dentistry — including implants and wisdom-tooth removal under sedation.',
        chips: ['Digital OPG on site', 'Same-day extractions', 'Sedation available'],
        stats: [
            { icon: 'fa-tooth', count: 5600, suffix: '+', label: 'Patients a year', note: '15% more than 2024' },
            { icon: 'fa-user-doctor', count: 1, suffix: '', label: 'Dental surgeon', note: 'Plus 2 hygienists' },
            { icon: 'fa-screwdriver-wrench', count: 240, suffix: '+', label: 'Implants placed', note: 'Since 2023' },
            { icon: 'fa-star', count: 4.9, suffix: '/5', label: 'Patient rating', note: '870 reviews' },
        ],
        introTitle: 'Dentistry without <strong>the dread</strong>',
        introBody: [
            'Most people put off dental care because of what they expect it to feel like. Local anaesthesia is given time to work, sedation is offered for longer procedures, and nothing starts before you have seen the plan and the price.',
            'The clinic is inside the hospital, so patients on blood thinners or with cardiac history are treated with the relevant specialist a corridor away.',
        ],
        checks: ['Digital OPG and IOPA imaging', 'Painless extraction protocol', 'Implants and crowns', 'Root canal in a single sitting', 'Scaling and gum therapy', 'Written estimate before treatment'],
        introImg: IMG.consult(1000),
        badge: { icon: 'fa-tooth', title: 'Free first check-up', text: 'Screening and OPG at no charge every first Monday.' },
        procedures: [
            { icon: 'fa-tooth', title: 'Root Canal Treatment', text: 'Rotary endodontics, usually completed in one sitting with a crown to follow.' },
            { icon: 'fa-screwdriver-wrench', title: 'Dental Implants', text: 'Titanium implants with guided placement and a three-month review schedule.' },
            { icon: 'fa-teeth', title: 'Crowns & Bridges', text: 'Zirconia and metal-ceramic restorations, shade-matched in the chair.' },
            { icon: 'fa-broom', title: 'Scaling & Polishing', text: 'Ultrasonic cleaning and gum therapy for bleeding or receding gums.' },
            { icon: 'fa-scissors', title: 'Wisdom Tooth Removal', text: 'Surgical extraction of impacted third molars, under sedation if preferred.' },
            { icon: 'fa-child', title: 'Pediatric Dentistry', text: 'Fluoride application, sealants and habit-breaking appliances for children.' },
        ],
        conditionsTitle: 'What the dental clinic handles',
        conditionsLead: 'Routine or urgent — a broken tooth on a Sunday is handled through Emergency, not left until Monday.',
        conditions: ['Tooth decay', 'Toothache', 'Bleeding gums', 'Impacted wisdom teeth', 'Missing teeth', 'Broken or chipped teeth', 'Bad breath', 'Jaw pain', 'Mouth ulcers', 'Teeth grinding', 'Stained teeth', 'Dental trauma'],
        team: [DOCS.philips, DOCS.jane, DOCS.rahul],
    },
    {
        slug: 'prenatal-care',
        name: 'Prenatal Care',
        menuNote: '1+ Doctors Available',
        icon: 'fa-baby',
        banner: IMG.maternity(),
        titleLead: 'Prenatal &',
        titleStrong: 'Maternity Care',
        lead: 'From the first scan to the first feed — one team, one file, and a labour room that never closes.',
        chips: ['Labour rooms 24/7', 'Level II nursery', 'Birth companion welcome'],
        stats: [
            { icon: 'fa-baby', count: 1180, suffix: '+', label: 'Babies delivered a year', note: 'Up from 1,020' },
            { icon: 'fa-user-doctor', count: 1, suffix: '', label: 'Obstetrician', note: 'Plus 6 midwives' },
            { icon: 'fa-baby-carriage', count: 12, suffix: '', label: 'Nursery cots', note: 'Level II neonatal' },
            { icon: 'fa-star', count: 4.9, suffix: '/5', label: 'Patient rating', note: '940 reviews' },
        ],
        introTitle: 'Nine months of care <strong>from the same faces</strong>',
        introBody: [
            'Continuity matters more in maternity than almost anywhere else. The consultant who confirms the pregnancy runs the growth scans, writes the birth plan and is called when labour starts.',
            'A birth companion is welcome in the labour room. Ante-natal classes run every second Saturday and cover breathing, feeding and what the first fortnight at home is actually like.',
        ],
        checks: ['Consultant-led antenatal clinic', 'Growth and anomaly scans on site', 'Level II neonatal nursery', 'Birth companion allowed', 'Lactation support after discharge', 'Ante-natal classes fortnightly'],
        introImg: IMG.newborn(1000),
        badge: { icon: 'fa-heart', title: 'Labour room open 24/7', text: 'Come in at any hour — no appointment needed in labour.' },
        procedures: [
            { icon: 'fa-stethoscope', title: 'Antenatal Check-ups', text: 'A full schedule of visits, bloods and scans mapped out at your first appointment.' },
            { icon: 'fa-wave-square', title: 'Ultrasound & Doppler', text: 'Dating, anomaly and growth scans reported by the obstetrician who sees you.' },
            { icon: 'fa-baby', title: 'Normal Delivery', text: 'Midwife-led birth with consultant cover, in a private labour room.' },
            { icon: 'fa-hospital', title: 'Caesarean Section', text: 'Planned or emergency, with skin-to-skin contact in theatre wherever possible.' },
            { icon: 'fa-heart-pulse', title: 'High-Risk Pregnancy', text: 'Joint care with medicine or cardiology for diabetes, hypertension or heart disease.' },
            { icon: 'fa-person-breastfeeding', title: 'Postnatal Care', text: 'Six-week review, lactation help and contraception counselling.' },
        ],
        conditionsTitle: 'What the maternity team looks after',
        conditionsLead: 'Straightforward or complicated, the pathway is the same — you are seen by a consultant, not a rotating registrar.',
        conditions: ['Routine pregnancy', 'Gestational diabetes', 'Pre-eclampsia', 'Twin pregnancy', 'Previous caesarean', 'Recurrent miscarriage', 'Anaemia in pregnancy', 'Thyroid in pregnancy', 'Preterm labour', 'Breech presentation', 'Infertility work-up', 'Postnatal depression'],
        team: [DOCS.philips, DOCS.jane, DOCS.anita],
    },
    {
        slug: 'nutrition',
        name: 'Food & Nutrition',
        menuNote: '1+ Doctors Available',
        icon: 'fa-apple-whole',
        banner: IMG.stress(),
        titleLead: 'Food &',
        titleStrong: 'Nutrition',
        lead: 'Clinical dietetics for inpatients and a weight, diabetes and child-growth clinic for everyone else.',
        chips: ['Diet plans in Bengali & English', 'Ward rounds daily', 'Child growth clinic'],
        stats: [
            { icon: 'fa-apple-whole', count: 3400, suffix: '+', label: 'Consultations a year', note: '21% more than 2024' },
            { icon: 'fa-user-doctor', count: 1, suffix: '', label: 'Clinical nutritionist', note: 'Plus 2 diet technicians' },
            { icon: 'fa-utensils', count: 260, suffix: '+', label: 'Therapeutic meals daily', note: 'Prepared on site' },
            { icon: 'fa-star', count: 4.7, suffix: '/5', label: 'Patient rating', note: '510 reviews' },
        ],
        introTitle: 'A diet plan you can <strong>actually cook at home</strong>',
        introBody: [
            'A plan written around foods nobody in the household eats gets abandoned in a week. Ours are built from what is already in your kitchen, priced for your budget and written in the language you read most easily.',
            'Inpatients are seen on the ward daily — renal, cardiac, diabetic and post-surgical diets are prepared in the hospital kitchen rather than outsourced.',
        ],
        checks: ['Plans in Bengali and English', 'Renal and cardiac diets', 'Child growth monitoring', 'Pregnancy and lactation nutrition', 'Tube-feed planning', 'Follow-up by phone'],
        introImg: IMG.ward(1000),
        badge: { icon: 'fa-weight-scale', title: 'Free BMI screening', text: 'Walk in any weekday between 10 AM and 12 noon.' },
        procedures: [
            { icon: 'fa-chart-line', title: 'Weight Management', text: 'Measured, gradual plans with fortnightly review — no crash protocols.' },
            { icon: 'fa-droplet', title: 'Diabetes Diet Planning', text: 'Carbohydrate counting matched to your insulin or tablet schedule.' },
            { icon: 'fa-kidneys', title: 'Renal Nutrition', text: 'Potassium, phosphate and fluid targets coordinated with the dialysis unit.' },
            { icon: 'fa-child-reaching', title: 'Child Growth Clinic', text: 'Growth-chart tracking, fussy-eating support and anaemia correction.' },
            { icon: 'fa-person-pregnant', title: 'Maternal Nutrition', text: 'Pregnancy and lactation plans built with the maternity team.' },
            { icon: 'fa-hospital-user', title: 'Inpatient Dietetics', text: 'Daily ward rounds and therapeutic meals cooked in the hospital kitchen.' },
        ],
        conditionsTitle: 'Who the nutrition clinic helps',
        conditionsLead: 'Referral is not required. If any of the below applies, book directly at the front desk.',
        conditions: ['Obesity', 'Type 2 diabetes', 'Kidney disease', 'High cholesterol', 'Underweight children', 'Anaemia', 'Fatty liver', 'PCOS', 'Food allergies', 'Post-surgical recovery', 'Pregnancy nutrition', 'Elderly malnutrition'],
        team: [DOCS.jane, DOCS.anita, DOCS.philips],
    },
    {
        slug: 'ophthalmology',
        name: 'Ophthalmology',
        menuNote: '2+ Doctors Available',
        icon: 'fa-eye',
        banner: IMG.lab(),
        titleLead: 'Ophthalmology &',
        titleStrong: 'Eye Surgery',
        lead: 'Cataract, glaucoma and retina care with a dedicated eye theatre and same-day discharge.',
        chips: ['Phaco theatre', 'Day-care surgery', 'Retina screening'],
        stats: [
            { icon: 'fa-eye', count: 2100, suffix: '+', label: 'Eye surgeries a year', note: '11% more than 2024' },
            { icon: 'fa-user-doctor', count: 2, suffix: '', label: 'Ophthalmologists', note: 'Plus 2 optometrists' },
            { icon: 'fa-clock', count: 1, suffix: ' day', label: 'Cataract turnaround', note: 'Admission to discharge' },
            { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Patient rating', note: '1,050 reviews' },
        ],
        introTitle: 'Sight restored <strong>in a single morning</strong>',
        introBody: [
            'A routine cataract is admitted, operated and discharged the same day. Phacoemulsification through a two-millimetre incision means no stitches and, for most people, reading vision back within the week.',
            'The department also screens every diabetic patient in the hospital for retinopathy — catching damage while it is still reversible.',
        ],
        checks: ['Dedicated eye operating theatre', 'Phacoemulsification with foldable lens', 'Diabetic retinopathy screening', 'Glaucoma pressure clinic', 'Optometry and spectacle advice', 'Same-day discharge'],
        introImg: IMG.lab(1000),
        badge: { icon: 'fa-eye', title: 'Diabetic? Screen yearly.', text: 'Free retina screening with any diabetes review.' },
        procedures: [
            { icon: 'fa-eye', title: 'Cataract Surgery', text: 'Stitchless phaco with a foldable intraocular lens, discharged the same day.' },
            { icon: 'fa-gauge-high', title: 'Glaucoma Management', text: 'Pressure monitoring, field testing and trabeculectomy when drops stop working.' },
            { icon: 'fa-bolt', title: 'Retinal Laser', text: 'Photocoagulation for diabetic retinopathy and retinal tears.' },
            { icon: 'fa-glasses', title: 'Refraction & Optometry', text: 'Full refraction with a prescription you can take anywhere.' },
            { icon: 'fa-droplet', title: 'Dry Eye Clinic', text: 'Tear-film assessment and long-term management for chronic irritation.' },
            { icon: 'fa-child', title: 'Squint & Amblyopia', text: 'Childhood squint correction and patching programmes.' },
        ],
        conditionsTitle: 'Conditions the eye team treats',
        conditionsLead: 'Sudden loss of vision is an emergency — come to the department the same day, not at your next appointment.',
        conditions: ['Cataract', 'Glaucoma', 'Diabetic retinopathy', 'Dry eye', 'Squint', 'Refractive error', 'Conjunctivitis', 'Retinal detachment', 'Corneal ulcer', 'Eye injury', 'Watering eyes', 'Age-related macular degeneration'],
        team: [DOCS.rahul, DOCS.victor, DOCS.jane],
    },
    {
        slug: 'general-surgery',
        name: 'General Surgery',
        menuNote: '1+ Doctors Available',
        icon: 'fa-scissors',
        banner: IMG.theatre(),
        titleLead: 'General &',
        titleStrong: 'Laparoscopic Surgery',
        lead: 'Keyhole surgery for gallbladder, hernia and appendix — smaller scars, shorter stays.',
        chips: ['Laparoscopic first', '48-hour average stay', 'Emergency theatre 24/7'],
        stats: [
            { icon: 'fa-scissors', count: 1900, suffix: '+', label: 'Operations a year', note: '7% more than 2024' },
            { icon: 'fa-user-doctor', count: 1, suffix: '', label: 'General surgeon', note: 'Plus 3 assistants' },
            { icon: 'fa-bed', count: 48, suffix: ' hrs', label: 'Average length of stay', note: 'For keyhole cases' },
            { icon: 'fa-star', count: 4.7, suffix: '/5', label: 'Patient rating', note: '1,300 reviews' },
        ],
        introTitle: 'Keyhole wherever <strong>keyhole is the right answer</strong>',
        introBody: [
            'Laparoscopic surgery is the default here, not an upgrade. Three small incisions instead of one long one means less pain, a lower infection risk and most patients home inside two days.',
            'Open surgery is still the correct choice for some cases, and we will say so plainly rather than convert halfway through for the sake of the brochure.',
        ],
        checks: ['Laparoscopic gallbladder and hernia', 'Emergency theatre around the clock', 'Day-care procedure list', 'Enhanced recovery protocol', 'Stoma care and counselling', 'Wound clinic twice weekly'],
        introImg: IMG.theatre(1000),
        badge: { icon: 'fa-hospital', title: 'Home in two days', text: 'Typical stay for a keyhole gallbladder removal.' },
        procedures: [
            { icon: 'fa-droplet', title: 'Laparoscopic Cholecystectomy', text: 'Keyhole gallbladder removal, usually discharged the next morning.' },
            { icon: 'fa-shield-halved', title: 'Hernia Repair', text: 'Mesh repair for inguinal, umbilical and incisional hernias.' },
            { icon: 'fa-bolt', title: 'Appendicectomy', text: 'Emergency keyhole appendix removal, theatre available at any hour.' },
            { icon: 'fa-ring', title: 'Piles & Fistula Surgery', text: 'Stapler haemorrhoidopexy and fistula procedures as day cases.' },
            { icon: 'fa-ribbon', title: 'Breast Lump Surgery', text: 'Biopsy, lumpectomy and mastectomy with oncology coordination.' },
            { icon: 'fa-bandage', title: 'Wound & Abscess Care', text: 'Drainage, debridement and diabetic-foot wound management.' },
        ],
        conditionsTitle: 'Conditions the surgical team treats',
        conditionsLead: 'Abdominal pain that will not settle deserves a surgical opinion — not another course of antacids.',
        conditions: ['Gallstones', 'Hernia', 'Appendicitis', 'Piles', 'Anal fistula', 'Breast lumps', 'Thyroid swelling', 'Abscess', 'Diabetic foot', 'Varicose veins', 'Lipoma & cysts', 'Bowel obstruction'],
        team: [DOCS.victor, DOCS.rahul, DOCS.ronan],
    },
    {
        slug: 'pediatric-surgery',
        name: 'Pediatric Surgery',
        menuNote: '2+ Doctors Available',
        icon: 'fa-child-reaching',
        banner: IMG.newborn(),
        titleLead: 'Pediatric',
        titleStrong: 'Surgery',
        lead: 'Surgery for newborns, infants and children — in a ward built for parents to stay overnight.',
        chips: ['Parent stays overnight', 'Neonatal surgery', 'Play-led preparation'],
        stats: [
            { icon: 'fa-child-reaching', count: 720, suffix: '+', label: 'Child surgeries a year', note: '14% more than 2024' },
            { icon: 'fa-user-doctor', count: 2, suffix: '', label: 'Pediatric surgeons', note: 'Plus 4 pediatricians' },
            { icon: 'fa-bed', count: 20, suffix: '', label: 'Pediatric beds', note: 'Parent bed with each' },
            { icon: 'fa-star', count: 4.9, suffix: '/5', label: 'Parent rating', note: '480 reviews' },
        ],
        introTitle: 'Children are not <strong>small adults</strong>',
        introBody: [
            'Doses, instruments, anaesthesia and recovery all work differently in a four-year-old. The pediatric theatre list is staffed by anaesthetists who work with children every week, not occasionally.',
            'A parent stays with the child throughout, including into the anaesthetic room. Preparation is done with picture books and play rather than a consent form pushed across a desk.',
        ],
        checks: ['Parent stays overnight', 'Pediatric anaesthesia team', 'Neonatal surgical cover', 'Play-led preparation', 'Day-care surgery list', 'Follow-up in the child clinic'],
        introImg: IMG.newborn(1000),
        badge: { icon: 'fa-hand-holding-heart', title: 'You stay with them', text: 'Right into the anaesthetic room — no exceptions asked for.' },
        procedures: [
            { icon: 'fa-shield-halved', title: 'Hernia & Hydrocele', text: 'The commonest childhood operation, done as a day case.' },
            { icon: 'fa-bolt', title: 'Appendicectomy', text: 'Emergency keyhole surgery for children with appendicitis.' },
            { icon: 'fa-baby', title: 'Neonatal Surgery', text: 'Correction of congenital defects in the first weeks of life.' },
            { icon: 'fa-droplet', title: 'Undescended Testis', text: 'Orchidopexy timed to protect future fertility.' },
            { icon: 'fa-circle-dot', title: 'Circumcision', text: 'Medical circumcision under short general anaesthesia.' },
            { icon: 'fa-bone', title: 'Pediatric Trauma', text: 'Fractures and injuries managed with growth plates in mind.' },
        ],
        conditionsTitle: 'Conditions the pediatric team treats',
        conditionsLead: 'If you are unsure whether something needs surgery at all, book the clinic — most visits end with reassurance.',
        conditions: ['Inguinal hernia', 'Hydrocele', 'Undescended testis', 'Appendicitis', 'Phimosis', 'Congenital defects', 'Intussusception', 'Tongue tie', 'Pediatric fractures', 'Burns', 'Umbilical hernia', 'Swallowed objects'],
        team: [DOCS.jane, DOCS.philips, DOCS.victor],
    },
    {
        slug: 'lab-diagnostics',
        name: 'Lab Diagnostics',
        menuNote: 'Same-day Reports',
        icon: 'fa-flask-vial',
        banner: IMG.lab(),
        titleLead: 'Laboratory &',
        titleStrong: 'Diagnostics',
        lead: 'Pathology, radiology and imaging in one block — most reports back the same day, delivered to your phone.',
        chips: ['Same-day reports', 'Home sample collection', 'Reports by WhatsApp'],
        stats: [
            { icon: 'fa-flask-vial', count: 190000, suffix: '+', label: 'Tests processed a year', note: '23% more than 2024' },
            { icon: 'fa-clock', count: 6, suffix: ' hrs', label: 'Median report time', note: 'For routine bloods' },
            { icon: 'fa-house', count: 40, suffix: '+', label: 'Home collections daily', note: 'Within 8 km' },
            { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Patient rating', note: '2,600 reviews' },
        ],
        introTitle: 'A result you can act on <strong>before the day is out</strong>',
        introBody: [
            'Waiting three days for a blood report delays every decision that depends on it. Routine biochemistry and haematology are released within six hours, and critical values are phoned to the treating doctor immediately.',
            'Samples can be collected at home for anyone within eight kilometres — useful for elderly patients and anyone on a dialysis schedule.',
        ],
        checks: ['NABL-standard quality control', 'Home sample collection', 'Reports by WhatsApp and email', 'Digital X-ray and ultrasound', 'ECG and echo on site', 'Critical values phoned immediately'],
        introImg: IMG.lab(1000),
        badge: { icon: 'fa-mobile-screen', title: 'Reports on your phone', text: 'Delivered by WhatsApp the moment they are verified.' },
        procedures: [
            { icon: 'fa-vial', title: 'Blood Chemistry', text: 'Liver, kidney, lipid and thyroid panels with six-hour turnaround.' },
            { icon: 'fa-droplet', title: 'Haematology', text: 'Complete blood counts, coagulation studies and peripheral smears.' },
            { icon: 'fa-bacterium', title: 'Microbiology', text: 'Culture and sensitivity testing to target antibiotics properly.' },
            { icon: 'fa-x-ray', title: 'Digital X-Ray', text: 'Low-dose digital radiography with immediate image availability.' },
            { icon: 'fa-wave-square', title: 'Ultrasound & Doppler', text: 'Abdominal, obstetric and vascular scanning by a consultant radiologist.' },
            { icon: 'fa-microscope', title: 'Histopathology', text: 'Biopsy reporting with second-opinion referral where the case warrants.' },
        ],
        conditionsTitle: 'Popular test packages',
        conditionsLead: 'Packages are priced as a bundle and can be booked without a prescription. Fasting requirements are texted the evening before.',
        conditions: ['Full body check-up', 'Diabetes panel', 'Thyroid profile', 'Lipid profile', 'Liver function', 'Kidney function', 'Anaemia panel', 'Vitamin D & B12', 'Pre-employment check', 'Pregnancy profile', 'Cardiac markers', 'Fever panel'],
        team: [DOCS.anita, DOCS.jane, DOCS.ronan],
    },
];

/* ---------------------------------------------------------
   Blog. The first entry is the one the article page renders in
   full; the rest are cards on the blog index.
   --------------------------------------------------------- */
export const POSTS = [
    {
        slug: 'blog-post',
        cat: 'Cardiology',
        date: 'August 2, 2026',
        read: '6 MINS READ',
        title: 'The six hours after chest pain: what actually decides the outcome',
        /* Headline set separately: `title` is the listing card's sentence
           case, this is what the article's own banner carries. */
        heading: 'The Six Hours After Chest Pain: What Decides The Outcome',
        excerpt: 'Heart muscle does not wait. Here is what happens between the first symptom and the cath lab — and the part of it you control.',
        img: IMG.ward(1400),
        author: DOCS.ronan,
        /* Drives both the tag row at the foot of the article and the
           "related" picker — a post whose cat matches any of these is
           surfaced first. `cat` is implied and does not repeat here. */
        tags: ['Emergency', 'Heart Attack', 'Prevention'],
    },
    { cat: 'Maternity', date: 'January 29, 2026', read: '4 MINS READ', title: "How to prepare for your baby's arrival: a checklist for expectant parents", excerpt: 'What to pack, what to arrange and what genuinely does not matter.', img: IMG.maternity(800) },
    { cat: 'Maternity', date: 'January 29, 2026', read: '4 MINS READ', title: 'Caring for yourself postpartum: what every new mother should know', excerpt: 'The six weeks after birth deserve a care plan of their own.', img: IMG.newborn(800) },
    { cat: 'Wellness', date: 'January 28, 2026', read: '4 MINS READ', title: 'The importance of self-care in managing everyday stress', excerpt: 'Small, repeatable habits beat one heroic weekend of rest.', img: IMG.stress(800) },
    { cat: 'Nutrition', date: 'January 14, 2026', read: '5 MINS READ', title: 'Eating for a diabetic household without cooking two dinners', excerpt: 'One pot, one menu, portions that work for everybody at the table.', img: IMG.ward(800) },
    { cat: 'Orthopedics', date: 'December 30, 2025', read: '5 MINS READ', title: 'After a knee replacement: the first fortnight, hour by hour', excerpt: 'What to expect on day one, day three and the day you climb stairs.', img: IMG.corridor(800) },
    { cat: 'Diagnostics', date: 'December 12, 2025', read: '3 MINS READ', title: 'Reading your blood report without panicking about the arrows', excerpt: 'Why a value slightly out of range is usually not the story.', img: IMG.lab(800) },
    { cat: 'Pediatrics', date: 'November 26, 2025', read: '4 MINS READ', title: 'When a childhood fever needs a doctor — and when it needs patience', excerpt: 'The specific signs that should move you from watching to going in.', img: IMG.newborn(800) },
    { cat: 'Emergency', date: 'November 3, 2025', read: '4 MINS READ', title: 'Stroke: the four-hour window most families miss', excerpt: 'FAST is not a slogan. It is the difference between recovery and disability.', img: IMG.theatre(800) },
];

export const FACILITIES = [
    { icon: 'fa-truck-medical', title: '24/7 Emergency', text: 'A resuscitation bay, triage nurse and duty physician on site every hour of the year.' },
    { icon: 'fa-bed-pulse', title: 'Intensive Care', text: '34 ICU beds across general, cardiac, neuro and neonatal units with one-to-one nursing.' },
    { icon: 'fa-hospital', title: 'Modular Operating Theatres', text: 'Four laminar-flow theatres, one kept free at all times for emergencies.' },
    { icon: 'fa-flask-vial', title: 'Laboratory', text: 'Pathology, microbiology and histopathology with same-day reporting on routine work.' },
    { icon: 'fa-x-ray', title: 'Radiology & Imaging', text: 'Digital X-ray, ultrasound, colour Doppler and CT with consultant reporting.' },
    { icon: 'fa-droplet', title: 'Blood Bank Link', text: 'Licensed storage with a direct line to the district blood bank for rare groups.' },
    { icon: 'fa-pills', title: '24-Hour Pharmacy', text: 'In-house pharmacy stocking every drug on the hospital formulary, day and night.' },
    { icon: 'fa-person-walking', title: 'Physiotherapy Unit', text: 'A gym-equipped department running inpatient rounds and outpatient courses.' },
    { icon: 'fa-ambulance', title: 'Ambulance Fleet', text: 'Six vehicles, two of them advanced life support with a paramedic on board.' },
    { icon: 'fa-wheelchair', title: 'Accessible Throughout', text: 'Ramps, lifts and accessible toilets on every floor of the building.' },
    { icon: 'fa-utensils', title: 'Hospital Kitchen', text: 'Therapeutic diets cooked on site — renal, cardiac, diabetic and post-surgical.' },
    { icon: 'fa-wifi', title: 'Visitor Amenities', text: 'Free Wi-Fi, a cafeteria, prayer room and an attendant lounge on the ground floor.' },
];

export const VALUES = [
    { icon: 'fa-hand-holding-heart', title: 'Care Before Paperwork', text: 'Emergency treatment starts before any payment discussion. The billing desk comes to you, not the other way round.' },
    { icon: 'fa-eye', title: 'Plain Answers', text: 'Diagnosis, options and costs explained in the language you are most comfortable in, before anything is signed.' },
    { icon: 'fa-users', title: 'One Team, One File', text: 'Departments share a single record, so nobody has to repeat their history at every desk.' },
    { icon: 'fa-shield-halved', title: 'Safety Audited', text: 'Infection rates, surgical outcomes and complaint response times are reviewed every month.' },
    { icon: 'fa-clock', title: 'Time Respected', text: 'Appointment slots are real. If we are running late, you are told when you arrive — not after an hour.' },
    { icon: 'fa-scale-balanced', title: 'The Same Standard', text: 'General ward or private room, the clinical protocol does not change.' },
];

export const MILESTONES = [
    '1994 — Doors open with 40 beds',
    '2001 — First operating theatre',
    '2006 — Intensive care unit added',
    '2011 — Cath lab commissioned',
    '2014 — Dialysis unit opens',
    '2017 — Maternity block completed',
    '2019 — NABL-standard laboratory',
    '2021 — Neonatal nursery upgraded',
    '2023 — Modular theatres rebuilt',
    '2024 — Digital records go live',
    '2025 — Fourth theatre added',
    '2026 — 210 beds across 20 units',
];

/* The three pastel cards under the about-page banner strip. Order is
   fixed — the CSS tints them by :nth-child. */
export const PILLARS = [
    { icon: 'fa-shield-halved', title: 'Our Mission', text: 'To care for our patients and their families at the moment it matters most, without asking first what they can pay.' },
    { icon: 'fa-eye', title: 'Our Vision', text: 'A district where nobody has to travel to Kolkata for treatment that should already be available at home.' },
    { icon: 'fa-heart', title: 'Our Values', text: 'Excellence, collaboration, accountability, respect and engagement — audited monthly, not framed on a wall.' },
];

/* Testimonial carousel in the about-page mosaic. Portraits reuse the
   existing pool for the same reason ROSTER does. */
export const QUOTES = [
    { text: 'I was seen within twenty minutes of walking into emergency, and the doctor explained every step in Bangla before anything was signed.', name: 'Anjali Das', role: 'Patient — Cardiology', img: DOCS.jane.img },
    { text: 'My father spent eleven days in the ICU. Somebody from the team called us with an update every single evening, unprompted.', name: 'Rakesh Sarkar', role: 'Attendant — Critical Care', img: DOCS.victor.img },
    { text: 'The maternity block staff stayed past their shift until my daughter was born. I have never been treated like that in a hospital.', name: 'Farida Begum', role: 'Patient — Maternity', img: DOCS.anita.img },
];

/* --- careers page --- */

export const CAREER_CHECKS = [
    'Salaries benchmarked twice a year',
    'Fully funded course fees for nursing staff',
    'Rotating shifts published a month ahead',
    'Subsidised treatment for staff families',
    'Crèche on site for the maternity block',
    'No unpaid overtime — logged and settled monthly',
];

export const CAREER_BENEFITS = [
    { icon: 'fa-graduation-cap', title: 'Paid To Keep Learning', text: 'Course fees, exam leave and conference travel are funded for every clinical grade, not just consultants.' },
    { icon: 'fa-calendar-check', title: 'Rosters You Can Plan Around', text: 'Shifts are published four weeks ahead. Swaps are approved in a day, not argued over for a week.' },
    { icon: 'fa-hand-holding-medical', title: 'Care For Your Family', text: 'Staff, spouses, children and parents are treated here at heavily subsidised rates.' },
    { icon: 'fa-arrow-trend-up', title: 'A Real Ladder', text: 'Two thirds of our senior nursing posts were filled from inside. Every vacancy is advertised internally first.' },
    { icon: 'fa-scale-balanced', title: 'Paid Properly', text: 'Bands are reviewed against district and Kolkata rates twice a year. Overtime is logged and settled monthly.' },
    { icon: 'fa-people-group', title: 'A Small Enough Place', text: 'Two hundred and forty staff. The medical director knows your name and takes your call.' },
];
