#update version for the roles & permission:


Added:

// Users
- php artisan make:controller UserController --resource (UserController)

Users (pages):
1. Index.tsx
2. Create.tsx
3. Edit.tsx
4. Show.tsx
----------------------------------------

- php artisan make:seeder PermissionSeeder
- php artisan db:seed PermissionSeeder

----------------------------------------
//Roles and permissions
- php artisan make:controller RoleController --resource (RoleController)

Roles (pages):
1. Index.tsx
2. Create.tsx
3. Edit.tsx
4. Show.tsx
---------------------------------------------

- can.ts (resource/js/lib)

- app.php {bootstrap/app.php} (add ing of middle ware :
     $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);    )

---------------------------------------------


Edited:
- web.php
- app-sidebar.tsx (components)
- User.php (Models)  => [ use Spatie\Permission\Traits\HasRoles; ]

- HandleInertiaRequests.php (app/Http/Middleware)


Intalls:
- composer require spatie/laravel-permission
- php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
- php artisan migrate
