/* =========================================================
   Home page — section editor.

   One collapsible card per [data-section] block in
   website.html. Sections can be hidden or reordered; the
   fields inside are whatever that block actually renders.

   Blocks that draw from another list (doctors, articles, lab
   tests, testimonials, FAQs) expose their heading and a limit
   here, and link out to the list itself. A screen that lets
   you edit the same doctor in two places is a screen that
   will disagree with itself.
   ========================================================= */
(function () {
    'use strict';

    const { util: U, store, fields: F, form: formLib, layout, toast, media } = window.TMH;

    let page = null;
    let ctrl = null;
    let order = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        page = await store.get('pages', 'home');

        document.getElementById('pageHead').innerHTML = layout.pageHead({
            crumb: [{ label: 'Pages', href: 'pages.html' }, { label: 'Home Page' }],
            title: 'Home',
            accent: 'Page',
            sub: 'Twelve sections, in the order they appear on website.html. Drag a card to move a section; switch it off to hide it.',
            actions: `
                <a class="btn btn--ghost" href="../../website.html" target="_blank" rel="noopener">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> View page</a>`,
        });

        document.getElementById('view').innerHTML = markup();

        F.wireSections(document, (keys) => {
            order = keys;
            toast.info('Section order changed', { body: 'Save to apply it to the public page.' });
        });

        ctrl = formLib.create({
            el: '#pageForm',
            bar: '#formBar',
            onCancel: () => location.reload(),
            onSave: save,
        });

        ctrl.bind(U.flattenSections(page));
        media.wire(document);
    }

    const S = (key) => U.sectionData(page, key);
    const on = (key) => U.sectionEnabled(page, key);

    /* A block whose content lives in another list. */
    const linked = (label, href, note) => F.mirror({
        label: 'Content source', value: note, href, source: label,
    });

    function markup() {
        return `
        <form id="pageForm" novalidate>
            ${F.sect({
                key: 'hero', label: 'Hero banner', open: true, enabled: on('hero'),
                sub: 'The first screen. Headline splits so the second half carries the brand colour.',
                fields: [
                    F.text({ name: 'hero.eyebrow', label: 'Eyebrow', placeholder: 'Bardhaman · Since 1994' }),
                    F.media({ name: 'hero.image', label: 'Background image', wide: false }),
                    F.text({ name: 'hero.title', label: 'Headline — first half', required: true }),
                    F.text({ name: 'hero.titleStrong', label: 'Headline — second half', required: true }),
                    F.textarea({ name: 'hero.lead', label: 'Standfirst', rows: 3 }),
                    F.text({ name: 'hero.primaryLabel', label: 'Primary button label' }),
                    F.text({ name: 'hero.primaryHref', label: 'Primary button link', rule: 'url' }),
                    F.text({ name: 'hero.ghostLabel', label: 'Secondary button label' }),
                    F.text({ name: 'hero.ghostHref', label: 'Secondary button link' }),
                ],
            })}

            ${F.sect({
                key: 'about', label: 'About strip', enabled: on('about'),
                fields: [
                    F.text({ name: 'about.title', label: 'Heading', wide: true }),
                    F.textarea({ name: 'about.body', label: 'Body', rows: 3 }),
                    F.media({ name: 'about.image', label: 'Photo' }),
                ],
            })}

            ${F.sect({
                key: 'care', label: 'Why choose us', enabled: on('care'),
                fields: [F.text({ name: 'care.title', label: 'Heading', wide: true })],
            })}

            ${F.sect({
                key: 'services', label: 'Services grid', enabled: on('services'),
                fields: [
                    F.text({ name: 'services.title', label: 'Heading' }),
                    F.text({ name: 'services.lead', label: 'Standfirst' }),
                    linked('Departments', 'departments.html', `${store.allSync('departments').length} departments`),
                ],
            })}

            ${F.sect({
                key: 'specialities', label: 'Specialities', enabled: on('specialities'),
                fields: [
                    F.text({ name: 'specialities.title', label: 'Heading', wide: true }),
                    linked('Departments', 'departments.html', 'Cards are generated from the department list'),
                ],
            })}

            ${F.sect({
                key: 'why-us', label: 'Numbers band', enabled: on('why-us'),
                sub: 'The animated counters.',
                fields: [
                    F.text({ name: 'why-us.title', label: 'Heading', wide: true }),
                    linked('Counters & Numbers', 'stats.html',
                        `${store.allSync('counters').filter((c) => c.scope === 'home').length} counters scoped to the home page`),
                ],
            })}

            ${F.sect({
                key: 'doctors', label: 'Doctors strip', enabled: on('doctors'),
                fields: [
                    F.text({ name: 'doctors.title', label: 'Heading' }),
                    F.number({ name: 'doctors.limit', label: 'How many to show', min: 1 }),
                    linked('Doctors', 'doctors.html',
                        `${store.allSync('doctors').filter((d) => d.status === 'published').length} published doctors`),
                ],
            })}

            ${F.sect({
                key: 'lab-tests', label: 'Lab tests block', enabled: on('lab-tests'),
                fields: [
                    F.text({ name: 'lab-tests.title', label: 'Heading' }),
                    F.number({ name: 'lab-tests.limit', label: 'How many to show', min: 1 }),
                    F.text({ name: 'lab-tests.lead', label: 'Standfirst', wide: true }),
                    linked('Lab Tests', 'lab-tests.html',
                        `${store.allSync('lab-tests').filter((t) => t.featured).length} tests marked featured`),
                ],
            })}

            ${F.sect({
                key: 'testimonials', label: 'Testimonials', enabled: on('testimonials'),
                fields: [
                    F.text({ name: 'testimonials.title', label: 'Heading', wide: true }),
                    linked('Testimonials', 'testimonials.html',
                        `${store.allSync('testimonials').filter((t) => t.featured).length} featured quotes`),
                ],
            })}

            ${F.sect({
                key: 'articles', label: 'Latest articles', enabled: on('articles'),
                fields: [
                    F.text({ name: 'articles.title', label: 'Heading' }),
                    F.number({ name: 'articles.limit', label: 'How many to show', min: 1 }),
                    linked('Blog', 'blog.html',
                        `${store.allSync('posts').filter((p) => p.status === 'published').length} published posts`),
                ],
            })}

            ${F.sect({
                key: 'faq', label: 'FAQ accordion', enabled: on('faq'),
                fields: [
                    F.text({ name: 'faq.title', label: 'Heading' }),
                    F.select({ name: 'faq.group', label: 'Which FAQ group', options: ['Home', 'Contact', 'Department'] }),
                    linked('FAQs', 'faqs.html',
                        `${store.allSync('faqs').filter((f) => f.group === 'Home').length} questions in the Home group`),
                ],
            })}

            ${F.sect({
                key: 'contact', label: 'Contact band', enabled: on('contact'),
                fields: [
                    F.text({ name: 'contact.title', label: 'Heading', wide: true }),
                    linked('Contact Details', 'settings-contact.html', 'Numbers and address come from Settings'),
                ],
            })}

            <article class="card mt-6">
                ${F.seo({ optional: true, titlePlaceholder: 'Teresa Memorial Hospital — Compassionate Care, Every Day' })}
                ${F.bar({ singleSave: true, saveLabel: 'Save home page' })}
            </article>
        </form>`;
    }

    async function save(flat) {
        const next = U.applySections(page, flat, order);
        page = await store.update('pages', 'home', next);
        order = null;
        const hidden = page.sections.filter((s) => !s.enabled).length;
        toast.success('Home page saved', {
            body: hidden ? `${hidden} section${hidden === 1 ? '' : 's'} hidden from visitors.` : '',
            action: { label: 'View page', href: '../../website.html' },
        });
    }
}());
