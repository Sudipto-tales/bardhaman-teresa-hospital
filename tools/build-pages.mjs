/* =========================================================
   Teresa Memorial Hospital — inner-page generator.

       node tools/build-pages.mjs

   Writes plain static HTML into the repo root. Nothing on the
   live site depends on this script — it exists so the eighteen
   inner pages cannot drift apart in their shell, nav or footer.
   Edit the copy in tools/site-data.mjs, the markup here, then
   re-run it.
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
    DEPARTMENTS, ROSTER, POSTS, FACILITIES, VALUES, MILESTONES, IMG, DOCS,
    PILLARS, QUOTES, CAREER_CHECKS, CAREER_BENEFITS,
} from './site-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ---------------------------------------------------------
   SHELL
   Everything outside <main> is identical on all pages, which
   is the whole reason this file exists.
   --------------------------------------------------------- */

const megaMenu = () => DEPARTMENTS
    .map((d) => `                    <a href="${d.slug}.html" class="nav-mega-item">${d.name} <span>${d.menuNote}</span></a>`)
    .join('\n');

/* `active` matches one of: home | about | departments | facilities | contact */
const navBar = (active) => `        <nav class="nav-bar" aria-label="Primary">
            <a href="website.html" class="nav-link${active === 'home' ? ' is-active' : ''}">Home</a>
            <a href="about.html" class="nav-link${active === 'about' ? ' is-active' : ''}">About Us</a>

            <div class="nav-drop">
                <a href="departments.html" class="nav-link${active === 'departments' ? ' is-active' : ''}">Our Department <i class="fa-solid fa-chevron-down"></i></a>
                <div class="nav-mega">
                    <a href="departments.html" class="nav-mega-item">All Departments <span>Overview &amp; Directory</span></a>
${megaMenu()}
                </div>
            </div>

            <a href="facilities.html" class="nav-link${active === 'facilities' ? ' is-active' : ''}">Facilities</a>
            <a href="careers.html" class="nav-link${active === 'careers' ? ' is-active' : ''}">Careers</a>
            <a href="contact.html" class="nav-link${active === 'contact' ? ' is-active' : ''}">Contact</a>

            <button type="button" class="nav-search-toggle" id="navSearchBtn" aria-label="Search the site"
                aria-expanded="false" aria-controls="navSearch"><i class="fa-solid fa-magnifying-glass"></i></button>

            <!-- borrows .nav-search-toggle so it picks up the same shape and
                 the same over-hero / is-compact colour states -->
            <button type="button" class="nav-search-toggle nav-theme-toggle" id="themeBtn" aria-pressed="false"
                aria-label="Switch to dark theme"><i class="fa-solid fa-moon"></i><i
                    class="fa-solid fa-sun"></i></button>

            <a href="contact.html#emergency" class="nav-emergency"><i class="fa-solid fa-truck-medical"></i> Emergency</a>

            <!-- takes over the whole bar while open; see .nav-bar.is-searching -->
            <div class="nav-search" id="navSearch" role="search">
                <i class="fa-solid fa-magnifying-glass nav-search__icon"></i>
                <input type="text" id="navSearchInput" class="nav-search__input" autocomplete="off" spellcheck="false"
                    placeholder="Search this page — sections, doctors, tests…" aria-label="Search the site"
                    aria-autocomplete="list" aria-controls="navSearchResults">
                <button type="button" class="nav-search__close" id="navSearchClose" aria-label="Close search"><i
                        class="fa-solid fa-xmark"></i></button>
                <div class="nav-search__panel" id="navSearchResults" role="listbox" aria-label="Search results"></div>
            </div>

            <button class="nav-burger" id="navBurger" aria-label="Open menu" aria-controls="mobileMenu"><span></span></button>
        </nav>`;

const HEADER = (active) => `    <!-- ============ BRAND RAIL (fixed — never scrolls away) ============ -->
    <div class="brand-rail" id="brandRail">
        <a href="website.html" class="brand-rail__link">
            <img src="assets/logo-teresa.png" alt="Teresa Memorial Hospital" class="brand-rail__logo"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <span class="brand-rail__fallback" style="display:none">
                <span class="brand-rail__mark"><i class="fa-solid fa-plus"></i></span>
                <span class="brand-rail__word">TERESA<span>MEMORIAL</span></span>
            </span>
        </a>
    </div>

    <!-- ============ NAV (separate element — hides on scroll-down) ============ -->
    <div class="nav-shell" id="navShell">
        <div class="nav-topbar">
            <span><i class="fa-solid fa-envelope"></i> contact@teresamemorial.org</span>
            <span><i class="fa-solid fa-phone"></i> +91 342 325 4567</span>
        </div>

${navBar(active)}
    </div>

    <!-- mobile overlay menu -->
    <div class="mobile-menu" id="mobileMenu">
        <a href="website.html">Home</a>
        <a href="about.html">About Us</a>
        <a href="departments.html">Our Department</a>
        <a href="facilities.html">Facilities</a>
        <a href="doctors.html">Doctors</a>
        <a href="blog.html">Blog</a>
        <a href="careers.html">Careers</a>
        <a href="contact.html">Contact</a>
    </div>

    <!-- ============ FLOATING GLASS DOCK (left) ============ -->
    <aside class="dock" aria-label="Quick actions">
        <div class="dock__inner" id="dock">
            <a href="doctors.html" class="dock__btn" aria-label="Find a Doctor">
                <i class="fa-solid fa-stethoscope"></i>
                <span class="dock__tip">Find a Doctor</span>
            </a>
            <a href="contact.html#map" class="dock__btn" aria-label="Our Location">
                <i class="fa-solid fa-truck-medical"></i>
                <span class="dock__tip">Our Location</span>
            </a>
            <a href="tel:+913423254567" class="dock__btn" aria-label="Connect With Us">
                <i class="fa-solid fa-phone"></i>
                <span class="dock__tip">Connect With Us</span>
            </a>
            <a href="https://wa.me/913423254567" class="dock__btn dock__btn--wa" aria-label="WhatsApp" target="_blank"
                rel="noopener">
                <i class="fa-brands fa-whatsapp"></i>
                <span class="dock__tip">WhatsApp</span>
            </a>
        </div>
    </aside>

    <!-- ============ SCROLL-SPY RAIL (right, populated from [data-section]) ============ -->
    <nav class="spy" id="spy" aria-label="Section navigation"></nav>`;

