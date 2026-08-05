/* Seed: enquiries and appointment requests.
   These are what the contact form (contact.html) and the booking form
   (contact.html:242) will post to once /api/public/* exists — today they
   post nowhere at all.

   Status vocabularies here are the ones in docs/02-content-model.md §19/§20,
   not the generic draft/published/hidden the rest of the panel uses: an
   enquiry is new|replied|closed|spam, an appointment is
   pending|confirmed|cancelled|completed. store.list() histograms whatever
   `status` holds, so the filter chips work either way. */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    w.TMH_SEED.enquiries = [
        {
            id: 'enq-001', name: 'Sourav Das', email: 'sourav.das@example.com', phone: '+91 98300 45612',
            subject: 'Cardiac package pricing', message: 'My father is 62 and has been advised a full cardiac screen. What does the package cover and is Swasthya Sathi accepted for it?',
            source: 'Contact form', departmentId: 'cardiology', assignedTo: 'usr-002',
            status: 'new', priority: 'normal', replies: [], internalNotes: [],
            receivedAt: '2026-08-04T09:12:00Z', order: 1,
        },
        {
            id: 'enq-002', name: 'Nikita Roy', email: 'nikita.roy@example.com', phone: '+91 98311 22334',
            subject: 'Appointment with Dr. Haque', message: 'Trying to book a cataract consultation for my mother. Is Tuesday morning free next week?',
            source: 'Contact form', departmentId: 'ophthalmology', assignedTo: 'usr-002',
            status: 'replied', priority: 'normal',
            replies: [{ by: 'Riya Sarkar', at: '2026-08-03T11:02:00Z', body: 'Tuesday 9.30am is free — I have held it for you. Please confirm and bring any previous eye reports.' }],
            internalNotes: [], receivedAt: '2026-08-03T18:40:00Z', order: 2,
        },
        {
            id: 'enq-003', name: 'Amitava Sen', email: 'amitava.sen@example.com', phone: '+91 90070 88990',
            subject: 'Insurance empanelment', message: 'Is Star Health accepted for a planned knee replacement?',
            source: 'Contact form', departmentId: 'orthopedics', assignedTo: 'usr-004',
            status: 'closed', priority: 'normal',
            replies: [{ by: 'Billing Team', at: '2026-08-03T09:40:00Z', body: 'Yes, Star Health is on our TPA list. Please bring your card and a photo ID to the insurance desk for pre-authorisation.' }],
            internalNotes: [{ by: 'Billing Team', at: '2026-08-03T09:41:00Z', body: 'Pre-auth usually takes 48h for this TPA.' }],
            receivedAt: '2026-08-03T11:05:00Z', order: 3,
        },
        {
            id: 'enq-004', name: 'Zara Ahmed', email: '', phone: '+91 88880 12345',
            subject: 'Ambulance availability', message: 'Needed an ALS ambulance to Kolkata at short notice — is that possible at night?',
            source: 'Phone widget', departmentId: '', assignedTo: 'usr-001',
            status: 'replied', priority: 'high',
            replies: [{ by: 'Emergency', at: '2026-08-02T22:30:00Z', body: 'Two of our six vehicles are ALS with a paramedic on board, available around the clock. Call the emergency line directly.' }],
            internalNotes: [], receivedAt: '2026-08-02T22:17:00Z', order: 4,
        },
        {
            id: 'enq-005', name: 'Prakash Ghosh', email: 'prakash.g@example.com', phone: '+91 98765 43210',
            subject: 'Health camp registration', message: 'Our housing society would like to host a diabetes screening camp. Who do we speak to?',
            source: 'Landing page', departmentId: '', assignedTo: '',
            status: 'new', priority: 'normal', replies: [], internalNotes: [],
            receivedAt: '2026-08-04T14:02:00Z', order: 5,
        },
        {
            id: 'enq-006', name: 'Anonymous', email: 'noreply@spam.example', phone: '',
            subject: 'SEO services for your hospital', message: 'We can rank you #1 on Google in 30 days, guaranteed…',
            source: 'Contact form', departmentId: '', assignedTo: '',
            status: 'spam', priority: 'low', replies: [], internalNotes: [{ by: 'Admin Desk', at: '2026-08-01T10:00:00Z', body: 'Marked as spam.' }],
            receivedAt: '2026-08-01T09:55:00Z', order: 6,
        },
        {
            id: 'enq-007', name: 'Debarati Nath', email: 'debarati.n@example.com', phone: '+91 91234 56789',
            subject: 'Maternity package', message: 'What is included in the normal delivery package, and does it change for a caesarean?',
            source: 'Chat widget', departmentId: 'prenatal-care', assignedTo: '',
            status: 'new', priority: 'normal', replies: [], internalNotes: [],
            receivedAt: '2026-08-05T07:40:00Z', order: 7,
        },
        {
            /* Same person as enq-001 — the detail screen's "related enquiries"
               list matches on email or phone, and an empty list would hide the
               fact that it works. */
            id: 'enq-008', name: 'Sourav Das', email: 'sourav.das@example.com', phone: '+91 98300 45612',
            subject: 'Reports from the cardiac screen', message: 'The screen was done on the 2nd. When can we collect the reports, and can they be emailed?',
            source: 'Contact form', departmentId: 'cardiology', assignedTo: 'usr-002',
            status: 'new', priority: 'high', replies: [], internalNotes: [],
            receivedAt: '2026-08-05T05:30:00Z', order: 8,
        },
    ];

    w.TMH_SEED.appointments = [
        { id: 'apt-001', patientName: 'Ratan Kumar', phone: '+91 98300 00011', email: 'ratan.k@example.com', departmentId: 'cardiology', doctorId: 'dr-jonathon-ronan', preferredDate: '2026-08-08', preferredSlot: 'Morning', reason: 'Follow-up after angioplasty', status: 'pending', createdAt: '2026-08-04T10:00:00Z', order: 1 },
        { id: 'apt-002', patientName: 'Sharmila Bose', phone: '+91 98311 00022', email: '', departmentId: 'orthopedics', doctorId: 'dr-victor-james', preferredDate: '2026-08-07', preferredSlot: 'Morning', reason: 'Knee pain, worsening over three months', status: 'confirmed', confirmedSlot: '2026-08-07 10:30', confirmedAt: '2026-08-04T12:10:00Z', createdAt: '2026-08-03T15:20:00Z', order: 2 },
        { id: 'apt-003', patientName: 'Imran Sheikh', phone: '+91 90070 00033', email: 'imran.s@example.com', departmentId: 'nephrology', doctorId: 'dr-debjani-roy', preferredDate: '2026-08-09', preferredSlot: 'Afternoon', reason: 'Creatinine rising on last two reports', status: 'pending', createdAt: '2026-08-04T16:45:00Z', order: 3 },
        { id: 'apt-004', patientName: 'Kalpana Devi', phone: '+91 88880 00044', email: '', departmentId: 'prenatal-care', doctorId: 'dr-philips-rownd', preferredDate: '2026-08-06', preferredSlot: 'Morning', reason: '28-week antenatal check', status: 'confirmed', confirmedSlot: '2026-08-06 09:00', confirmedAt: '2026-08-03T09:00:00Z', createdAt: '2026-08-02T18:30:00Z', order: 4 },
        { id: 'apt-005', patientName: 'Bikash Pramanik', phone: '+91 87770 00055', email: 'bikash.p@example.com', departmentId: 'ophthalmology', doctorId: 'dr-imran-haque', preferredDate: '2026-08-05', preferredSlot: 'Morning', reason: 'Blurred vision, diabetic', status: 'cancelled', cancelReason: 'Patient rescheduled to next month', createdAt: '2026-08-01T11:15:00Z', order: 5 },
        { id: 'apt-006', patientName: 'Mousumi Sardar', phone: '+91 91234 00066', email: '', departmentId: 'dental-care', doctorId: 'dr-sneha-pal', preferredDate: '2026-08-10', preferredSlot: 'Afternoon', reason: 'Tooth extraction consultation', status: 'pending', createdAt: '2026-08-05T06:20:00Z', order: 6 },
        { id: 'apt-007', patientName: 'Habib Mondal', phone: '+91 90070 00077', email: 'habib.m@example.com', departmentId: 'general-surgery', doctorId: 'dr-victor-james', preferredDate: '2026-08-06', preferredSlot: 'Afternoon', reason: 'Hernia review before surgery date', status: 'confirmed', confirmedSlot: '2026-08-06 15:00', confirmedAt: '2026-08-05T04:10:00Z', createdAt: '2026-08-04T19:05:00Z', order: 7 },
        { id: 'apt-008', patientName: 'Anita Sil', phone: '+91 98311 00088', email: '', departmentId: 'cardiology', doctorId: 'dr-jonathon-ronan', preferredDate: '2026-08-04', preferredSlot: 'Morning', reason: 'ECG review', status: 'completed', confirmedSlot: '2026-08-04 09:30', confirmedAt: '2026-08-02T10:00:00Z', createdAt: '2026-08-01T08:00:00Z', order: 8 },
    ];
}(window));
