/* =========================================================
   Sidebar definition — the single source of truth for the
   panel's navigation. core/layout.js renders this into every
   page, so adding a screen means adding one line here, not
   editing 42 files.

   key   matches <body data-page="…">; also used to mark the
         active item when a form page declares its parent
         (e.g. doctor-form.html sets data-page="doctors")
   badge optional; a number renders as a red count bubble.
         A function is called at mount time, after the store
         exists, so the bubble tracks the data instead of
         drifting from it the moment someone clears an inbox.
   ========================================================= */
(function () {
    /* Counts live rows, not seed rows — the store may have been written to. */
    function count(entity, test) {
        try {
            return (window.TMH.store.allSync(entity) || []).filter(test).length;
        } catch (e) {
            return 0;
        }
    }

    window.TMH_NAV_COUNT = count;
}());

window.TMH_NAV = [
    {
        label: 'Main',
        items: [
            { key: 'dashboard', label: 'Dashboard', icon: 'fa-house-medical', href: 'dashboard.html' },
            { key: 'analytics', label: 'Web Analytics', icon: 'fa-chart-line', href: 'analytics.html' },
        ],
    },
    {
        label: 'Content',
        items: [
            { key: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', href: 'doctors.html' },
            { key: 'leadership', label: 'Leadership', icon: 'fa-user-tie', href: 'leadership.html' },
            { key: 'departments', label: 'Departments', icon: 'fa-hospital', href: 'departments.html' },
            { key: 'facilities', label: 'Facilities', icon: 'fa-bed-pulse', href: 'facilities.html' },
            { key: 'lab-tests', label: 'Lab Tests', icon: 'fa-flask-vial', href: 'lab-tests.html' },
            { key: 'blog', label: 'Blog & News', icon: 'fa-newspaper', href: 'blog.html' },
            { key: 'blog-categories', label: 'Categories', icon: 'fa-tags', href: 'blog-categories.html' },
            { key: 'testimonials', label: 'Testimonials', icon: 'fa-comment-medical', href: 'testimonials.html' },
            { key: 'faqs', label: 'FAQs', icon: 'fa-circle-question', href: 'faqs.html' },
            { key: 'gallery', label: 'Media Gallery', icon: 'fa-images', href: 'gallery.html' },
        ],
    },
    {
        label: 'Pages',
        items: [
            { key: 'pages', label: 'All Pages', icon: 'fa-file-lines', href: 'pages.html' },
            { key: 'page-home', label: 'Home Page', icon: 'fa-house', href: 'page-home.html' },
            { key: 'page-about', label: 'About Page', icon: 'fa-circle-info', href: 'page-about.html' },
            { key: 'page-contact', label: 'Contact Page', icon: 'fa-map-location-dot', href: 'page-contact.html' },
            { key: 'page-careers', label: 'Careers Page', icon: 'fa-briefcase', href: 'page-careers.html' },
            { key: 'stats', label: 'Counters & Numbers', icon: 'fa-arrow-up-9-1', href: 'stats.html' },
        ],
    },
    {
        label: 'Careers',
        items: [
            { key: 'jobs', label: 'Vacancies', icon: 'fa-bullhorn', href: 'jobs.html' },
            {
                key: 'applications', label: 'Applications', icon: 'fa-file-signature', href: 'applications.html',
                badge: () => window.TMH_NAV_COUNT('applications', (a) => a.stage === 'new'),
            },
        ],
    },
    {
        label: 'Growth',
        items: [
            {
                key: 'enquiries', label: 'Enquiries', icon: 'fa-envelope-open-text', href: 'enquiries.html',
                badge: () => window.TMH_NAV_COUNT('enquiries', (e) => e.status === 'new'),
            },
            /* No badge: the screen is read-only, so a count would be nagging
               the user about work the panel gives them no way to do. */
            { key: 'appointments', label: 'Appointments', icon: 'fa-calendar-check', href: 'appointments.html' },
            { key: 'seo', label: 'SEO Manager', icon: 'fa-magnifying-glass-chart', href: 'seo.html' },
            { key: 'navigation', label: 'Navigation', icon: 'fa-sitemap', href: 'navigation.html' },
            { key: 'redirects', label: 'Redirects', icon: 'fa-right-left', href: 'redirects.html' },
        ],
    },
    {
        label: 'System',
        items: [
            { key: 'settings-general', label: 'General Settings', icon: 'fa-sliders', href: 'settings-general.html' },
            { key: 'settings-contact', label: 'Contact Details', icon: 'fa-address-book', href: 'settings-contact.html' },
            { key: 'settings-social', label: 'Social Links', icon: 'fa-share-nodes', href: 'settings-social.html' },
            { key: 'settings-integrations', label: 'Integrations', icon: 'fa-plug', href: 'settings-integrations.html' },
            { key: 'settings-theme', label: 'Theme & Branding', icon: 'fa-palette', href: 'settings-theme.html' },
            { key: 'settings-popups', label: 'Popups & Cookie Bar', icon: 'fa-rectangle-ad', href: 'settings-popups.html' },
            { key: 'users', label: 'Users & Roles', icon: 'fa-user-shield', href: 'users.html' },
            { key: 'activity-log', label: 'Activity Log', icon: 'fa-clock-rotate-left', href: 'activity-log.html' },
            { key: 'profile', label: 'My Profile', icon: 'fa-circle-user', href: 'profile.html' },
        ],
    },
];
