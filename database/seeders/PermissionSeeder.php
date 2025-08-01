<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            "users.view",
            "users.edit",
            "users.delete",
            "users.create",
            "roles.view",
            "roles.edit",
            "roles.delete",
            "roles.create",
            "forms.view",
            "forms.edit",
            "forms.delete",
            "forms.create",
            "forms.completion_viewer", // View completed submissions
            "forms.completion_editor", // Edit completed submissions
            "forms.completion_delete", // Delete completed submissions
            "forms.upload_user", // Upload forms for users
            "notifications.view",
            "notifications.Submissions_view",
            // notifications.create removed - notifications are auto-generated by system
            "submissions.view",
            "submissions.review",
            "submissions.re-review",
            "submissions.delete",
            "customization.view",
            "customization.edit",
            "customization.upload",
            "customization.delete",
        ];

        foreach ($permissions as $key => $value){
            Permission::firstOrCreate(["name" => $value]);
        }
    }
}
