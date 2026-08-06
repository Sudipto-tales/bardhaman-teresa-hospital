/* Seed: users, roles, activity log, navigation, redirects. */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    w.TMH_SEED.users = [
        { id: 'usr-001', name: 'Admin Desk', email: 'admin@teresamemorial.org', roleId: 'role-super', phone: '+91 342 325 4567', twoFactor: true, lastActiveAt: '2026-08-05T08:40:00Z', avatar: '', order: 1, status: 'published' },
        { id: 'usr-002', name: 'Riya Sarkar', email: 'riya.sarkar@teresamemorial.org', roleId: 'role-editor', phone: '', twoFactor: true, lastActiveAt: '2026-08-05T07:10:00Z', avatar: '', order: 2, status: 'published' },
        { id: 'usr-003', name: 'Dr. Jonathon Ronan', email: 'j.ronan@teresamemorial.org', roleId: 'role-doctor', phone: '', twoFactor: false, lastActiveAt: '2026-08-04T18:20:00Z', avatar: '', order: 3, status: 'published' },
        { id: 'usr-004', name: 'Billing Team', email: 'billing@teresamemorial.org', roleId: 'role-accounts', phone: '', twoFactor: true, lastActiveAt: '2026-08-04T16:00:00Z', avatar: '', order: 4, status: 'published' },
        { id: 'usr-005', name: 'Sanjay Bhattacharya', email: 's.bhattacharya@teresamemorial.org', roleId: 'role-editor', phone: '', twoFactor: false, lastActiveAt: '2026-07-30T09:00:00Z', avatar: '', order: 5, status: 'published' },
        { id: 'usr-006', name: 'Old Intern', email: 'intern2025@teresamemorial.org', roleId: 'role-editor', phone: '', twoFactor: false, lastActiveAt: '2026-06-01T09:00:00Z', avatar: '', order: 6, status: 'hidden' },
        { id: 'usr-007', name: 'HR Desk', email: 'hr@teresamemorial.org', roleId: 'role-hr', phone: '', twoFactor: false, lastActiveAt: '', avatar: '', order: 7, status: 'draft' },
    ];

    /* Modules match the sidebar groups. Phase 1 displays this matrix; the
       server enforces it in Phase 2. */
    w.TMH_SEED.roles = [
        {
            id: 'role-super', name: 'Super Admin', description: 'Everything, including users and settings.',
            permissions: {
                content: ['view', 'create', 'edit', 'delete', 'publish'],
                pages: ['view', 'create', 'edit', 'delete', 'publish'],
                careers: ['view', 'create', 'edit', 'delete', 'publish'],
                growth: ['view', 'create', 'edit', 'delete', 'publish'],
                system: ['view', 'create', 'edit', 'delete', 'publish'],
            },
            order: 1, status: 'published',
        },
        {
            id: 'role-editor', name: 'Content Editor', description: 'Writes and publishes website content. No settings, no users.',
            permissions: {
                content: ['view', 'create', 'edit', 'publish'],
                pages: ['view', 'edit', 'publish'],
                careers: ['view'],
                growth: ['view', 'edit'],
                system: [],
            },
            order: 2, status: 'published',
        },
        {
            id: 'role-doctor', name: 'Doctor', description: 'Edits their own profile and schedule only.',
            permissions: { content: ['view', 'edit'], pages: [], careers: [], growth: ['view'], system: [] },
            order: 3, status: 'published',
        },
        {
            id: 'role-accounts', name: 'Accounts', description: 'Enquiries and appointments, for billing questions.',
            permissions: { content: [], pages: [], careers: [], growth: ['view', 'edit'], system: [] },
            order: 4, status: 'published',
        },
        {
            id: 'role-hr', name: 'HR', description: 'Vacancies and applications.',
            permissions: { content: [], pages: [], careers: ['view', 'create', 'edit', 'delete', 'publish'], growth: [], system: [] },
            order: 5, status: 'published',
        },
    ];

    w.TMH_SEED.activity = [
        { id: 'act-001', userId: 'usr-002', userName: 'Riya Sarkar', action: 'update', entity: 'posts', entityId: 'blog-post', summary: 'Edited “The six hours after chest pain”', ip: '103.21.44.10', at: '2026-08-05T08:12:00Z', order: 1 },
        { id: 'act-002', userId: 'usr-001', userName: 'Admin Desk', action: 'publish', entity: 'doctors', entityId: 'dr-imran-haque', summary: 'Published Dr. Imran Haque', ip: '103.21.44.2', at: '2026-08-05T07:40:00Z', order: 2 },
        { id: 'act-003', userId: 'usr-002', userName: 'Riya Sarkar', action: 'create', entity: 'jobs', entityId: 'physiotherapist', summary: 'Created vacancy “Physiotherapist — Inpatient”', ip: '103.21.44.10', at: '2026-08-03T11:20:00Z', order: 3 },
        { id: 'act-004', userId: 'usr-001', userName: 'Admin Desk', action: 'update', entity: 'settings', entityId: 'contact', summary: 'Changed the emergency number', ip: '103.21.44.2', at: '2026-08-02T16:05:00Z', order: 4 },
        { id: 'act-005', userId: 'usr-004', userName: 'Billing Team', action: 'update', entity: 'enquiries', entityId: 'enq-003', summary: 'Replied to Amitava Sen', ip: '103.21.44.31', at: '2026-08-03T09:40:00Z', order: 5 },
        { id: 'act-006', userId: 'usr-002', userName: 'Riya Sarkar', action: 'delete', entity: 'testimonials', entityId: 'tst-009', summary: 'Deleted a testimonial', ip: '103.21.44.10', at: '2026-08-01T14:22:00Z', order: 6 },
        { id: 'act-007', userId: 'usr-003', userName: 'Dr. Jonathon Ronan', action: 'login', entity: 'auth', entityId: '', summary: 'Signed in', ip: '49.37.12.88', at: '2026-08-04T18:20:00Z', order: 7 },
        { id: 'act-008', userId: 'usr-001', userName: 'Admin Desk', action: 'update', entity: 'departments', entityId: 'cardiology', summary: 'Updated the cardiology counters', ip: '103.21.44.2', at: '2026-07-29T11:20:00Z', order: 8 },
    ];

    /* Replaces navBar() and megaMenu() in tools/build-pages.mjs:29-81 and the
       footer link columns in the same file. */
    w.TMH_SEED['nav-items'] = [
        { id: 'nav-001', location: 'header', label: 'Home', href: 'website.html', icon: '', parentId: '', order: 1, visible: true, status: 'published' },
        { id: 'nav-002', location: 'header', label: 'About', href: 'about.html', icon: '', parentId: '', order: 2, visible: true, status: 'published' },
        { id: 'nav-003', location: 'header', label: 'Departments', href: 'departments.html', icon: '', parentId: '', order: 3, visible: true, status: 'published' },
        { id: 'nav-004', location: 'header', label: 'Doctors', href: 'doctors.html', icon: '', parentId: '', order: 4, visible: true, status: 'published' },
        { id: 'nav-005', location: 'header', label: 'Facilities', href: 'facilities.html', icon: '', parentId: '', order: 5, visible: true, status: 'published' },
        { id: 'nav-006', location: 'header', label: 'Blog', href: 'blog.html', icon: '', parentId: '', order: 6, visible: true, status: 'published' },
        { id: 'nav-007', location: 'header', label: 'Careers', href: 'careers.html', icon: '', parentId: '', order: 7, visible: true, status: 'published' },
        { id: 'nav-008', location: 'header', label: 'Contact', href: 'contact.html', icon: '', parentId: '', order: 8, visible: true, status: 'published' },

        { id: 'nav-020', location: 'footer-1', label: 'About us', href: 'about.html', icon: '', parentId: '', order: 1, visible: true, status: 'published' },
        { id: 'nav-021', location: 'footer-1', label: 'Our doctors', href: 'doctors.html', icon: '', parentId: '', order: 2, visible: true, status: 'published' },
        { id: 'nav-022', location: 'footer-1', label: 'Careers', href: 'careers.html', icon: '', parentId: '', order: 3, visible: true, status: 'published' },
        { id: 'nav-030', location: 'footer-2', label: 'Cardiology', href: 'cardiology.html', icon: '', parentId: '', order: 1, visible: true, status: 'published' },
        { id: 'nav-031', location: 'footer-2', label: 'Orthopedics', href: 'orthopedics.html', icon: '', parentId: '', order: 2, visible: true, status: 'published' },
        { id: 'nav-032', location: 'footer-2', label: 'Lab & Diagnostics', href: 'lab-diagnostics.html', icon: '', parentId: '', order: 3, visible: true, status: 'published' },

        { id: 'nav-040', location: 'dock', label: 'Call us', href: 'tel:+913423254567', icon: 'fa-phone', parentId: '', order: 1, visible: true, status: 'published' },
        { id: 'nav-041', location: 'dock', label: 'Book appointment', href: 'contact.html#book', icon: 'fa-calendar-check', parentId: '', order: 2, visible: true, status: 'published' },
        { id: 'nav-042', location: 'dock', label: 'Directions', href: 'contact.html#map', icon: 'fa-location-dot', parentId: '', order: 3, visible: true, status: 'published' },
    ];

    w.TMH_SEED.redirects = [
        { id: 'rdr-001', from: '/heart.html', to: '/cardiology.html', code: 301, hits: 214, order: 1, status: 'published' },
        { id: 'rdr-002', from: '/our-team.html', to: '/doctors.html', code: 301, hits: 88, order: 2, status: 'published' },
        { id: 'rdr-003', from: '/jobs', to: '/careers.html', code: 301, hits: 41, order: 3, status: 'published' },
        { id: 'rdr-004', from: '/old-blog/chest-pain', to: '/blog-post.html', code: 301, hits: 12, order: 4, status: 'hidden' },
    ];
}(window));