const FOOTER = `    <!-- ============ PRE-FOOTER ============ -->
    <div class="prefooter" id="prefooter">
        <div class="prefooter__card">
            <p>Teresa Memorial operates more than 20 units, including specialist day-care centres.</p>
            <a class="prefooter__btn" href="departments.html" aria-label="See our departments"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="prefooter__card">
            <p>Delivering an exceptional care experience for every kind of patient.</p>
            <a class="prefooter__btn" href="about.html" aria-label="About the hospital"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="prefooter__card">
            <p>It is our privilege to care for more than a million people across the district.</p>
            <a class="prefooter__btn" href="about.html" aria-label="Our reach"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="prefooter__card">
            <p>Driven by a desire to help, we collaborate and support one another.</p>
            <a class="prefooter__btn" href="doctors.html" aria-label="Meet the team"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
    </div>

    <!-- ============ FOOTER ============ -->
    <footer class="site-footer">
        <svg class="site-footer__ecg" id="footerEcg" viewBox="0 0 1200 60" preserveAspectRatio="none"
            aria-hidden="true">
            <path d="M0 30 H320 l14 -22 l16 44 l14 -30 l12 14 H700 l16 -26 l18 40 l14 -28 H1200" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <div class="ft__grid">
            <div class="ft__col">
                <a class="ft__logo" href="website.html" aria-label="Teresa Memorial Hospital">
                    <img src="assets/logo-teresa.png" alt="Teresa Memorial Hospital" loading="lazy">
                </a>

                <div class="ft__contact">
                    <p><strong>Location:</strong> G.T. Road, Bardhaman,<br>West Bengal 713101</p>
                    <p><strong>Visiting Hours:</strong><br>
                        Sunday: 08:00 AM &ndash; 10:00 PM<br>
                        Monday &ndash; Friday: 06:00 AM &ndash; 12:00 AM</p>
                </div>
            </div>

            <div class="ft__col">
                <h4>Community</h4>
                <ul>
                    <li><a href="doctors.html">Doctors</a></li>
                    <li><a href="website.html#testimonials">Testimonials</a></li>
                    <li><a href="website.html#faq">FAQs</a></li>
                    <li><a href="blog.html">Blog</a></li>
                    <li><a href="departments.html">Site Map</a></li>
                </ul>
            </div>

            <div class="ft__col">
                <h4>About</h4>
                <ul>
                    <li><a href="careers.html">Careers</a></li>
                    <li><a href="blog.html">Education</a></li>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="departments.html">Areas of Care</a></li>
                    <li><a href="careers.html#openings">Volunteers</a></li>
                </ul>
            </div>

            <div class="ft__col">
                <h4>Support</h4>
                <ul>
                    <li><a href="facilities.html#visiting">Visitor Information</a></li>
                    <li><a href="contact.html#emergency">Emergency Care</a></li>
                    <li><a href="contact.html">Donate</a></li>
                    <li><a href="lab-diagnostics.html">Online Services</a></li>
                    <li><a href="contact.html">Pay Your Bills</a></li>
                </ul>
            </div>

            <div class="ft__col">
                <h4>Trust &amp; Legal</h4>
                <ul>
                    <li><a href="contact.html">Terms &amp; Conditions</a></li>
                    <li><a href="contact.html">Privacy Policy</a></li>
                    <li><a href="facilities.html#visiting">Hospital Stay</a></li>
                </ul>

                <h4>Social Media</h4>
                <div class="ft__social">
                    <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
    </footer>

    <div class="ft__bottom">
        <p class="ft__bottom-copy">&copy; 2026 Teresa Memorial Hospital. All rights reserved.</p>
        <p class="ft__bottom-tag" lang="bn">মানুষের সাথে ..... মানুষের পাশে</p>
        <a class="ft__dev" href="https://promix.tech/" target="_blank" rel="noopener noreferrer" data-tip="Promix"
            aria-label="Developed by Promix">
            <span>Developed by</span>
            <img src="assets/promix-logo.png" alt="Promix" loading="lazy">
        </a>
    </div>

    <button class="to-top" id="toTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>

    <!-- ============ SCRIPTS ============ -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
    <script src="assets/website.js"></script>
    <script src="assets/pages.js"></script>`;

/* `scripts` appends page-specific <script> tags after the shared ones.
   Order is safe either way — they are classic, non-deferred scripts, so
   they all run before pages.js boots on DOMContentLoaded. */
const page = ({ file, title, desc, active, body, scripts = '' }) => `<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">

    <!-- Theme resolved before the stylesheet so the first paint is already
         correct — a deferred script would flash the light page first.
         Stored choice wins; with none, follow the OS. -->
    <script>
        (function () {
            try {
                var stored = localStorage.getItem('tmh-theme');
                document.documentElement.dataset.theme = stored
                    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            } catch (e) { /* private mode — stay on the light default */ }
        })();
    </script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} &mdash; Teresa Memorial Hospital</title>
    <meta name="description" content="${desc}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">

    <link rel="stylesheet" href="assets/website.css">
    <link rel="stylesheet" href="assets/pages.css">
</head>

<body>

${HEADER(active)}

${body}

${FOOTER}${scripts}
</body>

</html>
`;

/* ---------------------------------------------------------
   BLOCKS
   Each returns a chunk of <main>. They map one-to-one onto the
   sections of assets/pages.css.
   --------------------------------------------------------- */

/* crumb: [{label, href}] — the last entry is rendered as current */
const banner = ({ crumb, title, strong, lead, img, chips = [], primary, ghost }) => `        <!-- ============ PAGE BANNER ============ -->
        <section class="pg-hero">
            <img class="pg-hero__img" src="${img}" alt="" aria-hidden="true">
            <div class="pg-hero__scrim"></div>
            <div class="pg-hero__ring" aria-hidden="true"></div>
            <svg class="pg-hero__ecg" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 40 H300 l14 -24 l16 46 l14 -32 l12 16 H680 l16 -28 l18 42 l14 -30 H1200" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <div class="pg-hero__inner">
                <nav class="pg-crumb" aria-label="Breadcrumb">
${crumb.map((c, i) => (i === crumb.length - 1
        ? `                    <span aria-current="page">${c.label}</span>`
        : `                    <a href="${c.href}">${c.label}</a>
                    <i class="fa-solid fa-chevron-right"></i>`)).join('\n')}
                </nav>

                <div class="pg-hero__head">
                    <h1>${title} <strong>${strong}</strong></h1>
                    <p class="pg-hero__lead">${lead}</p>
                </div>

                <div class="pg-hero__actions">
                    <a href="${primary.href}" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> ${primary.label}</a>
                    <a href="${ghost.href}" class="btn-ghost"><i class="fa-solid ${ghost.icon}"></i> ${ghost.label}</a>
                </div>
${chips.length ? `
                <div class="pg-hero__chips">
${chips.map((c) => `                    <span class="pg-hero__chip"><i class="fa-solid fa-circle-check"></i> ${c}</span>`).join('\n')}
                </div>` : ''}
            </div>
        </section>`;

const stats = (rows) => `        <!-- ============ GROWTH STATS ============ -->
        <section class="pg-stats" aria-label="Key figures">
            <div class="pg-stats__grid">
${rows.map((s) => `                <div class="pg-stat">
                    <i class="pg-stat__icon fa-solid ${s.icon}"></i>
                    <p class="pg-stat__num"><span class="pg-stat__value" data-count="${s.count}">${s.count}</span><span
                            class="pg-stat__suffix">${s.suffix}</span></p>
                    <p class="pg-stat__label">${s.label}</p>
                    <span class="pg-stat__note"><i class="fa-solid fa-arrow-trend-up"></i> ${s.note}</span>
                </div>`).join('\n')}
            </div>
        </section>`;

const intro = ({ section, eyebrow, title, body, checks, img, badge, alt = false }) => `        <section class="pg-section${alt ? ' pg-section--alt' : ''}" data-section="${section}">
            <div class="pg-wrap">
                <div class="pg-intro">
                    <div class="pg-intro__copy">
                        <span class="eyebrow">${eyebrow}</span>
                        <h2>${title}</h2>
${body.map((p) => `                        <p>${p}</p>`).join('\n')}

                        <ul class="pg-checks">
${checks.map((c) => `                            <li><i class="fa-solid fa-circle-check"></i> ${c}</li>`).join('\n')}
                        </ul>
                    </div>

                    <div class="pg-intro__media">
                        <div class="img-stretch">
                            <img src="${img}" alt="Inside Teresa Memorial Hospital" loading="lazy">
                        </div>
                        <div class="pg-badge">
                            <span class="pg-badge__icon"><i class="fa-solid ${badge.icon}"></i></span>
                            <div>
                                <h4>${badge.title}</h4>
                                <p>${badge.text}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

const cards = ({ section, eyebrow, title, items, alt = false, center = true }) => `        <section class="pg-section${alt ? ' pg-section--alt' : ''}" data-section="${section}">
            <div class="pg-wrap">
                <div class="section-head${center ? ' section-head--center' : ''}">
                    <span class="eyebrow">${eyebrow}</span>
                    <h2>${title}</h2>
                </div>

                <div class="pg-cards">
${items.map((c) => `                    ${c.href ? `<a class="pg-card" href="${c.href}">` : '<article class="pg-card">'}
                        <span class="pg-card__icon"><i class="fa-solid ${c.icon}"></i></span>
                        <h3>${c.title}</h3>
                        <p>${c.text}</p>
                    ${c.href ? '</a>' : '</article>'}`).join('\n')}
                </div>
            </div>
        </section>`;

const conditions = ({ section, id = '', title, lead, items, alt = false }) => `        <section class="pg-section${alt ? ' pg-section--alt' : ''}"${id ? ` id="${id}"` : ''} data-section="${section}">
            <div class="pg-wrap">
                <div class="pg-cond">
                    <div class="pg-cond__intro">
                        <h2>${title}</h2>
                        <p>${lead}</p>
                        <a href="contact.html" class="arrow-link arrow-link--cool"><i class="fa-solid fa-arrow-right"></i> Book an appointment</a>
                    </div>

                    <ul class="pg-cond__list">
