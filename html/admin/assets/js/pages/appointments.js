/* Appointment requests — the booking form's queue.

   Two views over the same data: a table for triage and a day view for "what
   does Thursday morning look like". The day view is not a calendar and does
   not pretend to be one — the hospital's slots live in the HIS, and inventing
   a second source of truth for them here would be worse than useless. It
   groups requests by the half-day they asked for, and nothing more. */
(function () {
    'use strict';

    const { util: U, store, table, layout, toast, modal, confirm: confirmDialog } = window.TMH;

    const STATUS = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const TONE = {
        pending: 'warn', confirmed: 'info', completed: 'ok', cancelled: 'off',
    };

    const SLOTS = ['Morning', 'Afternoon', 'Evening'];

    const CANCEL_REASONS = [
        'Slot no longer available',
        'Patient rescheduled',
        'Patient did not respond',
        'Duplicate request',
        'Doctor unavailable',
    ];

    let list = null;
    let doctors = [];
    let departments = [];
    let day = U.param('day') || todayIso();

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        [doctors, departments] = await Promise.all([
            store.all('doctors'),
            store.all('departments'),
        ]);

        const rows = await store.all('appointments');

        document.getElementById('pageHead').innerHTML = layout.pageHead({
            crumb: [{ label: 'Growth' }, { label: 'Appointments' }],
            title: 'Appointment requests',
            sub: 'What the booking form collected. Confirming one is a promise to the patient — the call still has to happen.',
            actions: `
                <div class="row gap-1">
                    <button type="button" class="btn ${isDayView() ? 'btn--ghost' : 'btn--soft'}" data-view="table">
                        <i class="fa-solid fa-table-list"></i> Table</button>
                    <button type="button" class="btn ${isDayView() ? 'btn--soft' : 'btn--ghost'}" data-view="day">
                        <i class="fa-solid fa-calendar-day"></i> Day</button>
                </div>`,
        });

        document.getElementById('pageHead').querySelectorAll('[data-view]').forEach((b) =>
            b.addEventListener('click', () => {
                U.setParams({ view: b.dataset.view === 'day' ? 'day' : null });
                window.location.reload();
            }));

        const pending = rows.filter((r) => r.status === 'pending');

        document.getElementById('view').innerHTML = `
            ${U.statStrip([
                ['fa-hourglass-half', 'red', pending.length, 'Awaiting confirmation', pending.length ? 'Call these back' : 'All caught up'],
                ['fa-calendar-check', 'navy', rows.filter((r) => r.status === 'confirmed').length, 'Confirmed', 'Slot given to the patient'],
                ['fa-calendar-day', 'blue', rows.filter((r) => dateOf(r) === todayIso() && r.status !== 'cancelled').length, 'Today', 'Requested or booked for today'],
                ['fa-calendar-xmark', 'magenta', rows.filter((r) => r.status === 'cancelled').length, 'Cancelled', ''],
            ])}
            <div id="body"></div>`;
        U.stagger(document.getElementById('view'));

        if (isDayView()) renderDay();
        else renderTable();
    }

    const isDayView = () => U.param('view') === 'day';

    /* ---------- table view ---------- */

    function renderTable() {
        document.getElementById('body').innerHTML = '<article class="card card--flush" id="listCard"></article>';

        list = table.create({
            mount: '#listCard',
            entity: 'appointments',
            searchFields: ['patientName', 'phone', 'email', 'reason'],
            searchPlaceholder: 'Search patient, phone or reason',
            statusOptions: STATUS,
            filters: [
                { key: 'departmentId', label: 'Department', options: departments.map((d) => ({ value: d.id, label: d.name })) },
                { key: 'doctorId', label: 'Doctor', options: doctors.map((d) => ({ value: d.id, label: d.name })) },
                { key: 'preferredSlot', label: 'Slot', options: SLOTS.map((s) => ({ value: s, label: s })) },
                {
                    key: 'when',
                    label: 'When',
                    options: [
                        { value: 'today', label: 'Today' },
                        { value: 'upcoming', label: 'Upcoming' },
                        { value: 'past', label: 'Past' },
                    ],
                    match: (r, v) => {
                        const d = dateOf(r);
                        if (v === 'today') return d === todayIso();
                        if (v === 'upcoming') return d > todayIso();
                        return d < todayIso();
                    },
                },
            ],
            sort: 'preferredDate',
            dir: 'asc',
            rowClass: (r) => (r.status === 'pending' ? 'is-unread' : ''),
            bulkActions: [
                { key: 'confirm', label: 'Confirm', icon: 'fa-circle-check', onClick: bulkConfirm },
                { key: 'cancel', label: 'Cancel', icon: 'fa-ban', danger: true, onClick: bulkCancel },
            ],
            columns: [
                {
                    label: 'Patient', sort: 'patientName', width: '22%',
                    render: (r, s) => `
                        <div class="cell-media">
                            <span class="avatar" style="display:grid;place-items:center;font-size:11px;font-weight:700;color:var(--text-mid)">${U.esc(U.initials(r.patientName))}</span>
                            <span>
                                <span class="cell-main">${U.mark(r.patientName, s.q)}</span>
                                <span class="cell-sub">${U.esc(r.phone || r.email || 'No contact given')}</span>
                            </span>
                        </div>`,
                },
                {
                    label: 'With', width: '22%',
                    render: (r) => {
                        const doc = doctors.find((d) => d.id === r.doctorId);
                        const dep = departments.find((d) => d.id === r.departmentId);
                        return `
                            <span class="cell-main">${doc ? U.esc(doc.name) : '<span class="muted">No doctor named</span>'}</span>
                            <span class="cell-sub">${dep ? U.esc(dep.name) : 'General'}</span>`;
                    },
                },
                {
                    label: 'Asked for', sort: 'preferredDate', width: '16%',
                    render: (r) => `
                        <span class="cell-main">${U.esc(U.fmtDate(r.preferredDate))}</span>
                        <span class="cell-sub">${U.esc(r.preferredSlot || '—')}</span>`,
                },
                {
                    label: 'Confirmed for', width: '15%',
                    render: (r) => (r.confirmedSlot
                        ? `<span class="cell-main">${U.esc(r.confirmedSlot)}</span>`
                        : '<span class="muted">—</span>'),
                },
                { label: 'Reason', width: '15%', render: (r) => `<span class="clamp-2">${U.esc(r.reason || '—')}</span>` },
                {
                    label: 'Status', sort: 'status', width: '10%',
                    render: (r) => statusTag(r),
                },
            ],
            rowActions: (row) => [
                { label: 'Open', icon: 'fa-eye', onClick: () => openDrawer(row) },
                ...(row.phone ? [{ label: 'Call patient', icon: 'fa-phone', onClick: () => call(row) }] : []),
                { divider: true },
                ...(row.status === 'pending'
                    ? [{ label: 'Confirm', icon: 'fa-circle-check', onClick: () => confirmOne(row) }]
                    : []),
                ...(row.status === 'confirmed'
                    ? [
                        { label: 'Reschedule', icon: 'fa-calendar-day', onClick: () => confirmOne(row, true) },
                        { label: 'Mark completed', icon: 'fa-clipboard-check', onClick: () => setStatus(row, 'completed', 'Marked completed') },
                    ]
                    : []),
                ...(row.status === 'cancelled'
                    ? [{ label: 'Reopen', icon: 'fa-rotate-left', onClick: () => setStatus(row, 'pending', 'Moved back to pending') }]
                    : [{ label: 'Cancel', icon: 'fa-ban', danger: true, onClick: () => cancelOne(row) }]),
                { divider: true },
                { label: 'Delete', icon: 'fa-trash', danger: true, onClick: () => remove(row) },
            ],
            onRowClick: openDrawer,
            empty: {
                icon: 'fa-calendar-check', title: 'No appointment requests',
                text: 'They will land here once the booking form is wired to the backend.',
            },
        });
    }

    /* ---------- day view ---------- */

    function renderDay() {
        const rows = store.allSync('appointments')
            .filter((r) => dateOf(r) === day && r.status !== 'cancelled');

        document.getElementById('body').innerHTML = `
            <article class="card anim-item">
                <div class="card__head">
                    <h3>${U.esc(U.fmtDate(day))}${day === todayIso() ? ' <span class="chip">Today</span>' : ''}</h3>
                    <div class="grow"></div>
                    <div class="row gap-1">
                        <button type="button" class="icon-btn" data-day="-1" aria-label="Previous day"><i class="fa-solid fa-chevron-left"></i></button>
                        <input type="date" id="dayPick" value="${U.esc(day)}"
                               style="height:32px;padding:0 10px;border:1px solid var(--hairline);border-radius:var(--radius-sm);background:var(--surface-2);font-size:var(--fs-sm)">
                        <button type="button" class="icon-btn" data-day="1" aria-label="Next day"><i class="fa-solid fa-chevron-right"></i></button>
                        <button type="button" class="btn btn--ghost btn--sm" data-today>Today</button>
                    </div>
                </div>

                ${rows.length ? `
                <div class="dayview">
                    ${SLOTS.map((slot) => {
                        const inSlot = rows.filter((r) => (r.preferredSlot || 'Morning') === slot);
                        return `
                        <section class="dayview__col">
                            <div class="dayview__head">
                                <span>${U.esc(slot)}</span>
                                <span>${inSlot.length}</span>
                            </div>
                            ${inSlot.length ? inSlot.map((r) => {
                                const doc = doctors.find((d) => d.id === r.doctorId);
                                return `
                                <article class="slot-card slot-card--${U.esc(r.status)}" data-open="${U.esc(r.id)}"
                                         tabindex="0" role="button">
                                    <div class="slot-card__name">${U.esc(r.patientName)}</div>
                                    <div class="slot-card__meta">${doc ? U.esc(doc.name) : 'No doctor named'}</div>
                                    <div class="slot-card__meta">${r.confirmedSlot ? U.esc(r.confirmedSlot.slice(11) || r.confirmedSlot) : U.esc(r.phone || '')}</div>
                                    <div class="mt-2">${statusTag(r)}</div>
                                </article>`;
                            }).join('') : '<p class="text-xs muted">Nothing booked.</p>'}
                        </section>`;
                    }).join('')}
                </div>`
                : `
                <div class="empty">
                    <div class="empty__art"><i class="fa-solid fa-calendar-day"></i></div>
                    <h3>Nothing on this day</h3>
                    <p>No requests asked for ${U.esc(U.fmtDate(day))}.</p>
                </div>`}
            </article>`;

        U.stagger(document.getElementById('body'));

        const body = document.getElementById('body');

        body.querySelectorAll('[data-day]').forEach((b) =>
            b.addEventListener('click', () => setDay(shift(day, Number(b.dataset.day)))));

        body.querySelector('[data-today]').addEventListener('click', () => setDay(todayIso()));

        body.querySelector('#dayPick').addEventListener('change', (e) => {
            if (e.target.value) setDay(e.target.value);
        });

        body.querySelectorAll('[data-open]').forEach((card) => {
            const go = () => {
                const r = store.allSync('appointments').find((x) => x.id === card.dataset.open);
                if (r) openDrawer(r);
            };
            card.addEventListener('click', go);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    go();
                }
            });
        });
    }

    function setDay(next) {
        day = next;
        U.setParams({ day: next });
        renderDay();
    }

    /* ---------- drawer ---------- */

    async function openDrawer(row) {
        const doc = doctors.find((d) => d.id === row.doctorId);
        const dep = departments.find((d) => d.id === row.departmentId);

        await modal.drawer({
            title: row.patientName,
            html: `
                <div class="col gap-6">
                    <div>
                        <div class="eyebrow mb-4">Request</div>
                        <dl class="kv">
                            <dt>Status</dt><dd>${statusTag(row)}</dd>
                            <dt>Asked for</dt><dd>${U.esc(U.fmtDate(row.preferredDate))} · ${U.esc(row.preferredSlot || '—')}</dd>
                            ${row.confirmedSlot ? `<dt>Confirmed</dt><dd>${U.esc(row.confirmedSlot)}</dd>` : ''}
                            <dt>Department</dt><dd>${U.esc(dep ? dep.name : 'General')}</dd>
                            <dt>Doctor</dt><dd>${U.esc(doc ? doc.name : 'Not named')}</dd>
                            <dt>Requested</dt><dd>${U.esc(U.ago(row.createdAt))}</dd>
                        </dl>
                    </div>

                    <div>
                        <div class="eyebrow mb-4">Contact</div>
                        <dl class="kv">
                            <dt>Phone</dt>
                            <dd>${row.phone ? `<a href="tel:${U.esc(row.phone.replace(/\s+/g, ''))}">${U.esc(row.phone)}</a>` : '<span class="muted">Not given</span>'}</dd>
                            <dt>Email</dt>
                            <dd>${row.email ? `<a href="mailto:${U.esc(row.email)}">${U.esc(row.email)}</a>` : '<span class="muted">Not given</span>'}</dd>
                        </dl>
                    </div>

                    <div>
                        <div class="eyebrow mb-4">Reason given</div>
                        <p class="text-sm mid">${U.esc(row.reason || 'None given.')}</p>
                    </div>

                    ${row.cancelReason ? `
                    <div>
                        <div class="eyebrow mb-4">Cancelled because</div>
                        <p class="text-sm mid">${U.esc(row.cancelReason)}</p>
                    </div>` : ''}
                </div>`,
            footer: `
                ${row.status === 'pending'
                    ? '<button type="button" class="btn btn--primary grow" data-act="confirm"><i class="fa-solid fa-circle-check"></i> Confirm</button>'
                    : ''}
                ${row.status === 'confirmed'
                    ? `<button type="button" class="btn btn--ghost grow" data-act="reschedule"><i class="fa-solid fa-calendar-day"></i> Reschedule</button>
                       <button type="button" class="btn btn--primary grow" data-act="complete"><i class="fa-solid fa-clipboard-check"></i> Completed</button>`
                    : ''}
                ${row.status === 'cancelled'
                    ? '<button type="button" class="btn btn--ghost grow" data-act="reopen"><i class="fa-solid fa-rotate-left"></i> Reopen</button>'
                    : '<button type="button" class="btn btn--danger" data-act="cancel"><i class="fa-solid fa-ban"></i> Cancel</button>'}`,
            onMount(panel, close) {
                const acts = {
                    confirm: () => confirmOne(row),
                    reschedule: () => confirmOne(row, true),
                    complete: () => setStatus(row, 'completed', 'Marked completed'),
                    reopen: () => setStatus(row, 'pending', 'Moved back to pending'),
                    cancel: () => cancelOne(row),
                };
                panel.querySelectorAll('[data-act]').forEach((b) =>
                    b.addEventListener('click', async () => {
                        close();
                        await acts[b.dataset.act]();
                    }));
            },
        });
    }

    /* ---------- actions ---------- */

    function statusTag(row) {
        const s = STATUS.find((x) => x.value === row.status);
        return `<span class="tag ${TONE[row.status] || 'off'}">${U.esc(s ? s.label : row.status || 'Unknown')}</span>`;
    }

    function call(row) {
        window.location.href = `tel:${row.phone.replace(/\s+/g, '')}`;
    }

    async function confirmOne(row, reschedule) {
        const picked = await modal.open({
            title: reschedule ? `Reschedule ${row.patientName}` : `Confirm ${row.patientName}`,
            icon: reschedule ? 'fa-calendar-day' : 'fa-circle-check',
            subtitle: reschedule
                ? 'The patient has to be told about a change — this does not tell them.'
                : `Asked for ${U.fmtDate(row.preferredDate)}, ${String(row.preferredSlot || '').toLowerCase()}.`,
            html: `
                <div class="form-grid">
                    <div class="field">
                        <label for="cDate">Date <span class="field__req">*</span></label>
                        <input type="date" id="cDate" value="${U.esc(dateOf(row))}">
                    </div>
                    <div class="field">
                        <label for="cTime">Time <span class="field__req">*</span></label>
                        <input type="time" id="cTime" value="${U.esc(timeOf(row) || defaultTime(row.preferredSlot))}">
                    </div>
                    <div class="field field--wide">
                        <small>Phase 1 records the slot. Phase 2 sends the SMS and the calendar
                            invite, and checks the doctor is actually free.</small>
                    </div>
                </div>`,
            footer: `
                <button type="button" class="btn btn--ghost" data-cancel>Back</button>
                <button type="button" class="btn btn--primary" data-ok>
                    ${reschedule ? 'Save new slot' : 'Confirm slot'}</button>`,
            onMount(panel, close) {
                panel.querySelector('[data-cancel]').addEventListener('click', () => close(undefined));
                panel.querySelector('[data-ok]').addEventListener('click', () => {
                    const d = panel.querySelector('#cDate').value;
                    const t = panel.querySelector('#cTime').value;
                    if (!d || !t) {
                        toast.warning('Pick a date and a time');
                        return;
                    }
                    close(`${d} ${t}`);
                });
            },
        });

        if (!picked) return;

        const before = { status: row.status, confirmedSlot: row.confirmedSlot || '', confirmedAt: row.confirmedAt || '' };

        await store.update('appointments', row.id, {
            status: 'confirmed',
            confirmedSlot: picked,
            confirmedAt: new Date().toISOString(),
        });

        toast.success(reschedule ? 'Slot changed' : 'Patient notified', {
            body: `${row.patientName} — ${picked}.`,
            undo: async () => {
                await store.update('appointments', row.id, before);
                toast.success('Reverted');
                refresh();
            },
        });
        refresh();
    }

    async function cancelOne(row) {
        const reason = await modal.open({
            title: `Cancel ${row.patientName}'s request`,
            icon: 'fa-ban',
            subtitle: 'The reason is kept on the record, so the next person to call knows what happened.',
            html: `
                <div class="form-grid">
                    <div class="field field--wide">
                        <label for="cReason">Reason <span class="field__req">*</span></label>
                        <select id="cReason">
                            <option value="">Choose a reason…</option>
                            ${CANCEL_REASONS.map((r) => `<option value="${U.esc(r)}">${U.esc(r)}</option>`).join('')}
                            <option value="__other">Something else…</option>
                        </select>
                    </div>
                    <div class="field field--wide hidden" id="otherWrap">
                        <label for="cOther">Details</label>
                        <input type="text" id="cOther" placeholder="What happened?">
                    </div>
                </div>`,
            footer: `
                <button type="button" class="btn btn--ghost" data-cancel>Back</button>
                <button type="button" class="btn btn--danger" data-ok>Cancel request</button>`,
            onMount(panel, close) {
                const sel = panel.querySelector('#cReason');
                const wrap = panel.querySelector('#otherWrap');

                sel.addEventListener('change', () => {
                    wrap.classList.toggle('hidden', sel.value !== '__other');
                    if (sel.value === '__other') panel.querySelector('#cOther').focus();
                });

                panel.querySelector('[data-cancel]').addEventListener('click', () => close(undefined));
                panel.querySelector('[data-ok]').addEventListener('click', () => {
                    const value = sel.value === '__other'
                        ? panel.querySelector('#cOther').value.trim()
                        : sel.value;
                    if (!value) {
                        toast.warning('Give a reason', { body: 'It is the only record of why this was dropped.' });
                        return;
                    }
                    close(value);
                });
            },
        });

        if (!reason) return;

        const before = { status: row.status, cancelReason: row.cancelReason || '' };
        await store.update('appointments', row.id, { status: 'cancelled', cancelReason: reason });

        toast.success('Request cancelled', {
            body: row.phone ? `Call ${row.phone} to tell them — Phase 1 sends nothing.` : '',
            undo: async () => {
                await store.update('appointments', row.id, before);
                toast.success('Reverted');
                refresh();
            },
        });
        refresh();
    }

    async function setStatus(row, status, message) {
        const before = row.status;
        await store.update('appointments', row.id, { status });
        toast.success(message, {
            undo: async () => {
                await store.update('appointments', row.id, { status: before });
                toast.success('Reverted');
                refresh();
            },
        });
        refresh();
    }

    async function remove(row) {
        const ok = await confirmDialog({
            title: 'Delete this request?',
            body: `${row.patientName}, ${U.fmtDate(row.preferredDate)}. Cancelling keeps the record and the reason; deleting does not.`,
            danger: true,
            confirmLabel: 'Delete',
        });
        if (!ok) return;

        const removed = await store.remove('appointments', row.id);
        toast.success('Request deleted', {
            undo: async () => {
                await store.restore('appointments', removed.row, removed.index);
                toast.success('Request restored');
                refresh();
            },
        });
        refresh();
    }

    /* ---------- bulk ---------- */

    async function bulkConfirm(ids, ctl) {
        /* Bulk confirm keeps each patient's own preferred day and the default
           time for their half-day. Anything else would be one slot handed to
           several people at once. */
        const ok = await confirmDialog({
            title: `Confirm ${ids.length} request${ids.length === 1 ? '' : 's'}?`,
            body: 'Each is confirmed for the day and half-day the patient asked for. Use the row action if a slot needs a specific time.',
            confirmLabel: `Confirm ${ids.length}`,
        });
        if (!ok) return;

        const rows = store.allSync('appointments').filter((r) => ids.includes(String(r.id)));
        const before = rows.map((r) => ({
            id: r.id, status: r.status, confirmedSlot: r.confirmedSlot || '', confirmedAt: r.confirmedAt || '',
        }));

        await Promise.all(rows.map((r) => store.update('appointments', r.id, {
            status: 'confirmed',
            confirmedSlot: `${dateOf(r)} ${defaultTime(r.preferredSlot)}`,
            confirmedAt: new Date().toISOString(),
        })));

        ctl.clear();
        toast.success(`${rows.length} confirmed`, {
            body: 'Patients still have to be told — Phase 1 sends nothing.',
            undo: async () => {
                await Promise.all(before.map((b) => store.update('appointments', b.id, b)));
                toast.success('Reverted');
                ctl.reload();
            },
        });
        ctl.reload();
    }

    async function bulkCancel(ids, ctl) {
        const ok = await confirmDialog({
            title: `Cancel ${ids.length} request${ids.length === 1 ? '' : 's'}?`,
            body: 'They keep their records; the reason is logged as a bulk cancellation.',
            danger: true,
            confirmLabel: `Cancel ${ids.length}`,
        });
        if (!ok) return;

        const rows = store.allSync('appointments').filter((r) => ids.includes(String(r.id)));
        const before = rows.map((r) => ({ id: r.id, status: r.status, cancelReason: r.cancelReason || '' }));

        await store.bulk('appointments', ids, 'patch', {
            status: 'cancelled',
            cancelReason: 'Cancelled in bulk from the panel',
        });

        ctl.clear();
        toast.success(`${rows.length} cancelled`, {
            undo: async () => {
                await Promise.all(before.map((b) => store.update('appointments', b.id, b)));
                toast.success('Reverted');
                ctl.reload();
            },
        });
        ctl.reload();
    }

    /* ---------- dates ---------- */

    function refresh() {
        if (isDayView()) renderDay();
        else if (list) list.load();
    }

    /* Local dates throughout. toISOString() would report yesterday for the
       first 5.5 hours of every IST day, which is exactly when the morning
       desk is looking at this screen. */
    function todayIso() {
        return U.dateInput(new Date());
    }

    /* The date this row belongs on: what was confirmed if anything was, what
       was asked for otherwise. */
    function dateOf(row) {
        return (row.confirmedSlot || '').slice(0, 10) || row.preferredDate || '';
    }

    function timeOf(row) {
        return (row.confirmedSlot || '').slice(11, 16);
    }

    function defaultTime(slot) {
        if (slot === 'Afternoon') return '15:00';
        if (slot === 'Evening') return '18:00';
        return '10:00';
    }

    function shift(iso, days) {
        const d = new Date(`${iso}T00:00:00`);
        d.setDate(d.getDate() + days);
        return U.dateInput(d);
    }
}());
