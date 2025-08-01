<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Form;
use App\Models\FormField;

echo "Setting up test data...\n\n";

try {
    // Create a test form
    $form = Form::create([
        'title' => 'Test Form for Integration Testing',
        'description' => 'This is a test form to verify rejection reasons functionality',
        'created_by' => 1,
    ]);
    
    echo "Created form ID: {$form->id}\n";
    
    // Create test fields
    $field1 = FormField::create([
        'form_id' => $form->id,
        'title' => 'Test Document 1',
        'type' => 'PDF',
        'order' => 1,
    ]);
    
    $field2 = FormField::create([
        'form_id' => $form->id,
        'title' => 'Test Document 2',
        'type' => 'Word',
        'order' => 2,
    ]);
    
    echo "Created field IDs: {$field1->id}, {$field2->id}\n";
    echo "✅ Test data setup completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Failed to setup test data: " . $e->getMessage() . "\n";
    exit(1);
}
