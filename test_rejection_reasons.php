<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormSubmission;
use App\Models\SubmissionResponse;
use App\Models\SubmissionReview;
use App\Models\Notification;

echo "Testing rejection reasons functionality...\n\n";

try {
    // Find or create test users
    $submitter = User::first();
    $reviewer = User::skip(1)->first();
    
    if (!$submitter || !$reviewer) {
        echo "Error: Need at least 2 users in the database to run this test.\n";
        exit(1);
    }
    
    echo "Using submitter: {$submitter->email}\n";
    echo "Using reviewer: {$reviewer->email}\n\n";
    
    // Find a test form with fields
    $form = Form::whereHas('fields')->first();
    if (!$form) {
        echo "Error: Need at least 1 form with fields in the database to run this test.\n";
        exit(1);
    }
    
    echo "Using form: {$form->title}\n\n";
    
    // Create a test submission
    $submission = FormSubmission::create([
        'form_id' => $form->id,
        'user_id' => $submitter->id,
        'status' => 'user_responded',
        'submitted_at' => now(),
    ]);
    
    echo "Created submission ID: {$submission->id}\n";
    
    // Create test responses for each form field
    $responses = [];
    foreach ($form->fields as $field) {
        $response = SubmissionResponse::create([
            'form_submission_id' => $submission->id,
            'form_field_id' => $field->id,
            'file_path' => 'test/file.pdf',
            'original_filename' => 'test_file.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'submitted_at' => now(),
        ]);
        $responses[] = $response;
        echo "Created response for field '{$field->title}'\n";
    }
    
    // Create a rejection review with reasons
    $rejectionReasons = [];
    $notes = "Test rejection notes for integration testing";
    
    foreach ($responses as $index => $response) {
        $fieldNumber = $index + 1;
        $rejectionReasons[$response->form_field_id] = "Rejection reason for field {$fieldNumber}: needs improvement";
    }
    
    $review = SubmissionReview::create([
        'form_submission_id' => $submission->id,
        'reviewer_id' => $reviewer->id,
        'action' => 'rejected',
        'rejection_reasons' => json_encode($rejectionReasons),
        'notes' => $notes,
        'reviewed_at' => now(),
    ]);
    
    echo "\nCreated rejection review ID: {$review->id}\n";
    echo "Rejection reasons: " . json_encode($rejectionReasons, JSON_PRETTY_PRINT) . "\n";
    
    // Update submission status
    $submission->update(['status' => 'rejection_process']);
    
    // Update each response with its rejection reason
    foreach ($responses as $response) {
        if (isset($rejectionReasons[$response->form_field_id])) {
            $response->update([
                'rejection_reason' => $rejectionReasons[$response->form_field_id]
            ]);
            echo "Updated response {$response->id} with rejection reason\n";
        }
    }
    
    // Create notification
    $notification = Notification::create([
        'user_id' => $submitter->id,
        'form_id' => $form->id,
        'type' => 'form_rejected',
        'title' => "Submission Rejected: {$form->title}",
        'message' => "Your submission has been rejected. Please review the feedback and resubmit.",
        'status' => 'unread',
    ]);
    
    echo "Created notification ID: {$notification->id}\n\n";
    
    // Verify the data was saved correctly
    echo "=== VERIFICATION ===\n";
    
    // Check submission review
    $savedReview = SubmissionReview::find($review->id);
    $savedReasons = json_decode($savedReview->rejection_reasons, true);
    echo "Review rejection reasons: " . json_encode($savedReasons, JSON_PRETTY_PRINT) . "\n";
    echo "Review notes: {$savedReview->notes}\n";
    
    // Check responses
    echo "\nResponse rejection reasons:\n";
    foreach ($responses as $response) {
        $updatedResponse = SubmissionResponse::find($response->id);
        echo "- Field {$updatedResponse->form_field_id}: {$updatedResponse->rejection_reason}\n";
    }
    
    // Check notification
    $savedNotification = Notification::find($notification->id);
    echo "\nNotification: {$savedNotification->title}\n";
    echo "Message: {$savedNotification->message}\n";
    
    echo "\n✅ Test completed successfully! All rejection reasons were saved and can be retrieved.\n";
    
    // Clean up test data
    echo "\nCleaning up test data...\n";
    $notification->delete();
    foreach ($responses as $response) {
        $response->delete();
    }
    $review->delete();
    $submission->delete();
    echo "✅ Cleanup completed.\n";
    
} catch (Exception $e) {
    echo "❌ Test failed with error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
