<?php

require_once __DIR__ . '/../core/RouteProvider.php';

class ApiGatewayProvider extends RouteProvider
{
    public static function routes(): array
    {
        return [
            // Auth (public)
            'POST:api/v1/auth/login'    => ['UserController', 'login'],
            'POST:api/v1/auth/register' => ['UserController', 'register'],

            // Users (protected)
            'GET:api/v1/users'          => ['UserController', 'index',   'auth'],
            'GET:api/v1/users/{id}'     => ['UserController', 'show',    'auth'],
            'PUT:api/v1/users/{id}'     => ['UserController', 'update',  'auth'],
            'DELETE:api/v1/users/{id}'  => ['UserController', 'destroy', 'auth'],
        ];
    }
}

return ApiGatewayProvider::routes();
