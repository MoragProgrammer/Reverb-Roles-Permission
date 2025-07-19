<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

// Import our seeders
use Database\Seeders\PermissionSeeder;
use Database\Seeders\UserSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run permission seeder first to create all permissions
        $this->call(PermissionSeeder::class);
        
        // Run user seeder to create admin and regular user
        $this->call(UserSeeder::class);
    }
}
