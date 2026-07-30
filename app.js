/* =========================================================
   Teresa Memorial Hospital — Admin Panel
   nav indicator · router · charts · micro-animations
   ========================================================= */
(() => {
    'use strict';

    /* Validated categorical palette (CVD-checked, fixed order — never cycled) */
    const C = {
        red: '#C1272D',
        blue: '#2E6BB8',
        navy: '#1B3E7A',
        magenta: '#A81E5C',
        grid: '#F0E3E8',
        ink: '#6B5A62',
        surface: '#FFFFFF'
    };
    const SERIES = [C.red, C.blue, C.navy, C.magenta];

    /* =====================================================
       1. SIDEBAR — active pill tracking
       The item box and the pill box are identical by CSS, so the pill only
       needs the item's offsetTop/offsetHeight. Re-sync on every event that
       can change layout (icon font load, web font load, resize, scroll-bar).
       ===================================================== */
    const navTrack = document.getElementById('navTrack');
    const indicator = document.getElementById('activeIndicator');
    const navItems = [...document.querySelectorAll('.nav-item')];

    const syncIndicator = () => {
        const active = document.querySelector('.nav-item.active');
        if (!active) return;
        indicator.style.top = `${active.offsetTop}px`;
        indicator.style.height = `${active.offsetHeight}px`;
    };

    const setActive = (item) => {
        navItems.forEach(i => i.classList.toggle('active', i === item));
        syncIndicator();
    };

    /* first paint without the slide animation, then enable it */
    requestAnimationFrame(() => {
        syncIndicator();
        requestAnimationFrame(() => indicator.classList.remove('no-anim'));
    });
    window.addEventListener('load', syncIndicator);
    window.addEventListener('resize', syncIndicator);
    if (document.fonts?.ready) document.fonts.ready.then(syncIndicator);
    new ResizeObserver(syncIndicator).observe(navTrack);

    /* =====================================================
       2. PAGE DATA — everything the generated views render from
       ===================================================== */
    const PAGES = {
        dashboard: { title: ['Admin', 'Overview'], crumb: 'Main · Dashboard', static: 'page-dashboard' },
        analytics: { title: ['Web', 'Analytics'], crumb: 'Main · Web Analytics', static: 'page-analytics' },

        patients: {
            title: ['Patient', 'Records'], crumb: 'Hospital · Patients',
            stats: [
                ['fa-users', 'red', '1,245', 'Registered patients', 'up', '6.1% this month'],
                ['fa-bed-pulse', 'blue', '212', 'Currently admitted', 'up', '11 since Monday'],
                ['fa-person-walking-arrow-right', 'navy', '94', 'Discharged this week', 'up', '4.2%'],
                ['fa-triangle-exclamation', 'magenta', '7', 'Critical care', 'down', '2 vs yesterday']
            ],
            table: {
                title: 'All patients',
                cols: ['Patient', 'ID', 'Department', 'Doctor', 'Admitted', 'Status'],
                rows: [
                    ['Ananya Ghosh', '#TMH-1042', 'Cardiology', 'Dr. R. Sen', '12 Jul 2026', ['ok', 'Stable']],
                    ['Imran Sheikh', '#TMH-1043', 'Orthopedics', 'Dr. M. Roy', '14 Jul 2026', ['warn', 'Observation']],
                    ['Priya Nair', '#TMH-1044', 'Pediatrics', 'Dr. S. Iyer', '18 Jul 2026', ['ok', 'Stable']],
                    ['Debasis Pal', '#TMH-1045', 'Neurology', 'Dr. A. Bose', '21 Jul 2026', ['bad', 'Critical']],
                    ['Farida Khan', '#TMH-1046', 'Oncology', 'Dr. N. Dutta', '25 Jul 2026', ['warn', 'Observation']],
                    ['Rahul Verma', '#TMH-1047', 'Cardiology', 'Dr. R. Sen', '28 Jul 2026', ['ok', 'Discharged']]
                ]
            }
        },

        doctors: {
            title: ['Doctors', 'Directory'], crumb: 'Hospital · Doctors',
            stats: [
                ['fa-user-doctor', 'red', '142', 'Active doctors', 'up', '4 joined this month'],
                ['fa-calendar-check', 'navy', '96%', 'Slot utilisation', 'up', '3.1%'],
                ['fa-star', 'blue', '4.7', 'Avg. patient rating', 'up', '0.2'],
                ['fa-user-clock', 'magenta', '9', 'On leave today', 'down', '2 vs last week']
            ],
            table: {
                title: 'Doctor profiles shown on the website',
                cols: ['Doctor', 'Department', 'Experience', 'Consults / wk', 'Rating', 'Profile'],
                rows: [
                    ['Dr. Rupa Sen', 'Cardiology', '18 yrs', '64', '4.9 ★', ['ok', 'Published']],
                    ['Dr. Arindam Bose', 'Neurology', '15 yrs', '52', '4.8 ★', ['ok', 'Published']],
                    ['Dr. Sneha Iyer', 'Pediatrics', '11 yrs', '71', '4.9 ★', ['ok', 'Published']],
                    ['Dr. Manoj Roy', 'Orthopedics', '20 yrs', '48', '4.6 ★', ['warn', 'Draft']],
                    ['Dr. Nabanita Dutta', 'Oncology', '13 yrs', '39', '4.7 ★', ['ok', 'Published']],
                    ['Dr. Kabir Alam', 'ENT', '8 yrs', '44', '4.5 ★', ['off', 'Hidden']]
                ]
            }
        },

        departments: {
            title: ['Department', 'Manager'], crumb: 'Hospital · Departments',
            stats: [
                ['fa-hospital', 'red', '18', 'Departments', 'up', '1 added'],
                ['fa-bed', 'navy', '640', 'Total beds', 'up', '24 new'],
                ['fa-gauge-high', 'blue', '78%', 'Average occupancy', 'up', '5.4%'],
                ['fa-truck-medical', 'magenta', '28', 'Ambulances on call', 'up', '3']
            ],
            table: {
                title: 'Departments listed on the website',
                cols: ['Department', 'Head', 'Doctors', 'Beds', 'Occupancy', 'Page'],
                rows: [
                    ['Cardiology', 'Dr. Rupa Sen', '19', '96', '84%', ['ok', 'Live']],
                    ['Neurology', 'Dr. Arindam Bose', '14', '72', '69%', ['ok', 'Live']],
                    ['Pediatrics', 'Dr. Sneha Iyer', '17', '80', '77%', ['ok', 'Live']],
                    ['Orthopedics', 'Dr. Manoj Roy', '12', '64', '71%', ['warn', 'Draft']],
                    ['Oncology', 'Dr. Nabanita Dutta', '11', '58', '81%', ['ok', 'Live']],
                    ['Emergency & Trauma', 'Dr. Kabir Alam', '22', '110', '92%', ['ok', 'Live']]
                ]
            }
        },

        appointments: {
            title: ['Appointment', 'Desk'], crumb: 'Hospital · Appointments',
            stats: [
                ['fa-calendar-day', 'red', '318', 'Booked today', 'up', '8.2%'],
                ['fa-globe', 'navy', '61%', 'Booked from website', 'up', '9.6%'],
                ['fa-clock-rotate-left', 'blue', '24', 'Rescheduled', 'down', '4'],
                ['fa-ban', 'magenta', '11', 'No-shows', 'down', '2.3%']
            ],
            table: {
                title: 'Today’s schedule',
                cols: ['Time', 'Patient', 'Doctor', 'Department', 'Channel', 'Status'],
                rows: [
                    ['09:00', 'Ananya Ghosh', 'Dr. R. Sen', 'Cardiology', 'Website', ['ok', 'Confirmed']],
                    ['09:40', 'Imran Sheikh', 'Dr. M. Roy', 'Orthopedics', 'Phone', ['ok', 'Confirmed']],
                    ['10:15', 'Priya Nair', 'Dr. S. Iyer', 'Pediatrics', 'Website', ['warn', 'Awaiting']],
                    ['11:00', 'Debasis Pal', 'Dr. A. Bose', 'Neurology', 'Walk-in', ['ok', 'Confirmed']],
                    ['11:45', 'Farida Khan', 'Dr. N. Dutta', 'Oncology', 'Website', ['bad', 'Cancelled']],
                    ['12:30', 'Rahul Verma', 'Dr. R. Sen', 'Cardiology', 'Website', ['ok', 'Confirmed']]
                ]
            }
        },

        billing: {
            title: ['Billing', 'Ledger'], crumb: 'Hospital · Billing',
            stats: [
                ['fa-indian-rupee-sign', 'red', '₹42.8L', 'Revenue this month', 'up', '5.6%'],
                ['fa-file-invoice-dollar', 'navy', '1,082', 'Invoices raised', 'up', '3.9%'],
                ['fa-hourglass-half', 'blue', '₹6.2L', 'Outstanding', 'down', '1.8%'],
                ['fa-shield-heart', 'magenta', '38%', 'Insurance claims', 'up', '2.4%']
            ],
            table: {
                title: 'Recent invoices',
                cols: ['Invoice', 'Patient', 'Department', 'Amount', 'Method', 'Status'],
                rows: [
                    ['INV-90412', 'Ananya Ghosh', 'Cardiology', '₹84,200', 'Insurance', ['ok', 'Paid']],
                    ['INV-90413', 'Imran Sheikh', 'Orthopedics', '₹1,12,000', 'Card', ['ok', 'Paid']],
                    ['INV-90414', 'Priya Nair', 'Pediatrics', '₹22,450', 'UPI', ['warn', 'Partial']],
                    ['INV-90415', 'Debasis Pal', 'Neurology', '₹2,04,900', 'Insurance', ['warn', 'In review']],
                    ['INV-90416', 'Farida Khan', 'Oncology', '₹1,68,300', 'Cash', ['bad', 'Overdue']]
                ]
            }
        },

        pages: {
            title: ['Pages &', 'Content'], crumb: 'Website · Pages & Content',
            stats: [
                ['fa-file-lines', 'red', '46', 'Published pages', 'up', '3 this month'],
                ['fa-pen-ruler', 'blue', '7', 'Drafts', 'up', '2'],
                ['fa-eye', 'navy', '96,110', 'Page views', 'up', '9.8%'],
                ['fa-link-slash', 'magenta', '3', 'Broken links', 'down', '5 fixed']
            ],
            table: {
                title: 'Website pages',
                cols: ['Page', 'URL', 'Template', 'Views (30d)', 'Updated', 'Status'],
                rows: [
                    ['Home', '/', 'Landing', '31,204', '28 Jul 2026', ['ok', 'Published']],
                    ['About the hospital', '/about', 'Standard', '8,940', '19 Jul 2026', ['ok', 'Published']],
                    ['Departments', '/departments', 'Listing', '12,760', '24 Jul 2026', ['ok', 'Published']],
                    ['Find a doctor', '/doctors', 'Listing', '15,318', '26 Jul 2026', ['ok', 'Published']],
                    ['Health packages', '/packages', 'Standard', '4,102', '02 Jul 2026', ['warn', 'Draft']],
                    ['Contact & directions', '/contact', 'Standard', '6,588', '11 Jul 2026', ['ok', 'Published']]
                ]
            }
        },

        testimonials: {
            title: ['Patient', 'Testimonials'], crumb: 'Website · Testimonials',
            stats: [
                ['fa-comment-medical', 'red', '218', 'Total testimonials', 'up', '12 new'],
                ['fa-circle-check', 'navy', '186', 'Approved', 'up', '8'],
                ['fa-clock', 'blue', '4', 'Awaiting review', 'up', '4'],
                ['fa-star', 'magenta', '4.7', 'Average rating', 'up', '0.1']
            ],
            table: {
                title: 'Moderation queue',
                cols: ['Patient', 'Department', 'Rating', 'Submitted', 'Excerpt', 'State'],
                rows: [
                    ['Sujata M.', 'Cardiology', '5 ★', '28 Jul 2026', 'The team explained every step…', ['warn', 'Pending']],
                    ['Arjun K.', 'Orthopedics', '4 ★', '27 Jul 2026', 'Physio support was excellent…', ['warn', 'Pending']],
                    ['Meera D.', 'Pediatrics', '5 ★', '26 Jul 2026', 'They kept my daughter calm…', ['ok', 'Approved']],
                    ['Tapan B.', 'Neurology', '5 ★', '24 Jul 2026', 'Fast diagnosis, clear billing…', ['ok', 'Approved']],
                    ['Rekha S.', 'Oncology', '3 ★', '22 Jul 2026', 'Long wait at the reception…', ['off', 'Hidden']]
                ]
            }
        },

        gallery: {
            title: ['Media', 'Gallery'], crumb: 'Website · Media Gallery',
            stats: [
                ['fa-images', 'red', '412', 'Media files', 'up', '26 uploaded'],
                ['fa-folder-open', 'navy', '14', 'Albums', 'up', '1'],
                ['fa-file-zipper', 'blue', '1.8 GB', 'Storage used', 'up', '120 MB'],
                ['fa-image', 'magenta', '38', 'Missing alt text', 'down', '14 fixed']
            ],
            table: {
                title: 'Recent uploads',
                cols: ['File', 'Album', 'Type', 'Size', 'Uploaded', 'Alt text'],
                rows: [
                    ['cardiac-lab-01.jpg', 'Facilities', 'Image', '820 KB', '28 Jul 2026', ['ok', 'Set']],
                    ['opd-reception.jpg', 'Facilities', 'Image', '640 KB', '27 Jul 2026', ['ok', 'Set']],
                    ['health-camp-jul.mp4', 'Events', 'Video', '48 MB', '25 Jul 2026', ['off', 'N/A']],
                    ['dr-sen-portrait.jpg', 'Doctors', 'Image', '310 KB', '24 Jul 2026', ['warn', 'Missing']],
                    ['ambulance-fleet.jpg', 'Facilities', 'Image', '910 KB', '21 Jul 2026', ['warn', 'Missing']]
                ]
            }
        },

        blog: {
            title: ['Blog &', 'News'], crumb: 'Website · Blog & News',
            stats: [
                ['fa-newspaper', 'red', '84', 'Published posts', 'up', '5 this month'],
                ['fa-eye', 'navy', '18,420', 'Blog reads', 'up', '16.2%'],
                ['fa-comments', 'blue', '96', 'Comments', 'up', '11'],
                ['fa-share-nodes', 'magenta', '1,204', 'Social shares', 'up', '7.8%']
            ],
            table: {
                title: 'Latest articles',
                cols: ['Title', 'Category', 'Author', 'Reads', 'Published', 'Status'],
                rows: [
                    ['5 signs of an early heart attack', 'Cardiology', 'Dr. R. Sen', '4,210', '26 Jul 2026', ['ok', 'Live']],
                    ['Monsoon fever: when to worry', 'General', 'Content team', '3,180', '22 Jul 2026', ['ok', 'Live']],
                    ['Child vaccination schedule 2026', 'Pediatrics', 'Dr. S. Iyer', '2,940', '18 Jul 2026', ['ok', 'Live']],
                    ['Free health camp — August', 'News', 'Admin desk', '1,860', '15 Jul 2026', ['warn', 'Scheduled']],
                    ['Understanding knee replacement', 'Orthopedics', 'Dr. M. Roy', '1,402', '09 Jul 2026', ['ok', 'Live']]
                ]
            }
        },

        seo: {
            title: ['SEO', 'Manager'], crumb: 'Growth · SEO Manager',
            stats: [
                ['fa-magnifying-glass-chart', 'red', '82', 'SEO health score', 'up', '6 pts'],
                ['fa-ranking-star', 'navy', '14', 'Keywords in top 10', 'up', '3'],
                ['fa-link', 'blue', '208', 'Backlinks', 'up', '18'],
                ['fa-bug', 'magenta', '9', 'Crawl issues', 'down', '12 fixed']
            ],
            table: {
                title: 'Keyword positions',
                cols: ['Keyword', 'Page', 'Position', 'Change', 'Volume / mo', 'Intent'],
                rows: [
                    ['hospital in park street', '/', '3', '▲ 2', '4,400', ['ok', 'Local']],
                    ['best cardiologist kolkata', '/doctors', '6', '▲ 4', '2,900', ['ok', 'Commercial']],
                    ['emergency ambulance service', '/contact', '8', '▼ 1', '1,600', ['warn', 'Local']],
                    ['pediatric hospital near me', '/departments', '11', '▲ 5', '3,300', ['ok', 'Local']],
                    ['full body checkup package', '/packages', '19', '▼ 3', '5,100', ['warn', 'Commercial']]
                ]
            },
            form: {
                title: 'Global SEO defaults',
                fields: [
                    ['Default meta title', 'input', 'Teresa Memorial Hospital — Multispeciality Care', 'Used when a page has no title of its own.'],
                    ['Canonical domain', 'input', 'https://teresamemorial.org', ''],
                    ['Default meta description', 'textarea', 'Teresa Memorial Hospital offers 24×7 emergency, cardiology, neurology, pediatrics and oncology care with 640 beds and 142 specialists.', 'Aim for 150–160 characters.'],
                    ['Robots directive', 'select', 'index, follow|noindex, follow|index, nofollow', ''],
                    ['Sitemap URL', 'input', '/sitemap.xml', ''],
                    ['Google Analytics ID', 'input', 'G-TMH2026XX', '']
                ]
            }
        },

        enquiries: {
            title: ['Website', 'Enquiries'], crumb: 'Growth · Enquiries',
            stats: [
                ['fa-envelope-open-text', 'red', '264', 'Enquiries this month', 'up', '13.7%'],
                ['fa-reply', 'navy', '92%', 'Responded < 24h', 'up', '4.1%'],
                ['fa-phone', 'blue', '118', 'Callback requests', 'up', '9'],
                ['fa-face-smile', 'magenta', '31%', 'Converted to visits', 'up', '2.8%']
            ],
            table: {
                title: 'Inbox',
                cols: ['Name', 'Subject', 'Source', 'Received', 'Assigned', 'Status'],
                rows: [
                    ['Sourav Das', 'Cardiac package pricing', 'Contact form', '30 Jul, 09:12', 'Front desk', ['warn', 'New']],
                    ['Nikita Roy', 'Appointment with Dr. Iyer', 'Chat widget', '29 Jul, 18:40', 'Reception', ['ok', 'Replied']],
                    ['Amitava Sen', 'Insurance empanelment', 'Contact form', '29 Jul, 11:05', 'Billing', ['ok', 'Replied']],
                    ['Zara Ahmed', 'Ambulance availability', 'Phone widget', '28 Jul, 22:17', 'Emergency', ['ok', 'Closed']],
                    ['Prakash G.', 'Health camp registration', 'Landing page', '28 Jul, 14:02', 'Marketing', ['warn', 'New']]
                ]
            }
        },

        'site-settings': {
            title: ['Website', 'Settings'], crumb: 'System · Website Settings',
            form: {
                title: 'Hospital & website identity',
                fields: [
                    ['Hospital name', 'input', 'Teresa Memorial Hospital', ''],
                    ['Tagline', 'input', 'We care ··· He cures', ''],
                    ['Primary phone', 'input', '+91 33 4000 1234', ''],
                    ['Emergency number', 'input', '+91 33 4000 9999', 'Shown in the sticky header bar.'],
                    ['Public email', 'input', 'care@teresamemorial.org', ''],
                    ['Address', 'input', '14 Park Street, Kolkata 700016', ''],
                    ['About the hospital', 'textarea', 'A 640-bed multispeciality hospital serving eastern India since 1994, with 24×7 emergency, trauma and critical-care units.', 'Appears on the About page and in schema markup.'],
                    ['Maintenance mode', 'select', 'Off|On — show holding page', '']
                ]
            },
            form2: {
                title: 'Appearance & integrations',
                fields: [
                    ['Brand primary colour', 'input', '#C1272D', ''],
                    ['Brand accent colour', 'input', '#2E6BB8', ''],
                    ['Booking widget', 'select', 'Enabled|Disabled', ''],
                    ['Live chat', 'select', 'Enabled — 08:00 to 22:00|Disabled', ''],
                    ['Facebook page', 'input', 'facebook.com/teresamemorial', ''],
                    ['Instagram handle', 'input', '@teresamemorial', '']
                ]
            }
        },

        users: {
            title: ['Users &', 'Roles'], crumb: 'System · Users & Roles',
            stats: [
                ['fa-user-shield', 'red', '24', 'Panel users', 'up', '2 added'],
                ['fa-key', 'navy', '6', 'Roles defined', 'up', '1'],
                ['fa-clock-rotate-left', 'blue', '318', 'Actions logged today', 'up', '12%'],
                ['fa-lock', 'magenta', '2', 'Locked accounts', 'down', '1']
            ],
            table: {
                title: 'Panel access',
                cols: ['User', 'Role', 'Scope', 'Last active', '2FA', 'Status'],
                rows: [
                    ['Admin Desk', 'Super Admin', 'All modules', '2 min ago', 'On', ['ok', 'Active']],
                    ['Riya Sarkar', 'Content Editor', 'Website', '1 h ago', 'On', ['ok', 'Active']],
                    ['Dr. Rupa Sen', 'Doctor', 'Own schedule', '3 h ago', 'Off', ['ok', 'Active']],
                    ['Billing Team', 'Accounts', 'Billing', 'Yesterday', 'On', ['ok', 'Active']],
                    ['Old Intern', 'Content Editor', 'Blog', '62 days ago', 'Off', ['off', 'Suspended']]
                ]
            }
        },

        settings: {
            title: ['Panel', 'Preferences'], crumb: 'System · Preferences',
            form: {
                title: 'Your workspace',
                fields: [
                    ['Display name', 'input', 'Admin Desk', ''],
                    ['Email', 'input', 'admin@teresamemorial.org', ''],
                    ['Language', 'select', 'English|বাংলা|हिन्दी', ''],
                    ['Time zone', 'select', 'Asia/Kolkata (GMT+5:30)|UTC', ''],
                    ['Dashboard density', 'select', 'Comfortable|Compact', ''],
                    ['Email digest', 'select', 'Daily 08:00|Weekly Monday|Off', '']
                ]
            }
        }
    };

    /* =====================================================
       3. VIEW RENDERING
       ===================================================== */
    const dynamicView = document.getElementById('page-dynamic');
    const pageTitle = document.getElementById('pageTitle');
    const pageCrumb = document.getElementById('pageCrumb');
    const mainEl = document.querySelector('.main-content');

    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const statCard = ([icon, tone, value, label, dir, note]) => `
        <article class="card stat c3 anim-item">
            <div class="card-icon ${tone}"><i class="fa-solid ${icon}"></i></div>
            <h3>${esc(value)}</h3>
            <p>${esc(label)}</p>
            <span class="delta ${dir}"><i class="fa-solid fa-caret-${dir === 'up' ? 'up' : 'down'}"></i> ${esc(note)}</span>
        </article>`;

    const cell = (v) => Array.isArray(v)
        ? `<td><span class="tag ${v[0]}">${esc(v[1])}</span></td>`
        : `<td>${esc(v)}</td>`;

    const tableCard = (t, span = 'c12') => `
        <article class="card ${span} anim-item">
            <div class="card-head"><h3>${esc(t.title)}</h3><span class="pill soft">${t.rows.length} records</span></div>
            <div class="table-wrap">
                <table class="data-table">
                    <thead><tr>${t.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
                    <tbody>${t.rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>
        </article>`;

    const fieldHtml = ([label, type, value, hint]) => {
        const wide = type === 'textarea' ? ' wide' : '';
        let control;
        if (type === 'textarea') control = `<textarea>${esc(value)}</textarea>`;
        else if (type === 'select') control = `<select>${value.split('|').map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
        else control = `<input type="text" value="${esc(value)}">`;
        return `<div class="field${wide}"><label>${esc(label)}</label>${control}${hint ? `<small>${esc(hint)}</small>` : ''}</div>`;
    };

    const formCard = (f, span = 'c6') => `
        <article class="card ${span} anim-item">
            <div class="card-head"><h3>${esc(f.title)}</h3></div>
            <div class="form-grid">${f.fields.map(fieldHtml).join('')}</div>
            <button class="btn">Save changes</button>
        </article>`;

    const renderPage = (key) => {
        const p = PAGES[key];
        if (!p) return;

        pageTitle.innerHTML = `${esc(p.title[0])} <span>${esc(p.title[1])}</span>`;
        pageCrumb.textContent = p.crumb;

        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

        if (p.static) {
            document.getElementById(p.static).classList.remove('hidden');
        } else {
            let html = (p.stats || []).map(statCard).join('');
            if (p.table) html += tableCard(p.table, p.form ? 'c12' : 'c12');
            if (p.form) html += formCard(p.form, p.form2 ? 'c6' : (p.table ? 'c12' : 'c8'));
            if (p.form2) html += formCard(p.form2, 'c6');
            dynamicView.innerHTML = html;
            dynamicView.classList.remove('hidden');
        }

        mainEl.scrollTop = 0;
        stagger();
        if (key === 'analytics') initAnalyticsCharts();
    };

    const goTo = (key, push = true) => {
        const item = navItems.find(i => i.dataset.page === key);
        if (!item) return;
        setActive(item);
        renderPage(key);
        if (push) history.replaceState(null, '', '#' + key);
    };

    navItems.forEach(item => item.addEventListener('click', () => goTo(item.dataset.page)));
    window.addEventListener('hashchange', () => goTo(location.hash.slice(1), false));

    document.addEventListener('click', (e) => {
        const goto = e.target.closest('[data-goto]');
        if (!goto) return;
        e.preventDefault();
        const target = navItems.find(i => i.dataset.page === goto.dataset.goto);
        if (target) target.click();
    });

    /* =====================================================
       4. DASHBOARD WIDGET DATA
       ===================================================== */
    const TRAFFIC = [
        ['Organic search', 42, 16_140],
        ['Direct', 26, 9_990],
        ['Social', 18, 6_916],
        ['Referral', 9, 3_458],
        ['Paid', 5, 1_916]
    ];

    document.getElementById('trafficList').innerHTML = TRAFFIC.map(([name, pct, visits]) => `
        <li>
            <span>${name}</span><b>${pct}% · ${visits.toLocaleString()}</b>
            <div class="track"><i data-w="${pct}" style="width:0"></i></div>
        </li>`).join('');

    document.getElementById('testimonialFeed').innerHTML = [
        ['Sujata M.', 'Cardiology', 5, 'The team explained every step before the angioplasty.'],
        ['Arjun K.', 'Orthopedics', 4, 'Physio support after knee surgery was excellent.'],
        ['Meera D.', 'Pediatrics', 5, 'They kept my daughter calm through the whole stay.']
    ].map(([who, dept, stars, quote]) => `
        <li>
            <q>${quote}</q>
            <span>${who} · ${dept}</span>
            <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
        </li>`).join('');

    document.getElementById('topDoctors').innerHTML = `
        <thead><tr><th>Doctor</th><th>Department</th><th>Consults</th><th>Rating</th><th>Profile views</th><th>Status</th></tr></thead>
        <tbody>
            <tr><td>Dr. Sneha Iyer</td><td>Pediatrics</td><td>71</td><td>4.9 ★</td><td>3,204</td><td><span class="tag ok">Published</span></td></tr>
            <tr><td>Dr. Rupa Sen</td><td>Cardiology</td><td>64</td><td>4.9 ★</td><td>2,918</td><td><span class="tag ok">Published</span></td></tr>
            <tr><td>Dr. Arindam Bose</td><td>Neurology</td><td>52</td><td>4.8 ★</td><td>2,140</td><td><span class="tag ok">Published</span></td></tr>
            <tr><td>Dr. Manoj Roy</td><td>Orthopedics</td><td>48</td><td>4.6 ★</td><td>1,806</td><td><span class="tag warn">Draft</span></td></tr>
        </tbody>`;

    document.getElementById('activityFeed').innerHTML = [
        ['fa-comment-medical', 'New testimonial submitted by Sujata M.', '12 minutes ago'],
        ['fa-user-doctor', 'Dr. Kabir Alam profile set to hidden', '1 hour ago'],
        ['fa-newspaper', 'Blog post “Monsoon fever” published', '3 hours ago'],
        ['fa-magnifying-glass-chart', 'Sitemap re-submitted to Search Console', 'Yesterday'],
        ['fa-hospital', 'Emergency & Trauma page updated', 'Yesterday']
    ].map(([icon, text, time]) => `
        <li><span class="tl-ico"><i class="fa-solid ${icon}"></i></span>
            <div>${text}<time>${time}</time></div>
        </li>`).join('');

    /* =====================================================
       5. CHARTS
       Rules applied: 2px lines · 10% area wash · 8px markers with a 2px
       surface ring · bars capped at 24px with 4px rounded caps · solid
       hairline gridlines · legend whenever there are 2+ series · no dual axis.
       ===================================================== */
    const baseScales = () => ({
        y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: C.grid, drawTicks: false },
            ticks: { color: C.ink, font: { family: 'Poppins', size: 11 }, padding: 8 }
        },
        x: {
            border: { display: false },
            grid: { display: false },
            ticks: { color: C.ink, font: { family: 'Poppins', size: 11 }, padding: 6 }
        }
    });

    const legendCfg = (show) => ({
        display: show,
        position: 'bottom',
        labels: {
            usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8,
            padding: 16, color: C.ink, font: { family: 'Poppins', size: 11 }
        }
    });

    const tooltipCfg = {
        backgroundColor: '#2C2028', padding: 10, cornerRadius: 10, displayColors: true,
        usePointStyle: true, titleFont: { family: 'Poppins', size: 11 },
        bodyFont: { family: 'Poppins', size: 12 }
    };

    /* selective direct labels — endpoint of each line, cap of the tallest bar */
    const endLabels = {
        id: 'endLabels',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            ctx.save();
            ctx.font = '600 11px Poppins';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            chart.data.datasets.forEach((ds, di) => {
                const meta = chart.getDatasetMeta(di);
                if (meta.hidden) return;
                const last = meta.data[meta.data.length - 1];
                if (!last) return;
                ctx.fillStyle = C.ink;
                ctx.fillText(ds.data[ds.data.length - 1].toLocaleString(), last.x - 6, last.y - 8);
            });
            ctx.restore();
        }
    };

    const maxLabel = {
        id: 'maxLabel',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const ds = chart.data.datasets[0];
            const peak = ds.data.indexOf(Math.max(...ds.data));
            const bar = chart.getDatasetMeta(0).data[peak];
            if (!bar) return;
            ctx.save();
            ctx.font = '600 11px Poppins';
            ctx.fillStyle = C.ink;
            ctx.textAlign = 'center';
            ctx.fillText(ds.data[peak].toLocaleString(), bar.x, bar.y - 8);
            ctx.restore();
        }
    };

    const VISITORS = {
        Weekly: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            now: [4120, 4680, 4310, 5240, 5890, 6710, 7470],
            prev: [3810, 4020, 4160, 4480, 5010, 5660, 6240]
        },
        Monthly: {
            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            now: [24800, 27600, 29100, 31800, 34200, 38420],
            prev: [22100, 24900, 26800, 28400, 30900, 34180]
        }
    };

    let visitorsChart, dashDone = false, analyticsDone = false;

    const lineDataset = (label, data, color, fill) => ({
        label, data,
        borderColor: color,
        backgroundColor: fill ? color + '1A' : 'transparent', /* ~10% wash */
        borderWidth: 2,
        borderDash: fill ? [] : [6, 5],
        fill,
        tension: .4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: C.surface,
        pointBorderWidth: 2,        /* 2px surface ring keeps overlapping dots legible */
        pointHitRadius: 14
    });

    const initDashCharts = () => {
        if (dashDone || !window.Chart) return;
        dashDone = true;

        const v = VISITORS.Weekly;
        visitorsChart = new Chart(document.getElementById('visitorsChart'), {
            type: 'line',
            data: {
                labels: v.labels,
                datasets: [
                    lineDataset('This period', v.now, C.red, true),
                    lineDataset('Previous period', v.prev, C.navy, false)
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                layout: { padding: { top: 18, right: 8 } },
                animation: { duration: 1200, easing: 'easeOutQuart' },
                plugins: { legend: legendCfg(true), tooltip: tooltipCfg },
                scales: baseScales()
            },
            plugins: [endLabels]
        });

        new Chart(document.getElementById('deptChart'), {
            type: 'doughnut',
            data: {
                labels: ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology'],
                datasets: [{
                    data: [34, 22, 26, 18],
                    backgroundColor: SERIES,
                    borderColor: C.surface,
                    borderWidth: 2,      /* 2px surface gap between segments */
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                animation: { animateScale: true, animateRotate: true, duration: 1300 },
                plugins: {
                    legend: legendCfg(true),
                    tooltip: { ...tooltipCfg, callbacks: { label: (c) => ` ${c.label}: ${c.parsed}% of admissions` } }
                }
            }
        });

        new Chart(document.getElementById('apptChart'), {
            type: 'bar',
            data: {
                labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Appointments',
                    data: [5120, 5480, 5960, 6340, 6810, 7420],
                    backgroundColor: C.red,
                    borderRadius: { topLeft: 4, topRight: 4 },
                    borderSkipped: 'bottom',
                    maxBarThickness: 24
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 18 } },
                animation: { duration: 1100, easing: 'easeOutQuart' },
                plugins: { legend: legendCfg(false), tooltip: tooltipCfg },
                scales: baseScales()
            },
            plugins: [maxLabel]
        });
    };

    const initAnalyticsCharts = () => {
        if (analyticsDone || !window.Chart) return;
        analyticsDone = true;

        new Chart(document.getElementById('channelChart'), {
            type: 'bar',
            data: {
                labels: ['Organic', 'Direct', 'Social', 'Referral', 'Paid'],
                datasets: [
                    { label: 'This month', data: [16140, 9990, 6916, 3458, 1916], backgroundColor: C.red, borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: 22 },
                    { label: 'Last month', data: [14020, 9310, 5480, 3110, 1740], backgroundColor: C.navy, borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: 22 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1100, easing: 'easeOutQuart' },
                plugins: { legend: legendCfg(true), tooltip: tooltipCfg },
                scales: baseScales()
            }
        });

        new Chart(document.getElementById('deviceChart'), {
            type: 'doughnut',
            data: {
                labels: ['Mobile', 'Desktop', 'Tablet'],
                datasets: [{
                    data: [62, 31, 7],
                    backgroundColor: [C.red, C.blue, C.navy],
                    borderColor: C.surface, borderWidth: 2, hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                animation: { animateScale: true, animateRotate: true, duration: 1300 },
                plugins: {
                    legend: legendCfg(true),
                    tooltip: { ...tooltipCfg, callbacks: { label: (c) => ` ${c.label}: ${c.parsed}% of sessions` } }
                }
            }
        });

        document.getElementById('landingPages').innerHTML = `
            <thead><tr><th>Landing page</th><th>Sessions</th><th>Bounce</th><th>Avg. time</th><th>Goal completions</th><th>Trend</th></tr></thead>
            <tbody>
                <tr><td>/</td><td>31,204</td><td>38.1%</td><td>3m 40s</td><td>1,204</td><td><span class="tag ok">▲ 12.4%</span></td></tr>
                <tr><td>/doctors</td><td>15,318</td><td>34.6%</td><td>4m 02s</td><td>988</td><td><span class="tag ok">▲ 9.1%</span></td></tr>
                <tr><td>/departments</td><td>12,760</td><td>41.9%</td><td>2m 51s</td><td>604</td><td><span class="tag ok">▲ 6.8%</span></td></tr>
                <tr><td>/contact</td><td>6,588</td><td>52.4%</td><td>1m 47s</td><td>412</td><td><span class="tag warn">▼ 1.2%</span></td></tr>
                <tr><td>/packages</td><td>4,102</td><td>47.8%</td><td>2m 12s</td><td>188</td><td><span class="tag ok">▲ 4.4%</span></td></tr>
            </tbody>`;
    };

    /* weekly / monthly toggle on the visitors chart */
    document.querySelectorAll('.seg[data-chart="visitors"] button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
            const set = VISITORS[btn.textContent.trim()];
            if (!visitorsChart || !set) return;
            visitorsChart.data.labels = set.labels;
            visitorsChart.data.datasets[0].data = set.now;
            visitorsChart.data.datasets[1].data = set.prev;
            visitorsChart.update();
        });
    });

    /* =====================================================
       6. MICRO-ANIMATIONS
       ===================================================== */
    const stagger = () => {
        const items = [...document.querySelectorAll('.view:not(.hidden) .anim-item, .topbar.anim-item')]
            .filter(el => !el.classList.contains('show'));
        items.forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 70));
    };

    const countUp = (el) => {
        const to = +el.dataset.to;
        const start = performance.now();
        const dur = 1400;
        const tick = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(to * eased).toLocaleString();
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const fillTracks = () => {
        document.querySelectorAll('.track i[data-w]').forEach(bar => {
            requestAnimationFrame(() => { bar.style.width = bar.dataset.w + '%'; });
        });
    };

    /* count-up runs when a stat tile first becomes visible */
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting && !seen.has(e.target)) { seen.add(e.target); countUp(e.target); }
        });
    }, { threshold: .4 });
    document.querySelectorAll('.count').forEach(el => io.observe(el));

    const boot = () => {
        const hash = location.hash.slice(1);
        if (hash && PAGES[hash] && hash !== 'dashboard') goTo(hash, false);
        stagger();
        fillTracks();
        setTimeout(initDashCharts, 320);
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
