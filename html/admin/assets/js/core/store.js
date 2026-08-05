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
