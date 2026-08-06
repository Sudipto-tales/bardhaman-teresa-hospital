/* =========================================================
   Teresa Memorial Hospital — cookie bar and ads popup.

   Both read assets/popups-config.js (window.TMH_POPUPS), which
   the admin panel owns. Neither exists in the markup: if a
   widget is off, nothing is inserted into the DOM at all,
   rather than inserted and hidden. A hidden overlay still
   costs a screen-reader user a tab stop.

   State lives in first-party cookies, not localStorage, for
   one reason: the consent decision has to survive a visitor
   who blocks storage APIs but not cookies, and it is the one
   thing on this site that must not silently reset.
   ========================================================= */
(function () {
    'use strict';

    const CFG = window.TMH_POPUPS || {};

    const COOKIE_KEY = 'tmh-consent';
    const ADS_KEY = 'tmh-ad-seen';

    /* ---------------------------------------------------------
       Cookies
       --------------------------------------------------------- */

    function readCookie(name) {
        const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[2]) : '';
    }

    function writeCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
    }

    /* ---------------------------------------------------------
       Cookie bar
       --------------------------------------------------------- */

    function initCookieBar() {
        if (!CFG.cookieEnabled) return;
        if (readCookie(COOKIE_KEY)) return;

        const bar = document.createElement('div');
        bar.className = 'pop-cookie';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', 'Cookie notice');
        bar.innerHTML = `
            <p class="pop-cookie__text">${escape_(CFG.cookieMessage || '')}${
                CFG.cookiePolicyUrl
                    ? ` <a href="${escape_(CFG.cookiePolicyUrl)}">Read more</a>.`
                    : ''}</p>
            <div class="pop-cookie__actions">
                ${CFG.cookieDeclineLabel
                    ? `<button type="button" class="pop-btn pop-btn--ghost" data-consent="declined">${escape_(CFG.cookieDeclineLabel)}</button>`
                    : ''}
                <button type="button" class="pop-btn pop-btn--solid" data-consent="accepted">${
                    escape_(CFG.cookieAcceptLabel || 'Got it')}</button>
            </div>`;

        document.body.appendChild(bar);
        requestAnimationFrame(() => bar.classList.add('is-in'));

        bar.querySelectorAll('[data-consent]').forEach((btn) => {
            btn.addEventListener('click', () => {
                writeCookie(COOKIE_KEY, btn.dataset.consent, Number(CFG.cookieRemember) || 180);
                bar.classList.remove('is-in');
                setTimeout(() => bar.remove(), 400);
            });
        });
    }

    /* ---------------------------------------------------------
       Ads popup
       --------------------------------------------------------- */

    /* Outside its date window the popup simply does not exist. This is what
       lets someone schedule a camp in advance and forget about it — the
       campaign stops on its own rather than needing a second visit to the
       panel to switch it off. */
    function inWindow() {
        const today = new Date().toISOString().slice(0, 10);
        if (CFG.adsStart && today < CFG.adsStart) return false;
        if (CFG.adsEnd && today > CFG.adsEnd) return false;
        return true;
    }

    /* 'session' | 'days:N' | 'always' */
    function alreadySeen() {
        const freq = CFG.adsFrequency || 'session';
        if (freq === 'always') return false;

        if (freq === 'session') {
            try {
                return sessionStorage.getItem(ADS_KEY) === stamp();
            } catch (e) {
                /* Private mode: fall back to showing it once per page load
                   rather than not at all. */
                return false;
            }
        }

        return readCookie(ADS_KEY) === stamp();
    }

    function markSeen() {
        const freq = CFG.adsFrequency || 'session';
        if (freq === 'always') return;

        if (freq === 'session') {
            try {
                sessionStorage.setItem(ADS_KEY, stamp());
            } catch (e) { /* nothing to do — it shows again next load */ }
            return;
        }

        const days = Number(String(freq).split(':')[1]) || 7;
        writeCookie(ADS_KEY, stamp(), days);
    }

    /* Ties the "seen" mark to this particular campaign, so editing the popup
       in the panel shows the new one to everybody instead of being swallowed
       by the old one's cookie. */
    function stamp() {
        return String(CFG.adsTitle || '') + '|' + String(CFG.adsStart || '');
    }

    function initAds() {
        if (!CFG.adsEnabled) return;
        if (!inWindow()) return;
        if (alreadySeen()) return;

        const root = document.createElement('div');
        root.className = 'pop-ad';
        root.innerHTML = `
            <div class="pop-ad__scrim" ${CFG.adsDismissible ? 'data-close' : ''}></div>
            <div class="pop-ad__card" role="dialog" aria-modal="true" aria-labelledby="popAdTitle">
                ${CFG.adsDismissible
                    ? '<button type="button" class="pop-ad__x" data-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>'
                    : ''}
                ${CFG.adsImage
                    ? `<img class="pop-ad__img" src="${escape_(CFG.adsImage)}" alt="">`
                    : ''}
                <div class="pop-ad__body">
                    <h3 class="pop-ad__title" id="popAdTitle">${escape_(CFG.adsTitle || '')}</h3>
                    ${CFG.adsBody ? `<p class="pop-ad__text">${escape_(CFG.adsBody)}</p>` : ''}
                    ${CFG.adsLink
                        ? `<a class="pop-btn pop-btn--solid" href="${escape_(CFG.adsLink)}">${
                            escape_(CFG.adsLinkLabel || 'Learn more')}</a>`
                        : ''}
                </div>
            </div>`;

        document.body.appendChild(root);
        markSeen();

        requestAnimationFrame(() => root.classList.add('is-in'));

        const card = root.querySelector('.pop-ad__card');
        const previous = document.activeElement;

        const close = () => {
            root.classList.remove('is-in');
            setTimeout(() => root.remove(), 300);
            document.removeEventListener('keydown', onKey);
            if (previous && previous.focus) previous.focus();
        };

        const onKey = (e) => {
            if (e.key === 'Escape' && CFG.adsDismissible) {
                close();
                return;
            }
            if (e.key !== 'Tab') return;

            /* A modal that lets Tab wander behind the scrim is a keyboard
               trap in the other direction — the user is left typing into a
               page they cannot see. */
            const nodes = card.querySelectorAll('a[href],button:not([disabled])');
            if (!nodes.length) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        root.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
        document.addEventListener('keydown', onKey);

        const focusTarget = card.querySelector('a[href],button');
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
    }

    function escape_(s) {
        return String(s == null ? '' : s)
            .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    /* The ads popup waits a beat. Landing on a page and being covered before
       it has finished painting reads as an error, not an offer. */
    document.addEventListener('DOMContentLoaded', () => {
        initCookieBar();
        setTimeout(initAds, 1200);
    });
}());
