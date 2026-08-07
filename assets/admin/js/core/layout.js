/* =========================================================
   Panel shell. Renders the sidebar and topbar into every page
   from window.TMH_NAV, so the navigation lives in one file
   rather than being copy-pasted into 42.

   Page markup is only ever:

     <body data-page="doctors">
       <div class="app">
         <div id="sidebar"></div>
         <div class="shell">
           <div id="topbar"></div>
           <main class="main"> … </main>
         </div>
       </div>
   ========================================================= */
(function (root) {
    'use strict';

    const esc = (s) => (root.TMH.util ? root.TMH.util.esc(s) : String(s));

    const THEME_KEY = 'tmh-admin-theme';
    const COLLAPSE_KEY = 'tmh-admin-collapsed';

    /* ---------------------------------------------------------
       THEME
       The pre-paint script in each page's <head> has already set
       data-theme; this only handles the toggle afterwards.
       --------------------------------------------------------- */
    const theme = {
        get() {
            return document.documentElement.dataset.theme || 'light';
        },
        set(value) {
            document.documentElement.dataset.theme = value;
            try {
                localStorage.setItem(THEME_KEY, value);
            } catch (e) { /* private mode — the choice just will not persist */ }
            root.dispatchEvent(new CustomEvent('tmh:theme', { detail: value }));
        },
        toggle() {
            theme.set(theme.get() === 'dark' ? 'light' : 'dark');
        },
    };

    /* ---------------------------------------------------------
       SIDEBAR
       --------------------------------------------------------- */
    /* The shell shows whoever is signed in. A page that never loaded
       assets/data/system.js has no users to read, so the seeded desk account
       is the fallback rather than an empty chip. */
    function me() {
        const user = root.TMH.session ? root.TMH.session.currentSync() : null;
        const name = (user && user.name) || 'Admin Desk';
        return {
            name,
            role: user ? root.TMH.session.roleName(user.roleId) : 'Super Admin',
            initials: root.TMH.util ? root.TMH.util.initials(name) : 'AD',
            avatar: (user && user.avatar) || '',
        };
    }

    function sidebarHtml(activeKey) {
        /* A badge may be a number or a fn(); resolved here so the count is
           read after the store is loaded. A zero renders as no bubble. */
        const badgeOf = (item) => {
            const v = typeof item.badge === 'function' ? item.badge() : item.badge;
            return v ? `<span class="nav-item__badge">${esc(v)}</span>` : '';
        };

        const user = me();

        const groups = (root.TMH_NAV || []).map((group) => `
            <div class="nav-group">
                <div class="nav-group__label">${esc(group.label)}</div>
                ${group.items.map((item) => `
                    <a class="nav-item${item.key === activeKey ? ' active' : ''}"
                       href="${esc(item.href)}"
                       data-key="${esc(item.key)}"
                       data-label="${esc(item.label)}">
                        <i class="fa-solid ${esc(item.icon)}"></i>
                        <span>${esc(item.label)}</span>
                        ${badgeOf(item)}
                    </a>`).join('')}
            </div>`).join('');

        return `
        <aside class="sidebar" id="sidebarEl">
            <div class="sidebar__brand">
                <span class="sidebar__logo"><i class="fa-solid fa-plus"></i></span>
                <div class="sidebar__name">TMH<small lang="bn">মানুষের সাথে ..... মানুষের পাশে</small></div>
            </div>
            <nav class="sidebar__nav" id="navTrack" aria-label="Main">
                <span class="nav-pill no-anim" id="navPill"></span>
                ${groups}
            </nav>
            <div class="sidebar__foot">
                <span class="sidebar__me">${esc(user.initials)}</span>
                <span class="sidebar__user"><strong>${esc(user.name)}</strong><span>${esc(user.role)}</span></span>
                <button type="button" class="sidebar__collapse" id="collapseBtn"
                        aria-label="Collapse sidebar"><i class="fa-solid fa-angles-left"></i></button>
            </div>
        </aside>
        <div class="scrim" id="scrim"></div>`;
    }

    /* The pill is a single absolutely-positioned element behind the items, so
       it slides between them instead of blinking. It only needs the active
       item's offsetTop/offsetHeight — same approach as the original mockup. */
    function syncPill() {
        const pill = document.getElementById('navPill');
        const active = document.querySelector('.nav-item.active');
        if (!pill) return;
        if (!active) {
            pill.style.opacity = '0';
            return;
        }
        pill.style.opacity = '1';
        pill.style.top = `${active.offsetTop}px`;
        pill.style.height = `${active.offsetHeight}px`;
    }

    /* ---------------------------------------------------------
       GLOBAL SEARCH
       One index over everything the panel edits. A source names the
       entity, the fields worth matching on, and where a hit opens —
       a form screen when the record has one, otherwise its list page
       pre-filtered through ?q= so the row is on screen on arrival.
       --------------------------------------------------------- */
    const form = (page) => (r) => `${page}.html?id=${encodeURIComponent(r.id)}`;
    const listAt = (page) => (r, q) => `${page}.html?q=${encodeURIComponent(q)}`;

    const SEARCH_SOURCES = [
        {
            entity: 'doctors', group: 'Doctors', icon: 'fa-user-doctor',
            fields: ['name', 'role', 'speciality', 'qualification'],
            title: (r) => r.name, sub: (r) => r.role || r.speciality, href: form('doctor-form'),
        },
        {
            entity: 'leadership', group: 'Leadership', icon: 'fa-user-tie',
            fields: ['name', 'title'],
            title: (r) => r.name, sub: (r) => r.title, href: form('leadership-form'),
        },
        {
            entity: 'departments', group: 'Departments', icon: 'fa-hospital',
            fields: ['name', 'id', 'lead'],
            /* `lead` is a full paragraph, so it is matched on but never shown
               as the subtitle — the menu note is one line and says more. */
            title: (r) => r.name, sub: (r) => r.menuNote || r.id, href: form('department-form'),
        },
        {
            entity: 'posts', group: 'Blog', icon: 'fa-newspaper',
            fields: ['title', 'heading', 'excerpt'],
            title: (r) => r.title, sub: (r) => r.excerpt, href: form('blog-form'),
        },
        {
            entity: 'jobs', group: 'Vacancies', icon: 'fa-bullhorn',
            fields: ['title', 'dept', 'summary'],
            title: (r) => r.title, sub: (r) => r.dept, href: form('job-form'),
        },
        {
            entity: 'enquiries', group: 'Enquiries', icon: 'fa-envelope-open-text',
            fields: ['name', 'email', 'phone', 'subject', 'message'],
            title: (r) => r.name, sub: (r) => r.subject, href: form('enquiry-view'),
        },
        {
            entity: 'appointments', group: 'Appointments', icon: 'fa-calendar-check',
            fields: ['patientName', 'phone', 'email', 'reason'],
            title: (r) => r.patientName, sub: (r) => r.reason, href: listAt('appointments'),
        },
        {
            entity: 'applications', group: 'Applications', icon: 'fa-file-signature',
            fields: ['name', 'email', 'currentEmployer'],
            title: (r) => r.name, sub: (r) => r.currentEmployer, href: listAt('applications'),
        },
        {
            entity: 'pages', group: 'Pages', icon: 'fa-file-lines',
            fields: ['title', 'path'],
            title: (r) => r.title, sub: (r) => r.path, href: listAt('pages'),
        },
        {
            entity: 'lab-tests', group: 'Lab tests', icon: 'fa-flask-vial',
            fields: ['name', 'description', 'category'],
            title: (r) => r.name, sub: (r) => r.category, href: listAt('lab-tests'),
        },
        {
            entity: 'facilities', group: 'Facilities', icon: 'fa-bed-pulse',
            fields: ['title', 'text'],
            title: (r) => r.title, sub: (r) => r.text, href: () => 'facilities.html',
        },
        {
            entity: 'testimonials', group: 'Testimonials', icon: 'fa-comment-medical',
            fields: ['name', 'text', 'role'],
            title: (r) => r.name, sub: (r) => r.role, href: () => 'testimonials.html',
        },
        {
            entity: 'faqs', group: 'FAQs', icon: 'fa-circle-question',
            fields: ['question', 'answer', 'group'],
            title: (r) => r.question, sub: (r) => r.group, href: () => 'faqs.html',
        },
        {
            entity: 'media', group: 'Media', icon: 'fa-images',
            fields: ['filename', 'alt', 'caption'],
            title: (r) => r.filename, sub: (r) => r.alt, href: listAt('gallery'),
        },
        {
            entity: 'users', group: 'Users', icon: 'fa-user-shield',
            fields: ['name', 'email'],
            title: (r) => r.name, sub: (r) => r.email, href: () => 'users.html',
        },
    ];

    const SEARCH_LIMIT = 8;

    /* Sidebar destinations are searchable too — "where do I set the favicon"
       is a navigation question, not a content one. */
    function navHits(needle) {
        const out = [];
        (root.TMH_NAV || []).forEach((group) => group.items.forEach((item) => {
            const hay = `${item.label} ${group.label}`.toLowerCase();
            const at = hay.indexOf(needle);
            if (at < 0) return;
            out.push({
                group: 'Go to', icon: item.icon, title: item.label,
                sub: group.label, href: item.href, rank: at === 0 ? 0 : 2,
            });
        }));
        return out;
    }

    function searchAll(q) {
        const needle = q.trim().toLowerCase();
        if (needle.length < 2) return [];

        const store = root.TMH && root.TMH.store;
        const hits = navHits(needle);

        if (store) {
            SEARCH_SOURCES.forEach((src) => {
                /* A page that never loaded this entity's data file cannot
                   answer for it, and asking would only report it as empty. */
                if (!store.available(src.entity)) return;

                (store.allSync(src.entity) || []).forEach((row) => {
                    let rank = -1;
                    src.fields.some((f) => {
                        const v = row[f];
                        if (v == null) return false;
                        const at = String(v).toLowerCase().indexOf(needle);
                        if (at < 0) return false;
                        /* A title that starts with the query beats one that
                           merely mentions it, which beats a body-text match. */
                        rank = f === src.fields[0] ? (at === 0 ? 0 : 1) : 3;
                        return true;
                    });
                    if (rank < 0) return;

                    hits.push({
                        group: src.group,
                        icon: src.icon,
                        title: src.title(row) || row.id,
                        sub: src.sub(row) || '',
                        href: src.href(row, q.trim()),
                        rank,
                    });
                });
            });
        }

        return hits.sort((a, b) => a.rank - b.rank).slice(0, SEARCH_LIMIT);
    }

    function wireGlobalSearch() {
        const input = document.getElementById('globalSearch');
        const panel = document.getElementById('searchResults');
        if (!input || !panel) return;

        let hits = [];
        let active = -1;

        const close = () => {
            panel.hidden = true;
            active = -1;
            input.setAttribute('aria-expanded', 'false');
        };

        function paintActive() {
            [...panel.querySelectorAll('[data-hit]')].forEach((el, i) => {
                el.classList.toggle('is-active', i === active);
                if (i === active) el.scrollIntoView({ block: 'nearest' });
            });
        }

        /* Only the results list is rewritten — the input keeps its node, so
           the caret never moves and no keystroke is lost mid-search. */
        function render() {
            const q = input.value.trim();
            if (q.length < 2) {
                close();
                return;
            }

            hits = searchAll(q);
            active = hits.length ? 0 : -1;

            panel.innerHTML = hits.length
                ? hits.map((h, i) => `
                    <a class="search-results__item${i === 0 ? ' is-active' : ''}" data-hit="${i}"
                       href="${esc(h.href)}" role="option" aria-selected="${i === 0}">
                        <i class="fa-solid ${esc(h.icon)}"></i>
                        <span class="search-results__text">
                            <b>${root.TMH.util.mark(h.title, q)}</b>
                            ${h.sub ? `<small>${esc(h.sub)}</small>` : ''}
                        </span>
                        <span class="search-results__group">${esc(h.group)}</span>
                    </a>`).join('')
                : `<p class="search-results__empty">Nothing matches “${esc(q)}”.</p>`;

            panel.hidden = false;
            input.setAttribute('aria-expanded', 'true');
        }

        input.addEventListener('input', root.TMH.util.debounce(render, 120));
        input.addEventListener('focus', () => {
            if (input.value.trim().length >= 2) render();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                close();
                input.blur();
                return;
            }
            if (panel.hidden || !hits.length) {
                /* Enter inside the debounce window has nothing to open yet.
                   Search now and go straight to the best hit, so a fast typist
                   is not made to press Enter twice. */
                if (e.key === 'Enter') {
                    e.preventDefault();
                    render();
                    if (hits.length) location.href = hits[0].href;
                }
                return;
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                active = (active + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length;
                paintActive();
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const hit = hits[active < 0 ? 0 : active];
                if (hit) location.href = hit.href;
            }
        });

        panel.addEventListener('mousemove', (e) => {
            const item = e.target.closest('[data-hit]');
            if (!item) return;
            active = Number(item.dataset.hit);
            paintActive();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.topbar__search')) close();
        });
    }

    /* ---------------------------------------------------------
       TOPBAR
       --------------------------------------------------------- */
    function topbarHtml() {
        const user = me();
        return `
        <header class="topbar">
            <button type="button" class="topbar__burger" id="burger" aria-label="Open menu">
                <i class="fa-solid fa-bars"></i>
            </button>

            <div class="topbar__search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="search" id="globalSearch" placeholder="Search doctors, posts, enquiries…"
                       aria-label="Search the panel" role="combobox" autocomplete="off"
                       aria-controls="searchResults" aria-expanded="false">
                <kbd>/</kbd>
                <div class="search-results" id="searchResults" role="listbox"
                     aria-label="Search results" hidden></div>
            </div>

            <div class="topbar__spacer"></div>

            <button type="button" class="topbar__btn" id="themeBtn" aria-label="Toggle theme">
                <i class="fa-solid fa-moon"></i>
            </button>

            <button type="button" class="topbar__btn" id="bellBtn" aria-label="Notifications">
                <i class="fa-solid fa-bell"></i><span class="dot"></span>
            </button>

            <div class="menu-wrap">
                <button type="button" class="topbar__account" id="accountBtn" aria-haspopup="true" aria-expanded="false">
                    ${user.avatar
                        ? `<img class="avatar" src="${esc(user.avatar)}" alt="">`
                        : `<span class="avatar" style="display:grid;place-items:center;font-size:11px;font-weight:600;color:#fff">${esc(user.initials)}</span>`}
                    <b>${esc(user.name)}</b>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="menu hidden" id="accountMenu" role="menu">
                    <a href="profile.html" role="menuitem"><i class="fa-solid fa-circle-user"></i> My profile</a>
                    <a href="profile.html?tab=security" role="menuitem"><i class="fa-solid fa-key"></i> Change password</a>
                    <a href="settings-general.html" role="menuitem"><i class="fa-solid fa-sliders"></i> Settings</a>
                    <a href="../../website.html" target="_blank" rel="noopener" role="menuitem"><i class="fa-solid fa-arrow-up-right-from-square"></i> View website</a>
                    <hr>
                    <button type="button" role="menuitem" id="resetDemo"><i class="fa-solid fa-rotate-left"></i> Reset demo data</button>
                    <a href="login.html" class="danger" role="menuitem"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign out</a>
                </div>
            </div>
        </header>`;
    }

    /* ---------------------------------------------------------
       PAGE HEADER helper — every page calls this rather than
       hand-writing the same block.
       --------------------------------------------------------- */
    function pageHead(opts) {
        const o = opts || {};
        const crumbs = (o.crumb || []).map((c, i, arr) => (
            i === arr.length - 1
                ? `<span>${esc(c.label)}</span>`
                : `<a href="${esc(c.href || '#')}">${esc(c.label)}</a><i class="fa-solid fa-angle-right" style="font-size:8px"></i>`
        )).join('');

        return `
        <div class="page-head">
            <div>
                ${crumbs ? `<div class="page-head__crumb">${crumbs}</div>` : ''}
                <h1>${esc(o.title || '')} ${o.accent ? `<span>${esc(o.accent)}</span>` : ''}</h1>
                ${o.sub ? `<p class="page-head__sub">${esc(o.sub)}</p>` : ''}
            </div>
            <div class="page-head__actions">${o.actions || ''}</div>
        </div>`;
    }

    /* ---------------------------------------------------------
       BOOT
       --------------------------------------------------------- */
    function mount() {
        const app = document.querySelector('.app');
        const activeKey = document.body.dataset.page || '';

        const sidebarSlot = document.getElementById('sidebar');
        const topbarSlot = document.getElementById('topbar');
        if (sidebarSlot) sidebarSlot.outerHTML = sidebarHtml(activeKey);
        if (topbarSlot) topbarSlot.outerHTML = topbarHtml();

        /* ---- collapsed state ---- */
        try {
            if (localStorage.getItem(COLLAPSE_KEY) === '1') app.classList.add('is-collapsed');
        } catch (e) { /* ignore */ }

        const collapseBtn = document.getElementById('collapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                app.classList.toggle('is-collapsed');
                const on = app.classList.contains('is-collapsed');
                collapseBtn.querySelector('i').className =
                    `fa-solid fa-angles-${on ? 'right' : 'left'}`;
                try {
                    localStorage.setItem(COLLAPSE_KEY, on ? '1' : '0');
                } catch (e) { /* ignore */ }
                requestAnimationFrame(syncPill);
            });
            if (app.classList.contains('is-collapsed')) {
                collapseBtn.querySelector('i').className = 'fa-solid fa-angles-right';
            }
        }

        /* ---- mobile drawer ---- */
        const burger = document.getElementById('burger');
        const scrim = document.getElementById('scrim');
        const closeDrawer = () => app.classList.remove('is-drawer-open');
        if (burger) burger.addEventListener('click', () => app.classList.toggle('is-drawer-open'));
        if (scrim) scrim.addEventListener('click', closeDrawer);
        root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDrawer();
        });

        /* ---- theme ---- */
        const themeBtn = document.getElementById('themeBtn');
        const paintThemeIcon = () => {
            if (!themeBtn) return;
            themeBtn.querySelector('i').className =
                `fa-solid fa-${theme.get() === 'dark' ? 'sun' : 'moon'}`;
        };
        paintThemeIcon();
        if (themeBtn) themeBtn.addEventListener('click', () => {
            theme.toggle();
            paintThemeIcon();
        });

        /* ---- account menu ---- */
        const accountBtn = document.getElementById('accountBtn');
        const accountMenu = document.getElementById('accountMenu');
        if (accountBtn && accountMenu) {
            accountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = accountMenu.classList.toggle('hidden');
                accountBtn.setAttribute('aria-expanded', String(!open));
            });
            document.addEventListener('click', () => {
                accountMenu.classList.add('hidden');
                accountBtn.setAttribute('aria-expanded', 'false');
            });
            accountMenu.addEventListener('click', (e) => e.stopPropagation());
        }

        const resetBtn = document.getElementById('resetDemo');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                const ok = await root.TMH.confirm({
                    title: 'Reset demo data?',
                    body: 'Every change you have made in this browser is discarded and the panel goes back to the seeded content.',
                    danger: true,
                    icon: 'fa-rotate-left',
                    confirmLabel: 'Reset everything',
                });
                if (!ok) return;
                root.TMH.store.reset();
                root.TMH.toast.success('Demo data reset', { body: 'Reloading…' });
                setTimeout(() => location.reload(), 700);
            });
        }

        /* ---- global search: "/" focuses it, like the public site's shortcut ---- */
        const search = document.getElementById('globalSearch');
        document.addEventListener('keydown', (e) => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
                || e.target.isContentEditable;
            if (e.key === '/' && !typing && search) {
                e.preventDefault();
                search.focus();
            }
        });
        wireGlobalSearch();

        const bell = document.getElementById('bellBtn');
        if (bell) {
            bell.addEventListener('click', () => {
                root.TMH.toast.info('4 new enquiries', {
                    body: 'Notification centre lands with the backend.',
                    action: { label: 'Open enquiries', onClick: () => { location.href = 'enquiries.html'; } },
                });
            });
        }

        /* ---- pill: resync on every event that can move the item ---- */
        const pill = document.getElementById('navPill');
        requestAnimationFrame(() => {
            syncPill();
            requestAnimationFrame(() => pill && pill.classList.remove('no-anim'));
        });
        root.addEventListener('load', syncPill);
        root.addEventListener('resize', syncPill);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncPill);
        const track = document.getElementById('navTrack');
        if (track && root.ResizeObserver) new ResizeObserver(syncPill).observe(track);

        /* Scroll the active item into view — the System group sits well below
           the fold on a short viewport. */
        const active = document.querySelector('.nav-item.active');
        if (active && track) {
            const top = active.offsetTop;
            if (top > track.clientHeight - 80) track.scrollTop = top - track.clientHeight / 2;
        }
    }

    root.TMH = root.TMH || {};
    root.TMH.layout = { mount, pageHead, syncPill, theme };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
}(window));
