/* =========================================================
   Teresa Memorial Hospital — cookie bar and ads popup config.

   The panel owns these values: html/admin/settings-popups.html
   edits exactly this shape (the `popups` group of the settings
   record). This file is the static stand-in until the backend
   lands, in the same way assets/jobs.js stands in for the
   vacancies table.

   Turning either widget off is one boolean here — and one
   toggle in the panel — with no rebuild of the pages.

   adsFrequency
     'session'  once per browser session
     'days:N'   once every N days
     'always'   every page load; for checking a change only
   ========================================================= */
window.TMH_POPUPS = {
    cookieEnabled: true,
    cookieMessage: 'We use cookies to remember your language and theme, and to count visits. Nothing here identifies you.',
    cookieAcceptLabel: 'Got it',
    cookieDeclineLabel: 'No thanks',
    cookiePolicyUrl: 'contact.html',
    cookieRemember: 180,

    adsEnabled: true,
    adsTitle: 'Free Cardiac Screening Camp',
    adsBody: 'ECG, blood pressure and a consultant review — no charge, 12–14 September, OPD block.',
    adsImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=900&auto=format&fit=crop',
    adsLink: 'contact.html',
    adsLinkLabel: 'Book a slot',
    adsStart: '2026-08-01',
    adsEnd: '2026-09-14',
    adsFrequency: 'days:7',
    adsDismissible: true,
};
