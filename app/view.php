<?php

/**
 * The public site's route table.
 *
 * Clean URLs, and department pages at the root — `/cardiology`, not
 * `/departments/cardiology`. The design names them that way, the seeded
 * redirects point at them that way, and a department is a destination on this
 * site rather than a child of the listing.
 *
 * ORDER: RouteManager tries exact keys first, so every literal above beats
 * `{slug}` whatever order they appear in. Between patterns the first that
 * matches wins, and a `{param}` never spans a `/` — which is what stops
 * `{slug}` swallowing `blog/how-to-read-a-blood-report`.
 *
 * `{slug}` last, and deliberately a catch-all: an unknown one-segment path is
 * a department that does not exist, and DepartmentController answers it with
 * the redirect table and then the 404 page.
 */

require_once __DIR__ . '/../core/RouteProvider.php';

class ViewRouteProvider extends RouteProvider
{
    public static function routes(): array
    {
        return [
            'default' => ['HomeController', 'index'],

            'about' => ['AboutController', 'index'],
            'contact' => ['ContactController', 'index'],

            'departments' => ['DepartmentController', 'index'],
            /* The nested form the mega menu used to build, and the shape
               anybody would guess from the listing's own URL. It is not a
               second address for the page — it is a 301 to the first. */
            'departments/{slug}' => ['DepartmentController', 'legacy'],
            'doctors' => ['DoctorController', 'index'],
            'facilities' => ['FacilityController', 'index'],

            'blog' => ['BlogController', 'index'],
            'blog/{slug}' => ['BlogController', 'show'],

            'careers' => ['CareersController', 'index'],
            'careers/{slug}' => ['CareersController', 'show'],

            /* The panel. `admin/{screen}` is the whole of it — a screen exists
               if app/page/admin/<screen>.php does, so adding one is never also
               remembering to add a route. The two literals above it are the
               front door and the way out; both beat the pattern, whatever
               order they are written in.

               There is no `admin/{screen}/{id}`. The panel addresses a record
               with `?id=`, never with a path segment, and a segment would
               change what every relative link in the page scripts resolves to. */
            'admin' => ['AdminController', 'index'],
            'admin/login' => ['AdminController', 'login'],
            'admin/logout' => ['AdminController', 'logout'],
            'admin/{screen}' => ['AdminController', 'screen'],

            /* Last. Anything else one segment long is looked up as a
               department, then as a redirect, then answered as a 404. */
            '{slug}' => ['DepartmentController', 'show'],

            '404' => ['ErrorController', 'notFound'],
        ];
    }
}

return ViewRouteProvider::routes();
