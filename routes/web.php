<?php

//added controller------------
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\CustomizationController;
//---------------------------------

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Debug route to check permissions
    Route::get('/debug-permissions', function () {
        $user = auth()->user();
        return response()->json([
            'user' => $user->email,
            'roles' => $user->roles->pluck('name'),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'has_completion_viewer' => $user->can('forms.completion_viewer'),
        ]);
    });


    Route::resource('posts', PostController::class);

    // Customization page routes
    Route::get('customization', [CustomizationController::class, 'index'])->name('customization.index');
    Route::post('customization/upload/{type}', [CustomizationController::class, 'upload'])->name('customization.upload');
    Route::post('customization/delete/{type}', [CustomizationController::class, 'delete'])->name('customization.delete');
    Route::post('customization/update-title', [CustomizationController::class, 'updateTitle'])->name('customization.update-title');
    Route::post('customization/update-overlay-opacity', [CustomizationController::class, 'updateOverlayOpacity'])->name('customization.update-overlay-opacity');

//add route Users / Roles & Permissions ------------------

 //user route
    Route::resource("users", UserController::class)
                    ->only(["create", "store"])
                    ->middleware("permission:users.create");

    Route::resource("users", UserController::class)
                    ->only(["edit", "update"])
                    ->middleware("permission:users.edit");

    Route::resource("users", UserController::class)
                    ->only(["destroy"])
                    ->middleware("permission:users.delete");

    Route::resource("users", UserController::class)
                    ->only(["index","show"])
                    ->middleware("permission:users.view|users.create|users.edit|users.delete");



    //roles route
    Route::resource("roles", RoleController::class)
                    ->only(["create", "store"])
                    ->middleware("permission:roles.create");

   Route::resource("roles", RoleController::class)
                    ->only(["edit", "update"])
                    ->middleware("permission:roles.edit");

  Route::resource("roles", RoleController::class)
                    ->only(["destroy"])
                    ->middleware("permission:roles.delete");


  Route::resource("roles", RoleController::class)
                    ->only(["index","show"])
                    ->middleware("permission:roles.view|roles.create|roles.edit|roles.delete");
    //----------------------------------

    // Forms routes with permissions
    Route::resource('forms', FormController::class)
        ->only(['create', 'store'])
        ->middleware('permission:forms.create');
    
    Route::resource('forms', FormController::class)
        ->only(['edit', 'update'])
        ->middleware('permission:forms.edit');
    
    Route::resource('forms', FormController::class)
        ->only(['destroy'])
        ->middleware('permission:forms.delete');
    
    Route::resource('forms', FormController::class)
        ->only(['index', 'show'])
        ->middleware('permission:forms.view|forms.create|forms.edit|forms.delete');
        
    // Upload user form route
    Route::post('forms/{id}/upload-user', [FormController::class, 'uploadUser'])
        ->name('forms.upload-user')
        ->middleware('permission:forms.upload_user');

    // Notifications routes
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/fill-up/{id}', [NotificationController::class, 'fillUp'])->name('notifications.fillUp');
    Route::post('notifications/submit/{id}', [NotificationController::class, 'submit'])->name('notifications.submit');
    Route::get('notifications/rejected/{id}', [NotificationController::class, 'rejected'])->name('notifications.rejected');
    Route::get('notifications/completed/{id}', [NotificationController::class, 'completed'])->name('notifications.completed');

    // Submissions routes - specific routes first to avoid conflicts
    Route::get('submissions/{id}/completed', [SubmissionController::class, 'completed'])
        ->name('submissions.completed')
        ->middleware('permission:forms.completion_viewer');
    Route::get('submissions/{id}/completed/edit', [SubmissionController::class, 'edit'])
        ->name('submissions.completed.edit')
        ->middleware('permission:forms.completion_editor');
    Route::patch('submissions/{id}', [SubmissionController::class, 'update'])
        ->name('submissions.update')
        ->middleware('permission:forms.completion_editor');
    Route::get('submissions/{id}/download-all', [SubmissionController::class, 'downloadAll'])
        ->name('submissions.download.all')
        ->middleware('permission:forms.completion_viewer');
    Route::get('submissions/{id}/download/{responseId}', [SubmissionController::class, 'downloadFile'])
        ->name('submissions.download.file')
        ->middleware('permission:forms.completion_viewer');
    Route::delete('submissions/{id}/completed', [SubmissionController::class, 'destroy'])
        ->name('submissions.completed.destroy')
        ->middleware('permission:forms.completion_delete');
    Route::get('submissions/{id}/review', [SubmissionController::class, 'review'])
        ->name('submissions.review')
        ->middleware('permission:submissions.review');
    Route::post('submissions/{id}/review', [SubmissionController::class, 'storeReview'])
        ->name('submissions.review.store')
        ->middleware('permission:submissions.review');
    Route::get('submissions/{id}/re-review', [SubmissionController::class, 'reReview'])
        ->name('submissions.re-review')
        ->middleware('permission:submissions.re-review');
    Route::post('submissions/{id}/re-review', [SubmissionController::class, 'storeReReview'])
        ->name('submissions.reReview.store')
        ->middleware('permission:submissions.re-review');
    
    // General submissions resource routes
    Route::resource('submissions', SubmissionController::class)
        ->only(['index', 'show'])
        ->middleware('permission:submissions.view');
        
    Route::resource('submissions', SubmissionController::class)
        ->only(['destroy'])
        ->middleware('permission:submissions.delete');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