${items.map((c) => `                        <li><i class="fa-solid fa-check"></i> ${c}</li>`).join('\n')}
                    </ul>
                </div>
            </div>
        </section>`;

const team = ({ section, eyebrow, title, docs, alt = false }) => `        <section class="pg-section${alt ? ' pg-section--alt' : ''}" data-section="${section}">
            <div class="pg-wrap">
                <div class="section-head section-head--center">
                    <span class="eyebrow">${eyebrow}</span>
                    <h2>${title}</h2>
                </div>

                <div class="pg-team">
${docs.map((d) => `                    <article class="pg-doc">
                        <div class="pg-doc__img img-stretch">
                            <img src="${d.img}" alt="${d.name}" loading="lazy">
                        </div>
                        <div class="pg-doc__body">
                            <h4>${d.name}</h4>
                            <p>${d.role}</p>
                            <span class="pg-doc__qual">${d.qual}</span>
                        </div>
                    </article>`).join('\n')}
                </div>
            </div>
        </section>`;

const cta = ({ title, text }) => `        <section class="pg-section pg-section--tight">
            <div class="pg-wrap">
                <div class="pg-cta">
                    <div>
                        <h2>${title}</h2>
                        <p>${text}</p>
                    </div>
                    <div class="pg-cta__actions">
                        <a href="contact.html" class="btn-light"><i class="fa-solid fa-calendar-check"></i> Book an Appointment</a>
                        <a href="tel:+913423254567" class="btn-outline"><i class="fa-solid fa-phone"></i> +91 342 325 4567</a>
                    </div>
                </div>
            </div>
        </section>`;

/* A photo strip carrying its own copy, then the three pastel
   mission / vision / values cards. `title` takes <span> per line —
   the reference breaks it manually rather than relying on wrap. */
const purpose = ({ section, eyebrow, title, img, cta: btn, items, alt = false }) => `        <section class="pg-section${alt ? ' pg-section--alt' : ''}" data-section="${section}">
            <div class="pg-wrap">
                <div class="ab-banner">
                    <img src="${img}" alt="" aria-hidden="true" loading="lazy">
                    <div class="ab-banner__copy">
                        <span class="eyebrow eyebrow--onDark">${eyebrow}</span>
                        <h2>${title}</h2>
                        <a href="${btn.href}" class="btn-primary"><i class="fa-solid fa-circle-arrow-right"></i> ${btn.label}</a>
                    </div>
                </div>

                <div class="ab-pillars">
${items.map((p) => `                    <article class="ab-pillar">
                        <i class="ab-pillar__icon fa-solid ${p.icon}"></i>
                        <h3>${p.title}</h3>
                        <p>${p.text}</p>
                    </article>`).join('\n')}
                </div>
            </div>
        </section>`;

/* Interlocking tiles: two photos, the Google rating, a testimonial
   carousel (driven by initQuotes in pages.js) and the accreditation
   card. Placement lives in the .ab-mosaic grid-template-areas. */
const mosaic = ({ section, photoA, photoB, rating, quotes, cred, alt = false }) => `        <section class="pg-section${alt ? ' pg-section--alt' : ''}" data-section="${section}">
            <div class="pg-wrap">
                <div class="ab-mosaic">
                    <figure class="ab-tile ab-tile--a">
                        <img src="${photoA.src}" alt="${photoA.alt}" loading="lazy">
                    </figure>

                    <div class="ab-rating">
                        <span class="eyebrow">${rating.label}</span>
                        <p class="ab-rating__score"><i class="fa-solid fa-star"></i><span class="pg-stat__value"
                                data-count="${rating.score}">${rating.score}</span></p>
                    </div>

                    <figure class="ab-tile ab-tile--b">
                        <img src="${photoB.src}" alt="${photoB.alt}" loading="lazy">
                    </figure>

                    <div class="ab-quote" id="abQuote">
                        <span class="ab-quote__mark" aria-hidden="true">&rdquo;</span>

                        <!-- attribution rides on each slide as data-*; the footer
                             below shows one set and initQuotes swaps it -->
                        <div class="ab-quote__track" aria-live="polite">
${quotes.map((q, i) => `                            <blockquote class="ab-quote__slide${i === 0 ? ' is-active' : ''}" data-name="${q.name}"
                                data-role="${q.role}" data-img="${q.img}">&ldquo;${q.text}&rdquo;</blockquote>`).join('\n')}
                        </div>

                        <div class="ab-quote__foot">
                            <div class="ab-quote__who">
                                <img class="ab-quote__avatar" src="${quotes[0].img}" alt="" loading="lazy">
                                <div>
                                    <span class="ab-quote__name">${quotes[0].name}</span>
                                    <span class="ab-quote__role">${quotes[0].role}</span>
                                </div>
                            </div>

                            <div class="ab-quote__nav">
                                <button type="button" data-quote="prev" aria-label="Previous testimonial"><i
                                        class="fa-solid fa-arrow-left"></i></button>
                                <button type="button" data-quote="next" aria-label="Next testimonial"><i
                                        class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="ab-cred">
                        <span class="ab-cred__icon"><i class="fa-solid ${cred.icon}"></i></span>
                        <div>
                            <span class="eyebrow">${cred.label}</span>
                            <h3>${cred.title}</h3>
                            <a href="${cred.href}" class="arrow-link arrow-link--cool"><i class="fa-solid fa-arrow-right"></i> ${cred.link}</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

const main = (...blocks) => {
    const list = blocks.filter(Boolean);
    /* The stats band rides up over the banner's foot, so a banner that is
       followed by one needs extra floor clearance for its chips. */
    if (list[1]?.includes('class="pg-stats"')) {
        list[0] = list[0].replace('<section class="pg-hero">', '<section class="pg-hero pg-hero--stats">');
    }
    return `    <main id="top">\n${list.join('\n\n')}\n    </main>`;
};

/* ---------------------------------------------------------
   DEPARTMENT PAGES
   --------------------------------------------------------- */
const departmentPage = (d) => page({
    file: `${d.slug}.html`,
    title: d.name,
    desc: d.lead.replace(/<[^>]+>/g, ''),
    active: 'departments',
    body: main(
        banner({
            crumb: [
                { label: 'Home', href: 'website.html' },
                { label: 'Departments', href: 'departments.html' },
                { label: d.name },
            ],
            title: d.titleLead,
            strong: d.titleStrong,
            lead: d.lead,
            img: d.banner,
            chips: d.chips,
            primary: { href: 'contact.html', label: 'Book an Appointment' },
            ghost: { href: 'doctors.html', icon: 'fa-user-doctor', label: 'Meet the Doctors' },
        }),
        stats(d.stats),
        intro({
            section: 'Overview',
            eyebrow: d.name,
            title: d.introTitle,
            body: d.introBody,
            checks: d.checks,
            img: d.introImg,
            badge: d.badge,
        }),
        cards({
            section: 'Procedures',
            eyebrow: 'What We Do',
            title: `Procedures &amp; <strong>Services</strong>`,
            items: d.procedures,
            alt: true,
        }),
        conditions({
            section: 'Conditions',
            title: d.conditionsTitle,
            lead: d.conditionsLead,
            items: d.conditions,
        }),
        team({
            section: 'Doctors',
            eyebrow: 'The Team',
            title: `Consultants In <strong>${d.name}</strong>`,
            docs: d.team,
            alt: true,
        }),
        cta({
            title: `Speak to the ${d.name} team`,
            text: 'Appointments are confirmed the same day. Emergencies do not need one — walk in at any hour.',
        }),
    ),
});

/* ---------------------------------------------------------
   ABOUT
   --------------------------------------------------------- */
