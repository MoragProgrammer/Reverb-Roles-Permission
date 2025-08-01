<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CustomizationSetting;
use Illuminate\Support\Facades\Storage;

class CustomizationController extends Controller
{
    public function index()
    {
        // Get settings from database with defaults
        $settings = [
            'current_logo' => CustomizationSetting::getValue('logo'),
            'current_favicon' => CustomizationSetting::getValue('favicon'),
            'current_title_text' => CustomizationSetting::getValue('title_text', 'Laravel Starter Kit'),
            'current_login_picture' => CustomizationSetting::getValue('login_picture'),
        ];

        return Inertia::render('Customization/Index', [
            'settings' => $settings
        ]);
    }

    public function updateTitle(Request $request)
    {
        $request->validate([
            'title_text' => 'required|string|max:255',
        ]);

        CustomizationSetting::setValue('title_text', $request->title_text);

        return back()->with('message', 'Title updated successfully!');
    }

    public function updateOverlayOpacity(Request $request)
    {
        $request->validate([
            'overlay_opacity' => 'required|numeric|min:0|max:1',
        ]);

        CustomizationSetting::setValue('login_overlay_opacity', $request->overlay_opacity);

        return back()->with('message', 'Overlay opacity updated successfully!');
    }

    public function upload(Request $request, $type)
    {
        $allowedTypes = ['logo', 'favicon', 'login_picture'];
        if (!in_array($type, $allowedTypes)) {
            return back()->withErrors([$type => 'Invalid upload type.']);
        }

        $request->validate([
            $type => 'required|image|mimes:jpeg,png,jpg,gif,svg,ico|max:2048',
        ]);

        if ($request->hasFile($type)) {
            // Delete old file if exists
            $oldFile = CustomizationSetting::getValue($type);
            if ($oldFile && Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }

            // Store new file
            $path = $request->file($type)->store('customization', 'public');
            CustomizationSetting::setValue($type, $path);

            return back()->with('message', ucfirst($type) . ' uploaded successfully!');
        }

        return back()->withErrors([$type => 'Failed to upload file.']);
    }

    public function delete(Request $request, $type)
    {
        $allowedTypes = ['logo', 'favicon', 'login_picture'];
        if (!in_array($type, $allowedTypes)) {
            return back()->withErrors([$type => 'Invalid delete type.']);
        }

        $oldFile = CustomizationSetting::getValue($type);
        if ($oldFile && Storage::disk('public')->exists($oldFile)) {
            Storage::disk('public')->delete($oldFile);
        }

        CustomizationSetting::setValue($type, null);

        return back()->with('message', ucfirst($type) . ' deleted successfully!');
    }
}
