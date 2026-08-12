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

    const meta = (name) => {
        const el = document.querySelector(`meta[name="${name}"]`);
        return el ? el.getAttribute('content') || '' : '';
    };

    /* Absolute, because /blog/{slug} and /careers/{slug} are two segments
       deep — a relative href written here would resolve against /blog/
       rather than the site root, and the site may be installed in a
       subdirectory besides. app/components/site/layout/head.php prints the
       real base; core/api.js reads the same meta on the panel's side. */
    const BASE = (meta('app-base') || '/').replace(/\/+$/, '') + '/';
    const url = (path) => BASE + String(path ?? '').replace(/^\/+/, '');

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
        const shareTitle = title ? title.textContent.trim() : document.title;

        /* ---- share sheet -------------------------------------
           navigator.share is https + mobile only and gives back
           nothing when it is missing, so the networks are drawn
           here instead: one row of intents plus copy-link, which
           is the option people actually reach for on a desktop.
           Built once, on first open. */
        const enc = encodeURIComponent;
        const NETWORKS = [
            { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-brands fa-whatsapp', href: (u, t) => `https://api.whatsapp.com/send?text=${enc(t + ' ' + u)}` },
            { id: 'facebook', label: 'Facebook', icon: 'fa-brands fa-facebook-f', href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
            { id: 'x', label: 'X', icon: 'fa-brands fa-x-twitter', href: (u, t) => `https://twitter.com/intent/tweet?url=${enc(u)}&text=${enc(t)}` },
            { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}` },
            { id: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram', href: (u, t) => `https://t.me/share/url?url=${enc(u)}&text=${enc(t)}` },
            { id: 'email', label: 'Email', icon: 'fa-solid fa-envelope', href: (u, t) => `mailto:?subject=${enc(t)}&body=${enc(u)}` },
        ];

        let sheet;
        let opener;

        const buildSheet = () => {
            const el = document.createElement('div');
            el.className = 'share-sheet';
            el.hidden = true;
            el.innerHTML = `
                <div class="share-sheet__scrim" data-share-close></div>
                <div class="share-sheet__panel" role="dialog" aria-modal="true" aria-label="Share this article">
                    <div class="share-sheet__head">
                        <h3>Share this article</h3>
                        <button type="button" class="share-sheet__x" data-share-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="share-sheet__grid">
                        ${NETWORKS.map((n) => `
                        <a class="share-sheet__net share-sheet__net--${n.id}" href="${n.href(url, shareTitle)}" target="_blank" rel="noopener noreferrer">
                            <span class="share-sheet__ic"><i class="${n.icon}"></i></span>
                            <span>${n.label}</span>
                        </a>`).join('')}
                    </div>
                    <div class="share-sheet__copy">
                        <input type="text" readonly value="${url.replace(/"/g, '&quot;')}" aria-label="Article link">
                        <button type="button" data-share-copy><i class="fa-solid fa-link"></i> Copy link</button>
                    </div>
                    ${navigator.share ? '<button type="button" class="share-sheet__more" data-share-native><i class="fa-solid fa-ellipsis"></i> More apps</button>' : ''}
                </div>`;
            document.body.appendChild(el);

            el.addEventListener('click', async (ev) => {
                if (ev.target.closest('[data-share-close]')) { closeSheet(); return; }

                if (ev.target.closest('[data-share-copy]')) {
                    await copyLink();
                    closeSheet();
                    return;
                }

                if (ev.target.closest('[data-share-native]')) {
                    closeSheet();
                    try { await navigator.share({ title: shareTitle, url }); } catch (err) { /* cancelled */ }
                    return;
                }

                /* a network opened in its own tab; this one is done with */
                if (ev.target.closest('.share-sheet__net')) closeSheet();
            });

            return el;
        };

        const openSheet = () => {
            sheet = sheet || buildSheet();
            opener = document.activeElement;
            sheet.hidden = false;
            document.body.classList.add('is-share-open');
            requestAnimationFrame(() => sheet.classList.add('is-open'));
            const first = $('.share-sheet__net', sheet);
            if (first) first.focus();
            document.addEventListener('keydown', onKey);
        };

        const closeSheet = () => {
            if (!sheet || sheet.hidden) return;
            sheet.classList.remove('is-open');
            document.body.classList.remove('is-share-open');
            document.removeEventListener('keydown', onKey);
            setTimeout(() => { sheet.hidden = true; }, 220);
            if (opener && opener.focus) opener.focus();
        };

        const onKey = (ev) => {
            if (ev.key === 'Escape') { closeSheet(); return; }
            if (ev.key !== 'Tab' || !sheet) return;

            /* the sheet is modal, so Tab has to come back round rather
               than walking the page behind the scrim */
            const stops = $$('a[href], button, input', sheet).filter((n) => n.offsetParent !== null);
            if (!stops.length) return;
            const edge = ev.shiftKey ? stops[0] : stops[stops.length - 1];
            if (document.activeElement === edge) {
                ev.preventDefault();
                (ev.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
            }
        };

        const copyLink = async () => {
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(url);
                    say('Link copied');
                    return;
                } catch (err) { /* falls through to the prompt */ }
            }
            window.prompt('Copy this link', url);
        };

        $$('[data-post-tool]', hero).forEach((el) => {
            const kind = el.dataset.postTool;

            if (kind === 'mail') {
                /* the subject was baked at build time; only the body needs
                   the live URL, which the generator cannot know */
                el.href += `&body=${encodeURIComponent(url)}`;
                return;
            }

            el.addEventListener('click', () => {
                if (kind === 'print') {
                    window.print();
                    return;
                }

                openSheet();
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

        gsap.from($$('.post-hero__flags, .post-hero__title, .post-hero__lead, .post-hero__card .pg-crumb', hero), {
            y: 24,
            opacity: 0,
            duration: .7,
            ease: 'power3.out',
            stagger: .07,
            delay: .15,
        });

        /* the side stack is revealed as one box, never child by child:
           a per-child y would sit in the flow's own gap, so a tween
           interrupted mid-flight leaves the call pill overlapping the
           tool row. clearProps drops the inline transform either way */
        const side = $('.post-hero__side', hero);
        if (side) {
            gsap.from(side, {
                y: 24,
                opacity: 0,
                duration: .7,
                ease: 'power3.out',
                delay: .4,
                clearProps: 'transform',
            });
        }
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

       A form with an action posts it there and reports what came
       back; one without — the static copy of this design, which
       has no backend behind it — validates, confirms and clears.
       The submit is intercepted either way, because the endpoint
       answers JSON and a native post would navigate the visitor
       to it.
       --------------------------------------------------------- */
    const initForm = () => {
        const form = $('#appointmentForm');
        if (!form) return;

        const note = $('#formNote', form);
        const endpoint = form.getAttribute('action');

        preselectDoctor(form);

        form.addEventListener('submit', (e) => {
            if (!form.reportValidity()) return;

            e.preventDefault();

            if (!endpoint) {
                form.reset();
                flash(note);
                return;
            }

            post(form, endpoint, note);
        });
    };

    /* Shows the note for a few seconds. `message` overrides the
       server-rendered text — an error, usually — and is restored
       afterwards so the next submit reads correctly. */
    const flash = (note, message, isError) => {
        if (!note) return;

        const original = note.dataset.original || note.innerHTML;
        note.dataset.original = original;

        if (message) {
            note.textContent = message;
        }

        note.classList.toggle('ct-note--error', !!isError);
        note.classList.add('is-visible');

        setTimeout(() => {
            note.classList.remove('is-visible', 'ct-note--error');
            note.innerHTML = original;
        }, 6000);
    };

    /* Posts a form as multipart, which is what the intake
       endpoints read — the application form carries a CV, and
       sending both the same way keeps one path to maintain.

       A 422 names the fields it rejected; the first message is
       shown rather than all of them, because the note is one
       line and the browser's own validation has already caught
       everything that can be checked without the server. */
    const post = (form, endpoint, note, onSent) => {
        const button = $('button[type="submit"]', form);
        if (button) button.disabled = true;

        fetch(endpoint, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((res) => res.json().catch(() => ({})).then((data) => ({ res, data })))
            .then(({ res, data }) => {
                if (res.ok) {
                    form.reset();
                    if (onSent) onSent();
                    flash(note);
                    return;
                }

                /* {error: {code, message, fields}} — see core/Api.php */
                const error = data.error || {};
                const fields = error.fields || {};
                const first = Object.keys(fields)[0];

                flash(note, first ? fields[first] : (error.message || 'Something went wrong — please call the desk.'), true);
            })
            .catch(() => flash(note, 'Could not reach the server — please call the desk.', true))
            .finally(() => {
                if (button) button.disabled = false;
            });
    };

    /* ---------------------------------------------------------
       "Book an appointment" on a doctor card lands here as
       /contact?doctor=dr-anita-sharma#book. Fill the doctor
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
    /* ---------------------------------------------------------
       Doctor finder — the doctors index only.

       Free-text search over one prebuilt haystack per card (name, role,
       speciality, qualification, departments), plus three single-choice
       menus. Everything is client side: the whole roster is already in the
       page, so filtering is a class toggle rather than a request, and Load
       More reveals the rest of the matches without touching the server.
       --------------------------------------------------------- */
    const initDoctorFilter = () => {
        const find = $('[data-doc-find]');
        const grid = $('[data-doc-grid]');
        if (!find || !grid) return;

        const cards = $$('[data-doc]', grid);
        const input = $('[data-find-q]', find);
        const clear = $('[data-find-clear]', find);
        const reset = $('[data-find-reset]', find);
        const count = $('[data-find-count]', find);
        const empty = $('[data-find-empty]', grid.parentElement);
        const more = $('[data-find-more]', grid.parentElement);

        /* Two rows of the desktop grid. Load More lifts it for good — the ask
           was the whole roster on one click, not a page at a time. */
        const step = Number(grid.dataset.initial) || 8;
        let limit = step;
        let q = '';
        const picks = { dept: '', degree: '', book: '' };

        const matches = (card) => {
            const d = card.dataset;
            return (!q || (d.search || '').includes(q))
                && (!picks.dept || (d.dept || '').split(' ').includes(picks.dept))
                && (!picks.degree || (d.degree || '').split(' ').includes(picks.degree))
                && (!picks.book || d.book === '1');
        };

        const apply = () => {
            let hits = 0;

            cards.forEach((card) => {
                const hit = matches(card);
                if (hit) hits += 1;
                /* Past the limit it is a match that is not shown yet, which is
                   what Load More is counting. */
                card.classList.toggle('is-out', !hit || hits > limit);
            });

            const filtered = q !== '' || picks.dept || picks.degree || picks.book;

            if (empty) empty.hidden = hits > 0;
            if (clear) clear.hidden = q === '';
            if (more) {
                more.hidden = hits <= limit;
                more.lastChild.textContent = ` Load more doctors (${hits - limit})`;
            }
            if (count) {
                count.innerHTML = hits === 0
                    ? 'No consultants match'
                    : `<strong>${Math.min(hits, limit)}</strong> of ${hits} consultant${hits === 1 ? '' : 's'}${filtered ? ' matching' : ''}`;
            }
        };

        const setPick = (key, value, label, sel) => {
            picks[key] = value;
            sel.classList.toggle('is-set', value !== '');
            $('[data-find-val]', sel).textContent = label;
            $$('button[data-value]', sel).forEach((b) => {
                const on = b.dataset.value === value;
                b.classList.toggle('is-on', on);
                b.setAttribute('aria-checked', on ? 'true' : 'false');
            });
            /* A new filter is a new result set, so the cap starts over rather
               than leaving a shorter list already fully expanded. */
            limit = step;
            apply();
        };

        const closeMenus = (except) => {
            $$('.dfind__sel', find).forEach((sel) => {
                if (sel === except) return;
                sel.classList.remove('is-open');
                $('.dfind__pill', sel).setAttribute('aria-expanded', 'false');
            });
        };

        $$('.dfind__sel', find).forEach((sel) => {
            const key = sel.dataset.findSel;
            const pill = $('.dfind__pill', sel);

            pill.addEventListener('click', () => {
                const open = !sel.classList.contains('is-open');
                closeMenus(sel);
                sel.classList.toggle('is-open', open);
                pill.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            $$('button[data-value]', sel).forEach((option) => {
                option.addEventListener('click', () => {
                    /* The option's own count is markup, not part of its label. */
                    const label = option.firstChild.textContent.trim();
                    setPick(key, option.dataset.value, label, sel);
                    closeMenus();
                });
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dfind__sel')) closeMenus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenus();
        });

        let timer;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                q = input.value.trim().toLowerCase();
                limit = step;
                apply();
            }, 120);
        });

        if (clear) {
            clear.addEventListener('click', () => {
                input.value = '';
                q = '';
                limit = step;
                apply();
                input.focus();
            });
        }

        if (reset) {
            reset.addEventListener('click', () => {
                input.value = '';
                q = '';
                $$('.dfind__sel', find).forEach((sel) => {
                    const all = $('button[data-value=""]', sel);
                    setPick(sel.dataset.findSel, '', all.textContent.trim(), sel);
                });
                limit = step;
                apply();
            });
        }

        if (more) {
            more.addEventListener('click', () => {
                limit = cards.length;
                apply();
                /* The first card that was not there a moment ago, so the eye
                   lands on new rows rather than staying at the button. */
                const first = cards.filter((c) => !c.classList.contains('is-out'))[step];
                if (first) first.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
            });
        }

        apply();
    };

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

        /* An article's tag links point here as /blog?tag=Cardiology.
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
       Careers. window.TMH_JOBS was the prototype's single source
       for both the list and the detail page. The PHP site renders
       both server-side from the jobs table, so nothing defines it
       any more and JOBS() returns an empty array — the branches
       below are reached only when the markup lacks data-server.
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

    /* Fills the count line and hides the empty panel. Shared by
       both paths below so the two lists read identically. */
    const jobTally = (n, count, empty, list) => {
        if (list) list.hidden = n === 0;
        if (empty) empty.hidden = n > 0;
        if (count) {
            count.textContent = n === 0
                ? 'No roles match that filter'
                : `${n} open ${n === 1 ? 'role' : 'roles'}`;
        }
    };

    /* ---------------------------------------------------------
       The vacancy list.

       A server-rendered list — marked data-server — is filtered
       in place: the rows came from the database and rebuilding
       them from TMH_JOBS would replace real markup with a copy,
       or with nothing at all where that global is absent. The
       static build has no such list and keeps rendering its own.
       --------------------------------------------------------- */
    const initCareers = () => {
        const list = $('#jobList');
        if (!list) return;

        const empty = $('#jobEmpty');
        const count = $('#jobCount');
        const filter = $('#jobFilter');

        if ('server' in list.dataset) {
            const rows = [...list.children];

            if (filter) {
                [...new Set(rows.map((li) => li.dataset.dept).filter(Boolean))].sort().forEach((dept) => {
                    const opt = document.createElement('option');
                    opt.value = dept;
                    opt.textContent = dept;
                    filter.appendChild(opt);
                });

                filter.addEventListener('change', () => {
                    let shown = 0;

                    rows.forEach((li) => {
                        const match = !filter.value || li.dataset.dept === filter.value;
                        li.hidden = !match;
                        if (match) shown += 1;
                    });

                    jobTally(shown, count, empty, null);
                });
            }

            jobTally(rows.length, count, empty, null);
            return;
        }

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
                <a class="arrow-link" href="${url('careers/' + encodeURIComponent(job.id))}"><i
                        class="fa-solid fa-arrow-right"></i> View &amp; apply</a>
            </li>`).join('');

            jobTally(rows.length, count, empty, list);
        };

        render('');
        if (filter) filter.addEventListener('change', () => render(filter.value));
    };

    /* ---------------------------------------------------------
       Job detail — /careers/{slug}. An unknown or missing id
       shows the not-found panel and takes the form away, so an
       expired link cannot collect applications for nothing.

       The PHP site renders this server-side and deliberately omits
       #jobDetail (app/page/site/job.php), so initJob() returns on its
       first line and this block is the prototype's path only.
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
                <a href="${url('careers')}" class="btn-primary"><i class="fa-solid fa-arrow-left"></i> All open roles</a>
                <a href="mailto:careers@teresamemorialhospital.com" class="arrow-link"><i
                        class="fa-solid fa-envelope"></i> Email careers@teresamemorialhospital.com</a>
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
            mailto.href = `mailto:careers@teresamemorialhospital.com?subject=${encodeURIComponent(`Application — ${job.title}`)}`;
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
        const endpoint = form.getAttribute('action');

        files.forEach((input) => input.addEventListener('change', () => checkFile(input)));

        /* The role is rendered into the field's value attribute, so a
           reset() puts it back on its own. */
        const clear = () => files.forEach((input) => {
            const box = input.closest('.cr-file');
            const nameEl = box && $('[data-file-name]', box);
            if (nameEl) nameEl.classList.remove('is-visible');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            /* file checks first — reportValidity() would otherwise pass a
               5 MB .png sitting in a required input */
            if (files.some((input) => !checkFile(input))) return;
            if (!form.reportValidity()) return;

            if (!endpoint) {
                const role = $('#apRole', form);
                const keepRole = role ? role.value : '';
                form.reset();
                if (role) role.value = keepRole;
                clear();
                flash(note);
                return;
            }

            post(form, endpoint, note, clear);
        });
    };

    /* ---------------------------------------------------------
       Gallery — /gallery.

       Three jobs: the chips, the mosaic, and the viewer.

       The mosaic's spans are set here rather than in the
       stylesheet because :nth-child counts hidden tiles too — an
       album with four photographs in it would inherit whatever
       pattern position its rows happened to hold in the full set,
       and the block would come out with holes in it. The pattern
       is laid over the visible run, every time the run changes.

       The viewer is built on open and torn down on close, every
       time. That is not tidiness — a YouTube iframe left in the
       document goes on playing its audio behind a closed dialog,
       and thirty <video> elements with a src are thirty range
       requests on a page nobody has clicked yet. The grid is
       posters only; a player exists for exactly as long as
       somebody is looking at it.
       --------------------------------------------------------- */
    const initGallery = () => {
        const grid = $('#galGrid');
        if (!grid) return;

        const tiles = $$('.gal-tile', grid);
        const typeChips = $$('#galTags [data-type]');
        const albumChips = $$('#galTags [data-album]');
        const none = $('#galNone');

        const box = $('#galLightbox');
        const stage = $('#lbStage');
        const titleEl = $('#lbTitle');
        const capEl = $('#lbCaption');
        const countEl = $('#lbCount');
        const closeBtn = $('#lbClose');
        const prevBtn = $('#lbPrev');
        const nextBtn = $('#lbNext');

        /* `shown` is what the grid is showing; `list` is what the arrows walk.
           They are the same thing when a tile was clicked — pressing `next`
           inside an album should not wander out of it — and the rail's own
           cards when one of those was, so the viewer opened from the channel
           steps through the channel. */
        let shown = tiles.slice();
        let list = shown;
        let at = -1;
        let opener = null;

        /* --- the mosaic ---

           Each plan is one band: a run of tiles whose cells add up to whole
           rows of the four-column module, so a band never ends halfway across
           and the next one never starts in a hole. Widths are clamped to the
           column count, which is how the same plans tile the two-column phone
           grid — every plan's row is either one wide tile or two narrow ones.

           [width, height] in cells. */
        const PLANS = {
            1: [[4, 1]],
            2: [[2, 1], [2, 1]],
            3: [[2, 1], [1, 1], [1, 1]],
            4: [[1, 1], [1, 1], [1, 1], [1, 1]],
            5: [[2, 2], [1, 1], [1, 1], [1, 1], [1, 1]],
            6: [[2, 2], [1, 1], [1, 1], [2, 1], [2, 1], [2, 1]],
        };

        const mosaic = () => {
            const cols = Number(getComputedStyle(grid).getPropertyValue('--gal-cols')) || 4;
            let i = 0;

            while (i < shown.length) {
                const rest = shown.length - i;
                /* Seven left would be a band of six and then a lone tile
                   stretched across the whole width. Three and four is the
                   better pair of bands. */
                const take = rest > 6 ? (rest === 7 ? 3 : 6) : rest;

                PLANS[take].forEach(([w, h], k) => {
                    const tile = shown[i + k];
                    tile.style.setProperty('--w', Math.min(w, cols));
                    tile.style.setProperty('--h', h);
                });

                i += take;
            }
        };

        /* --- chips ---
           Type and album are two questions, not one row of chips: "video" and
           "Talks & Camps" are both true of the same row and picking one should
           not clear the other. */
        let album = '';
        let kind = '';

        const filter = () => {
            shown = tiles.filter((tile) => {
                const type = tile.dataset.type === 'image' ? 'image' : 'video';
                const hit = (!album || tile.dataset.album === album) && (!kind || type === kind);
                tile.hidden = !hit;
                return hit;
            });

            if (none) none.hidden = shown.length > 0;
            mosaic();
        };

        const wire = (chips, key, set) => {
            chips.forEach((chip) => {
                chip.addEventListener('click', () => {
                    chips.forEach((c) => c.classList.toggle('is-active', c === chip));
                    set(chip.dataset[key] || '');
                    filter();
                });
            });
        };

        wire(albumChips, 'album', (v) => { album = v; });
        wire(typeChips, 'type', (v) => { kind = v; });

        mosaic();

        /* The plans are the same at either column count but the clamp is not,
           so a rotated phone re-lays the block. */
        let redraw;
        window.addEventListener('resize', () => {
            clearTimeout(redraw);
            redraw = setTimeout(mosaic, 150);
        }, { passive: true });

        /* --- the viewer --- */

        if (!box) return;

        const player = (tile) => {
            const d = tile.dataset;

            if (d.type === 'youtube' && d.youtube) {
                /* -nocookie, and no `origin`: the embed sets nothing until it
                   is played. autoplay is honest here — the visitor pressed a
                   play button to get this far. */
                return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(d.youtube)}?autoplay=1&rel=0&modestbranding=1"
                    title="${esc(d.title)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
            }

            if (d.type === 'video' && d.src) {
                return `<video src="${esc(d.src)}" poster="${esc(d.poster)}" controls autoplay playsinline
                    preload="metadata"></video>`;
            }

            return `<img src="${esc(d.src || d.poster)}" alt="${esc(d.title)}">`;
        };

        const show = (i) => {
            at = (i + list.length) % list.length;

            const tile = list[at];
            const d = tile.dataset;

            stage.innerHTML = player(tile);
            if (titleEl) titleEl.textContent = d.title || '';
            if (capEl) capEl.textContent = d.caption || '';
            if (countEl) countEl.textContent = `${at + 1} of ${list.length}`;

            const many = list.length > 1;
            if (prevBtn) prevBtn.hidden = !many;
            if (nextBtn) nextBtn.hidden = !many;
        };

        const close = () => {
            box.hidden = true;
            /* Emptied, not hidden: see the note at the top of this block. */
            stage.innerHTML = '';
            document.body.classList.remove('lb-open');
            at = -1;

            if (opener) {
                opener.focus();
                opener = null;
            }
        };

        const open = (tile, from) => {
            list = from;

            const i = list.indexOf(tile);
            if (i < 0) return;

            opener = tile;
            box.hidden = false;
            document.body.classList.add('lb-open');
            show(i);
            if (closeBtn) closeBtn.focus();
        };

        tiles.forEach((tile) => tile.addEventListener('click', () => open(tile, shown)));

        /* --- the channel rail ---
           Half the cards in the track are the copy that makes the loop
           seamless. A click on one of those opens the card it was copied from,
           so the viewer never counts the same video twice. */
        const railCards = $$('[data-yt-card]');

        /* One entry per video. A short channel is repeated inside the run as
           well as copied for the loop, so the cards are not one video each. */
        const keys = new Set();
        const railList = railCards.filter((card) => {
            if (card.dataset.clone || keys.has(card.dataset.key)) return false;
            keys.add(card.dataset.key);

            return true;
        });

        railCards.forEach((card) => {
            card.addEventListener('click', () => {
                const first = railList.find((c) => c.dataset.key === card.dataset.key);
                open(first || card, first ? railList : [card]);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (prevBtn) prevBtn.addEventListener('click', () => show(at - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => show(at + 1));

        /* The backdrop closes; anything inside the figure does not. */
        box.addEventListener('click', (e) => {
            if (e.target === box) close();
        });

        document.addEventListener('keydown', (e) => {
            if (box.hidden) return;

            if (e.key === 'Escape') {
                close();
                return;
            }

            if (list.length < 2) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                show(at - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                show(at + 1);
            }
        });

        /* Tab stays inside the dialog. Three controls, so the trap is the
           three of them in order rather than a query for everything
           focusable — the <video> element's own controls are reached with
           the arrow keys the browser already gives them. */
        box.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const stops = [closeBtn, prevBtn, nextBtn].filter((b) => b && !b.hidden);
            if (!stops.length) return;

            const i = stops.indexOf(document.activeElement);
            const next = e.shiftKey
                ? stops[(i <= 0 ? stops.length : i) - 1]
                : stops[(i + 1) % stops.length];

            e.preventDefault();
            next.focus();
        });
    };

    const boot = () => {
        initBanner();
        initPostHero();
        initStats();
        initDoctorFilter();
        initBlogFilter();
        initQuotes();
        initGallery();
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
