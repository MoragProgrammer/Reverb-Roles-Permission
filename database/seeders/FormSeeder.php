<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\FormField;
use App\Models\User;
use App\Models\Role;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user as the form creator
        $creator = User::first();
        if (!$creator) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        // Create sample forms
        $forms = [
            [
                'title' => 'Document Submission Form',
                'description' => 'Submit required documents for processing',
                'status' => 'active',
                'account_name' => 'Human Resources Department',
                'school_id' => 'HR-001',
                'fields' => [
                    ['title' => 'Resume/CV', 'type' => 'PDF', 'order' => 1],
                    ['title' => 'Cover Letter', 'type' => 'Word', 'order' => 2],
                    ['title' => 'Portfolio', 'type' => 'PDF', 'order' => 3],
                ]
            ],
            [
                'title' => 'Image Upload Form',
                'description' => 'Upload required images and photos',
                'status' => 'active',
                'account_name' => 'Student Services Office',
                'school_id' => 'SSO-002',
                'fields' => [
                    ['title' => 'Profile Photo', 'type' => 'JPEG', 'order' => 1],
                    ['title' => 'ID Photo', 'type' => 'PNG', 'order' => 2],
                ]
            ],
            [
                'title' => 'Presentation Submission',
                'description' => 'Submit your presentation files',
                'status' => 'inactive',
                'account_name' => 'Academic Affairs Office',
                'school_id' => 'AAO-003',
                'fields' => [
                    ['title' => 'Main Presentation', 'type' => 'PowerPoint', 'order' => 1],
                    ['title' => 'Supporting Documents', 'type' => 'PDF', 'order' => 2],
                    ['title' => 'Data Analysis', 'type' => 'Excel', 'order' => 3],
                ]
            ]
        ];

        foreach ($forms as $formData) {
            $fields = $formData['fields'];
            unset($formData['fields']);
            
            $form = Form::create([
                'title' => $formData['title'],
                'description' => $formData['description'],
                'status' => $formData['status'],
                'account_name' => $formData['account_name'],
                'school_id' => $formData['school_id'],
                'created_by' => $creator->id,
            ]);

            // Create form fields
            foreach ($fields as $fieldData) {
                FormField::create([
                    'form_id' => $form->id,
                    'title' => $fieldData['title'],
                    'type' => $fieldData['type'],
                    'order' => $fieldData['order'],
                ]);
            }

            // Assign form to some roles and users if they exist
            $roles = Role::take(2)->get();
            if ($roles->isNotEmpty()) {
                $form->roles()->attach($roles->pluck('id'));
            }

            $users = User::take(3)->get();
            if ($users->isNotEmpty()) {
                $form->users()->attach($users->pluck('id'));
            }
        }

        $this->command->info('Forms seeded successfully!');
    }
}
