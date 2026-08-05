/* Seed: media library.
   Mirrors the IMG pool in tools/site-data.mjs — every id below is already
   in use somewhere on the public site, so the panel shows real pictures.

   `usedBy` is deliberately absent: the back-references are worked out by
   scanning the other entities (see pages/gallery.js), because a stored copy
   would be wrong the moment somebody swapped a doctor's photo. Phase 2
   replaces the scan with a real join, not with a cached field. */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    const U = (id, wd) => `https://images.unsplash.com/photo-${id}?q=80&w=${wd}&auto=format&fit=crop`;

    w.TMH_SEED.media = [
        { id: 'med-001', url: U('1587351021759-3e566b6af7cc', 1600), filename: 'ward.jpg', alt: 'Nurse checking on a patient in a hospital ward', caption: '', folder: 'Hospital', width: 1600, height: 1067, sizeBytes: 412000, mime: 'image/jpeg', uploadedAt: '2026-02-11T09:20:00Z', status: 'published', order: 1 },
        { id: 'med-002', url: U('1551076805-e1869033e561', 1600), filename: 'corridor.jpg', alt: 'Bright hospital corridor', caption: '', folder: 'Hospital', width: 1600, height: 1067, sizeBytes: 388000, mime: 'image/jpeg', uploadedAt: '2026-02-11T09:22:00Z', status: 'published', order: 2 },
        { id: 'med-003', url: U('1628348068343-c6a848d2b6dd', 1600), filename: 'theatre.jpg', alt: 'Surgical team in a modular operating theatre', caption: 'Theatre 2, laminar flow', folder: 'Hospital', width: 1600, height: 1067, sizeBytes: 455000, mime: 'image/jpeg', uploadedAt: '2026-02-11T09:25:00Z', status: 'published', order: 3 },
        { id: 'med-004', url: U('1579684385127-1ef15d508118', 1600), filename: 'team.jpg', alt: 'Medical team standing together', caption: '', folder: 'People', width: 1600, height: 1067, sizeBytes: 402000, mime: 'image/jpeg', uploadedAt: '2026-03-02T11:00:00Z', status: 'published', order: 4 },
        { id: 'med-005', url: U('1579154204601-01588f351e67', 1600), filename: 'lab.jpg', alt: 'Technician working at a laboratory bench', caption: '', folder: 'Hospital', width: 1600, height: 1067, sizeBytes: 377000, mime: 'image/jpeg', uploadedAt: '2026-03-02T11:04:00Z', status: 'published', order: 5 },
        { id: 'med-006', url: U('1531746020798-e6953c6e8e04', 1600), filename: 'consult.jpg', alt: 'Doctor consulting with a patient', caption: '', folder: 'People', width: 1600, height: 1067, sizeBytes: 361000, mime: 'image/jpeg', uploadedAt: '2026-03-02T11:07:00Z', status: 'published', order: 6 },
        { id: 'med-007', url: U('1555252333-9f8e92e65df9', 1600), filename: 'maternity.jpg', alt: 'Mother holding a newborn', caption: '', folder: 'Departments', width: 1600, height: 1067, sizeBytes: 344000, mime: 'image/jpeg', uploadedAt: '2026-04-18T15:40:00Z', status: 'published', order: 7 },
        { id: 'med-008', url: U('1522771739844-6a9f6d5f14af', 1600), filename: 'newborn.jpg', alt: 'Newborn baby asleep', caption: '', folder: 'Departments', width: 1600, height: 1067, sizeBytes: 298000, mime: 'image/jpeg', uploadedAt: '2026-04-18T15:41:00Z', status: 'published', order: 8 },
        { id: 'med-009', url: U('1498551172505-8ee7ad69f235', 1600), filename: 'stress.jpg', alt: 'Person resting with eyes closed', caption: '', folder: 'Blog', width: 1600, height: 1067, sizeBytes: 312000, mime: 'image/jpeg', uploadedAt: '2026-05-06T08:15:00Z', status: 'published', order: 9 },
        { id: 'med-010', url: U('1622253692010-333f2da6031d', 500), filename: 'dr-ronan.jpg', alt: 'Portrait of Dr. Jonathon Ronan', caption: '', folder: 'Doctors', width: 500, height: 625, sizeBytes: 96000, mime: 'image/jpeg', uploadedAt: '2026-01-09T10:00:00Z', status: 'published', order: 10 },
        { id: 'med-011', url: U('1559839734-2b71ea197ec2', 500), filename: 'dr-sharma.jpg', alt: 'Portrait of Dr. Anita Sharma', caption: '', folder: 'Doctors', width: 500, height: 625, sizeBytes: 91000, mime: 'image/jpeg', uploadedAt: '2026-01-09T10:02:00Z', status: 'published', order: 11 },
        { id: 'med-012', url: U('1612349317150-e413f6a5b16d', 500), filename: 'dr-james.jpg', alt: 'Portrait of Dr. Victor James', caption: '', folder: 'Doctors', width: 500, height: 625, sizeBytes: 94000, mime: 'image/jpeg', uploadedAt: '2026-01-09T10:04:00Z', status: 'published', order: 12 },
        { id: 'med-013', url: U('1581056771107-24ca5f033842', 500), filename: 'dr-dey.jpg', alt: 'Portrait of Dr. Rahul Dey', caption: '', folder: 'Doctors', width: 500, height: 625, sizeBytes: 88000, mime: 'image/jpeg', uploadedAt: '2026-01-09T10:06:00Z', status: 'published', order: 13 },
        { id: 'med-014', url: U('1537368910025-702800faa86b', 500), filename: 'dr-rownd.jpg', alt: 'Portrait of Dr. Philips Rownd', caption: '', folder: 'Doctors', width: 500, height: 625, sizeBytes: 90000, mime: 'image/jpeg', uploadedAt: '2026-01-09T10:08:00Z', status: 'published', order: 14 },

        /* No alt text — the gallery's "Missing alt" filter needs something to
           find, and this is exactly the file that reaches a published page
           unnoticed. */
        { id: 'med-015', url: U('1594824436998-d40d9b4b0870', 500), filename: 'dr-jane.jpg', alt: '', caption: '', folder: 'Doctors', width: 500, height: 625, sizeBytes: 87000, mime: 'image/jpeg', uploadedAt: '2026-01-09T10:10:00Z', status: 'published', order: 15 },

        /* Uploaded, never placed. The "Unused" filter is how these get found
           before the folder turns into an attic. */
        { id: 'med-016', url: U('1516549655169-df83a0774514', 1600), filename: 'reception-2025.jpg', alt: 'Reception desk with a queue of visitors', caption: 'Shot before the 2025 refit', folder: 'Uploads', width: 1600, height: 1067, sizeBytes: 421000, mime: 'image/jpeg', uploadedAt: '2026-06-21T13:30:00Z', status: 'published', order: 16 },
        { id: 'med-017', url: U('1538108149393-fbbd81895907', 1600), filename: 'ambulance-bay.jpg', alt: 'Ambulance parked at the emergency entrance', caption: '', folder: 'Uploads', width: 1600, height: 1067, sizeBytes: 398000, mime: 'image/jpeg', uploadedAt: '2026-07-02T16:05:00Z', status: 'published', order: 17 },

        /* Documents. They have no preview, which is the whole reason the grid
           has to handle a tile with no picture in it. */
        { id: 'med-018', url: '../../assets/docs/patient-charter.pdf', filename: 'patient-charter.pdf', alt: 'Patient charter (PDF)', caption: 'Linked from the About page', folder: 'Documents', sizeBytes: 184000, mime: 'application/pdf', uploadedAt: '2026-03-14T12:00:00Z', status: 'published', order: 18 },
        { id: 'med-019', url: '../../assets/docs/tariff-2026.pdf', filename: 'tariff-2026.pdf', alt: 'Room tariff, April 2026 onward (PDF)', caption: '', folder: 'Documents', sizeBytes: 96000, mime: 'application/pdf', uploadedAt: '2026-04-01T09:00:00Z', status: 'published', order: 19 },
    ];
}(window));
