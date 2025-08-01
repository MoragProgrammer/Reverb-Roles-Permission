<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CustomizationSetting;

class CustomizationSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Set default title text
        CustomizationSetting::updateOrCreate(
            ['key' => 'title_text'],
            ['value' => 'Laravel Starter Kit']
        );
        
        // Set default login overlay opacity (40% = 0.4)
        CustomizationSetting::updateOrCreate(
            ['key' => 'login_overlay_opacity'],
            ['value' => '0.4']
        );
    }
}
