<?php

/**
 * The campaign popup — a screening camp, a new clinic.
 *
 * Same arrangement as the cookie bar: assets/popups.js builds the dialog, and
 * this component supplies the record it builds it from. The date window and
 * the frequency stay in the script rather than being decided here, because
 * both are read together with a cookie the server cannot see, and splitting
 * that decision across two files is how a campaign ends up showing twice.
 *
 * Props (§22b)
 *   enabled      bool
 *   title        string
 *   body         string
 *   image        string  Optional — the card renders without one
 *   link         string
 *   linkLabel    string
 *   start / end  string  ISO dates; outside them popups.js renders nothing
 *   frequency    string  session | days:N | always
 *   dismissible  bool    Off means it can only be dismissed by following the link
 */

if (empty($enabled)) {
    return;
}

$config = [
    'adsEnabled' => true,
    'adsTitle' => (string) ($title ?? ''),
    'adsBody' => (string) ($body ?? ''),
    'adsImage' => (string) ($image ?? ''),
    'adsLink' => (string) ($link ?? ''),
    'adsLinkLabel' => (string) ($linkLabel ?? 'Learn more'),
    'adsStart' => (string) ($start ?? ''),
    'adsEnd' => (string) ($end ?? ''),
    'adsFrequency' => (string) ($frequency ?? 'session'),
    'adsDismissible' => !isset($dismissible) || (bool) $dismissible,
];
?>
    <script>
        window.TMH_POPUPS = Object.assign(window.TMH_POPUPS || {}, <?= json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>);
    </script>