const aboutPage = () => page({
    file: 'about.html',
    title: 'About Us',
    desc: 'Teresa Memorial Hospital — 210 beds, 20 units and three decades of care for Bardhaman and the districts around it.',
    active: 'about',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'About Us' }],
            title: 'Three Decades Of',
            strong: 'Compassionate Care',
            lead: 'Teresa Memorial opened in 1994 with forty beds and one operating theatre. It now runs 210 beds across twenty units — and treats the same first patient the same way.',
            img: IMG.team(),
            chips: ['Founded 1994', '210 beds · 20 units', 'Serving 1.2 million people'],
            primary: { href: 'departments.html', label: 'Explore Departments' },
            ghost: { href: 'doctors.html', icon: 'fa-user-doctor', label: 'Meet the Doctors' },
        }),
        stats([
            { icon: 'fa-calendar', count: 32, suffix: ' yrs', label: 'Caring for the district', note: 'Since 1994' },
            { icon: 'fa-bed', count: 210, suffix: '', label: 'Beds across 20 units', note: '30 added in 2025' },
            { icon: 'fa-user-doctor', count: 64, suffix: '+', label: 'Doctors and consultants', note: '12 joined this year' },
            { icon: 'fa-users', count: 1200000, suffix: '+', label: 'People in our catchment', note: 'Bardhaman & beyond' },
        ]),
        intro({
            section: 'Our Story',
            eyebrow: 'About Teresa Memorial',
            title: 'Built by the district, <strong>for the district</strong>',
            body: [
                'The hospital began as a subscription raised by local families who were tired of sending relatives to Kolkata for care that should have been available at home. That origin still shapes how it is run.',
                'Growth has been deliberate. A unit opens when the district needs it and when we can staff it properly — never as a line on a brochure. Cardiology came in 2011, dialysis in 2014, the maternity block in 2017.',
                'What has not changed is the rule the founders wrote into the trust deed: treatment starts before payment is discussed.',
            ],
            checks: ['Trust-run, not investor-owned', 'Surpluses reinvested in equipment', 'Free emergency stabilisation', 'Subsidised beds for the district', 'Monthly clinical audit', 'Complaints answered in 72 hours'],
            img: IMG.corridor(1000),
            badge: { icon: 'fa-hand-holding-heart', title: 'Care before paperwork', text: 'No emergency is delayed for a payment conversation.' },
        }),
        purpose({
            section: 'Purpose',
            eyebrow: 'Healthcare Solution',
            title: '<span>Your Health Is Our</span><span>Top Priority</span>',
            img: IMG.stress(1600),
            cta: { href: 'departments.html', label: 'Learn More' },
            items: PILLARS,
        }),
        cards({
            section: 'Values',
            eyebrow: 'How We Work',
            title: 'The Six Things We <strong>Refuse To Compromise</strong>',
            items: VALUES,
            alt: true,
        }),
        conditions({
            section: 'Milestones',
            title: 'Thirty-two years, unit by unit',
            lead: 'Every entry below is a service the district did not have the year before. The list is the clearest answer to what the hospital is for.',
            items: MILESTONES,
        }),
        team({
            section: 'Leadership',
            eyebrow: 'Leadership',
            title: 'The People <strong>Accountable For It</strong>',
            docs: [DOCS.ronan, DOCS.victor, DOCS.philips, DOCS.anita],
            alt: true,
        }),
        mosaic({
            section: 'In Practice',
            photoA: { src: IMG.consult(1000), alt: 'A consultation at Teresa Memorial Hospital' },
            photoB: { src: IMG.theatre(1400), alt: 'The surgical team in a modular theatre' },
            rating: { label: 'Average Google Ratings', score: 4.9 },
            quotes: QUOTES,
            cred: {
                icon: 'fa-award',
                label: 'NABH Accredited',
                title: 'Teresa Memorial provides award-winning quality care',
                href: 'facilities.html',
                link: 'Learn More',
            },
        }),
        `        <section class="pg-section pg-section--tight" id="careers" data-section="Careers">
            <div class="pg-wrap">
                <div class="pg-cta">
                    <div>
                        <h2>Work with us</h2>
                        <p>Consultant, nursing, technician and volunteer roles open through the year. Send a CV and we
                            will call you within a week.</p>
                    </div>
                    <div class="pg-cta__actions">
                        <a href="careers.html" class="btn-light"><i class="fa-solid fa-briefcase"></i> See Open Roles</a>
                        <a href="mailto:careers@teresamemorial.org" class="btn-outline"><i class="fa-solid fa-paper-plane"></i> careers@teresamemorial.org</a>
                    </div>
                </div>
            </div>
        </section>`,
    ),
});

/* ---------------------------------------------------------
   DEPARTMENTS INDEX
   --------------------------------------------------------- */
const departmentsPage = () => page({
    file: 'departments.html',
    title: 'Our Departments',
    desc: 'Eleven specialities under one roof — cardiology, neurosurgery, orthopedics, maternity, dialysis, dental, eye care, nutrition and diagnostics.',
    active: 'departments',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Departments' }],
            title: 'Eleven Specialities,',
            strong: 'One Building',
            lead: 'No cross-city referrals for a second opinion. Departments share a floor, a record system and a weekly meeting — so complicated cases are handled by everyone at once.',
            img: IMG.corridor(),
            chips: ['11 specialities', 'Shared patient record', 'Same-day cross referral'],
            primary: { href: 'contact.html', label: 'Book an Appointment' },
            ghost: { href: 'doctors.html', icon: 'fa-user-doctor', label: 'Find a Doctor' },
        }),
        stats([
            { icon: 'fa-hospital', count: 11, suffix: '', label: 'Clinical departments', note: 'Two added since 2023' },
            { icon: 'fa-user-doctor', count: 64, suffix: '+', label: 'Doctors on staff', note: '12 joined this year' },
            { icon: 'fa-clipboard-check', count: 86000, suffix: '+', label: 'Outpatient visits a year', note: '17% more than 2024' },
            { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Average rating', note: 'Across 12,400 reviews' },
        ]),
        cards({
            section: 'Departments',
            eyebrow: 'Centres of Excellence',
            title: 'Choose A <strong>Department</strong>',
            items: DEPARTMENTS.map((d) => ({
                icon: d.icon,
                title: d.name,
                text: d.lead,
                href: `${d.slug}.html`,
            })),
        }),
        conditions({
            section: 'Referrals',
            title: 'Not sure which department you need?',
            lead: 'Describe the symptom at the front desk and the duty physician will place you in the right clinic the same morning. Nobody is sent away to work it out themselves.',
            items: ['Chest pain', 'Breathlessness', 'Persistent headache', 'Back or joint pain', 'Abdominal pain', 'Swelling or lumps', 'Pregnancy care', 'Child illness', 'Vision problems', 'Toothache', 'Weight concerns', 'Routine check-up'],
            alt: true,
        }),
        cta({
            title: 'Book with any department',
            text: 'One number, every clinic. Tell us the symptom and we will find the right consultant.',
        }),
    ),
});

/* ---------------------------------------------------------
   FACILITIES
   --------------------------------------------------------- */
