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

----------------------------------------
//Roles and permissions




Edited:
- web.php
- app-sidebar.tsx (components)




Intalls:
- composer require spatie/laravel-permission
- php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
- php artisan migrate
