<?php

/**
 * The API route table — docs/07-api-contract.md.
 *
 * ORDER MATTERS, in one specific way. RouteManager tries exact keys first, so
 * a literal route always beats a pattern. Between two *patterns* it takes the
 * first that matches, in the order written here. So every purpose-built
 * pattern must appear above the generic api/{resource}/... block, or
 * PATCH api/settings/general would be read as "patch the record 'general' in
 * the collection 'settings'".
 *
 * Middleware:
 *   'session'  cookie session + CSRF on anything that writes. The panel.
 *   none       public. Rate-limited and CSRF-checked inside the controller,
 *              because the site's own forms have no session to check.
 */

require_once __DIR__ . '/../core/RouteProvider.php';

class ApiGatewayProvider extends RouteProvider
{
    public static function routes(): array
    {
        return [

            /* -----------------------------------------------------
               Auth — the only panel routes without a session, for
               the obvious reason.
               ----------------------------------------------------- */

            'POST:api/auth/login' => ['AuthController', 'login'],
            'POST:api/auth/forgot' => ['AuthController', 'forgot'],
            'POST:api/auth/reset' => ['AuthController', 'reset'],
            'POST:api/auth/logout' => ['AuthController', 'logout', 'session'],
            'GET:api/auth/me' => ['AuthController', 'me', 'session'],
            /* Not in the contract. The profile screen confirms the current
               password before changing it, and posting to `login` to find out
               would regenerate the session and log a sign-in that was not one. */
            'POST:api/auth/verify-password' => ['AuthController', 'verifyPassword', 'session'],

            /* -----------------------------------------------------
               Public intake — called by the website, not the panel.
               ----------------------------------------------------- */

            'POST:api/public/enquiry' => ['PublicIntakeController', 'enquiry'],
            'POST:api/public/application' => ['PublicIntakeController', 'application'],

            /* There is deliberately no POST:api/public/appointment. The
               contact page's request form posts an enquiry with
               source = appointment; the desk calls back. See
               docs/02-content-model.md §20. */

            /* -----------------------------------------------------
               Singletons and specials — all above the generic block.
               ----------------------------------------------------- */

            'GET:api/settings' => ['SettingsController', 'index', 'session'],
            'POST:api/settings/integrations/test-smtp' => ['SettingsController', 'testSmtp', 'session'],
            'PATCH:api/settings/{group}' => ['SettingsController', 'update', 'session'],

            'GET:api/pages' => ['PageController', 'index', 'session'],
            'POST:api/pages/{id}/sections/reorder' => ['PageController', 'reorderSections', 'session'],
            'GET:api/pages/{id}' => ['PageController', 'show', 'session'],
            'PATCH:api/pages/{id}' => ['PageController', 'update', 'session'],

            'GET:api/media' => ['MediaController', 'index', 'session'],
            'POST:api/media' => ['MediaController', 'store', 'session'],
            'GET:api/media/{id}/usage' => ['MediaController', 'usage', 'session'],
            /* Not in the contract's media block, but the delete toast offers
               Undo like every other one, and media is not a generic resource,
               so it cannot borrow POST api/{resource}/{id}/restore. */
            'POST:api/media/{id}/restore' => ['MediaController', 'restore', 'session'],
            'PATCH:api/media/{id}' => ['MediaController', 'update', 'session'],
            'DELETE:api/media/{id}' => ['MediaController', 'destroy', 'session'],

            /* Applications go to their own controller for one reason: the
               record carries `cvUrl`, which is a route and not a column, and
               the panel's download button reads it. Everything else about
               these three verbs is ResourceController's, inherited. */
            'GET:api/applications/{id}/cv' => ['ApplicationController', 'cv', 'session'],
            'GET:api/applications' => ['ApplicationController', 'index', 'session'],
            'GET:api/applications/{id}' => ['ApplicationController', 'show', 'session'],
            'PATCH:api/applications/{id}' => ['ApplicationController', 'update', 'session'],

            'POST:api/enquiries/{id}/reply' => ['EnquiryController', 'reply', 'session'],
            'POST:api/enquiries/{id}/note' => ['EnquiryController', 'note', 'session'],

            /* Not in the contract, and added at 5.3. The panel reads its
               lookup collections synchronously — a table cell cannot await —
               so api.js fills that cache once per page load instead of the
               nine seed files the prototype shipped. See the controller. */
            'GET:api/bootstrap' => ['BootstrapController', 'index', 'session'],

            'GET:api/dashboard/summary' => ['DashboardController', 'summary', 'session'],
            'GET:api/activity' => ['DashboardController', 'activity', 'session'],
            'GET:api/search' => ['DashboardController', 'search', 'session'],

            /* -----------------------------------------------------
               The generic block. One controller, eighteen resources,
               config/resources.php.
               ----------------------------------------------------- */

            'POST:api/{resource}/reorder' => ['ResourceController', 'reorder', 'session'],
            'POST:api/{resource}/bulk' => ['ResourceController', 'bulk', 'session'],
            'POST:api/{resource}/{id}/restore' => ['ResourceController', 'restore', 'session'],

            'GET:api/{resource}' => ['ResourceController', 'index', 'session'],
            'POST:api/{resource}' => ['ResourceController', 'store', 'session'],
            'GET:api/{resource}/{id}' => ['ResourceController', 'show', 'session'],
            'PATCH:api/{resource}/{id}' => ['ResourceController', 'update', 'session'],
            'DELETE:api/{resource}/{id}' => ['ResourceController', 'destroy', 'session'],
        ];
    }
}

return ApiGatewayProvider::routes();
