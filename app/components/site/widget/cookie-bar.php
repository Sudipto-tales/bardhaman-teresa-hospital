<?php

/**
 * The cookie notice.
 *
 * No bar is rendered here. assets/popups.js owns the element — it decides
 * whether to insert one at all by reading the consent cookie, and a bar that
 * was printed server-side and then hidden still costs a screen-reader user a
 * tab stop. What this component contributes is the configuration popups.js
 * reads, which used to come from assets/popups-config.js and now comes from
 * the settings record.
 *
 * It merges rather than assigns, so the ads widget can write the other half of
 * the same object, and it has to be echoed before site/layout/scripts —
 * popups.js reads window.TMH_POPUPS once, at parse time.
 *
 * Props (§22b)
 *   enabled       bool
 *   message       string
 *   acceptLabel   string
 *   declineLabel  string  Empty offers no decline button
 *   policyUrl     string
 *   remember      int     Days the consent cookie lasts
 */

if (empty($enabled)) {
    return;
}

$config = [
    'cookieEnabled' => true,
    'cookieMessage' => (string) ($message ?? ''),
    'cookieAcceptLabel' => (string) ($acceptLabel ?? 'Got it'),
    'cookieDeclineLabel' => (string) ($declineLabel ?? ''),
    'cookiePolicyUrl' => (string) ($policyUrl ?? ''),
    'cookieRemember' => (int) ($remember ?? 180),
];
?>
    <script>
        window.TMH_POPUPS = Object.assign(window.TMH_POPUPS || {}, <?= json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>);
    </script>
