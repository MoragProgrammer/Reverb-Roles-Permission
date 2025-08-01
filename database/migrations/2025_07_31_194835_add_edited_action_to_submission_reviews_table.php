<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table to modify the enum
        // First, create a temporary table with the new enum
        Schema::create('submission_reviews_temp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained('form_submissions')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->enum('action', ['approved', 'rejected', 're-approved', 're-rejected', 'edited']);
            $table->text('notes')->nullable();
            $table->json('rejection_reasons')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();
        });

        // Copy data from the old table to the new table
        DB::statement('INSERT INTO submission_reviews_temp SELECT * FROM submission_reviews');

        // Drop the old table
        Schema::dropIfExists('submission_reviews');

        // Rename the temp table to the original name
        Schema::rename('submission_reviews_temp', 'submission_reviews');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the table with the old enum values
        Schema::create('submission_reviews_temp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained('form_submissions')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->enum('action', ['approved', 'rejected', 're-approved', 're-rejected']);
            $table->text('notes')->nullable();
            $table->json('rejection_reasons')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();
        });

        // Copy data from the current table to the temp table (excluding 'edited' actions)
        DB::statement('INSERT INTO submission_reviews_temp SELECT * FROM submission_reviews WHERE action != "edited"');

        // Drop the current table
        Schema::dropIfExists('submission_reviews');

        // Rename the temp table to the original name
        Schema::rename('submission_reviews_temp', 'submission_reviews');
    }
};
