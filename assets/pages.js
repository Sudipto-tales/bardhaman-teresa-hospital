/* =========================================================
   Teresa Memorial Hospital — inner-page behaviour
   Loaded AFTER website.js. website.js already wires the nav,
   dock, spy rail, FAQ accordion and search on every page —
   all of its inits bail out when their markup is absent, so
   this file only adds what the department / contact pages
   introduce: the banner parallax, the count-up stats and the
   appointment form.
   ========================================================= */
(() => {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    /* ---------------------------------------------------------
       Banner: slow parallax drift on the photo + ECG draw-in.
       Falls back to a static banner when GSAP is absent or the
       visitor asked for reduced motion.
       --------------------------------------------------------- */
    const initBanner = () => {
        const hero = $('.pg-hero');
        if (!hero || REDUCED || !HAS_GSAP) return;

        const img = $('.pg-hero__img', hero);
        if (img) {
            gsap.to(img, {
                yPercent: 12,
                ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
            });
        }

        gsap.from($$('.pg-crumb, .pg-hero__head > *, .pg-hero__actions, .pg-hero__chip', hero), {
            y: 26,
            opacity: 0,
            duration: .7,
            ease: 'power3.out',
            stagger: .07,
            delay: .15,
        });

        const ecg = $('.pg-hero__ecg path', hero);
        if (ecg) {
            const len = ecg.getTotalLength();
            gsap.fromTo(ecg,
                { strokeDasharray: len, strokeDashoffset: len },
                { strokeDashoffset: 0, duration: 2.2, ease: 'power2.out', delay: .3 });
        }
    };

    /* ---------------------------------------------------------
       Stats: count up once, the first time the band is seen.
       The final value lives in data-count so the markup still
       reads correctly with JS off — we only animate toward it.
       --------------------------------------------------------- */
    const countUp = (el) => {
        const target = parseFloat(el.dataset.count);
        if (!Number.isFinite(target)) return;

        /* keep the author's decimal precision (4.9 must not land on 5) */
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        const format = (v) => v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        if (REDUCED) {
            el.textContent = format(target);
            return;
        }

        const DURATION = 1600;
        let start = null;

        const step = (ts) => {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / DURATION, 1);
            /* easeOutExpo — fast off the line, long settle */
            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            el.textContent = format(target * eased);
            if (p < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const initStats = () => {
        const nums = $$('.pg-stat__value[data-count]');
        if (!nums.length) return;

        /* seed with 0 so the jump from placeholder to animation isn't visible */
        if (!REDUCED) nums.forEach((n) => { n.textContent = '0'; });

        if (!('IntersectionObserver' in window)) {
            nums.forEach(countUp);
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: .4 });

        nums.forEach((n) => io.observe(n));
    };

    /* ---------------------------------------------------------
       Section reveals for the inner-page blocks. website.js's
       initSections() only knows the home page's section ids.
       --------------------------------------------------------- */
    const initReveals = () => {
        if (REDUCED || !HAS_GSAP) return;

        const groups = [
            '.pg-intro__copy > *',
            '.pg-intro__media',
            '.pg-card',
            '.pg-cond__intro > *',
            '.pg-cond__list li',
            '.pg-doc',
            '.ct-tile',
            '.ct-form',
            '.ct-aside > *',
            '.pg-cta',
        ];

        groups.forEach((sel) => {
            const els = $$(sel);
            if (!els.length) return;

            gsap.from(els, {
                y: 40,
                opacity: 0,
                duration: .8,
                ease: 'power3.out',
                stagger: .06,
                scrollTrigger: { trigger: els[0].parentElement || els[0], start: 'top 82%' },
            });
        });
    };

    /* ---------------------------------------------------------
       Appointment / enquiry form.
       There is no backend here, so this validates, shows a
       confirmation and clears. Point the <form> at your handler
       (action + method) and delete the preventDefault to go live.
       --------------------------------------------------------- */
    const initForm = () => {
        const form = $('#appointmentForm');
        if (!form) return;

        const note = $('#formNote', form);

        form.addEventListener('submit', (e) => {
            if (!form.reportValidity()) return;

            e.preventDefault();
            form.reset();

            if (note) {
                note.classList.add('is-visible');
                setTimeout(() => note.classList.remove('is-visible'), 6000);
            }
        });
    };

    const boot = () => {
        initBanner();
        initStats();
        initReveals();
        initForm();
        if (HAS_GSAP) ScrollTrigger.refresh();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
