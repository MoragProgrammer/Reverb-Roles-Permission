<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customization_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Setting key (logo, favicon, title_text, login_picture)
            $table->text('value')->nullable(); // Setting value (file path or text)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customization_settings');
    }
};
