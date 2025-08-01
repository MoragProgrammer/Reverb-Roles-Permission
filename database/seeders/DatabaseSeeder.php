<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

// Import our seeders
use Database\Seeders\PermissionSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\FormSeeder;
use Database\Seeders\FormSubmissionSeeder;
use Database\Seeders\NotificationSeeder;
use Database\Seeders\PostSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        
        // Step 1: Run permission seeder first to create all permissions
        $this->command->info('📋 Creating permissions...');
        $this->call(PermissionSeeder::class);
        
        // Step 2: Run user seeder to create admin and regular user
        $this->command->info('👤 Creating users and assigning roles...');
        $this->call(UserSeeder::class);
        
        // Step 3: Run form seeder to create sample forms with fields and assignments
        $this->command->info('📝 Creating sample forms...');
        $this->call(FormSeeder::class);
        
        // Step 4: Run form submission seeder to create sample submissions and responses
        $this->command->info('📋 Creating sample form submissions...');
        $this->call(FormSubmissionSeeder::class);
        
        // Step 5: Run notification seeder to create sample notifications
        $this->command->info('🔔 Creating sample notifications...');
        $this->call(NotificationSeeder::class);
        
        // Step 6: Run post seeder to create sample posts
        $this->command->info('📰 Creating sample posts...');
        $this->call(PostSeeder::class);
        
        $this->command->info('✅ Database seeding completed successfully!');
    }
}
