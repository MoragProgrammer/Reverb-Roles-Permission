<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;
use App\Models\Form;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get some users and forms for sample notifications
        $users = User::take(3)->get();
        $forms = Form::take(2)->get();
        
        if ($users->isEmpty() || $forms->isEmpty()) {
            $this->command->warn('No users or forms found. Please run UserSeeder and FormSeeder first.');
            return;
        }
        
        // Create some sample notifications
        foreach ($users as $user) {
            foreach ($forms as $form) {
                // Create assigned form notification
                Notification::createFormAssignedNotification($user, $form);
                
                // Create some rejected notifications for variety
                if ($user->id % 2 === 0) {
                    Notification::createFormRejectedNotification($user, $form, [
                        'Document Upload' => 'File format not supported. Please upload PDF format.',
                        'Cover Letter' => 'Cover letter is missing required information.'
                    ]);
                }
            }
        }
        
        $this->command->info('Sample notifications created successfully!');
    }
}
