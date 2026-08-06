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
       Single-article banner: same parallax as initBanner (which
       only knows .pg-hero) plus the print / mail / share row.
       The markup ships those three working without JS as far as
       it can — the mail link is a real mailto — so everything
       here is an upgrade, not a requirement.
       --------------------------------------------------------- */
    const initPostHero = () => {
        const hero = $('.post-hero');
        if (!hero) return;

        const flash = $('#postFlash');
        /* the message clears itself; the timer is held so a second
           click restarts it rather than being cut short by the first */
        let flashTimer;
        const say = (msg) => {
            if (!flash) return;
            flash.textContent = msg;
            flash.classList.add('is-visible');
            clearTimeout(flashTimer);
            flashTimer = setTimeout(() => flash.classList.remove('is-visible'), 2600);
        };

        const title = $('.post-hero__title');
        const url = location.href;

        $$('[data-post-tool]', hero).forEach((el) => {
            const kind = el.dataset.postTool;

            if (kind === 'mail') {
                /* the subject was baked at build time; only the body needs
                   the live URL, which the generator cannot know */
                el.href += `&body=${encodeURIComponent(url)}`;
                return;
            }

            el.addEventListener('click', async () => {
                if (kind === 'print') {
                    window.print();
                    return;
                }

                const data = { title: title ? title.textContent.trim() : document.title, url };

                /* navigator.share is mobile and https only; the desktop
                   path is the clipboard, and a cancelled share sheet
                   throws AbortError, which is not a failure */
                if (navigator.share) {
                    try {
                        await navigator.share(data);
                        return;
                    } catch (err) {
                        if (err && err.name === 'AbortError') return;
                    }
                }

                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(url);
                        say('Link copied');
                        return;
                    } catch (err) { /* falls through to the prompt */ }
                }

                window.prompt('Copy this link', url);
            });
        });

        if (REDUCED || !HAS_GSAP) return;

        const img = $('.post-hero__img', hero);
        if (img) {
            gsap.to(img, {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
            });
        }

        gsap.from($$('.post-hero__flags, .post-hero__title, .post-hero__lead, .post-hero__card .pg-crumb, .post-hero__side > *', hero), {
            y: 24,
            opacity: 0,
            duration: .7,
            ease: 'power3.out',
            stagger: .07,
            delay: .15,
        });
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
            '.ab-banner',
            '.ab-pillar',
            '.ab-mosaic > *',
            '.cr-job',
            '.cr-mail',
            '.post-related .blog__card',
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

        preselectDoctor(form);

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

    /* ---------------------------------------------------------
       "Book an appointment" on a doctor card lands here as
       contact.html?doctor=dr-anita-sharma#book. Fill the doctor
       in, and the department with it — someone who picked a
       cardiologist should not then have to say "cardiology".

       An unknown slug is ignored rather than guessed at: a stale
       link should leave the form usable, not half-filled with
       something the visitor did not choose.
       --------------------------------------------------------- */
    const preselectDoctor = (form) => {
        const slug = new URLSearchParams(window.location.search).get('doctor');
        if (!slug) return;

        const select = $('#ctDoctor', form);
        if (!select) return;

        const option = Array.from(select.options).find((o) => o.value === slug);
        if (!option) return;

        select.value = slug;

        const dept = option.dataset.dept;
        const deptSelect = $('#ctDept', form);
        if (dept && deptSelect && Array.from(deptSelect.options).some((o) => o.value === dept)) {
            deptSelect.value = dept;
        }
    };

    /* ---------------------------------------------------------
       Blog listing sidebar: free-text search + a single-select
       tag chip, combined with AND.

       The query is matched against card.textContent rather than a
       baked-in data-search string, so it keeps working once the
       Google Translate widget has rewritten the cards into
       Bengali. The chips match on data-cat, which the widget
       leaves alone — attributes are never translated.
       --------------------------------------------------------- */
    const initBlogFilter = () => {
        const search = $('#blogSearch');
        if (!search) return;

        const cards = $$('.blog__card');
        const chips = $$('#blogTags .pg-tag');
        const count = $('#blogCount');
        const empty = $('#blogEmpty');
        const clear = $('#blogClear');

        let q = '';
        let tag = '';

        const apply = () => {
            let shown = 0;

            cards.forEach((card) => {
                const hit = (!tag || card.dataset.cat === tag)
                    && (!q || card.textContent.toLowerCase().includes(q));
                card.hidden = !hit;
                if (hit) shown += 1;
            });

            if (empty) empty.hidden = shown > 0;
            if (clear) clear.hidden = !q && !tag;
            if (count) {
                count.textContent = shown === 0
                    ? 'No articles match'
                    : `${shown} article${shown === 1 ? '' : 's'}${tag ? ` in ${tag}` : ''}`;
            }
        };

        /* typing is cheap here — nine cards — but the debounce keeps the
           status line from thrashing a screen reader mid-word */
        let timer;
        search.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                q = search.value.trim().toLowerCase();
                apply();
            }, 120);
        });

        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                /* clicking the active chip clears it, same as picking All */
                tag = chip.dataset.tag === tag ? '' : chip.dataset.tag;
                chips.forEach((c) => c.classList.toggle('is-active', c.dataset.tag === tag));
                apply();
            });
        });

        if (clear) {
            clear.addEventListener('click', () => {
                q = '';
                tag = '';
                search.value = '';
                chips.forEach((c) => c.classList.toggle('is-active', !c.dataset.tag));
                apply();
            });
        }

        /* An article's tag links point here as blog.html?tag=Cardiology.
           Only honour a value that an actual chip carries, so a stale or
           hand-typed tag shows the full list instead of an empty grid. */
        const wanted = new URLSearchParams(location.search).get('tag');
        if (wanted && chips.some((c) => c.dataset.tag === wanted)) {
            tag = wanted;
            chips.forEach((c) => c.classList.toggle('is-active', c.dataset.tag === tag));
            apply();
        }
    };

    /* ---------------------------------------------------------
       About-page testimonial carousel. The quote text lives in
       .ab-quote__slide elements; the attribution rides on each of
       them as data-* and is copied into the single footer block.
       --------------------------------------------------------- */
    const initQuotes = () => {
        const box = $('#abQuote');
        if (!box) return;

        const slides = $$('.ab-quote__slide', box);
        if (slides.length < 2) return;

        const avatar = $('.ab-quote__avatar', box);
        const name = $('.ab-quote__name', box);
        const role = $('.ab-quote__role', box);
        let i = 0;

        const show = (next) => {
            i = (next + slides.length) % slides.length;
            slides.forEach((s, n) => s.classList.toggle('is-active', n === i));

            const d = slides[i].dataset;
            if (avatar) avatar.src = d.img;
            if (name) name.textContent = d.name;
            if (role) role.textContent = d.role;
        };

        $$('[data-quote]', box).forEach((btn) => {
            btn.addEventListener('click', () => show(i + (btn.dataset.quote === 'next' ? 1 : -1)));
        });

        /* arrows work while anywhere in the card has focus */
        box.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') show(i + 1);
            else if (e.key === 'ArrowLeft') show(i - 1);
        });
    };

    /* ---------------------------------------------------------
       Careers. window.TMH_JOBS (assets/jobs.js) is the single
       source for both the list and the detail page, so a vacancy
       opens or closes without rebuilding the static HTML.
       --------------------------------------------------------- */
    const JOBS = () => (Array.isArray(window.TMH_JOBS) ? window.TMH_JOBS : []);

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    /* '2026-07-28' -> '28 Jul 2026'; anything unparseable passes through */
    const niceDate = (iso) => {
        const d = new Date(`${iso}T00:00:00`);
        if (Number.isNaN(d.getTime())) return iso || '';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const jobChips = (job) => `<ul class="cr-chips">
                    <li><i class="fa-solid fa-hospital"></i> ${esc(job.dept)}</li>
                    <li><i class="fa-solid fa-clock"></i> ${esc(job.type)}</li>
                    <li><i class="fa-solid fa-location-dot"></i> ${esc(job.location)}</li>
                    <li><i class="fa-solid fa-user-clock"></i> ${esc(job.experience)}</li>
                </ul>`;

    const initCareers = () => {
        const list = $('#jobList');
        if (!list) return;

        const empty = $('#jobEmpty');
        const count = $('#jobCount');
        const filter = $('#jobFilter');
        const all = JOBS();

        if (filter) {
            [...new Set(all.map((j) => j.dept))].sort().forEach((dept) => {
                const opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                filter.appendChild(opt);
            });
        }

        const render = (dept) => {
            const rows = dept ? all.filter((j) => j.dept === dept) : all;

            list.innerHTML = rows.map((job) => `<li class="cr-job">
                <div>
                    <h3>${esc(job.title)}</h3>
                    ${jobChips(job)}
                    <span class="cr-job__posted">Posted ${niceDate(job.posted)}${job.closes ? ` &middot; closes ${niceDate(job.closes)}` : ''}</span>
                </div>
                <a class="arrow-link" href="job.html?id=${encodeURIComponent(job.id)}"><i
                        class="fa-solid fa-arrow-right"></i> View &amp; apply</a>
            </li>`).join('');

            list.hidden = rows.length === 0;
            if (empty) empty.hidden = rows.length > 0;
            if (count) {
                count.textContent = rows.length === 0
                    ? 'No roles match that filter'
                    : `${rows.length} open ${rows.length === 1 ? 'role' : 'roles'}`;
            }
        };

        render('');
        if (filter) filter.addEventListener('change', () => render(filter.value));
    };

    /* ---------------------------------------------------------
       Job detail — job.html?id=<slug>. An unknown or missing id
       shows the not-found panel and takes the form away, so an
       expired link cannot collect applications for nothing.
       --------------------------------------------------------- */
    const jobBlock = (title, items) => (items && items.length
        ? `<div class="cr-jd__block">
                <h3>${title}</h3>
                <ul>${items.map((t) => `
                    <li><i class="fa-solid fa-circle-check"></i> ${esc(t)}</li>`).join('')}
                </ul>
            </div>`
        : '');

    const initJob = () => {
        const box = $('#jobDetail');
        if (!box) return;

        const id = new URLSearchParams(window.location.search).get('id');
        const job = JOBS().find((j) => j.id === id);
        const applySection = $('#apply');

        if (!job) {
            box.innerHTML = `<div class="cr-notfound">
                <i class="fa-solid fa-circle-question"></i>
                <h3>This role is no longer listed</h3>
                <p>It may have been filled or the link may be out of date. The current openings are always on the
                    careers page — or send a CV and HR will match it against what is coming up.</p>
                <a href="careers.html" class="btn-primary"><i class="fa-solid fa-arrow-left"></i> All open roles</a>
                <a href="mailto:careers@teresamemorial.org" class="arrow-link"><i
                        class="fa-solid fa-envelope"></i> Email careers@teresamemorial.org</a>
            </div>`;
            /* the whole #apply section goes, mailto panel included — the
               link above is the replacement route */
            if (applySection) applySection.remove();
            return;
        }

        document.title = `${job.title} — Teresa Memorial Hospital`;

        box.innerHTML = `<div class="cr-jd">
            <div>
                <div class="cr-jd__head">
                    <span class="eyebrow">${esc(job.dept)}</span>
                    <h2>${esc(job.title)}</h2>
                    ${jobChips(job)}
                </div>

                <p class="cr-jd__lead">${esc(job.summary)}</p>

                ${jobBlock('What you will be doing', job.responsibilities)}
                ${jobBlock('What we need from you', job.requirements)}
                ${jobBlock('Good to have', job.niceToHave)}
                ${jobBlock('What we offer', job.benefits)}
            </div>

            <aside class="cr-jd__aside">
                <h3>At a glance</h3>
                <ul class="cr-facts">
                    <li><span>Department</span> <strong>${esc(job.dept)}</strong></li>
                    <li><span>Employment</span> <strong>${esc(job.type)}</strong></li>
                    <li><span>Location</span> <strong>${esc(job.location)}</strong></li>
                    <li><span>Experience</span> <strong>${esc(job.experience)}</strong></li>
                    <li><span>Posted</span> <strong>${niceDate(job.posted)}</strong></li>
                    <li><span>Applications close</span> <strong>${niceDate(job.closes)}</strong></li>
                </ul>
                <a href="#apply" class="btn-primary"><i class="fa-solid fa-arrow-down"></i> Apply for this role</a>
            </aside>
        </div>`;

        /* carry the role through to the form and the mailto fallback */
        const role = $('#apRole');
        if (role) role.value = job.title;

        const mailto = $('#applyMailto');
        if (mailto) {
            mailto.href = `mailto:careers@teresamemorial.org?subject=${encodeURIComponent(`Application — ${job.title}`)}`;
        }

        const crumb = $('.pg-crumb [aria-current]');
        if (crumb) crumb.textContent = job.title;
    };

    /* ---------------------------------------------------------
       Application form. Same no-backend contract as the
       appointment form above, plus client-side file checks —
       type and size are the two things a visitor can get wrong
       in a way no amount of server code will forgive later.
       --------------------------------------------------------- */
    const MAX_FILE = 5 * 1024 * 1024;
    const FILE_TYPES = ['pdf', 'doc', 'docx'];

    const checkFile = (input) => {
        const box = input.closest('.cr-file');
        const field = input.closest('.ct-field');
        const nameEl = box && $('[data-file-name]', box);
        const errEl = field && $('[data-file-err]', field);
        const file = input.files && input.files[0];

        const fail = (msg) => {
            if (box) box.classList.add('has-error');
            if (errEl) {
                /* keep the leading <i>, replace the text after it */
                errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
                errEl.classList.add('is-visible');
            }
            input.value = '';
            if (nameEl) nameEl.classList.remove('is-visible');
            return false;
        };

        if (box) box.classList.remove('has-error');
        if (errEl) errEl.classList.remove('is-visible');
        if (nameEl) nameEl.classList.remove('is-visible');

        if (!file) return true;

        const ext = file.name.split('.').pop().toLowerCase();
        if (!FILE_TYPES.includes(ext)) return fail('That file type is not accepted — send a PDF, DOC or DOCX.');
        if (file.size > MAX_FILE) return fail(`That file is ${(file.size / 1048576).toFixed(1)} MB — the limit is 5 MB.`);

        if (nameEl) {
            nameEl.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${esc(file.name)}`;
            nameEl.classList.add('is-visible');
        }
        return true;
    };

    const initApplyForm = () => {
        const form = $('#applyForm');
        if (!form) return;

        const note = $('#applyNote', form);
        const files = $$('input[type="file"]', form);

        files.forEach((input) => input.addEventListener('change', () => checkFile(input)));

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            /* file checks first — reportValidity() would otherwise pass a
               5 MB .png sitting in a required input */
            if (files.some((input) => !checkFile(input))) return;
            if (!form.reportValidity()) return;

            const role = $('#apRole', form);
            const keepRole = role ? role.value : '';
            form.reset();
            if (role) role.value = keepRole;

            files.forEach((input) => {
                const box = input.closest('.cr-file');
                const nameEl = box && $('[data-file-name]', box);
                if (nameEl) nameEl.classList.remove('is-visible');
            });

            if (note) {
                note.classList.add('is-visible');
                setTimeout(() => note.classList.remove('is-visible'), 6000);
            }
        });
    };

    const boot = () => {
        initBanner();
        initPostHero();
        initStats();
        initBlogFilter();
        initQuotes();
        initCareers();
        /* fills #jobDetail, so it has to run before the reveals measure it */
        initJob();
        initReveals();
        initForm();
        initApplyForm();
        if (HAS_GSAP) ScrollTrigger.refresh();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
