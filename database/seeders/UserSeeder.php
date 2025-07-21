<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        
        // Give admin all permissions
        $adminRole->givePermissionTo([
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
        ]);

        // Create admin user
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'school_id' => 'admin001',
            'email' => 'admin@example.com',
            'gender' => 'Male',
            'password' => Hash::make('password123'),
        ]);

        // Assign admin role to admin user
        $admin->assignRole('admin');

        // Create regular user role if it doesn't exist
        $userRole = Role::firstOrCreate(['name' => 'user']);
        
        // Give user basic permissions
        $userRole->givePermissionTo([
            'users.view',
            'roles.view',
        ]);

        // Create regular user
        $user = User::create([
            'first_name' => 'Regular',
            'last_name' => 'User',
            'school_id' => 'user001',
            'email' => 'user@example.com',
            'gender' => 'Female',
            'password' => Hash::make('password123'),
        ]);

        // Assign user role to regular user
        $user->assignRole('user');
    }
}
