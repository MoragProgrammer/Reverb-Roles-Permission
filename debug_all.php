<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Form;
use App\Models\FormField;

echo "Forms count: " . Form::count() . "\n";
echo "Fields count: " . FormField::count() . "\n\n";

echo "All Forms:\n";
foreach (Form::all() as $form) {
    echo "- Form ID: {$form->id}, Title: {$form->title}\n";
}

echo "\nAll Fields:\n";
foreach (FormField::all() as $field) {
    echo "- Field ID: {$field->id}, Form ID: {$field->form_id}, Title: {$field->title}\n";
}
