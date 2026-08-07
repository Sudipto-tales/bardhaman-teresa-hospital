<?php

/**
 * What `/admin` shows once there is a session.
 *
 * The forty-three panel screens are phase 5.2 and are not built yet. This says
 * so plainly rather than redirecting into the static prototype under `html/`,
 * which reads from a seeded JavaScript store and would look like a working
 * panel that saves nothing.
 *
 * $user    The signed-in row, as Auth::user() returns it
 * $logout  GET /admin/logout
 */
?>
        <section class="adm-auth">
            <div class="adm-auth__card">
                <a class="adm-auth__brand" href="<?= e($home ?? '/') ?>">
<?php if (($logo ?? '') !== ''): ?>
                    <img src="<?= e($logo) ?>" alt="<?= e($siteName ?? '') ?>" width="48" height="48">
<?php endif; ?>
                    <span><?= e($siteName ?? '') ?></span>
                </a>

                <h1>Signed in</h1>
                <p class="adm-auth__lead">
                    <?= e((string) ($user['name'] ?? 'You')) ?>
<?php if (($user['role'] ?? '') !== ''): ?>
                    &mdash; <?= e((string) $user['role']) ?>
<?php endif; ?>
                </p>

                <p class="adm-auth__lead">
                    The panel screens are not built yet — that is phase 5.2 of the conversion. The API
                    behind them is finished and answering: this session is what every panel request
                    will authenticate with.
                </p>

                <a class="btn-primary adm-auth__submit" href="<?= e($logout ?? '#') ?>">
                    <i class="fa-solid fa-right-from-bracket"></i> Sign out
                </a>

                <a class="adm-auth__back" href="<?= e($home ?? '/') ?>"><i class="fa-solid fa-arrow-left"></i> Back to the website</a>
            </div>
        </section>
