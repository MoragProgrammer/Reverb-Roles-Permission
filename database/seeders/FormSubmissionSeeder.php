<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\User;
use App\Models\FormSubmission;
use App\Models\SubmissionResponse;
use App\Models\SubmissionReview;
use Carbon\Carbon;

class FormSubmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $forms = Form::with('fields', 'users')->get();
        $users = User::all();
        $reviewers = User::whereHas('roles', function($query) {
            $query->where('name', 'admin');
        })->get();

        if ($forms->isEmpty() || $users->isEmpty()) {
            $this->command->error('Forms and Users must exist before running FormSubmissionSeeder.');
            return;
        }

        $statuses = [
            'not_yet_responded',
            'user_responded', 
            'rejection_process',
            'rejected_responded',
            'completed'
        ];

        foreach ($forms as $form) {
            // Get users assigned to this form (direct + through roles)
            $assignedUsers = $form->getAssignedUsersAttribute();
            
            if ($assignedUsers->isEmpty()) {
                // If no assigned users, use random users
                $assignedUsers = $users->random(min(3, $users->count()));
            }

            foreach ($assignedUsers->take(5) as $user) {
                $status = fake()->randomElement($statuses);
                $submittedAt = null;
                $reviewedAt = null;

                // Set timestamps based on status
                if (in_array($status, ['user_responded', 'rejection_process', 'rejected_responded', 'completed'])) {
                    $submittedAt = fake()->dateTimeBetween('-30 days', 'now');
                }

                if (in_array($status, ['rejection_process', 'rejected_responded', 'completed'])) {
                    $reviewedAt = fake()->dateTimeBetween($submittedAt ?? '-20 days', 'now');
                }

                $submission = FormSubmission::create([
                    'form_id' => $form->id,
                    'user_id' => $user->id,
                    'status' => $status,
                    'submitted_at' => $submittedAt,
                    'reviewed_at' => $reviewedAt,
                ]);

                // Create responses for submitted forms
                if ($submittedAt) {
                    foreach ($form->fields as $field) {
                        SubmissionResponse::create([
                            'form_submission_id' => $submission->id,
                            'form_field_id' => $field->id,
                            'file_path' => 'uploads/sample_' . strtolower($field->type) . '_' . $submission->id . '_' . $field->id . '.pdf',
                            'original_filename' => 'sample_' . str_replace(' ', '_', strtolower($field->title)) . '.pdf',
                            'mime_type' => 'application/pdf',
                            'file_size' => fake()->numberBetween(1024, 5242880), // 1KB to 5MB
                            'status' => match($status) {
                                'user_responded' => 'pending',
                                'rejection_process', 'rejected_responded' => 'rejected',
                                'completed' => 'approved',
                                default => 'pending'
                            },
                            'rejection_reason' => in_array($status, ['rejection_process', 'rejected_responded']) 
                                ? fake()->sentence() : null,
                            'submitted_at' => $submittedAt,
                        ]);
                    }
                }

                // Create reviews for reviewed submissions
                if ($reviewedAt && $reviewers->isNotEmpty()) {
                    $action = match($status) {
                        'rejection_process' => 'rejected',
                        'rejected_responded' => fake()->randomElement(['re-rejected', 're-approved']),
                        'completed' => 'approved',
                        default => fake()->randomElement(['approved', 'rejected'])
                    };

                    SubmissionReview::create([
                        'form_submission_id' => $submission->id,
                        'reviewer_id' => $reviewers->random()->id,
                        'action' => $action,
                        'notes' => fake()->paragraph(),
                        'rejection_reasons' => in_array($action, ['rejected', 're-rejected']) 
                            ? $form->fields->pluck('title')->take(fake()->numberBetween(1, 2))->toArray()
                            : null,
                        'reviewed_at' => $reviewedAt,
                    ]);
                }
            }
        }

        $this->command->info('Form submissions seeded successfully!');
    }
}
