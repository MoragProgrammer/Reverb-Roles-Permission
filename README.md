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


=========================================
DAY 2 :
=========================================
[Seeder Account User and Admin]
Add:
- UserSeeder.php  (database/seeders/UserSeeder.php ) 
- php artisan db:seed 


Edit:
- DatabaseSeeder.php  (database/seeders/DatabaseSeeder.php )

--------------------------------------------------------------------
[ Applying real time Users ]

Add:
- UserCreated.php (app/Events)
- UserDeleted.php (app/Events)
- UserUpdated.php (app/Events)

Edit:
- UserController.php
- Index.tsx (resources/js/pages/Users/Index.tsx)

--------------------------------------------------------------------
[ Applying real time Roles ]

Add:
- RoleCreated.php (app/Events)
- RoleDeleted.php (app/Events)
- RoleUpdated.php (app/Events)


Edit:
- RoleController.php
- Index (resources/js/pages/Roles/Index.tsx) 

-----------------------------------------------------------------------------
[Minor Fixes]

Roles (resources/js/pages/Roles) ::
1. Index.tsx
2. Create.tsx
3. Edit.tsx

Users (resources/js/pages/Users) ::
1. Index.tsx
2. Create.tsx
3. Edit.tsx

----------------------------------------------------------------------------------
----------------------------------------------------------------------------------
=========================================
DAY 3 :
=========================================

Add:


Edit:
- 0001_01_01_000000_create_users_table.php (migration)
- UserSeeder.php (database/seeder)


Users (pages/User) :
1. Index.tsx
2. Edit.tsx
3. Create.tsx
4. Show.tsx

- UserController.php (app/Controllers)

- User.php (Models/User)


- user-info.tsx (resources/js/components)
- index.d.ts (resources/js/types)

----------------------------------------------------------------------------------
=========================================
DAY 4:
=========================================

Edit:
- RoleController.php (Controllers/RoleController.php)

Roles (resources/js/pages/Roles):
- Create.tsx
- Index.tsx
- Edit.tsx
- Show.tsx


User (resources/js/pages/User): 
- Index.tsx



Add:
- 2025_07_20_000000_add_badge_color_to_roles.php (migration) 
- color-picker.tsx (resources/js/components)
- permission-groups.tsx (resources/js/components) 
- role-badge.tsx (resources/js/components) 
- Role.php (app/model)


