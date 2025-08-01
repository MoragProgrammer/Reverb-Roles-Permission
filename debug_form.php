<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Form;

$form = Form::with('fields')->first();

echo "Form: {$form->title}\n";
echo "Fields count: {$form->fields->count()}\n";

foreach ($form->fields as $field) {
    echo "- Field ID: {$field->id}, Title: {$field->title}\n";
}
