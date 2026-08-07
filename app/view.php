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
            'doctors' => ['DoctorController', 'index'],
            'facilities' => ['FacilityController', 'index'],

            'blog' => ['BlogController', 'index'],
            'blog/{slug}' => ['BlogController', 'show'],

            'careers' => ['CareersController', 'index'],
            'careers/{slug}' => ['CareersController', 'show'],

            /* Last. Anything else one segment long is looked up as a
               department, then as a redirect, then answered as a 404. */
            '{slug}' => ['DepartmentController', 'show'],

            '404' => ['ErrorController', 'notFound'],
        ];
    }
}

return ViewRouteProvider::routes();
