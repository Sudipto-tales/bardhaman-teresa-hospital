<?php

/** Shared, deny-by-default policy for admin screens and session APIs. */
final class Permissions
{
    public const RESOURCES = [
        'doctors' => 'content', 'leadership' => 'content', 'departments' => 'content',
        'facilities' => 'content', 'gallery' => 'content', 'lab-tests' => 'content',
        'posts' => 'content', 'categories' => 'content', 'testimonials' => 'content',
        'faqs' => 'content', 'media' => 'content', 'counters' => 'pages', 'pages' => 'pages',
        'jobs' => 'careers', 'applications' => 'careers', 'enquiries' => 'growth',
        'appointments' => 'growth', 'nav-items' => 'growth', 'redirects' => 'growth',
        'users' => 'system', 'roles' => 'system', 'settings' => 'system', 'activity' => 'system',
    ];

    public const SCREENS = [
        'dashboard' => 'system', 'analytics' => 'system', 'profile' => 'account',
        'doctors' => 'content', 'doctor-form' => 'content', 'leadership' => 'content',
        'leadership-form' => 'content', 'departments' => 'content', 'department-form' => 'content',
        'facilities' => 'content', 'facility-form' => 'content', 'lab-tests' => 'content',
        'lab-test-form' => 'content', 'blog' => 'content', 'blog-form' => 'content',
        'blog-categories' => 'content', 'testimonials' => 'content', 'faqs' => 'content',
        'gallery-items' => 'content', 'gallery' => 'content', 'pages' => 'pages',
        'page-home' => 'pages', 'page-about' => 'pages', 'page-contact' => 'pages',
        'page-careers' => 'pages', 'stats' => 'pages', 'jobs' => 'careers',
        'job-form' => 'careers', 'applications' => 'careers', 'enquiries' => 'growth',
        'appointments' => 'growth', 'enquiry-view' => 'growth', 'seo' => 'system', 'navigation' => 'growth',
        'redirects' => 'growth', 'settings-general' => 'system', 'settings-contact' => 'system',
        'settings-social' => 'system', 'settings-integrations' => 'system',
        'settings-theme' => 'system', 'settings-popups' => 'system', 'users' => 'system',
        'user-form' => 'system', 'activity-log' => 'system',
    ];

    public static function effective(?array $user = null): array
    {
        $user ??= Auth::user();
        if (!$user || ($user['status'] ?? '') !== 'active' || !empty($user['deleted_at'])) return [];
        if (($user['role_key'] ?? '') === 'role-super') {
            return array_fill_keys(['content', 'pages', 'careers', 'growth', 'system'], ['view', 'create', 'edit', 'delete', 'publish']);
        }
        if (!empty($user['custom_permissions'])) return json_column($user['permissions'] ?? null);
        return empty($user['role_id']) ? [] : json_column(db_scalar(
            'SELECT permissions FROM roles WHERE id = ? AND deleted_at IS NULL', [$user['role_id']]
        ));
    }

    public static function can(string $module, string $verb = 'view'): bool
    {
        $user = Auth::user();
        if (!$user || ($user['status'] ?? '') !== 'active' || !empty($user['deleted_at'])) return false;
        if ($module === 'account') return true;
        // Account administration and global reports remain Super Admin only.
        if ($module === 'system') return ($user['role_key'] ?? '') === 'role-super';
        $perms = self::effective($user);
        return in_array($verb, $perms[$module] ?? [], true);
    }

    public static function resource(string $name, string $verb = 'view'): bool
    {
        return isset(self::RESOURCES[$name]) && self::can(self::RESOURCES[$name], $verb);
    }

    public static function screen(string $name): bool
    {
        if (!isset(self::SCREENS[$name]) || !self::can(self::SCREENS[$name])) return false;
        if (str_ends_with($name, '-form')) {
            return self::can(self::SCREENS[$name], empty($_GET['id']) ? 'create' : 'edit');
        }
        return true;
    }

    public static function landing(): string
    {
        $stored = preg_replace('/\.html$/i', '', trim((string) (Auth::user()['landing_page'] ?? '')));
        if ($stored && isset(self::SCREENS[$stored]) && !str_ends_with($stored, '-form') && self::screen($stored)) return $stored;
        foreach (['dashboard', 'jobs', 'doctors', 'pages', 'enquiries', 'profile'] as $screen) {
            if (self::screen($screen)) return $screen;
        }
        return 'profile';
    }

    public static function enforceApi(string $route, string $method, array $params, string $action): void
    {
        $user = Auth::user();
        if (!$user || ($user['status'] ?? '') !== 'active' || !empty($user['deleted_at'])) Api::unauthenticated();
        if (str_starts_with($route, 'api/auth/') || in_array($route, ['api/bootstrap', 'api/search'], true)) return;
        $name = $params['resource'] ?? (explode('/', $route)[1] ?? '');
        if ($name === 'dashboard') $name = 'activity';
        $body = $method === 'GET' ? [] : ApiRequest::body();
        // The profile can read/update only its own record and safe account fields.
        if ($name === 'users' && ($params['id'] ?? '') === $user['public_id'] && in_array($method, ['GET', 'PATCH'], true)) {
            $allowed = ['name', 'email', 'phone', 'avatar', 'password', 'landingPage', 'language', 'timezone', 'emailDigest', 'updatedAt'];
            if ($method === 'GET' || !array_diff(array_keys($body), $allowed)) return;
        }
        $verb = match ($method) { 'GET' => 'view', 'DELETE' => 'delete', 'PATCH' => 'edit', default => 'create' };
        if (in_array($action, ['reorder', 'reorderSections', 'reply', 'note', 'testSmtp'], true)) $verb = 'edit';
        if ($action === 'restore') $verb = 'delete';
        if ($action === 'bulk') {
            $verb = match ($body['action'] ?? '') { 'delete' => 'delete', 'publish', 'hide' => 'publish', default => 'edit' };
        }
        if (!self::resource($name, 'view') || !self::resource($name, $verb)) Api::forbidden('You do not have permission to access this section or perform this action');
        $payload = $action === 'bulk' ? ($body['payload'] ?? []) : $body;
        if (in_array($payload['status'] ?? '', ['published', 'hidden'], true) && !self::resource($name, 'publish')) {
            Api::forbidden('You do not have permission to publish or hide records');
        }
    }
}
