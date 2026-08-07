<?php

/**
 * The panel's front door.
 *
 * `/admin` had no route at all, so the one URL every administrator types
 * answered 404. The panel screens themselves are phase 5 — this is the sign-in
 * that has to exist before any of them can, and the redirect that decides
 * which of the two a visitor sees.
 *
 * Authentication is not reimplemented here. The form posts to
 * `POST api/auth/login`, which is the same endpoint the panel's own JavaScript
 * will use at 5.3 — rate limited, session-based, and already the only place
 * that knows how a password is checked. This controller renders a page and
 * asks Auth whether there is a session; nothing more.
 */
class AdminController extends SiteController
{
    /* The panel is not the site. No nav item is lit, and neither the header's
       department menu nor the pre-footer belongs on it. */
    protected string $active = '';

    /**
     * `/admin` — the login screen, or the panel once there is a session.
     *
     * Not a redirect to `/admin/login`: a bookmark to `/admin` should open the
     * panel for somebody already signed in, and asking them to follow a
     * redirect to a form they do not need is a round trip to nothing.
     */
    public function index(): void
    {
        if (Auth::isAuthenticated()) {
            $this->panel();
            return;
        }

        $this->loginPage();
    }

    /**
     * `/admin/login` — the same screen under the name people link to.
     *
     * Signed in, it goes to `/admin` rather than rendering the form again: a
     * login page shown to somebody who is already logged in is a page that
     * invites them to log in twice.
     */
    public function login(): void
    {
        if (Auth::isAuthenticated()) {
            $this->redirect(base_url('admin'));
        }

        $this->loginPage();
    }

    /**
     * `/admin/logout` — sign out, then back to the form.
     *
     * A GET, unlike `POST api/auth/logout`. The API's version is what the
     * panel's JavaScript calls and it is CSRF-guarded; this one exists so that
     * a browser with no panel JavaScript loaded — which is every browser until
     * 5.2 — still has a way out. It ends a session and can create nothing, so
     * the worst a forged link achieves is signing somebody out.
     */
    public function logout(): void
    {
        if (Auth::isAuthenticated()) {
            $user = Auth::user();

            if ($user) {
                ActivityLog::record('logout', 'auth', null, (string) $user['email']);
            }
        }

        Auth::logout();

        $this->redirect(base_url('admin/login'));
    }

    /* ---------------------------------------------------------
       Screens
       --------------------------------------------------------- */

    private function loginPage(): void
    {
        $this->shell('admin/login', [
            'head' => ['title' => 'Sign in', 'noindex' => true],
            'csrf' => Csrf::token(),
            'action' => base_url('api/auth/login'),
            'next' => base_url('admin'),
        ]);
    }

    private function panel(): void
    {
        $user = Auth::user() ?? [];

        $this->shell('admin/panel', [
            'head' => ['title' => 'Panel', 'noindex' => true],
            'user' => $user,
            'logout' => base_url('admin/logout'),
        ]);
    }

    /**
     * The panel's own chrome: the site's head and footer, and nothing between
     * them but the screen.
     *
     * SiteController::page() is the wrong wrapper here — it renders the public
     * header, the department mega menu, the pre-footer and both popups, none
     * of which belong on a sign-in form. This takes the one part that does:
     * the document head, so the theme, the fonts and the stylesheets are the
     * site's own.
     *
     * `site/layout/scripts` is deliberately not rendered either. It loads GSAP,
     * Lenis and website.js, all of which exist to animate a page whose markup
     * is not here. The screens below carry their own script.
     */
    private function shell(string $body, array $data): void
    {
        $head = array_merge($this->head(), $data['head'] ?? []);
        $head['noindex'] = true;

        App::render('site/layout/head', $head);

        echo "\n    <main id=\"top\" class=\"adm-shell\">\n";
        render_view('/app/page/' . $body . '.php', $data + [
            'siteName' => (string) setting('general', 'name', 'Teresa Memorial Hospital'),
            'logo' => site_url((string) setting('general', 'logo', ''), base_url('assets/logo-teresa.png')),
            'home' => base_url('/'),
        ]);
        echo "\n    </main>\n</body>\n\n</html>\n";
    }
}
