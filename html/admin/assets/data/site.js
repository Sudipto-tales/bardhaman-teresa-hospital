/* Seed: settings singleton, site pages with their sections, and counters.

   `settings` is the record that removes the repo-wide find-and-replace —
   +91 342 325 4567 and contact@teresamemorial.org are currently hardcoded
   in all 20 public .html files, roughly four times each. */
(function (w) {
    w.TMH_SEED = w.TMH_SEED || {};

    w.TMH_SEED.settings = {
        general: {
            name: 'Teresa Memorial Hospital',
            shortName: 'Teresa Memorial',
            tagline: 'Compassionate Care, Every Day',
            logo: '../../assets/logo-teresa.png',
            logoDark: '../../assets/logo-nobg.png',
            favicon: '../../assets/logo-teresa.png',
            establishedYear: 1994,
            registrationNo: 'WB/HOSP/1994/0412',
            openingHours: [
                { day: 'Monday', from: '08:00', to: '20:00', closed: false },
                { day: 'Tuesday', from: '08:00', to: '20:00', closed: false },
                { day: 'Wednesday', from: '08:00', to: '20:00', closed: false },
                { day: 'Thursday', from: '08:00', to: '20:00', closed: false },
                { day: 'Friday', from: '08:00', to: '20:00', closed: false },
                { day: 'Saturday', from: '08:00', to: '17:00', closed: false },
                { day: 'Sunday', from: '09:00', to: '13:00', closed: false },
            ],
            emergencyAlwaysOpen: true,
            maintenanceMode: false,
            maintenanceMessage: 'The website is briefly down for maintenance. Emergency services are unaffected — call +91 342 325 4567.',
        },

        contact: {
            phones: [
                { label: 'Reception', number: '+91 342 325 4567', isPrimary: true, showInHeader: true, showInDock: true },
                { label: 'Emergency', number: '+91 342 325 9999', isPrimary: false, showInHeader: true, showInDock: true },
                { label: 'Ambulance', number: '+91 342 325 8888', isPrimary: false, showInHeader: false, showInDock: true },
                { label: 'Appointments', number: '+91 342 325 4500', isPrimary: false, showInHeader: false, showInDock: false },
            ],
            emergencyNumber: '+91 342 325 9999',
            emails: [
                { label: 'General', address: 'contact@teresamemorial.org', showInHeader: true },
                { label: 'Careers', address: 'careers@teresamemorial.org', showInHeader: false },
                { label: 'Billing', address: 'billing@teresamemorial.org', showInHeader: false },
            ],
            whatsapp: '+91 342 325 4567',
            whatsappMessage: 'Hello, I would like to ask about',
            addressLines: [
                { line: 'Teresa Memorial Hospital' },
                { line: 'GT Road, Nabapally' },
            ],
            city: 'Bardhaman',
            state: 'West Bengal',
            pincode: '713101',
            mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.0!2d87.85!3d23.25',
            mapLat: 23.2599,
            mapLng: 87.8615,
            directions: 'Opposite the Nabapally bus stand, five minutes from Bardhaman station by toto.',
            departmentLines: [
                { department: 'Emergency', number: '+91 342 325 9999' },
                { department: 'Cardiology', number: '+91 342 325 4571' },
                { department: 'Maternity', number: '+91 342 325 4572' },
                { department: 'Laboratory', number: '+91 342 325 4573' },
            ],
        },

        social: {
            social: [
                { platform: 'Facebook', url: 'https://facebook.com/teresamemorial', showInHeader: true, showInFooter: true },
                { platform: 'Instagram', url: 'https://instagram.com/teresamemorial', showInHeader: true, showInFooter: true },
                { platform: 'YouTube', url: 'https://youtube.com/@teresamemorial', showInHeader: false, showInFooter: true },
                { platform: 'LinkedIn', url: 'https://linkedin.com/company/teresamemorial', showInHeader: false, showInFooter: true },
            ],
            shareImage: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&auto=format&fit=crop',
            languages: [
                { code: 'en', label: 'English', enabled: true },
                { code: 'bn', label: 'বাংলা', enabled: true },
                { code: 'hi', label: 'हिन्दी', enabled: false },
            ],
            defaultLanguage: 'en',
        },

        integrations: {
            ga4Id: 'G-TMH2026XX',
            gtmId: '',
            searchConsoleTag: '',
            facebookPixel: '',
            smtpHost: 'smtp.teresamemorial.org',
            smtpPort: 587,
            smtpUser: 'noreply@teresamemorial.org',
            smtpPass: '••••••••••••',
            smtpFromName: 'Teresa Memorial Hospital',
            smtpFromEmail: 'noreply@teresamemorial.org',
            smtpSecure: 'tls',
            notifyEnquiryTo: [
                { email: 'contact@teresamemorial.org' },
                { email: 'frontdesk@teresamemorial.org' },
            ],
            recaptchaSiteKey: '',
            recaptchaSecret: '',
            liveChatProvider: 'None',
            liveChatEmbed: '',
            liveChatFrom: '08:00',
            liveChatTo: '22:00',
            liveChatEnabled: false,
        },

        theme: {
            brandPrimary: '#C1272D',
            brandAccent: '#2E6BB8',
            brandDeep: '#7A1540',
            defaultTheme: 'system',
            headingFont: 'Sora',
            bodyFont: 'Inter',
            bannerStyle: 'Photo with overlay',
        },

        seo: {
            titlePattern: '%page% — Teresa Memorial Hospital',
            defaultDescription: 'Teresa Memorial Hospital — multi-speciality care, expert doctors, 24/7 emergency services and advanced lab facilities in Bardhaman.',
            defaultOgImage: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&auto=format&fit=crop',
            robots: 'index, follow',
            sitemapUrl: '/sitemap.xml',
            canonicalDomain: 'https://teresamemorial.org',
        },
    };

    /* One record per public page. `sections` mirrors the [data-section] blocks
       in the generated HTML; `data` is what that section renders from. */
    w.TMH_SEED.pages = [
        {
            id: 'home', title: 'Home', path: 'website.html', order: 1, status: 'published',
            updatedAt: '2026-08-04T18:29:00Z',
            metaTitle: 'Teresa Memorial Hospital — Compassionate Care, Every Day',
            metaDescription: 'Multi-speciality care, expert doctors, 24/7 emergency services and advanced lab facilities.',
            sections: [
                {
                    key: 'hero', label: 'Hero banner', enabled: true, order: 1,
                    data: {
                        eyebrow: 'Bardhaman · Since 1994',
                        title: 'Compassionate care,',
                        titleStrong: 'every single day',
                        lead: 'A 210-bed multi-speciality hospital with a 24/7 emergency, twelve departments and a laboratory that reports the same day.',
                        primaryLabel: 'Book an appointment', primaryHref: 'contact.html#book',
                        ghostLabel: 'Call emergency', ghostHref: 'tel:+913423259999',
                        image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1600&auto=format&fit=crop',
                    },
                },
                { key: 'about', label: 'About strip', enabled: true, order: 2, data: { title: 'Care that starts before the paperwork', body: 'Emergency treatment begins before any payment discussion. The billing desk comes to you, not the other way round.', image: '' } },
                { key: 'care', label: 'Why choose us', enabled: true, order: 3, data: { title: 'Why families come back' } },
                { key: 'services', label: 'Services grid', enabled: true, order: 4, data: { title: 'What we do', lead: 'Twelve departments under one roof.' } },
                { key: 'specialities', label: 'Specialities', enabled: true, order: 5, data: { title: 'Our specialities' } },
                { key: 'why-us', label: 'Numbers band', enabled: true, order: 6, data: { title: 'The hospital in numbers' } },
                { key: 'doctors', label: 'Doctors strip', enabled: true, order: 7, data: { title: 'Meet the consultants', limit: 6 } },
                { key: 'lab-tests', label: 'Lab tests block', enabled: true, order: 8, data: { title: 'Popular tests', lead: 'Home collection across Bardhaman town.', limit: 6 } },
                { key: 'testimonials', label: 'Testimonials', enabled: true, order: 9, data: { title: 'What patients say' } },
                { key: 'articles', label: 'Latest articles', enabled: true, order: 10, data: { title: 'From the blog', limit: 3 } },
                { key: 'faq', label: 'FAQ accordion', enabled: true, order: 11, data: { title: 'Questions we are asked most', group: 'Home' } },
                { key: 'contact', label: 'Contact band', enabled: true, order: 12, data: { title: 'Come and see us' } },
            ],
        },
        {
            id: 'about', title: 'About', path: 'about.html', order: 2, status: 'published',
            updatedAt: '2026-08-04T18:29:00Z',
            metaTitle: 'About Teresa Memorial Hospital',
            metaDescription: 'A 210-bed multi-speciality hospital serving Bardhaman since 1994.',
            sections: [
                { key: 'story', label: 'Our story', enabled: true, order: 1, data: { title: 'Forty beds, one promise', body: '<p>The hospital opened in 1994 with forty beds and a promise that nobody would be turned away at the door for want of a deposit. Thirty-two years later the promise has not changed; the building has.</p>', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop' } },
                {
                    key: 'purpose', label: 'Mission, vision, values', enabled: true, order: 2,
                    data: {
                        pillars: [
                            { icon: 'fa-shield-halved', title: 'Our Mission', text: 'To care for our patients and their families at the moment it matters most, without asking first what they can pay.' },
                            { icon: 'fa-eye', title: 'Our Vision', text: 'A district where nobody has to travel to Kolkata for treatment that should already be available at home.' },
                            { icon: 'fa-heart', title: 'Our Values', text: 'Excellence, collaboration, accountability, respect and engagement — audited monthly, not framed on a wall.' },
                        ],
                    },
                },
                {
                    key: 'values', label: 'Values grid', enabled: true, order: 3,
                    data: {
                        title: 'What we hold ourselves to',
                        values: [
                            { icon: 'fa-hand-holding-heart', title: 'Care Before Paperwork', text: 'Emergency treatment starts before any payment discussion. The billing desk comes to you, not the other way round.' },
                            { icon: 'fa-eye', title: 'Plain Answers', text: 'Diagnosis, options and costs explained in the language you are most comfortable in, before anything is signed.' },
                            { icon: 'fa-users', title: 'One Team, One File', text: 'Departments share a single record, so nobody has to repeat their history at every desk.' },
                            { icon: 'fa-shield-halved', title: 'Safety Audited', text: 'Infection rates, surgical outcomes and complaint response times are reviewed every month.' },
                            { icon: 'fa-clock', title: 'Time Respected', text: 'Appointment slots are real. If we are running late, you are told when you arrive — not after an hour.' },
                            { icon: 'fa-scale-balanced', title: 'The Same Standard', text: 'General ward or private room, the clinical protocol does not change.' },
                        ],
                    },
                },
                {
                    key: 'milestones', label: 'Milestones', enabled: true, order: 4,
                    data: {
                        title: 'Thirty-two years, one building at a time',
                        milestones: [
                            { year: '1994', text: 'Doors open with 40 beds' },
                            { year: '2001', text: 'First operating theatre' },
                            { year: '2006', text: 'Intensive care unit added' },
                            { year: '2011', text: 'Cath lab commissioned' },
                            { year: '2014', text: 'Dialysis unit opens' },
                            { year: '2017', text: 'Maternity block completed' },
                            { year: '2019', text: 'NABL-standard laboratory' },
                            { year: '2021', text: 'Neonatal nursery upgraded' },
                            { year: '2023', text: 'Modular theatres rebuilt' },
                            { year: '2024', text: 'Digital records go live' },
                            { year: '2025', text: 'Fourth theatre added' },
                            { year: '2026', text: '210 beds across 20 units' },
                        ],
                    },
                },
                { key: 'leadership', label: 'Leadership strip', enabled: true, order: 5, data: { title: 'Who runs the hospital', category: 'all' } },
                { key: 'in-practice', label: 'Proof mosaic', enabled: true, order: 6, data: { title: 'In practice', photoA: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=900&auto=format&fit=crop', photoB: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=900&auto=format&fit=crop', rating: '4.8' } },
                { key: 'careers-cta', label: 'Careers call to action', enabled: true, order: 7, data: { title: 'Work with us', body: 'Two hundred and forty staff. The medical director knows your name and takes your call.' } },
            ],
        },
        {
            id: 'contact', title: 'Contact', path: 'contact.html', order: 3, status: 'published',
            updatedAt: '2026-08-04T18:29:00Z',
            metaTitle: 'Contact Teresa Memorial Hospital',
            metaDescription: 'Phone numbers, address, directions and the appointment booking form.',
            sections: [
                { key: 'reach-us', label: 'Reach us', enabled: true, order: 1, data: { title: 'How to reach us', lead: 'Numbers and addresses come from Contact Details in Settings.' } },
                { key: 'appointment', label: 'Appointment form', enabled: true, order: 2, data: { title: 'Book an appointment', lead: 'We call back within two working hours.', askDepartment: true, askDoctor: true, askDate: true, askReason: true, confirmation: 'Thank you — the front desk will call you back within two working hours to confirm the slot.' } },
                { key: 'location', label: 'Map and directions', enabled: true, order: 3, data: { title: 'Find us' } },
                { key: 'cta', label: 'Emergency call to action', enabled: true, order: 4, data: { title: 'In an emergency, do not wait', body: 'Come straight to the emergency entrance on GT Road, or call the emergency line.' } },
            ],
        },
        {
            id: 'careers', title: 'Careers', path: 'careers.html', order: 4, status: 'published',
            updatedAt: '2026-08-04T18:29:00Z',
            metaTitle: 'Careers at Teresa Memorial Hospital',
            metaDescription: 'Open roles in nursing, medicine and administration, with salaries benchmarked twice a year.',
            sections: [
                {
                    key: 'why-us', label: 'Why work here', enabled: true, order: 1,
                    data: {
                        title: 'Why people stay',
                        checks: [
                            { text: 'Salaries benchmarked twice a year' },
                            { text: 'Fully funded course fees for nursing staff' },
                            { text: 'Rotating shifts published a month ahead' },
                            { text: 'Subsidised treatment for staff families' },
                            { text: 'Crèche on site for the maternity block' },
                            { text: 'No unpaid overtime — logged and settled monthly' },
                        ],
                    },
                },
                {
                    key: 'what-we-offer', label: 'What we offer', enabled: true, order: 2,
                    data: {
                        title: 'What we offer',
                        benefits: [
                            { icon: 'fa-graduation-cap', title: 'Paid To Keep Learning', text: 'Course fees, exam leave and conference travel are funded for every clinical grade, not just consultants.' },
                            { icon: 'fa-calendar-check', title: 'Rosters You Can Plan Around', text: 'Shifts are published four weeks ahead. Swaps are approved in a day, not argued over for a week.' },
                            { icon: 'fa-hand-holding-medical', title: 'Care For Your Family', text: 'Staff, spouses, children and parents are treated here at heavily subsidised rates.' },
                            { icon: 'fa-arrow-trend-up', title: 'A Real Ladder', text: 'Two thirds of our senior nursing posts were filled from inside. Every vacancy is advertised internally first.' },
                            { icon: 'fa-scale-balanced', title: 'Paid Properly', text: 'Bands are reviewed against district and Kolkata rates twice a year. Overtime is logged and settled monthly.' },
                            { icon: 'fa-people-group', title: 'A Small Enough Place', text: 'Two hundred and forty staff. The medical director knows your name and takes your call.' },
                        ],
                    },
                },
                { key: 'openings', label: 'Open roles', enabled: true, order: 3, data: { title: 'Open roles', emptyMessage: 'Nothing open right now. Send a CV anyway — we keep them on file for six months.' } },
                { key: 'contact-hr', label: 'Contact HR', enabled: true, order: 4, data: { title: 'Talk to HR', email: 'careers@teresamemorial.org' } },
            ],
        },
        { id: 'departments', title: 'Departments', path: 'departments.html', order: 5, status: 'published', updatedAt: '2026-08-04T18:29:00Z', metaTitle: 'Departments — Teresa Memorial Hospital', metaDescription: 'Twelve departments, from cardiology to dental care.', sections: [] },
        { id: 'doctors', title: 'Doctors', path: 'doctors.html', order: 6, status: 'published', updatedAt: '2026-08-04T18:29:00Z', metaTitle: 'Our Doctors — Teresa Memorial Hospital', metaDescription: 'Consultants across twelve specialities.', sections: [] },
        { id: 'facilities', title: 'Facilities', path: 'facilities.html', order: 7, status: 'published', updatedAt: '2026-08-04T18:29:00Z', metaTitle: 'Facilities — Teresa Memorial Hospital', metaDescription: 'Emergency, intensive care, theatres, laboratory and imaging.', sections: [] },
        { id: 'blog', title: 'Blog', path: 'blog.html', order: 8, status: 'published', updatedAt: '2026-08-04T18:29:00Z', metaTitle: 'Health articles — Teresa Memorial Hospital', metaDescription: 'Plain-language articles from our consultants.', sections: [] },
    ];

    /* Every animated number on the public site, in one place. Department-scoped
       rows are the same records as the stats[] arrays inside DEPARTMENTS. */
    w.TMH_SEED.counters = [
        { id: 'cnt-beds', key: 'beds', icon: 'fa-bed', label: 'Beds', value: 210, suffix: '', note: 'Across 20 units', scope: 'global', departmentId: '', order: 1, status: 'published' },
        { id: 'cnt-doctors', key: 'doctors', icon: 'fa-user-doctor', label: 'Doctors & consultants', value: 48, suffix: '+', note: '12 specialities', scope: 'global', departmentId: '', order: 2, status: 'published' },
        { id: 'cnt-staff', key: 'staff', icon: 'fa-people-group', label: 'Staff', value: 240, suffix: '', note: 'Clinical and non-clinical', scope: 'global', departmentId: '', order: 3, status: 'published' },
        { id: 'cnt-years', key: 'years', icon: 'fa-calendar', label: 'Years of service', value: 32, suffix: '', note: 'Since 1994', scope: 'global', departmentId: '', order: 4, status: 'published' },
        { id: 'cnt-patients', key: 'patients-year', icon: 'fa-hospital-user', label: 'Patients a year', value: 96000, suffix: '+', note: 'Outpatient and inpatient', scope: 'home', departmentId: '', order: 5, status: 'published' },
        { id: 'cnt-emergency', key: 'emergency-year', icon: 'fa-truck-medical', label: 'Emergency arrivals a year', value: 18400, suffix: '', note: 'Triaged on arrival', scope: 'home', departmentId: '', order: 6, status: 'published' },
        { id: 'cnt-theatres', key: 'theatres', icon: 'fa-hospital', label: 'Operating theatres', value: 4, suffix: '', note: 'One always kept free', scope: 'home', departmentId: '', order: 7, status: 'published' },
        { id: 'cnt-rating', key: 'rating', icon: 'fa-star', label: 'Patient rating', value: 4.8, suffix: '/5', note: 'Across 4,300 reviews', scope: 'home', departmentId: '', order: 8, status: 'published' },
        { id: 'cnt-icu', key: 'icu-beds', icon: 'fa-bed-pulse', label: 'ICU beds', value: 34, suffix: '', note: 'General, cardiac, neuro, neonatal', scope: 'about', departmentId: '', order: 9, status: 'published' },
        { id: 'cnt-ambulance', key: 'ambulances', icon: 'fa-ambulance', label: 'Ambulances', value: 6, suffix: '', note: 'Two advanced life support', scope: 'about', departmentId: '', order: 10, status: 'published' },
        { id: 'cnt-card-1', key: 'procedures-year', icon: 'fa-heart-pulse', label: 'Procedures a year', value: 4200, suffix: '+', note: '18% more than 2024', scope: 'department', departmentId: 'cardiology', order: 11, status: 'published' },
        { id: 'cnt-card-2', key: 'cardiologists', icon: 'fa-user-doctor', label: 'Cardiologists on staff', value: 6, suffix: '', note: 'Two on call nightly', scope: 'department', departmentId: 'cardiology', order: 12, status: 'published' },
        { id: 'cnt-card-3', key: 'door-to-balloon', icon: 'fa-stopwatch', label: 'Median door-to-balloon', value: 52, suffix: ' min', note: 'Below the 90 min target', scope: 'department', departmentId: 'cardiology', order: 13, status: 'published' },
        { id: 'cnt-card-4', key: 'cardiology-rating', icon: 'fa-star', label: 'Patient rating', value: 4.8, suffix: '/5', note: '1,900 reviews', scope: 'department', departmentId: 'cardiology', order: 14, status: 'published' },
        { id: 'cnt-neuro-1', key: 'neuro-procedures', icon: 'fa-brain', label: 'Neuro procedures a year', value: 640, suffix: '+', note: '12% more than 2024', scope: 'department', departmentId: 'neuro-surgery', order: 15, status: 'published' },
        { id: 'cnt-neuro-2', key: 'neurosurgeons', icon: 'fa-user-doctor', label: 'Neurosurgeons', value: 2, suffix: '', note: 'Plus 3 neurologists', scope: 'department', departmentId: 'neuro-surgery', order: 16, status: 'published' },
    ];
}(window));
