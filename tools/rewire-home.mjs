/* =========================================================
   One-off: point website.html at the new inner pages.

       node tools/rewire-home.mjs

   Safe to re-run — every replacement asserts how many hits it
   expects, so a second run (0 hits) fails loudly rather than
   silently mangling the file.
   ========================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'website.html');

let html = readFileSync(FILE, 'utf8');

/* [find, replace, expectedHits] — plain strings, no regex escaping games */
const EDITS = [
    /* --- primary nav --- */
    ['<a href="#about" class="nav-link">About Us</a>', '<a href="about.html" class="nav-link">About Us</a>', 1],
    ['<a href="#specialities" class="nav-link">Our Department', '<a href="departments.html" class="nav-link">Our Department', 1],
    ['<a href="#lab" class="nav-link">Facilities</a>', '<a href="facilities.html" class="nav-link">Facilities</a>', 1],
    ['<a href="#contact" class="nav-link">Contact</a>', '<a href="contact.html" class="nav-link">Contact</a>', 1],
    ['<a href="#contact" class="nav-emergency">', '<a href="contact.html#emergency" class="nav-emergency">', 1],

    /* --- mega menu --- */
    ['<a href="#care" class="nav-mega-item">Services <span>Doctor &amp; Medical</span></a>', '<a href="departments.html" class="nav-mega-item">All Departments <span>Overview &amp; Directory</span></a>', 1],
    ['<a href="#specialities" class="nav-mega-item">Cardiology', '<a href="cardiology.html" class="nav-mega-item">Cardiology', 1],
    ['<a href="#specialities" class="nav-mega-item">Neuro Surgery', '<a href="neuro-surgery.html" class="nav-mega-item">Neuro Surgery', 1],
    ['<a href="#specialities" class="nav-mega-item">Medicine &amp; Nephrology', '<a href="nephrology.html" class="nav-mega-item">Medicine &amp; Nephrology', 1],
    ['<a href="#specialities" class="nav-mega-item">Orthopedic Surgery', '<a href="orthopedics.html" class="nav-mega-item">Orthopedic Surgery', 1],
    ['<a href="#care" class="nav-mega-item">Dental Care', '<a href="dental-care.html" class="nav-mega-item">Dental Care', 1],
    ['<a href="#specialities" class="nav-mega-item">Prenatal Care', '<a href="prenatal-care.html" class="nav-mega-item">Prenatal Care', 1],
    ['<a href="#care" class="nav-mega-item">Food &amp; Nutrition', '<a href="nutrition.html" class="nav-mega-item">Food &amp; Nutrition', 1],
    ['<a href="#care" class="nav-mega-item">Ophthalmology', '<a href="ophthalmology.html" class="nav-mega-item">Ophthalmology', 1],
    ['<a href="#specialities" class="nav-mega-item">General Surgery', '<a href="general-surgery.html" class="nav-mega-item">General Surgery', 1],
    ['<a href="#lab" class="nav-mega-item">Lab Diagnostics', '<a href="lab-diagnostics.html" class="nav-mega-item">Lab Diagnostics', 1],
    ['<a href="#specialities" class="nav-mega-item">Pediatric Surgery', '<a href="pediatric-surgery.html" class="nav-mega-item">Pediatric Surgery', 1],

    /* --- mobile overlay --- */
    [`        <a href="#about">About Us</a>
        <a href="#specialities">Our Department</a>
        <a href="#lab">Facilities</a>
        <a href="#contact">Contact</a>`,
        `        <a href="about.html">About Us</a>
        <a href="departments.html">Our Department</a>
        <a href="facilities.html">Facilities</a>
        <a href="doctors.html">Doctors</a>
        <a href="blog.html">Blog</a>
        <a href="contact.html">Contact</a>`, 1],

    /* --- dock --- */
    ['<a href="#doctors" class="dock__btn" aria-label="Find a Doctor">', '<a href="doctors.html" class="dock__btn" aria-label="Find a Doctor">', 1],
    ['<a href="#contact" class="dock__btn" aria-label="Our Location">', '<a href="contact.html#map" class="dock__btn" aria-label="Our Location">', 1],

    /* --- about block CTA --- */
    ['<a href="#doctors" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> More About Us</a>', '<a href="about.html" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> More About Us</a>', 1],

    /* --- specialities featured button (website.js rewrites its label, not its href) --- */
    ['<a href="#doctors" class="spec__btn" id="featBtn">', '<a href="doctors.html" class="spec__btn" id="featBtn">', 1],

    /* --- booking buttons --- */
    ['<a href="#contact" class="doc__book">', '<a href="contact.html#book" class="doc__book">', 6],
    ['<a href="#contact" class="lab__btn">', '<a href="contact.html#book" class="lab__btn">', 4],

    /* --- blog --- */
    ['<a href="#" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Read More</a>', '<a href="blog-post.html" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Read More</a>', 3],
    ['<a href="#" class="blog__viewall">', '<a href="blog.html" class="blog__viewall">', 1],

    /* --- services reveal: eight boxes, in document order --- */
    ['<a href="#contact">View All <i class="fa-solid fa-arrow-right"></i></a>', '<a href="departments.html">View All <i class="fa-solid fa-arrow-right"></i></a>', 1],

    /* --- footer --- */
    ['<li><a href="#doctors">Doctors</a></li>', '<li><a href="doctors.html">Doctors</a></li>', 1],
    ['<li><a href="#blog">Blog</a></li>', '<li><a href="blog.html">Blog</a></li>', 1],
    ['<li><a href="#">Site Map</a></li>', '<li><a href="departments.html">Site Map</a></li>', 1],
    ['<li><a href="#">Careers</a></li>', '<li><a href="about.html#careers">Careers</a></li>', 1],
    ['<li><a href="#blog">Education</a></li>', '<li><a href="blog.html">Education</a></li>', 1],
    ['<li><a href="#about">About Us</a></li>', '<li><a href="about.html">About Us</a></li>', 1],
    ['<li><a href="#specialities">Areas of Care</a></li>', '<li><a href="departments.html">Areas of Care</a></li>', 1],
    ['<li><a href="#">Volunteers</a></li>', '<li><a href="about.html#careers">Volunteers</a></li>', 1],
    ['<li><a href="#services">Visitor Information</a></li>', '<li><a href="facilities.html#visiting">Visitor Information</a></li>', 1],
    ['<li><a href="#care">Emergency Care</a></li>', '<li><a href="contact.html#emergency">Emergency Care</a></li>', 1],
    ['<li><a href="#lab">Online Services</a></li>', '<li><a href="lab-diagnostics.html">Online Services</a></li>', 1],
    ['<li><a href="#">Hospital Stay</a></li>', '<li><a href="facilities.html#visiting">Hospital Stay</a></li>', 1],
];

const count = (s, needle) => s.split(needle).length - 1;

for (const [find, replace, expect] of EDITS) {
    const hits = count(html, find);
    if (hits !== expect) {
        console.error(`FAIL: expected ${expect} hit(s), found ${hits}\n  ${find.slice(0, 90)}`);
        process.exit(1);
    }
    html = html.split(find).join(replace);
}

/* The eight service boxes all carry the same href, so they are rewritten by
   position rather than by content. Order matches the markup. */
const REVEAL = ['nutrition', 'ophthalmology', 'dental-care', 'general-surgery',
    'orthopedics', 'neuro-surgery', 'cardiology', 'nephrology'];

const REVEAL_FIND = '<a href="#doctors" class="reveal__more">';
if (count(html, REVEAL_FIND) !== REVEAL.length) {
    console.error(`FAIL: expected ${REVEAL.length} .reveal__more links, found ${count(html, REVEAL_FIND)}`);
    process.exit(1);
}

let i = 0;
html = html.split(REVEAL_FIND)
    .reduce((acc, part, n) => n === 0 ? part : `${acc}<a href="${REVEAL[i++]}.html" class="reveal__more">${part}`);

writeFileSync(FILE, html, 'utf8');
console.log('website.html rewired to the inner pages.');
