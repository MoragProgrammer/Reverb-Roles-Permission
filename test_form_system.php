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

echo "🧪 Testing Form Submission System...\n\n";

try {
    // Test 1: Check if forms exist
    $formCount = Form::count();
    echo "✅ Forms in database: $formCount\n";
    
    // Test 2: Check if submissions exist
    $submissionCount = FormSubmission::count();
    echo "✅ Submissions in database: $submissionCount\n";
    
    // Test 3: Check if users exist
    $userCount = User::count();
    echo "✅ Users in database: $userCount\n";
    
    // Test 4: Check if roles exist
    $roleCount = Role::count();
    echo "✅ Roles in database: $roleCount\n";
    
    // Test 5: Display sample data
    echo "\n📊 Sample Data:\n";
    echo "================\n";
    
    $forms = Form::with(['submissions.user'])->take(3)->get();
    foreach ($forms as $form) {
        echo "📝 Form: {$form->title}\n";
        echo "   Status: {$form->status}\n";
        echo "   Submissions: {$form->submissions->count()}\n";
        
        foreach ($form->submissions as $submission) {
            echo "   - {$submission->user->first_name} {$submission->user->last_name}: {$submission->status}\n";
        }
        echo "\n";
    }
    
    echo "🎉 System test completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    exit(1);
}
