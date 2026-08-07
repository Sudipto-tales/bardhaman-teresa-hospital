<?php

/**
 * The 404, and the redirect table that runs before it.
 *
 * Every path that matched no route arrives here, which makes it the one place
 * a redirect can be checked without checking it on every request that was
 * going to work anyway. `/heart.html` was a real page on the old site; it is
 * one row in `redirects` and a 301 from here.
 */
class ErrorController extends SiteController
{
    protected string $active = '';

    /**
     * Widened from BaseController's, which renders the 404 template bare —
     * without the header, the footer or the department list that make it
     * useful. Same signature, so any controller calling $this->notFound()
     * gets this one.
     */
    public function notFound(string $message = ''): void
    {
        $this->redirectOr404($message);
    }

    /**
     * Follow a redirect if the path has one, otherwise render the 404.
     *
     * Protected because DepartmentController's catch-all needs exactly this:
     * an unknown one-segment path is a department that does not exist, and
     * that is the same question as any other unknown path.
     */
    public function redirectOr404(string $message = ''): void
    {
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $redirect = redirect_for_path($path);

        if ($redirect !== null && trim((string) ($redirect['to'] ?? '')) !== '') {
            $code = (int) ($redirect['code'] ?? 301);

            $this->redirect(
                site_url((string) $redirect['to']),
                in_array($code, [301, 302, 307, 308], true) ? $code : 301
            );
        }

        http_response_code(404);

        /* noindex, because a 404 that a crawler files under the URL it was
           asked for is a 404 that keeps being asked for. */
        $this->page('404', [
            'head' => [
                'title' => 'Page not found',
                'description' => 'That page is not here. The departments, doctors and contact details are.',
                'noindex' => true,
            ],
            'notFoundMessage' => $message,
            'departments' => $this->menuDepartments(),
            'bannerImage' => (string) setting('seo', 'defaultOgImage', ''),
            /* The pre-footer sells the site to somebody who is already lost.
               One clear way back is more use than four claims. */
            'prefooter' => false,
        ]);
    }
}