const facilitiesPage = () => page({
    file: 'facilities.html',
    title: 'Facilities',
    desc: 'Emergency, intensive care, modular theatres, laboratory, imaging, pharmacy and ambulance services at Teresa Memorial Hospital.',
    active: 'facilities',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Facilities' }],
            title: 'Everything Needed,',
            strong: 'On One Campus',
            lead: 'Emergency, theatre, ICU, laboratory, imaging and pharmacy sit inside the same building — so a deteriorating patient never leaves the premises to get what they need.',
            img: IMG.ward(),
            chips: ['24/7 Emergency', '34 ICU beds', '4 modular theatres'],
            primary: { href: 'contact.html', label: 'Plan Your Visit' },
            ghost: { href: 'lab-diagnostics.html', icon: 'fa-flask-vial', label: 'Book a Test' },
        }),
        stats([
            { icon: 'fa-bed', count: 210, suffix: '', label: 'Inpatient beds', note: '30 added in 2025' },
            { icon: 'fa-bed-pulse', count: 34, suffix: '', label: 'Intensive care beds', note: 'Across 4 units' },
            { icon: 'fa-hospital', count: 4, suffix: '', label: 'Modular theatres', note: 'One always kept free' },
            { icon: 'fa-ambulance', count: 6, suffix: '', label: 'Ambulances', note: '2 advanced life support' },
        ]),
        intro({
            section: 'Overview',
            eyebrow: 'Our Facilities',
            title: 'Infrastructure that <strong>keeps the clock on your side</strong>',
            body: [
                'Most avoidable harm in a hospital comes from waiting — for a scan, a theatre, a bed. The building is laid out to remove those gaps: Emergency opens directly onto radiology, and radiology onto the theatre corridor.',
                'A generator and water-treatment plant keep dialysis, ICU and theatre running through any outage, which in this district is not a theoretical concern.',
            ],
            checks: ['Emergency next to radiology', 'Backup power for critical areas', 'Reverse-osmosis water plant', 'Central oxygen and suction', 'Lifts sized for trolleys', 'Accessible on every floor'],
            img: IMG.theatre(1000),
            badge: { icon: 'fa-bolt', title: 'Never off', text: 'Generator cover for ICU, theatre and dialysis.' },
        }),
        cards({
            section: 'Facilities',
            eyebrow: 'What Is On Site',
            title: 'Twelve Services <strong>Under One Roof</strong>',
            items: FACILITIES,
            alt: true,
        }),
        conditions({
            section: 'Visiting',
            id: 'visiting',
            title: 'Visiting and admission, in plain terms',
            lead: 'Bring a photo ID, any previous reports and your insurance card. Everything below is what people most often ask at the front desk.',
            items: ['General visiting: 4 PM – 7 PM', 'ICU visiting: 11 AM & 5 PM', 'One attendant per bed', 'Photo ID required', 'Admission desk open 24/7', 'Insurance desk: 9 AM – 8 PM', 'Cashless with 30+ insurers', 'Free Wi-Fi throughout', 'Cafeteria: 7 AM – 10 PM', 'Pharmacy open 24 hours', 'Attendant lounge on ground floor', 'Prayer room on first floor'],
        }),
        cta({
            title: 'Planning an admission?',
            text: 'Call ahead and the admission desk will have your paperwork and insurance pre-approval ready before you arrive.',
        }),
    ),
});

/* ---------------------------------------------------------
   DOCTORS
   --------------------------------------------------------- */
const doctorsPage = () => page({
    file: 'doctors.html',
    title: 'Our Doctors',
    desc: 'Meet the consultants of Teresa Memorial Hospital — cardiology, neurosurgery, orthopedics, obstetrics, nephrology, pediatrics and more.',
    active: 'departments',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Doctors' }],
            title: 'The People Who',
            strong: 'Will Treat You',
            lead: 'Sixty-four doctors, twelve of them consultants who have been here more than a decade. You are seen by the person named on your appointment, not whoever is free.',
            img: IMG.team(),
            chips: ['64+ doctors', 'Consultant-led clinics', 'Same-day appointments'],
            primary: { href: 'contact.html', label: 'Book an Appointment' },
            ghost: { href: 'departments.html', icon: 'fa-hospital', label: 'Browse Departments' },
        }),
        stats([
            { icon: 'fa-user-doctor', count: 64, suffix: '+', label: 'Doctors on staff', note: '12 joined this year' },
            { icon: 'fa-award', count: 12, suffix: '', label: 'Senior consultants', note: 'Average 16 years here' },
            { icon: 'fa-clipboard-check', count: 86000, suffix: '+', label: 'Consultations a year', note: '17% more than 2024' },
            { icon: 'fa-star', count: 4.8, suffix: '/5', label: 'Doctor rating', note: 'Across 12,400 reviews' },
        ]),
        team({
            section: 'Doctors',
            eyebrow: 'Our Doctors',
            title: 'Consultants Across <strong>Every Department</strong>',
            docs: ROSTER,
        }),
        conditions({
            section: 'Appointments',
            title: 'How to see one of them',
            lead: 'Appointments open fourteen days ahead. Call, WhatsApp or use the form — all three reach the same desk and are confirmed the same day.',
            items: ['Call +91 342 325 4567', 'WhatsApp the same number', 'Use the online form', 'Walk in for Emergency', 'Bring previous reports', 'Carry a photo ID', 'Insurance card if cashless', 'Arrive 15 minutes early', 'Reschedule free of charge', 'Follow-up within 14 days free', 'Second opinions welcome', 'Teleconsult on request'],
            alt: true,
        }),
        cta({
            title: 'Find the right consultant',
            text: 'Tell us the symptom rather than the speciality — the desk will match you to the correct clinic.',
        }),
    ),
});

/* ---------------------------------------------------------
   CONTACT
   --------------------------------------------------------- */
const contactPage = () => page({
    file: 'contact.html',
    title: 'Contact & Appointments',
    desc: 'Book an appointment, find us on G.T. Road Bardhaman, or reach the 24-hour emergency line at Teresa Memorial Hospital.',
    active: 'contact',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Contact' }],
            title: 'Book, Ask,',
            strong: 'Or Just Come In',
            lead: 'Appointments are confirmed the same day. Emergencies need no appointment at all — the department is staffed every hour of the year.',
            img: IMG.corridor(),
            chips: ['Same-day confirmation', 'Emergency 24/7', 'Cashless with 30+ insurers'],
            primary: { href: '#book', label: 'Book an Appointment' },
            ghost: { href: 'tel:+913423254567', icon: 'fa-phone', label: '+91 342 325 4567' },
        }),
        `        <section class="pg-section" data-section="Reach Us">
            <div class="pg-wrap">
                <div class="ct-tiles">
                    <article class="ct-tile">
                        <span class="ct-tile__icon"><i class="fa-solid fa-location-dot"></i></span>
                        <h3>Visit Us</h3>
                        <p>G.T. Road, Bardhaman,<br>West Bengal 713101</p>
                        <a href="#map"><i class="fa-solid fa-arrow-right"></i> See on the map</a>
                    </article>

                    <article class="ct-tile">
                        <span class="ct-tile__icon"><i class="fa-solid fa-phone"></i></span>
                        <h3>Call Us</h3>
                        <p>Reception and appointments, 8 AM &ndash; 9 PM.</p>
                        <a href="tel:+913423254567">+91 342 325 4567</a>
                    </article>

                    <article class="ct-tile">
                        <span class="ct-tile__icon"><i class="fa-solid fa-envelope"></i></span>
                        <h3>Email Us</h3>
                        <p>General enquiries answered within one working day.</p>
                        <a href="mailto:contact@teresamemorial.org">contact@teresamemorial.org</a>
                    </article>

                    <article class="ct-tile">
                        <span class="ct-tile__icon"><i class="fa-brands fa-whatsapp"></i></span>
                        <h3>WhatsApp</h3>
                        <p>Reports, prescriptions and appointment changes.</p>
                        <a href="https://wa.me/913423254567" target="_blank" rel="noopener">Message us</a>
                    </article>
                </div>
            </div>
        </section>`,
        `        <section class="pg-section pg-section--alt" id="book" data-section="Appointment">
            <div class="pg-wrap">
                <div class="ct-split">
                    <div class="ct-form">
                        <div class="ct-form__head">
                            <span class="eyebrow">Appointments</span>
                            <h2>Request An <strong>Appointment</strong></h2>
                            <p>Send this and the desk will call you back to confirm a slot, usually within the hour.</p>
                        </div>

                        <!-- no backend in this build: assets/pages.js validates, confirms and clears -->
                        <form id="appointmentForm" class="ct-grid" novalidate>
                            <div class="ct-field">
                                <label for="ctName">Full name</label>
                                <input type="text" id="ctName" name="name" required autocomplete="name">
                            </div>

                            <div class="ct-field">
                                <label for="ctPhone">Phone</label>
                                <input type="tel" id="ctPhone" name="phone" required autocomplete="tel">
                            </div>

                            <div class="ct-field">
                                <label for="ctEmail">Email</label>
                                <input type="email" id="ctEmail" name="email" autocomplete="email">
                            </div>

                            <div class="ct-field">
                                <label for="ctDept">Department</label>
                                <select id="ctDept" name="department" required>
                                    <option value="">Select a department</option>
${DEPARTMENTS.map((d) => `                                    <option value="${d.slug}">${d.name}</option>`).join('\n')}
                                    <option value="other">Not sure / other</option>
                                </select>
                            </div>

                            <div class="ct-field">
                                <label for="ctDate">Preferred date</label>
                                <input type="date" id="ctDate" name="date">
                            </div>

                            <div class="ct-field">
                                <label for="ctTime">Preferred time</label>
                                <select id="ctTime" name="time">
                                    <option value="morning">Morning (8 AM &ndash; 12 PM)</option>
                                    <option value="afternoon">Afternoon (12 PM &ndash; 4 PM)</option>
                                    <option value="evening">Evening (4 PM &ndash; 8 PM)</option>
                                </select>
                            </div>

                            <div class="ct-field ct-field--full">
                                <label for="ctMsg">What is the problem?</label>
                                <textarea id="ctMsg" name="message"
                                    placeholder="Describe the symptom in your own words — you do not need medical terms."></textarea>
                            </div>

                            <label class="ct-consent">
                                <input type="checkbox" name="consent" required>
                                <span>I agree to be contacted about this request. My details will not be shared
                                    outside the hospital.</span>
                            </label>

                            <div class="ct-form__foot">
                                <button type="submit" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> Request Appointment</button>
                                <span class="ct-note" id="formNote"><i class="fa-solid fa-circle-check"></i> Thank you — the desk will call you shortly.</span>
                            </div>
                        </form>
                    </div>

                    <aside class="ct-aside">
                        <div class="ct-panel">
                            <h3>Opening Hours</h3>
                            <ul class="ct-hours">
                                <li><span>Emergency</span> <strong>24 hours</strong></li>
                                <li><span>OPD &mdash; Mon to Fri</span> <strong>8 AM &ndash; 8 PM</strong></li>
                                <li><span>OPD &mdash; Saturday</span> <strong>8 AM &ndash; 4 PM</strong></li>
                                <li><span>OPD &mdash; Sunday</span> <strong>9 AM &ndash; 1 PM</strong></li>
                                <li><span>Laboratory</span> <strong>6 AM &ndash; 10 PM</strong></li>
                                <li><span>Pharmacy</span> <strong>24 hours</strong></li>
                                <li><span>General visiting</span> <strong>4 PM &ndash; 7 PM</strong></li>
                            </ul>
                        </div>

                        <div class="ct-emergency" id="emergency">
                            <h3>Emergency &amp; Ambulance</h3>
                            <p>Do not wait for an appointment and do not drive yourself. Call and an ambulance is
                                dispatched immediately.</p>
                            <a class="ct-emergency__num" href="tel:+913423254567"><i class="fa-solid fa-truck-medical"></i> +91 342 325 4567</a>
                        </div>
                    </aside>
                </div>
            </div>
        </section>`,
        `        <section class="pg-section" id="map" data-section="Location">
            <div class="pg-wrap">
                <div class="section-head section-head--center">
                    <span class="eyebrow">Find Us</span>
                    <h2>On G.T. Road, <strong>Bardhaman</strong></h2>
                </div>

                <div class="ct-map" style="margin-top:clamp(24px,3vw,40px)">
                    <iframe
                        src="https://www.google.com/maps?q=Bardhaman%2C%20West%20Bengal%20713101&output=embed"
                        title="Map to Teresa Memorial Hospital, Bardhaman" loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                    <div class="ct-map__card">
                        <h4>Teresa Memorial Hospital</h4>
                        <p>G.T. Road, Bardhaman, West Bengal 713101</p>
                        <p>Parking on site &middot; Ambulance bay at the north gate</p>
                    </div>
                </div>
            </div>
        </section>`,
        cta({
            title: 'Still not sure who to ask for?',
            text: 'Describe the symptom on the phone. The duty physician will route you to the right clinic — that is the desk’s job, not yours.',
        }),
    ),
});

