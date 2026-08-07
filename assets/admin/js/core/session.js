/* =========================================================
   The signed-in user — PHASE 1 ONLY.

   There is no auth backend yet, so "who am I" is a constant
   pointing at a row in assets/data/system.js. Phase 2 replaces
   currentSync()/current() with whatever /api/auth/me returns
   and verifyPassword()/changePassword() with the endpoints in
   docs/07-api-contract.md — no page JS changes.

   Everything that asks "may this person manage the panel" goes
   through here, so the super-admin rules live in one file
   rather than being re-derived on three screens.
   ========================================================= */
(function (root) {
    'use strict';

    const CURRENT_ID = 'usr-001';
    const SUPER_ROLE = 'role-super';

    /* Statuses on a user row read differently from content:
       published = active, draft = invited, hidden = suspended. */
    const USER_STATUS = {
        published: { tone: 'ok', label: 'Active' },
        draft: { tone: 'warn', label: 'Invited' },
        hidden: { tone: 'off', label: 'Suspended' },
    };

    const store = () => root.TMH && root.TMH.store;

    const session = {

        CURRENT_ID,
        SUPER_ROLE,
        USER_STATUS,

        /* Synchronous, because the shell paints the name and initials before
           it has awaited anything. Returns null on a page that never loaded
           assets/data/system.js. */
        currentSync() {
            const s = store();
            if (!s || !s.available('users')) return null;
            return (s.allSync('users') || []).find((u) => u.id === CURRENT_ID) || null;
        },

        current() {
            return store().get('users', CURRENT_ID);
        },

        isSuper(user) {
            return !!user && user.roleId === SUPER_ROLE;
        },

        /* Only active super admins count — a suspended or still-invited one
           cannot sign in, so they cannot be the last line of access. */
        superAdmins() {
            const s = store();
            if (!s || !s.available('users')) return [];
            return (s.allSync('users') || [])
                .filter((u) => u.roleId === SUPER_ROLE && u.status === 'published');
        },

        /* True when demoting, suspending or deleting this user would leave
           nobody able to reach Users, Settings or the permission matrix —
           i.e. would lock the hospital out of its own panel. */
        isLastSuper(user) {
            if (!session.isSuper(user) || user.status !== 'published') return false;
            return session.superAdmins().length <= 1;
        },

        roleName(roleId) {
            const s = store();
            const role = s && (s.allSync('roles') || []).find((r) => r.id === roleId);
            return role ? role.name : (roleId || '—');
        },

        statusTag(status) {
            const meta = USER_STATUS[status] || { tone: 'off', label: status || 'Unknown' };
            const esc = root.TMH.util.esc;
            return `<span class="tag ${meta.tone}">${esc(meta.label)}</span>`;
        },

        /* ---------- passwords ----------
           No plaintext and no hash is ever written to the store: Phase 1 keeps
           only the timestamp, which is the part the UI actually reads back.
           The real hashing belongs on the server. */

        /** '' when the password is acceptable, otherwise the reason. */
        passwordProblem(pw) {
            const v = String(pw || '');
            if (v.length < 10) return 'Use at least 10 characters';
            if (!/[a-z]/i.test(v)) return 'Include at least one letter';
            if (!/\d/.test(v)) return 'Include at least one number';
            return '';
        },

        /** 0–4, for the strength bar. */
        strength(pw) {
            const v = String(pw || '');
            if (!v) return 0;
            let score = 0;
            if (v.length >= 10) score += 1;
            if (v.length >= 16) score += 1;
            if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
            if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score += 1;
            return Math.min(4, score);
        },

        /* A readable temporary password for an invite — no l/1/O/0, because
           it gets read out over the phone. */
        suggest() {
            const words = ['harbour', 'lantern', 'meadow', 'compass', 'thistle', 'granite', 'willow', 'saffron'];
            const pick = () => words[Math.floor(Math.random() * words.length)];
            const digits = String(23 + Math.floor(Math.random() * 76));
            return `${pick()}-${pick()}-${digits}`;
        },

        /* Phase 1 has nothing to check the current password against, so this
           only enforces that the field was filled in. Phase 2 posts it to
           /api/auth/login and this becomes a real answer. */
        async verifyPassword(plain) {
            await new Promise((r) => setTimeout(r, 200));
            return String(plain || '').length > 0;
        },

        async changePassword(userId, plain) {
            const problem = session.passwordProblem(plain);
            if (problem) {
                const err = new Error(problem);
                err.fields = { newPassword: problem };
                throw err;
            }
            return store().update('users', userId, {
                passwordUpdatedAt: new Date().toISOString(),
                mustChangePassword: false,
            });
        },
    };

    root.TMH = root.TMH || {};
    root.TMH.session = session;
}(window));
