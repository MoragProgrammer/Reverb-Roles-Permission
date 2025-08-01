<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->error('Users must exist before running PostSeeder.');
            return;
        }

        $samplePosts = [
            [
                'title' => 'Welcome to the New Form Management System',
                'category' => 'Announcements',
                'content' => 'We are excited to announce the launch of our new form management system. This system allows for efficient form creation, assignment, and review processes.',
                'status' => true,
            ],
            [
                'title' => 'How to Submit Your Documents',
                'category' => 'Tutorials',
                'content' => 'Follow these simple steps to submit your documents: 1. Check your notifications for assigned forms, 2. Upload required files, 3. Submit for review.',
                'status' => true,
            ],
            [
                'title' => 'System Maintenance Scheduled',
                'category' => 'Maintenance',
                'content' => 'We will be performing system maintenance this weekend. The system may be unavailable for a few hours during this time.',
                'status' => false,
            ],
            [
                'title' => 'New File Types Supported',
                'category' => 'Features',
                'content' => 'We now support additional file types including PowerPoint presentations and Excel spreadsheets for form submissions.',
                'status' => true,
            ],
            [
                'title' => 'User Guide and Documentation',
                'category' => 'Documentation',
                'content' => 'Check out our comprehensive user guide for detailed instructions on using all features of the form management system.',
                'status' => true,
            ],
        ];

        foreach ($samplePosts as $postData) {
            Post::create([
                'title' => $postData['title'],
                'category' => $postData['category'],
                'content' => $postData['content'],
                'slug' => Str::slug($postData['title']),
                'status' => $postData['status'] ?? true,
                'user_id' => $users->random()->id,
                'created_at' => fake()->dateTimeBetween('-60 days', 'now'),
                'updated_at' => fake()->dateTimeBetween('-30 days', 'now'),
            ]);
        }

        $this->command->info('Posts seeded successfully!');
    }
}
