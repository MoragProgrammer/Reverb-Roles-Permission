<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\User;
use App\Models\Role;
use App\Models\Notification;

echo "🧪 Testing Form Assignment and Submission Creation...\n\n";

try {
    // Get existing users
    $users = User::take(2)->get();
    if ($users->count() < 2) {
        echo "❌ Need at least 2 users in database to test\n";
        exit(1);
    }
    
    echo "👥 Found " . $users->count() . " users:\n";
    foreach ($users as $user) {
        echo "   - {$user->first_name} {$user->last_name} (ID: {$user->id})\n";
    }
    echo "\n";
    
    // Get existing form
    $form = Form::first();
    if (!$form) {
        echo "❌ No forms found in database\n";
        exit(1);
    }
    
    echo "📝 Using form: {$form->title} (ID: {$form->id})\n\n";
    
    // Clear existing assignments
    $form->users()->detach();
    echo "🧹 Cleared existing form assignments\n";
    
    // Assign users to form
    $form->users()->attach($users->pluck('id'));
    echo "✅ Assigned {$users->count()} users to form\n";
    
    // Check notifications before
    $notificationsBefore = Notification::count();
    echo "📧 Notifications before: $notificationsBefore\n";
    
    // Check submissions before
    $submissionsBefore = FormSubmission::count();
    echo "📋 Submissions before: $submissionsBefore\n";
    
    // Simulate the FormController's createNotificationsForAssignedUsers method
    echo "\n🔄 Simulating form assignment process...\n";
    
    // Get all users assigned directly to the form
    $directUsers = $form->users;
    
    // Get all users assigned through roles (if any)
    $roleUsers = collect();
    foreach ($form->roles as $role) {
        $usersInRole = User::role($role->name)->get();
        $roleUsers = $roleUsers->merge($usersInRole);
    }
    
    // Combine and remove duplicates
    $allAssignedUsers = $directUsers->merge($roleUsers)->unique('id');
    
    echo "👥 Found {$allAssignedUsers->count()} assigned users (direct + roles)\n";
    
    // Create notifications and initial submissions for each assigned user
    foreach ($allAssignedUsers as $user) {
        // Create notification
        $notification = Notification::createFormAssignedNotification($user, $form);
        echo "   📧 Created notification for {$user->first_name} {$user->last_name}\n";
        
        // Create initial form submission with "not_yet_responded" status
        $submission = FormSubmission::create([
            'form_id' => $form->id,
            'user_id' => $user->id,
            'status' => 'not_yet_responded',
            'submitted_at' => null,
            'reviewed_at' => null,
        ]);
        echo "   📋 Created initial submission for {$user->first_name} {$user->last_name} (Status: {$submission->status})\n";
    }
    
    // Check final counts
    $notificationsAfter = Notification::count();
    $submissionsAfter = FormSubmission::count();
    
    echo "\n📊 Final Results:\n";
    echo "================\n";
    echo "📧 Notifications: $notificationsBefore → $notificationsAfter (+". ($notificationsAfter - $notificationsBefore) .")\n";
    echo "📋 Submissions: $submissionsBefore → $submissionsAfter (+". ($submissionsAfter - $submissionsBefore) .")\n";
    
    // Display current submissions
    echo "\n📋 Current Submissions:\n";
    $submissions = FormSubmission::with(['user', 'form'])->get();
    foreach ($submissions as $submission) {
        echo "   - {$submission->user->first_name} {$submission->user->last_name}: {$submission->status} (Form: {$submission->form->title})\n";
    }
    
    echo "\n🎉 Form assignment test completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
