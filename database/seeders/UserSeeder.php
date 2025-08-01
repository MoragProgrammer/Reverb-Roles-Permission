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
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'badge_color' => '#EF4444' // Red color for admin
        ]);

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
            'forms.view',
            'forms.create',
            'forms.edit',
            'forms.delete',
            'notifications.view',
            'notifications.Submissions_view',
            'submissions.view',
            'submissions.review',
            'submissions.re-review',
            'submissions.delete',
            'forms.completion_viewer',
            'forms.completion_editor',
            'forms.completion_delete',
            'forms.upload_user',
            'customization.view',
            'customization.edit',
            'customization.upload',
            'customization.delete',
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
        $userRole = Role::firstOrCreate([
            'name' => 'user',
            'badge_color' => '#3B82F6' // Blue color for regular users
        ]);

        // Give user basic permissions including forms access
        $userRole->givePermissionTo([
            'users.view',
            'roles.view',
            'forms.view',
            'notifications.view',
            'submissions.view',
        ]);

        // Create reviewer role
        $reviewerRole = Role::firstOrCreate([
            'name' => 'reviewer',
            'badge_color' => '#10B981' // Green color for reviewers
        ]);

        // Give reviewer permissions
        $reviewerRole->givePermissionTo([
            'users.view',
            'roles.view',
            'forms.view',
            'notifications.view',
            'notifications.Submissions_view',
            'submissions.view',
            'submissions.review',
            'submissions.re-review',
            'forms.completion_viewer',
            'forms.completion_editor',
        ]);

        // Create form manager role
        $formManagerRole = Role::firstOrCreate([
            'name' => 'form_manager',
            'badge_color' => '#8B5CF6' // Purple color for form managers
        ]);

        // Give form manager permissions
        $formManagerRole->givePermissionTo([
            'users.view',
            'roles.view',
            'forms.view',
            'forms.create',
            'forms.edit',
            'notifications.view',
            'submissions.view',
            'forms.completion_viewer',
        ]);

        // Create multiple users with different roles
        $users = [
            [
                'first_name' => 'John',
                'last_name' => 'Reviewer',
                'middle_name' => 'A.',
                'school_id' => 'rev001',
                'email' => 'reviewer@example.com',
                'gender' => 'Male',
                'status' => 'active',
                'role' => 'reviewer'
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Manager',
                'middle_name' => 'B.',
                'school_id' => 'mgr001',
                'email' => 'manager@example.com',
                'gender' => 'Female',
                'status' => 'active',
                'role' => 'form_manager'
            ],
            [
                'first_name' => 'Mike',
                'last_name' => 'Student',
                'middle_name' => null,
                'school_id' => 'std001',
                'email' => 'student1@example.com',
                'gender' => 'Male',
                'status' => 'active',
                'role' => 'user'
            ],
            [
                'first_name' => 'Emma',
                'last_name' => 'Wilson',
                'middle_name' => 'C.',
                'school_id' => 'std002',
                'email' => 'student2@example.com',
                'gender' => 'Female',
                'status' => 'active',
                'role' => 'user'
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Brown',
                'middle_name' => null,
                'school_id' => 'std003',
                'email' => 'student3@example.com',
                'gender' => 'Male',
                'status' => 'inactive',
                'role' => 'user'
            ]
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::create([
                ...$userData,
                'password' => Hash::make('password123'),
            ]);

            $user->assignRole($role);
        }
    }
}