/* ---------------------------------------------------------
   BLOG
   --------------------------------------------------------- */
const blogCard = (p) => `                    <article class="blog__card">
                        <div class="blog__card-img img-stretch">
                            <img src="${p.img}" alt="${p.title}" loading="lazy">
                            <span class="blog__cat">${p.cat}</span>
                        </div>
                        <div class="blog__meta">
                            <span>${p.date}</span> &ndash; <span>${p.read}</span>
                        </div>
                        <h3>${p.title}</h3>
                        <p class="pg-post__excerpt">${p.excerpt}</p>
                        <a href="${p.slug ? `${p.slug}.html` : 'blog-post.html'}" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Read More</a>
                    </article>`;

const blogPage = () => page({
    file: 'blog.html',
    title: 'Blog & Articles',
    desc: 'Health writing from the consultants of Teresa Memorial Hospital — cardiology, maternity, nutrition, orthopedics and emergency care.',
    active: '',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Blog' }],
            title: 'Health Writing By',
            strong: 'The People Treating You',
            lead: 'Every article here is written or reviewed by a consultant on staff. No syndicated filler, no advice we would not give in the clinic.',
            img: IMG.stress(),
            chips: ['Written by consultants', 'Reviewed before publishing', 'Updated when guidance changes'],
            primary: { href: 'contact.html', label: 'Ask a Doctor' },
            ghost: { href: 'departments.html', icon: 'fa-hospital', label: 'Browse Departments' },
        }),
        stats([
            { icon: 'fa-newspaper', count: 148, suffix: '', label: 'Articles published', note: '24 this year' },
            { icon: 'fa-user-doctor', count: 21, suffix: '', label: 'Contributing doctors', note: 'Across 11 departments' },
            { icon: 'fa-eye', count: 310000, suffix: '+', label: 'Reads a year', note: '31% more than 2024' },
            { icon: 'fa-language', count: 2, suffix: '', label: 'Languages', note: 'Bengali and English' },
        ]),
        `        <section class="pg-section" data-section="Articles">
            <div class="pg-wrap">
                <div class="section-head section-head--center">
                    <span class="eyebrow">Blog &amp; Articles</span>
                    <h2>Read Top Articles From <strong>Expert Doctors</strong></h2>
                </div>

                <div class="blog__grid" style="margin-top:clamp(28px,3vw,44px)">
${POSTS.map(blogCard).join('\n\n')}
                </div>
            </div>
        </section>`,
        cta({
            title: 'A question the article did not answer?',
            text: 'Book a consultation and ask the doctor who wrote it. Second opinions are welcome here.',
        }),
    ),
});

const post = POSTS[0];

