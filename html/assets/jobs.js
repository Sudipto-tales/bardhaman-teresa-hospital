/* =========================================================
   Teresa Memorial Hospital — open positions.

   careers.html renders the list from this array and
   job.html?id=<id> renders one entry in full, so a vacancy is
   opened or closed by editing this file alone — no rebuild of
   the static pages is needed.

   An empty array is a supported state: the careers page then
   shows its "nothing open right now" panel and the mailto.

   Field notes
     id            slug used in the URL — keep it unique and stable
     posted/closes ISO yyyy-mm-dd; printed as "12 Jul 2026"
     niceToHave    optional, omit the key to drop the section
   ========================================================= */
window.TMH_JOBS = [
    {
        id: 'staff-nurse-icu',
        title: 'Staff Nurse — Intensive Care',
        dept: 'Critical Care',
        type: 'Full time',
        location: 'Bardhaman — main campus',
        experience: '2+ years',
        posted: '2026-07-28',
        closes: '2026-08-31',
        summary: 'The ICU runs 18 beds across two pods with a 1:2 nurse-to-bed ratio on every shift. You will be part of a 24-nurse team that admits roughly 40 patients a month, most of them post-operative or cardiac.',
        responsibilities: [
            'Take charge of a two-bed pod through the shift, including ventilated and inotrope-dependent patients',
            'Run the handover round with the on-duty intensivist at the start and close of every shift',
            'Keep the electronic observation chart current — the unit audits completeness weekly',
            'Escalate early using the unit\'s deterioration protocol; nobody is questioned for calling too soon',
            'Support families at the bedside, including the daily evening update call',
        ],
        requirements: [
            'B.Sc Nursing or GNM with a valid West Bengal Nursing Council registration',
            'At least two years post-registration, of which one is in a critical-care or high-dependency setting',
            'Comfortable with ventilator circuits, arterial lines and infusion pumps',
            'Current BLS certification; ACLS within six months of joining is funded by the hospital',
            'Working Bangla and English — most families here speak Bangla first',
        ],
        niceToHave: [
            'Post-basic diploma in critical-care nursing',
            'Experience with a cardiac surgical population',
            'Preceptor or clinical-teaching experience',
        ],
        benefits: [
            'Roster published four weeks ahead, with night-shift differential',
            'Fully funded ACLS and post-basic diploma fees',
            'Subsidised treatment for you, your spouse, children and parents',
            'On-site crèche in the maternity block',
        ],
    },
    {
        id: 'consultant-cardiologist',
        title: 'Consultant Interventional Cardiologist',
        dept: 'Cardiology',
        type: 'Full time',
        location: 'Bardhaman — cath lab',
        experience: '5+ years post-DM',
        posted: '2026-07-21',
        closes: '2026-09-15',
        summary: 'Our cath lab has run since 2011 and now does about 900 procedures a year, roughly a third of them primary angioplasty out of hours. This post joins a team of four consultants and takes a one-in-four call rota.',
        responsibilities: [
            'Run diagnostic and interventional lists, including primary PCI on the call rota',
            'Hold two outpatient clinics a week and review inpatient referrals from medicine and critical care',
            'Present at the weekly joint cardiac meeting with cardiothoracic and imaging',
            'Supervise the DNB trainees attached to the unit',
            'Take part in the monthly outcomes audit — the unit publishes its own numbers internally',
        ],
        requirements: [
            'MD (Medicine) with DM (Cardiology) or DNB (Cardiology), MCI/NMC registrable in West Bengal',
            'At least five years of independent interventional practice post-DM',
            'Demonstrated primary PCI experience and willingness to take out-of-hours call',
            'A referral practice you are prepared to build in the district, not only inside the building',
        ],
        niceToHave: [
            'Structural or device implantation experience',
            'Published audit or research output in the last three years',
        ],
        benefits: [
            'One-in-four call rota, not one-in-two',
            'Conference leave and fees funded once a year',
            'Dedicated clinic and procedure slots — no shared list roulette',
            'Subsidised family treatment and hospital accommodation for the first six months',
        ],
    },
    {
        id: 'radiographer',
        title: 'Radiographer — CT & X-Ray',
        dept: 'Radiology & Imaging',
        type: 'Full time',
        location: 'Bardhaman — imaging block',
        experience: '1+ year',
        posted: '2026-07-16',
        closes: '2026-08-25',
        summary: 'Imaging covers a 128-slice CT, two digital X-ray rooms and a portable unit that serves the ICU and the maternity block. The department reports same-day for every inpatient study.',
        responsibilities: [
            'Perform CT and plain-film studies to departmental protocol, including trauma and stroke calls',
            'Position and reassure patients who are frightened, in pain or unable to cooperate',
            'Run the daily QA checks and log any equipment fault the same shift',
            'Keep radiation dose records and flag any study that breaches the reference level',
        ],
        requirements: [
            'B.Sc or Diploma in Radiography / Medical Imaging Technology',
            'At least one year of hospital experience on CT and digital radiography',
            'AERB radiation-safety awareness and a working knowledge of ALARA in practice',
            'Willing to take a share of the night and weekend rota',
        ],
        benefits: [
            'Structured rota with weekend compensatory offs',
            'Funded CT and MRI application training',
            'Annual health check and subsidised family treatment',
        ],
    },
    {
        id: 'front-desk-executive',
        title: 'Front Desk & Patient Relations Executive',
        dept: 'Patient Services',
        type: 'Full time',
        location: 'Bardhaman — main reception',
        experience: '0–2 years',
        posted: '2026-07-09',
        closes: '2026-08-20',
        summary: 'The front desk is the first thing a worried family sees. This role handles registration, appointment booking, queries and the small crises that arrive at reception before anyone reaches a doctor.',
        responsibilities: [
            'Register patients and book appointments across eleven departments',
            'Explain charges, packages and scheme eligibility clearly before anything is signed',
            'Log and route complaints — the hospital answers every one inside 72 hours',
            'Coordinate with wards on bed availability and admission paperwork',
        ],
        requirements: [
            'Graduate in any discipline; freshers are welcome and trained on the job',
            'Fluent Bangla and functional English and Hindi',
            'Comfortable on a computer — the hospital has been on digital records since 2024',
            'Even temper. People arrive here on the worst day of their year',
        ],
        niceToHave: [
            'Prior hospital or hospitality front-office experience',
            'Knowledge of Swasthya Sathi and insurance pre-authorisation',
        ],
        benefits: [
            'Fixed nine-hour shifts with a published roster',
            'Six-week structured induction before you take the desk alone',
            'Internal-first promotion policy',
        ],
    },
    {
        id: 'volunteer-patient-companion',
        title: 'Volunteer — Patient Companion',
        dept: 'Community & Volunteers',
        type: 'Volunteer · 4 hrs/week',
        location: 'Bardhaman — wards',
        experience: 'None required',
        posted: '2026-06-30',
        closes: '2026-12-31',
        summary: 'Long stays are lonely, especially for elderly patients whose families travel in from villages. Companions sit with patients, read to them, help with meal trays and simply keep them company.',
        responsibilities: [
            'Spend time on the wards with patients who have few or no visitors',
            'Help at meal times and with reading, writing letters or making phone calls home',
            'Guide visiting families to the right department',
            'Report anything clinical to the nurse in charge — companions do not give care',
        ],
        requirements: [
            'Eighteen or over, with a commitment of at least four hours a week for six months',
            'A completed induction and confidentiality undertaking before the first shift',
            'Basic health screening, arranged and paid for by the hospital',
        ],
        benefits: [
            'Full induction and a named staff mentor',
            'Meals on shift and travel reimbursement',
            'Certificate of service after six months',
        ],
    },
];
