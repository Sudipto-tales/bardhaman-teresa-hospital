/* Dashboard — docs/03-page-specs.md §3.

   One call: store.summary() is GET /api/dashboard/summary. Every figure on
   this screen is worked out server-side, because "drafts untouched for a
   week" across nine collections is a question the browser can only answer by
   downloading nine collections. */
(function () {
    'use strict';

    const { util: U, store, layout, toast } = window.TMH;

    /* Where an entity name coming back from the API opens. The server names
       collections; which screen edits them is the panel's business. */
    const SCREEN = {
        doctors: 'doctors.html',
        leadership: 'leadership.html',
        departments: 'departments.html',
        facilities: 'facilities.html',
        'lab-tests': 'lab-tests.html',
        posts: 'blog.html',
        categories: 'blog-categories.html',
        testimonials: 'testimonials.html',
        faqs: 'faqs.html',
        counters: 'stats.html',
        'nav-items': 'navigation.html',
        redirects: 'redirects.html',
        jobs: 'jobs.html',
        applications: 'applications.html',
        enquiries: 'enquiries.html',
        appointments: 'appointments.html',
        users: 'users.html',
        roles: 'users.html',
        media: 'gallery.html',
        pages: 'pages.html',
        settings: 'settings-general.html',
        auth: 'activity-log.html',
    };

    const NOUN = {
        doctors: 'Doctors', leadership: 'Leadership', departments: 'Departments',
        facilities: 'Facilities', 'lab-tests': 'Lab tests', posts: 'Blog',
        categories: 'Categories', testimonials: 'Testimonials', faqs: 'FAQs',
        counters: 'Counters', 'nav-items': 'Navigation', redirects: 'Redirects',
        jobs: 'Vacancies', applications: 'Applications', enquiries: 'Enquiries',
        appointments: 'Appointments', users: 'Users', roles: 'Roles',
        media: 'Media', pages: 'Pages', settings: 'Settings', auth: 'Account',
    };

    const TILE_ICON = {
        enquiries: ['fa-envelope-open-text', 'red'],
        appointmentRequests: ['fa-calendar-check', 'navy'],
        publishedPosts: ['fa-newspaper', 'blue'],
        activeVacancies: ['fa-bullhorn', 'magenta'],
    };

    const ATTENTION_ICON = {
        staleDrafts: 'fa-pen-ruler',
        unansweredEnquiries: 'fa-envelope-open-text',
        closingVacancies: 'fa-hourglass-half',
        mediaMissingAlt: 'fa-image',
    };

    const ACTION_TONE = {
        create: 'ok', update: 'info', publish: 'ok',
        delete: 'off', restore: 'info', login: 'off', logout: 'off', view: 'off',
    };

    const screenFor = (entity) => SCREEN[entity] || 'dashboard.html';
    const nounFor = (entity) => NOUN[entity] || entity;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        const who = window.TMH.session ? window.TMH.session.currentSync() : null;
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : (hour < 17 ? 'Good afternoon' : 'Good evening');

        document.getElementById('pageHead').innerHTML = layout.pageHead({
            title: `${greeting},`,
            accent: (who && who.name ? who.name.split(' ')[0] : 'there'),
            sub: 'What has come in, and what is waiting on you.',
            actions: '<a class="btn btn--ghost" href="../../website.html" target="_blank" rel="noopener">'
                + '<i class="fa-solid fa-arrow-up-right-from-square"></i> View website</a>',
        });

        const view = document.getElementById('view');
        view.innerHTML = skeleton();

        let data;
        try {
            data = await store.summary();
        } catch (e) {
            view.innerHTML = `
                <article class="card"><div class="empty">
                    <div class="empty__art"><i class="fa-solid fa-plug-circle-xmark"></i></div>
                    <h3>The dashboard could not load</h3>
                    <p>${U.esc(e.message || 'Something went wrong.')}</p>
                    <button type="button" class="btn btn--primary" id="retry">Try again</button>
                </div></article>`;
            const retry = document.getElementById('retry');
            if (retry) retry.addEventListener('click', init);
            return;
        }

        view.innerHTML = `
            ${statsHtml(data.stats)}
            ${data.setup && !data.setup.complete ? setupHtml(data.setup) : ''}
            <div class="bento">
                <article class="card c8">
                    <div class="card__head">
                        <h2>Recent enquiries</h2>
                        <a class="btn btn--ghost btn--sm" href="enquiries.html">All enquiries</a>
                    </div>
                    ${enquiriesHtml(data.recentEnquiries)}
                </article>

                <article class="card c4">
                    <div class="card__head"><h2>Needs attention</h2></div>
                    ${attentionHtml(data.attention)}
                </article>

                <article class="card c4">
                    <div class="card__head"><h2>Quick actions</h2></div>
                    ${quickActionsHtml()}
                </article>

                <article class="card c8">
                    <div class="card__head">
                        <h2>Recently edited</h2>
                        <a class="btn btn--ghost btn--sm" href="activity-log.html">Activity log</a>
                    </div>
                    ${activityHtml(data.recentActivity)}
                </article>
            </div>`;

        /* One delegated listener rather than a handler per row — the table is
           rewritten wholesale on every load, and per-row handlers would have
           to be rebound with it. */
        view.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-href]');
            if (row && !e.target.closest('a')) location.href = row.dataset.href;
        });

        U.stagger(view);
    }

    /* ---------------------------------------------------------
       Stat strip
       --------------------------------------------------------- */

    /* Not util.statStrip(): that one renders a flat note, and these tiles
       carry a signed delta that has to be coloured and to read differently
       when there is nothing to compare against. */
    function statsHtml(stats) {
        return `<div class="bento mb-4">${(stats || []).map((s) => {
            const [icon, tone] = TILE_ICON[s.key] || ['fa-chart-simple', 'navy'];
            return `
            <article class="card stat c3 anim-item">
                <div class="stat__icon ${U.esc(tone)}"><i class="fa-solid ${U.esc(icon)}"></i></div>
                <h3>${U.esc(U.num(s.value))}</h3>
                <p>${U.esc(s.label)}</p>
                ${deltaHtml(s)}
            </article>`;
        }).join('')}</div>`;
    }

    /**
     * The delta chip.
     *
     * A zero delta is flat, not green: "no change" is not good news and not
     * bad news. And a first-ever period says so rather than showing an
     * infinite rise — deltaPercent is null exactly when there is nothing to
     * divide by, which is why the server sends null instead of 0.
     */
    function deltaHtml(s) {
        if (typeof s.delta !== 'number') return '<span class="delta flat"></span>';

        if (s.previous === 0 && s.delta === 0) {
            return `<span class="delta flat">Nothing yet — against ${U.esc(s.deltaOf)}</span>`;
        }

        if (s.previous === 0) {
            return `<span class="delta up"><i class="fa-solid fa-arrow-up"></i> First against ${U.esc(s.deltaOf)}</span>`;
        }

        const tone = s.delta === 0 ? 'flat' : (s.delta > 0 ? 'up' : 'down');
        const arrow = s.delta === 0 ? '' : `<i class="fa-solid fa-arrow-${s.delta > 0 ? 'up' : 'down'}"></i> `;
        const size = s.deltaPercent === null
            ? `${s.delta > 0 ? '+' : ''}${s.delta}`
            : `${s.deltaPercent > 0 ? '+' : ''}${s.deltaPercent}%`;

        return `<span class="delta ${tone}">${arrow}${U.esc(s.delta === 0 ? 'No change' : size)}`
            + ` <span class="muted">vs ${U.esc(s.deltaOf)}</span></span>`;
    }

    /* ---------------------------------------------------------
       Cards
       --------------------------------------------------------- */

    function setupHtml(setup) {
        const done = setup.steps.filter((s) => s.done).length;

        return `
        <article class="card mb-4 anim-item">
            <div class="card__head">
                <h2>Finish setting up</h2>
                <span class="pill">${done} of ${setup.steps.length} done</span>
            </div>
            <ul class="checklist">
                ${setup.steps.map((s) => `
                    <li class="checklist__item${s.done ? ' is-done' : ''}">
                        <i class="fa-solid fa-${s.done ? 'circle-check' : 'circle'}"></i>
                        ${s.done
                            ? `<span>${U.esc(s.label)}</span>`
                            : `<a href="${U.esc(s.href)}">${U.esc(s.label)}</a>`}
                    </li>`).join('')}
            </ul>
        </article>`;
    }

    function enquiriesHtml(rows) {
        if (!rows || !rows.length) {
            return '<div class="empty--sm">No enquiries yet. They land here the moment the contact form is used.</div>';
        }

        return `
        <div class="table-wrap">
            <table class="data-table">
                <thead><tr><th>From</th><th>Subject</th><th>Status</th><th>Received</th></tr></thead>
                <tbody>
                    ${rows.map((r) => `
                        <tr data-href="enquiry-view.html?id=${U.esc(encodeURIComponent(r.id))}">
                            <td>
                                <span class="cell-main">${U.esc(r.name)}</span>
                                <span class="cell-sub">${U.esc(r.email || r.phone || '')}</span>
                            </td>
                            <td>${U.esc(r.subject || '—')}</td>
                            <td><span class="tag ${r.status === 'new' ? 'warn' : (r.status === 'replied' ? 'ok' : 'off')}">${U.esc(r.status)}</span></td>
                            <td><span class="muted" title="${U.esc(U.fmtDateTime(r.receivedAt))}">${U.esc(U.ago(r.receivedAt))}</span></td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    }

    function attentionHtml(items) {
        if (!items || !items.length) {
            return '<div class="empty--sm"><i class="fa-solid fa-mug-hot"></i> Nothing is waiting on you.</div>';
        }

        return `<ul class="feed">${items.map((it) => {
            /* An attention item may name a filtered destination — "4 enquiries
               with no reply" should land on those four, not on the full list. */
            const qs = it.query
                ? '?' + Object.entries(it.query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
                : '';
            const href = it.entity ? screenFor(it.entity) + qs : '';
            const label = `<b>${U.esc(it.label)}</b>`;

            return `
            <li class="feed__item">
                <span class="feed__icon warn"><i class="fa-solid ${U.esc(ATTENTION_ICON[it.key] || 'fa-triangle-exclamation')}"></i></span>
                <span class="feed__body">
                    ${href ? `<a href="${U.esc(href)}">${label}</a>` : label}
                    ${it.breakdown && it.breakdown.length
                        ? `<span class="feed__meta">${it.breakdown.map((b) =>
                            `<a href="${U.esc(screenFor(b.entity))}?status=draft">${U.esc(nounFor(b.entity))} ${b.count}</a>`).join(' · ')}</span>`
                        : ''}
                </span>
            </li>`;
        }).join('')}</ul>`;
    }

    function quickActionsHtml() {
        const actions = [
            ['fa-user-doctor', 'Add a doctor', 'doctor-form.html'],
            ['fa-pen-nib', 'Write a post', 'blog-form.html'],
            ['fa-bullhorn', 'Post a vacancy', 'job-form.html'],
            ['fa-address-book', 'Edit contact details', 'settings-contact.html'],
        ];

        return `<div class="quick-actions">${actions.map(([icon, label, href]) => `
            <a class="quick-action" href="${U.esc(href)}">
                <i class="fa-solid ${U.esc(icon)}"></i>
                <span>${U.esc(label)}</span>
            </a>`).join('')}</div>`;
    }

    function activityHtml(rows) {
        if (!rows || !rows.length) {
            return '<div class="empty--sm">Nothing has been edited yet.</div>';
        }

        /* userName is on the row because the log stores it — an account can be
           deleted and the entry still has to say who. The lookup is only a
           fallback for the seeded rows, which carry userId alone. */
        const users = store.available('users') ? store.allSync('users') : [];
        const nameOf = (row) => row.userName
            || (users.find((u) => u.id === row.userId) || {}).name
            || 'Someone';

        return `<ul class="feed">${rows.map((r) => `
            <li class="feed__item">
                <span class="feed__icon ${U.esc(ACTION_TONE[r.action] || 'info')}">
                    <i class="fa-solid fa-${r.action === 'delete' ? 'trash' : (r.action === 'create' ? 'plus' : 'pen')}"></i>
                </span>
                <span class="feed__body">
                    <b>${U.esc(nameOf(r))}</b>
                    <span>${U.esc(r.summary || `${r.action} ${nounFor(r.entity)}`)}</span>
                    <span class="feed__meta">
                        ${r.entity ? `<a href="${U.esc(screenFor(r.entity))}">${U.esc(nounFor(r.entity))}</a> · ` : ''}
                        <span title="${U.esc(U.fmtDateTime(r.at))}">${U.esc(U.ago(r.at))}</span>
                    </span>
                </span>
            </li>`).join('')}</ul>`;
    }

    /* ---------------------------------------------------------
       Loading
       --------------------------------------------------------- */

    /* Skeletons in the shape of what arrives, not a spinner over the page —
       the global loading rule in docs/03-page-specs.md. */
    function skeleton() {
        const line = (w, h) => `<div class="skel" style="width:${w}%${h ? `;height:${h}px` : ''}"></div>`;
        const tile = `<article class="card stat c3" style="gap:var(--s3)">
            <div class="skel skel--circle"></div>${line(45, 22)}${line(60)}</article>`;
        const block = (span) => `<article class="card ${span}" style="display:flex;flex-direction:column;gap:var(--s4)">
            ${line(35, 16)}${line(100)}${line(90)}${line(95)}${line(70)}</article>`;

        return `<div class="bento mb-4">${tile.repeat(4)}</div>`
            + `<div class="bento">${block('c8')}${block('c4')}</div>`;
    }
}());