const blogPostPage = () => page({
    file: 'blog-post.html',
    title: post.title,
    desc: post.excerpt,
    active: '',
    body: main(
        banner({
            crumb: [
                { label: 'Home', href: 'website.html' },
                { label: 'Blog', href: 'blog.html' },
                { label: post.cat },
            ],
            title: 'The Six Hours After Chest Pain:',
            strong: 'What Decides The Outcome',
            lead: post.excerpt,
            img: post.img,
            chips: [post.cat, post.date, post.read],
            primary: { href: 'cardiology.html', label: 'Cardiology Department' },
            ghost: { href: 'contact.html', icon: 'fa-calendar-check', label: 'Book a Consultation' },
        }),
        `        <section class="pg-section" data-section="Article">
            <div class="pg-wrap">
                <div class="pg-post">
                    <article class="pg-post__body">
                        <div class="pg-post__byline">
                            <img src="${post.author.img}" alt="${post.author.name}" loading="lazy">
                            <div>
                                <h4>${post.author.name}</h4>
                                <p>${post.author.role} &middot; ${post.date} &middot; ${post.read}</p>
                            </div>
                        </div>

                        <p class="pg-post__standfirst">Heart muscle dies on a schedule. From the moment a coronary
                            artery blocks, roughly one percent of the muscle it supplies is lost every four minutes.
                            Everything that follows is a race against that clock &mdash; and the first hour of it
                            belongs to you, not to us.</p>

                        <h2>Minute zero: recognising it</h2>
                        <p>The textbook heart attack &mdash; crushing central chest pain radiating to the left arm
                            &mdash; is only one presentation. Women, people with diabetes and anyone over seventy
                            frequently present instead with breathlessness, nausea, sudden sweating or pain in the jaw
                            or upper back.</p>
                        <p>The common factor is not the location. It is that the symptom is new, unexplained, and does
                            not settle with rest in ten minutes.</p>

                        <blockquote>If chest discomfort has lasted more than ten minutes and rest has not fixed it,
                            call an ambulance. The worst outcome of being wrong is an evening wasted.</blockquote>

                        <h2>The first hour: what to do, and what not to</h2>
                        <ul>
                            <li>Call for an ambulance rather than driving. A paramedic can defibrillate on the road; a
                                relative at the wheel cannot.</li>
                            <li>Chew 300 mg of aspirin unless you are allergic or have been told not to. Chewing gets
                                it into the blood faster than swallowing.</li>
                            <li>Sit down and stay still. Walking to the car increases the oxygen demand of a muscle
                                that is already starving.</li>
                            <li>Do not wait to see if it passes. The commonest reason people arrive too late is that
                                they hoped it was indigestion.</li>
                        </ul>

                        <h2>Arrival: the first ten minutes</h2>
                        <p>At Teresa Memorial, chest pain is a triage category of its own. An ECG is recorded within
                            ten minutes of arrival &mdash; usually within four &mdash; and read immediately by the duty
                            physician rather than queued for a cardiologist to see later.</p>
                        <p>If that ECG shows ST elevation, the cath lab team is paged before the patient has left the
                            resuscitation bay. Bedside troponin runs alongside, but treatment is not held up waiting
                            for it.</p>

                        <h2>Door to balloon</h2>
                        <p>The measure that matters is the interval between walking through the door and the balloon
                            opening the blocked artery. International guidance sets ninety minutes as acceptable. Our
                            median across 2025 was fifty-two.</p>
                        <p>That number is not a matter of equipment. It comes from the cath lab team being resident
                            rather than on call from home, and from the resuscitation bay sitting thirty metres from
                            the lab door.</p>

                        <h2>After the stent</h2>
                        <p>Surviving the event is the beginning. Roughly one in five people who have a heart attack
                            have a second one within five years, and most of that risk is modifiable.</p>
                        <ul>
                            <li>Cardiac rehabilitation, starting before discharge and continuing for twelve weeks.</li>
                            <li>Dual antiplatelet therapy for the period your cardiologist specifies &mdash; stopping
                                early is the single most common cause of stent thrombosis.</li>
                            <li>Blood pressure, cholesterol and glucose reviewed at six weeks, then quarterly.</li>
                            <li>Smoking cessation support, which halves the recurrence risk on its own.</li>
                        </ul>

                        <h2>The part you control</h2>
                        <p>Hospitals compete on door-to-balloon time because it is the part of the pathway we own.
                            But the largest single delay in almost every case is the gap between the first symptom and
                            the decision to call for help &mdash; and that gap is measured in hours, not minutes.</p>
                        <p>If you take one thing from this article: new chest discomfort lasting more than ten
                            minutes is a phone call, not a wait-and-see.</p>

                        <div class="pg-tags">
                            <span class="pg-tag">Cardiology</span>
                            <span class="pg-tag">Emergency</span>
                            <span class="pg-tag">Heart Attack</span>
                            <span class="pg-tag">Prevention</span>
                        </div>
                    </article>

                    <aside class="pg-post__aside">
                        <div class="ct-emergency">
                            <h3>Chest pain right now?</h3>
                            <p>Do not finish this article. Call, and do not drive yourself.</p>
                            <a class="ct-emergency__num" href="tel:+913423254567"><i class="fa-solid fa-truck-medical"></i> +91 342 325 4567</a>
                        </div>

                        <div class="ct-panel">
                            <h3>More from the blog</h3>
                            <ul class="pg-related">
${POSTS.slice(1, 5).map((p) => `                                <li><a href="blog.html"><span>${p.cat}</span> ${p.title}</a></li>`).join('\n')}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>`,
        cta({
            title: 'Get your heart checked',
            text: 'A cardiology screening takes ninety minutes and covers ECG, echo and a consultant review.',
        }),
    ),
});

/* ---------------------------------------------------------
   CAREERS
   The openings list is NOT baked in — assets/jobs.js holds it
   and pages.js renders it, so HR can open or close a vacancy
   without re-running this generator.
   --------------------------------------------------------- */
const careersPage = () => page({
    file: 'careers.html',
    title: 'Careers',
    desc: 'Nursing, consultant, technician and volunteer vacancies at Teresa Memorial Hospital, Bardhaman — with what we pay for, and how to apply.',
    active: 'careers',
    scripts: '\n    <script src="assets/jobs.js"></script>',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Careers' }],
            title: 'Work Where The',
            strong: 'Work Still Counts',
            lead: 'Two hundred and forty people run this hospital. Nobody here is a resource number, and nobody is asked to do unpaid overtime to cover a gap in the roster.',
            img: IMG.team(),
            chips: ['240 staff', 'Internal-first promotion', 'Course fees funded'],
            primary: { href: '#openings', label: 'See Open Roles' },
            ghost: { href: 'mailto:careers@teresamemorial.org', icon: 'fa-paper-plane', label: 'Email HR' },
        }),
        intro({
            section: 'Why Us',
            eyebrow: 'Working Here',
            title: 'A small hospital that <strong>keeps its promises</strong>',
            body: [
                'Teresa Memorial is trust-run, so surpluses go back into equipment and pay rather than out to shareholders. That is the whole reason the rota is honest and the training budget survives a bad year.',
                'You will not be anonymous. Two hundred and forty staff means the medical director knows your name, and it also means a mistake gets discussed with you rather than filed about you.',
                'Most of our senior nursing posts were filled from inside. Every vacancy is advertised internally before it reaches this page.',
            ],
            checks: CAREER_CHECKS,
            img: IMG.consult(1000),
            badge: { icon: 'fa-user-nurse', title: 'Two thirds promoted from within', text: 'Senior nursing posts go to our own staff first.' },
        }),
        cards({
            section: 'What We Offer',
            eyebrow: 'The Package',
            title: 'What You Actually <strong>Get In Return</strong>',
            items: CAREER_BENEFITS,
            alt: true,
        }),
        `        <section class="pg-section" id="openings" data-section="Open Roles">
            <div class="pg-wrap">
                <div class="section-head">
                    <span class="eyebrow">Current Vacancies</span>
                    <h2>Open <strong>Positions</strong></h2>
                </div>

                <div class="cr-toolbar">
                    <span class="cr-toolbar__count" id="jobCount" role="status">Loading roles&hellip;</span>
                    <div class="cr-filter">
                        <label for="jobFilter">Department</label>
                        <select id="jobFilter">
                            <option value="">All departments</option>
                        </select>
                    </div>
                </div>

                <!-- filled by initCareers() in assets/pages.js from assets/jobs.js -->
                <ul class="cr-jobs" id="jobList"></ul>

                <div class="cr-empty" id="jobEmpty" hidden>
                    <i class="fa-solid fa-inbox"></i>
                    <h3>Nothing open right now</h3>
                    <p>We post roles here as soon as they are approved. Send your CV anyway — speculative
                        applications are kept on file for six months and matched against new vacancies.</p>
                    <a href="mailto:careers@teresamemorial.org?subject=Speculative%20application" class="btn-primary"><i
                            class="fa-solid fa-paper-plane"></i> Email your CV</a>
                </div>
            </div>
        </section>`,
        `        <section class="pg-section pg-section--tight pg-section--alt" data-section="Contact HR">
            <div class="pg-wrap">
                <div class="pg-cta">
                    <div>
                        <h2>Not seeing your role?</h2>
                        <p>Send a CV with a line about what you want to do. HR reads every one and replies within a
                            week, even when the answer is no.</p>
                    </div>
                    <div class="pg-cta__actions">
                        <a href="mailto:careers@teresamemorial.org" class="btn-light"><i class="fa-solid fa-paper-plane"></i> careers@teresamemorial.org</a>
                        <a href="contact.html" class="btn-outline"><i class="fa-solid fa-arrow-right"></i> Contact HR</a>
                    </div>
                </div>
            </div>
        </section>`,
    ),
});

/* ---------------------------------------------------------
   JOB DETAIL — job.html?id=<slug>
   A shell only. initJob() in pages.js reads the query string,
   finds the entry in window.TMH_JOBS and fills #jobDetail, or
   shows the not-found panel and hides the form.
   --------------------------------------------------------- */
