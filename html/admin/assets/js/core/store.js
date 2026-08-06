/* =========================================================
   Mock data layer — PHASE 1 ONLY.

   Seeds from window.TMH_SEED[entity] (assets/data/*.js) into
   localStorage on first load, then serves every read and
   write from there. Create/edit/delete therefore survive a
   reload, which is the whole point: the flow can be walked
   end to end before a backend exists.

   Every method returns a Promise and mirrors the shape of the
   endpoints in docs/07-api-contract.md. Replacing this file
   with fetch() calls is the entire client-side backend
   integration — no page JS changes.
   ========================================================= */
(function (root) {
    'use strict';

    const PREFIX = 'tmh-admin:';
    const LATENCY = [120, 260];   /* so skeleton states are actually visible */

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const lag = () => wait(LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]));
    const clone = (v) => JSON.parse(JSON.stringify(v));

    const dependentHooks = {};   /* entity -> fn(id) => [string] */

    /* localStorage is unavailable in some private-mode and file:// setups.
       Falling back to an in-memory map keeps the panel usable for the length
       of the session instead of throwing on the first read. */
    const memory = {};
    let warnedNoStorage = false;

    function getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return key in memory ? memory[key] : null;
        }
    }

    function setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            memory[key] = value;
            if (!warnedNoStorage) {
                warnedNoStorage = true;
                console.warn('[store] localStorage unavailable — changes last for this session only');
            }
        }
    }

    function read(entity) {
        const key = PREFIX + entity;
        const raw = getItem(key);
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                /* Corrupt payload — fall through and re-seed rather than
                   leaving the panel permanently broken. */
                console.warn('[store] bad payload for', entity, '— re-seeding');
            }
        }
        /* Not every page loads every assets/data file, but the sidebar badges
           and the global search ask about entities the current page never
           seeded. Writing an empty array for those would persist the emptiness
           — the enquiries screen would then read [] out of localStorage for
           good, and its table and search would come back blank on every later
           visit. So an entity with no seed on the page is served empty and
           left unwritten, to be seeded properly by a page that does load it. */
        if (!root.TMH_SEED || !root.TMH_SEED[entity]) return [];

        const seed = clone(root.TMH_SEED[entity]);
        setItem(key, JSON.stringify(seed));
        return seed;
    }

    /* True when this page can actually answer for the entity — either it has
       been seeded into storage already, or its data file is on the page. */
    function available(entity) {
        return !!(getItem(PREFIX + entity) || (root.TMH_SEED && root.TMH_SEED[entity]));
    }

    function write(entity, rows) {
        setItem(PREFIX + entity, JSON.stringify(rows));
        return rows;
    }

    function nextId(entity, rows) {
        const prefix = entity.slice(0, 3);
        let n = rows.length + 1;
        let id = `${prefix}-${String(n).padStart(3, '0')}`;
        while (rows.some((r) => r.id === id)) {
            n += 1;
            id = `${prefix}-${String(n).padStart(3, '0')}`;
        }
        return id;
    }

    const now = () => new Date().toISOString();

    function matches(row, q, fields) {
        if (!q) return true;
        const needle = q.toLowerCase();
        const keys = fields && fields.length ? fields : Object.keys(row);
        return keys.some((k) => {
            const v = row[k];
            if (v == null) return false;
            if (Array.isArray(v)) return v.join(' ').toLowerCase().includes(needle);
            if (typeof v === 'object') return false;
            return String(v).toLowerCase().includes(needle);
        });
    }

    function compare(a, b, key, dir) {
        const av = a[key];
        const bv = b[key];
        let out;
        if (typeof av === 'number' && typeof bv === 'number') out = av - bv;
        else out = String(av == null ? '' : av).localeCompare(String(bv == null ? '' : bv), undefined, { numeric: true });
        return dir === 'desc' ? -out : out;
    }

    const store = {

        /* ----- read ----- */

        /**
         * list('doctors', {q, searchFields, status, filters, sort, dir, page, pageSize})
         * → {rows, total, page, pageSize, counts}
         * `counts` is a status histogram, used by the filter chips.
         */
        async list(entity, opts) {
            await lag();
            const o = Object.assign({ page: 1, pageSize: 20, dir: 'asc' }, opts || {});
            let rows = read(entity);

            if (o.filters) {
                Object.entries(o.filters).forEach(([k, v]) => {
                    if (v === undefined || v === null || v === '' || v === 'all') return;
                    /* A filter may supply its own predicate — a date window has
                       no field to compare against. Phase 2 turns these into
                       query params; the shape of the call does not change. */
                    const fn = o.filterFns && o.filterFns[k];
                    if (fn) {
                        rows = rows.filter((r) => fn(r, v));
                        return;
                    }
                    rows = rows.filter((r) => {
                        const rv = r[k];
                        if (Array.isArray(rv)) return rv.includes(v);
                        if (typeof rv === 'boolean') return rv === (v === true || v === 'true');
                        return String(rv) === String(v);
                    });
                });
            }

            if (o.q) rows = rows.filter((r) => matches(r, o.q, o.searchFields));

            /* The status histogram behind the filter chips is counted here —
               after the other filters and the search, before the status filter
               itself. A chip reading "Draft 3" has to mean three drafts in the
               set on screen; counted any earlier it would report drafts from a
               category the user is not looking at. */
            const counts = rows.reduce((acc, r) => {
                acc.all = (acc.all || 0) + 1;
                if (r.status) acc[r.status] = (acc[r.status] || 0) + 1;
                return acc;
            }, {});

            if (o.status && o.status !== 'all') rows = rows.filter((r) => r.status === o.status);

            const sortKey = o.sort || 'order';
            rows = rows.slice().sort((a, b) => compare(a, b, sortKey, o.dir));

            const total = rows.length;
            const start = (o.page - 1) * o.pageSize;
            const paged = o.pageSize === 0 ? rows : rows.slice(start, start + o.pageSize);

            return { rows: clone(paged), total, page: o.page, pageSize: o.pageSize, counts };
        },

        /** Every row, unfiltered — for pickers and cross-entity lookups. */
        async all(entity) {
            await lag();
            return clone(read(entity));
        },

        /** Synchronous read. Only for render-time lookups (author name for a
            post row) where an await per row would be absurd. */
        allSync(entity) {
            return read(entity);
        },

        /** Whether this page holds data for the entity at all — the global
            search asks before it offers to search something. */
        available,

        async get(entity, id) {
            await lag();
            const row = read(entity).find((r) => String(r.id) === String(id));
            return row ? clone(row) : null;
        },

        /* ----- write ----- */

        async create(entity, data) {
            await lag();
            const rows = read(entity);
            const row = Object.assign({
                id: data.id || nextId(entity, rows),
                status: 'draft',
                order: rows.length ? Math.max(...rows.map((r) => r.order || 0)) + 1 : 1,
            }, data, {
                createdAt: now(),
                updatedAt: now(),
                updatedBy: 'Admin Desk',
            });

            if (rows.some((r) => String(r.id) === String(row.id))) {
                const err = new Error('That ID is already in use');
                err.code = 'CONFLICT';
                err.fields = { id: 'Already in use' };
                throw err;
            }

            rows.push(row);
            write(entity, rows);
            return clone(row);
        },

        async update(entity, id, patch) {
            await lag();
            const rows = read(entity);
            const i = rows.findIndex((r) => String(r.id) === String(id));
            if (i === -1) {
                const err = new Error('Record not found');
                err.code = 'NOT_FOUND';
                throw err;
            }
            /* An id change is a slug change — allowed, but it must not
               collide with an existing record. */
            if (patch.id && String(patch.id) !== String(id)
                && rows.some((r) => String(r.id) === String(patch.id))) {
                const err = new Error('That slug is already in use');
                err.code = 'CONFLICT';
                err.fields = { id: 'Already in use' };
                throw err;
            }
            rows[i] = Object.assign({}, rows[i], patch, {
                updatedAt: now(),
                updatedBy: 'Admin Desk',
            });
            write(entity, rows);
            return clone(rows[i]);
        },

        /** Returns {row, index} so a toast can offer Undo. */
        async remove(entity, id) {
            await lag();
            const rows = read(entity);
            const i = rows.findIndex((r) => String(r.id) === String(id));
            if (i === -1) return null;
            const [row] = rows.splice(i, 1);
            write(entity, rows);
            return { row: clone(row), index: i };
        },

        async restore(entity, row, index) {
            await lag();
            const rows = read(entity);
            rows.splice(typeof index === 'number' ? index : rows.length, 0, clone(row));
            write(entity, rows);
            return clone(row);
        },

        /**
         * revert('testimonials', 'tst-009') — undo a delete from its log row.
         *
         * POST /api/{resource}/{id}/restore on the real backend, where a
         * delete only sets deleted_at and the record is still there to bring
         * back. This mock splices rows out of an array, so by the time the log
         * row is read the record is gone and an id is all there is to go on.
         * Refusing is the honest answer; inventing a row from its id would put
         * a stub into the collection and call it a restore.
         */
        async revert(entity, id) {
            await lag();
            const err = new Error('Restoring from the log needs the backend — this preview deletes for good.');
            err.code = 'NOT_SUPPORTED';
            err.entity = entity;
            err.id = id;
            throw err;
        },

        async reorder(entity, idsInOrder) {
            await lag();
            const rows = read(entity);
            idsInOrder.forEach((id, i) => {
                const row = rows.find((r) => String(r.id) === String(id));
                if (row) row.order = i + 1;
            });
            write(entity, rows);
            return true;
        },

        /**
         * bulk('doctors', ids, 'publish')
         * → {succeeded: [], failed: [{id, reason}]}
         * Partial failure is reported honestly rather than swallowed —
         * see the bulk toast rule in docs/04-crud-flows.md.
         */
        async bulk(entity, ids, action, payload) {
            await lag();
            const rows = read(entity);
            const succeeded = [];
            const failed = [];

            ids.forEach((id) => {
                const i = rows.findIndex((r) => String(r.id) === String(id));
                if (i === -1) {
                    failed.push({ id, reason: 'Not found' });
                    return;
                }
                if (action === 'delete') {
                    const deps = store.dependents(entity, id);
                    if (deps.length) {
                        failed.push({ id, reason: `In use by ${deps.length} record(s)` });
                        return;
                    }
                    rows.splice(i, 1);
                } else if (action === 'publish') {
                    rows[i].status = 'published';
                    rows[i].updatedAt = now();
                } else if (action === 'hide') {
                    rows[i].status = 'hidden';
                    rows[i].updatedAt = now();
                } else if (action === 'patch') {
                    Object.assign(rows[i], payload, { updatedAt: now() });
                }
                succeeded.push(id);
            });

            write(entity, rows);
            return { succeeded, failed };
        },

        /* ----- cross-entity reads -----
           The dashboard asks one question that spans eight tables, and no
           amount of list() calls is that question. GET /api/dashboard/summary
           answers it in one request; this computes the same shape from the
           seed so the screen is written once. Every field below exists on the
           real response — see api/controllers/DashboardController.php. */

        /**
         * summary() → {stats, attention, recentEnquiries, recentActivity, setup}
         *
         * The comparisons are deliberately the same ones the server makes:
         * month-to-date against the same days of last month for the two
         * counts, and against the state at the start of the month for the two
         * totals. A mock that compared differently would make the tiles change
         * meaning on the day the backend is plugged in.
         */
        async summary() {
            await lag();

            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevEnd = new Date(prevStart.getTime() + (now - start));
            const at = (row, key) => new Date(row[key] || 0);
            const within = (row, key, from, to) => at(row, key) >= from && (!to || at(row, key) < to);

            const enquiries = read('enquiries').filter((r) => r.status !== 'spam');
            const posts = read('posts');
            const jobs = read('jobs');
            const media = read('media');

            /* The design seed labels its sources for a human ('Contact form'),
               the database stores them as keys ('contact'). Matched loosely so
               both answer the same. */
            const isAppointment = (r) => /appoint/i.test(String(r.source || ''));
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const openOn = (job, when) => job.status === 'published'
                && (!job.closesAt || new Date(job.closesAt) >= when);

            const tile = (key, label, value, previous, deltaOf) => ({
                key, label, value, previous,
                delta: value - previous,
                /* Null, not 0 — "+100%" against a month with no enquiries at
                   all says less than "first this month". */
                deltaPercent: previous === 0 ? null : Math.round(((value - previous) / previous) * 100),
                deltaOf,
            });

            const stats = [
                tile('enquiries', 'Enquiries this month',
                    enquiries.filter((r) => within(r, 'receivedAt', start)).length,
                    enquiries.filter((r) => within(r, 'receivedAt', prevStart, prevEnd)).length,
                    'the same days last month'),
                tile('appointmentRequests', 'Appointment requests',
                    enquiries.filter((r) => isAppointment(r) && within(r, 'receivedAt', start)).length,
                    enquiries.filter((r) => isAppointment(r) && within(r, 'receivedAt', prevStart, prevEnd)).length,
                    'the same days last month'),
                tile('publishedPosts', 'Published posts',
                    posts.filter((r) => r.status === 'published').length,
                    posts.filter((r) => r.status === 'published' && r.publishedAt && at(r, 'publishedAt') < start).length,
                    'the start of the month'),
                tile('activeVacancies', 'Active vacancies',
                    jobs.filter((j) => openOn(j, today)).length,
                    jobs.filter((j) => openOn(j, start) && at(j, 'postedAt') < start).length,
                    'the start of the month'),
            ];

            /* Only what has something in it. A card listing four zeroes is
               four lines of nothing on the first screen of the morning. */
            const attention = [];
            const weekAgo = new Date(now.getTime() - 7 * 86400000);
            const staleBy = {};

            ['doctors', 'departments', 'posts', 'facilities', 'lab-tests', 'testimonials', 'faqs', 'jobs', 'leadership']
                .forEach((entity) => {
                    if (!available(entity)) return;
                    const n = read(entity).filter((r) => r.status === 'draft'
                        && (!r.updatedAt || at(r, 'updatedAt') < weekAgo)).length;
                    if (n) staleBy[entity] = n;
                });

            const staleTotal = Object.values(staleBy).reduce((a, b) => a + b, 0);

            if (staleTotal) {
                attention.push({
                    key: 'staleDrafts',
                    label: `${staleTotal} draft${staleTotal === 1 ? '' : 's'} untouched for over a week`,
                    count: staleTotal,
                    breakdown: Object.entries(staleBy).map(([entity, count]) => ({ entity, count })),
                });
            }

            const unanswered = enquiries.filter((r) => r.status === 'new').length;
            if (unanswered) {
                attention.push({
                    key: 'unansweredEnquiries',
                    label: `${unanswered} enquir${unanswered === 1 ? 'y' : 'ies'} with no reply`,
                    count: unanswered, entity: 'enquiries', query: { status: 'new' },
                });
            }

            const weekOut = new Date(today.getTime() + 7 * 86400000);
            const closing = jobs.filter((j) => j.status === 'published' && j.closesAt
                && at(j, 'closesAt') >= today && at(j, 'closesAt') <= weekOut).length;
            if (closing) {
                attention.push({
                    key: 'closingVacancies',
                    label: `${closing} vacanc${closing === 1 ? 'y closes' : 'ies close'} this week`,
                    count: closing, entity: 'jobs', query: { closingWithinDays: 7 },
                });
            }

            const noAlt = media.filter((m) => !String(m.alt || '').trim()).length;
            if (noAlt) {
                attention.push({
                    key: 'mediaMissingAlt',
                    label: `${noAlt} image${noAlt === 1 ? '' : 's'} with no alt text`,
                    count: noAlt, entity: 'media',
                });
            }

            const settings = JSON.parse(getItem(PREFIX + 'settings') || 'null')
                || (root.TMH_SEED && root.TMH_SEED.settings) || {};
            const published = (entity) => available(entity)
                && read(entity).some((r) => r.status === 'published');

            const steps = [
                {
                    key: 'settings',
                    label: 'Fill in the hospital\'s name and contact details',
                    href: 'settings-general.html',
                    done: !!(settings.general && String(settings.general.name || '').trim())
                        && !!(settings.contact && (settings.contact.phones || []).length),
                },
                { key: 'departments', label: 'Publish your departments', href: 'departments.html', done: published('departments') },
                { key: 'doctors', label: 'Publish your consultants', href: 'doctors.html', done: published('doctors') },
            ];

            return clone({
                stats,
                attention,
                recentEnquiries: enquiries
                    .slice()
                    .sort((a, b) => at(b, 'receivedAt') - at(a, 'receivedAt'))
                    .slice(0, 5),
                recentActivity: read('activity')
                    .slice()
                    .sort((a, b) => at(b, 'at') - at(a, 'at'))
                    .slice(0, 8),
                setup: { complete: steps.every((s) => s.done), steps },
            });
        },

        /* ----- singletons (settings, page content) ----- */

        async getDoc(key) {
            await lag();
            const raw = getItem(PREFIX + key);
            if (raw) {
                try {
                    return JSON.parse(raw);
                } catch (e) { /* re-seed below */ }
            }
            const seed = clone((root.TMH_SEED && root.TMH_SEED[key]) || {});
            setItem(PREFIX + key, JSON.stringify(seed));
            return seed;
        },

        async setDoc(key, data) {
            await lag();
            setItem(PREFIX + key, JSON.stringify(data));
            return clone(data);
        },

        /* ----- dependency guards -----
           A page registers what blocks a delete; confirm() renders the list.
           Registered in the page JS because only the page knows the
           relationships it cares about. */

        registerDependents(entity, fn) {
            dependentHooks[entity] = fn;
        },

        dependents(entity, id) {
            const fn = dependentHooks[entity];
            if (!fn) return [];
            try {
                return fn(id) || [];
            } catch (e) {
                console.warn('[store] dependent check failed for', entity, e);
                return [];
            }
        },

        /* ----- demo housekeeping ----- */

        reset() {
            try {
                Object.keys(localStorage)
                    .filter((k) => k.startsWith(PREFIX))
                    .forEach((k) => localStorage.removeItem(k));
            } catch (e) { /* memory fallback below covers it */ }
            Object.keys(memory).forEach((k) => delete memory[k]);
        },

        isSeeded(entity) {
            return getItem(PREFIX + entity) !== null;
        },
    };

    root.TMH = root.TMH || {};
    root.TMH.store = store;
}(window));