const jobPage = () => page({
    file: 'job.html',
    title: 'Open Role',
    desc: 'Role description and application form for a current vacancy at Teresa Memorial Hospital, Bardhaman.',
    active: 'careers',
    scripts: '\n    <script src="assets/jobs.js"></script>',
    body: main(
        banner({
            crumb: [{ label: 'Home', href: 'website.html' }, { label: 'Careers', href: 'careers.html' }, { label: 'Open Role' }],
            title: 'A Job Worth',
            strong: 'Doing Properly',
            lead: 'Read the whole description before you apply — it is written to be honest about the hours and the pressure as well as the training and the pay.',
            img: IMG.ward(),
            chips: ['Reply within a week', 'Interviews on campus', 'Travel reimbursed'],
            primary: { href: '#apply', label: 'Apply For This Role' },
            ghost: { href: 'careers.html', icon: 'fa-arrow-left', label: 'All Openings' },
        }),
        `        <section class="pg-section" data-section="The Role">
            <div class="pg-wrap">
                <!-- filled by initJob() in assets/pages.js -->
                <div id="jobDetail"></div>
            </div>
        </section>`,
        `        <section class="pg-section pg-section--alt" id="apply" data-section="Apply">
            <div class="pg-wrap">
                <div class="ct-form">
                    <div class="ct-form__head">
                        <span class="eyebrow">Application</span>
                        <h2>Apply For <strong>This Role</strong></h2>
                        <p>Everything above the divider is required. The rest helps HR shortlist faster but will
                            never be the reason an application is rejected.</p>
                    </div>

                    <!-- no backend in this build: assets/pages.js validates, confirms and clears -->
                    <form id="applyForm" class="ct-grid" novalidate>
                        <div class="ct-field">
                            <label for="apName">Full name</label>
                            <input type="text" id="apName" name="name" required autocomplete="name">
                        </div>

                        <div class="ct-field">
                            <label for="apPhone">Phone</label>
                            <input type="tel" id="apPhone" name="phone" required autocomplete="tel">
                        </div>

                        <div class="ct-field">
                            <label for="apEmail">Email</label>
                            <input type="email" id="apEmail" name="email" required autocomplete="email">
                        </div>

                        <div class="ct-field">
                            <label for="apRole">Position applied for</label>
                            <input type="text" id="apRole" name="position" required readonly>
                        </div>

                        <div class="ct-field">
                            <label for="apExp">Total experience</label>
                            <input type="text" id="apExp" name="experience" required placeholder="e.g. 3 years 6 months">
                        </div>

                        <div class="ct-field">
                            <label for="apCity">Current location</label>
                            <input type="text" id="apCity" name="location" required placeholder="City or district">
                        </div>

                        <div class="ct-field ct-field--full">
                            <label for="apResume">Resume / CV</label>
                            <div class="cr-file" id="apResumeBox">
                                <input type="file" id="apResume" name="resume" required accept=".pdf,.doc,.docx"
                                    aria-describedby="apResumeHint">
                                <i class="fa-solid fa-file-arrow-up"></i>
                                <span class="cr-file__label">Choose a file or drop it here</span>
                                <span class="cr-file__hint" id="apResumeHint">PDF, DOC or DOCX &mdash; 5 MB maximum</span>
                                <span class="cr-file__name" data-file-name></span>
                            </div>
                            <span class="cr-file__err" data-file-err><i class="fa-solid fa-circle-exclamation"></i></span>
                        </div>

                        <p class="cr-optional">Optional &mdash; tell us more</p>

                        <div class="ct-field">
                            <label for="apEmployer">Current employer</label>
                            <input type="text" id="apEmployer" name="employer">
                        </div>

                        <div class="ct-field">
                            <label for="apQual">Highest qualification</label>
                            <input type="text" id="apQual" name="qualification" placeholder="e.g. B.Sc Nursing">
                        </div>

                        <div class="ct-field">
                            <label for="apReg">Council / registration number</label>
                            <input type="text" id="apReg" name="registration">
                        </div>

                        <div class="ct-field">
                            <label for="apNotice">Notice period</label>
                            <select id="apNotice" name="notice">
                                <option value="">Select</option>
                                <option>Immediate</option>
                                <option>15 days</option>
                                <option>1 month</option>
                                <option>2 months</option>
                                <option>3 months or more</option>
                            </select>
                        </div>

                        <div class="ct-field">
                            <label for="apCtc">Current CTC (per annum)</label>
                            <input type="text" id="apCtc" name="ctc" placeholder="&#8377;">
                        </div>

                        <div class="ct-field">
                            <label for="apEctc">Expected CTC (per annum)</label>
                            <input type="text" id="apEctc" name="expectedCtc" placeholder="&#8377;">
                        </div>

                        <div class="ct-field">
                            <label for="apAvail">Available from</label>
                            <input type="date" id="apAvail" name="availableFrom">
                        </div>

                        <div class="ct-field">
                            <label for="apLink">LinkedIn or portfolio</label>
                            <input type="url" id="apLink" name="link" placeholder="https://">
                        </div>

                        <div class="ct-field">
                            <label for="apSource">How did you hear about us?</label>
                            <select id="apSource" name="source">
                                <option value="">Select</option>
                                <option>This website</option>
                                <option>A colleague at the hospital</option>
                                <option>Job portal</option>
                                <option>Nursing college or institute</option>
                                <option>Newspaper or notice board</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div class="ct-field ct-field--full">
                            <label for="apLetter">Cover letter</label>
                            <textarea id="apLetter" name="coverLetter"
                                placeholder="Why this role, and what you would bring to the unit. A few honest sentences beat a page of template."></textarea>
                        </div>

                        <div class="ct-field ct-field--full">
                            <label for="apLetterFile">Cover letter as a file (instead of the box above)</label>
                            <div class="cr-file" id="apLetterBox">
                                <input type="file" id="apLetterFile" name="coverLetterFile" accept=".pdf,.doc,.docx"
                                    aria-describedby="apLetterHint">
                                <i class="fa-solid fa-paperclip"></i>
                                <span class="cr-file__label">Attach a cover letter</span>
                                <span class="cr-file__hint" id="apLetterHint">PDF, DOC or DOCX &mdash; 5 MB maximum</span>
                                <span class="cr-file__name" data-file-name></span>
                            </div>
                            <span class="cr-file__err" data-file-err><i class="fa-solid fa-circle-exclamation"></i></span>
                        </div>

                        <label class="ct-consent">
                            <input type="checkbox" name="consent" required>
                            <span>I confirm the details above are true and agree that Teresa Memorial Hospital may
                                hold them for six months to consider me for this and similar roles.</span>
                        </label>

                        <div class="ct-form__foot">
                            <button type="submit" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> Submit Application</button>
                            <span class="ct-note" id="applyNote"><i class="fa-solid fa-circle-check"></i> Thank you — HR will be in touch within a week.</span>
                        </div>
                    </form>
                </div>

                <!-- a mailto: cannot carry the CV, so the direct route stays on
                     the page whether or not the form above was used -->
                <div class="cr-mail">
                    <i class="fa-solid fa-envelope-open-text"></i>
                    <p><strong>Prefer to email it?</strong>Send your CV and cover letter straight to HR. Attachments
                        are safest that way &mdash; put the role name in the subject line.</p>
                    <a href="mailto:careers@teresamemorial.org" class="btn-primary" id="applyMailto"><i
                            class="fa-solid fa-paper-plane"></i> careers@teresamemorial.org</a>
                </div>
            </div>
        </section>`,
    ),
});

/* ---------------------------------------------------------
   WRITE
   --------------------------------------------------------- */
const OUT = [
    ['about.html', aboutPage()],
    ['departments.html', departmentsPage()],
    ['facilities.html', facilitiesPage()],
    ['doctors.html', doctorsPage()],
    ['contact.html', contactPage()],
    ['careers.html', careersPage()],
    ['job.html', jobPage()],
    ['blog.html', blogPage()],
    ['blog-post.html', blogPostPage()],
    ...DEPARTMENTS.map((d) => [`${d.slug}.html`, departmentPage(d)]),
];

for (const [file, html] of OUT) {
    writeFileSync(join(ROOT, file), html, 'utf8');
    console.log(`wrote ${file}`);
}

console.log(`\n${OUT.length} pages written.`);
