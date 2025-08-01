<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Form;
use App\Models\Role;
use App\Models\User;
use App\Models\FormSubmission;
use App\Events\FormCreated;
use App\Events\FormUpdated;
use App\Events\FormDeleted;
use App\Events\SubmissionCreated;
use App\Models\Notification;
use App\Events\NotificationCreated;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $forms = Form::with(['roles', 'users', 'fields'])
            ->latest()
            ->get()
            ->map(function ($form) {
                return [
                    'id' => $form->id,
                    'title' => $form->title,
                    'description' => $form->description,
                    'status' => $form->status,
                    'assigned_roles' => $form->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'badge_color' => $role->badge_color ?? '#6b7280'
                        ];
                    }),
                    'assigned_users' => $form->users->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'first_name' => $user->first_name,
                            'middle_name' => $user->middle_name,
                            'last_name' => $user->last_name,
                            'school_id' => $user->school_id,
                            'email' => $user->email,
                        ];
                    }),
                    'fields' => $form->fields->map(function ($field) {
                        return [
                            'id' => $field->id,
                            'title' => $field->title,
                            'type' => $field->type
                        ];
                    }),
                    'created_at' => $form->created_at->toISOString(),
                    'updated_at' => $form->updated_at->toISOString()
                ];
            });

        return Inertia::render('Forms/Index', [
            'forms' => $forms
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::select('id', 'name', 'badge_color')->get();
        $users = User::select('id', 'first_name', 'middle_name', 'last_name', 'school_id', 'email')->get();
        
        return Inertia::render('Forms/Create', [
            'roles' => $roles,
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:active,inactive',
            'assigned_roles' => 'array',
            'assigned_users' => 'array',
            'fields' => 'required|array|min:1',
            'fields.*.title' => 'required|string|max:255',
            'fields.*.type' => 'required|in:Word,Excel,PowerPoint,PDF,JPEG,PNG',
        ]);

        $form = Form::create([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'status' => $validatedData['status'],
            'created_by' => auth()->id(),
        ]);

        // Create form fields
        foreach ($validatedData['fields'] as $index => $fieldData) {
            $form->fields()->create([
                'title' => $fieldData['title'],
                'type' => $fieldData['type'],
                'order' => $index + 1,
            ]);
        }

        // Assign roles if provided
        if (isset($validatedData['assigned_roles']) && !empty($validatedData['assigned_roles'])) {
            $form->roles()->attach($validatedData['assigned_roles']);
        }

        // Assign users if provided
        if (isset($validatedData['assigned_users']) && !empty($validatedData['assigned_users'])) {
            $form->users()->attach($validatedData['assigned_users']);
        }

        // Create notifications for assigned users
        $this->createNotificationsForAssignedUsers($form);
        
        // Reload form with relationships for broadcasting
        $form->load(['roles', 'users', 'fields']);
        event(new FormCreated($form));
        
        return redirect()->route('forms.index')->with('success', 'Form created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $form = Form::with(['roles', 'users', 'fields', 'creator', 'submissions.user'])->findOrFail($id);

        $formData = [
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'status' => $form->status,
            'assigned_roles' => $form->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'badge_color' => $role->badge_color ?? '#6b7280'
                ];
            }),
            'assigned_users' => $form->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'school_id' => $user->school_id,
                    'email' => $user->email,
                ];
            }),
            'fields' => $form->fields->map(function ($field) {
                return [
                    'id' => $field->id,
                    'title' => $field->title,
                    'type' => $field->type
                ];
            }),
            'submissions' => $form->submissions->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'form_id' => $submission->form_id,
                    'status' => $submission->status,
                    'submitted_at' => $submission->submitted_at ? $submission->submitted_at->toISOString() : $submission->created_at->toISOString(),
                    'user' => [
                        'id' => $submission->user->id,
                        'first_name' => $submission->user->first_name,
                        'middle_name' => $submission->user->middle_name,
                        'last_name' => $submission->user->last_name,
                        'school_id' => $submission->user->school_id,
                        'email' => $submission->user->email,
                    ]
                ];
            }),
            'account_name' => $form->account_name ?? ($form->creator ? $form->creator->first_name . ' ' . $form->creator->last_name : 'Unknown'),
            'school_id' => $form->school_id ?? ($form->creator ? $form->creator->school_id : 'N/A'),
            'created_at' => $form->created_at->toISOString(),
            'updated_at' => $form->updated_at->toISOString()
        ];

        // Get all users for the upload form functionality with their submission status
        $users = User::select('id', 'first_name', 'middle_name', 'last_name', 'school_id', 'email')
            ->with(['submissions' => function($query) use ($form) {
                $query->where('form_id', $form->id)->select('id', 'user_id', 'form_id', 'status');
            }])
            ->get()
            ->map(function ($user) use ($form) {
                $submission = $user->submissions->first();
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'school_id' => $user->school_id,
                    'email' => $user->email,
                    'has_completed_submission' => $submission && $submission->status === 'completed',
                    'submission_status' => $submission ? $submission->status : null,
                ];
            });
        
        return Inertia::render('Forms/Show', [
            'form' => $formData,
            'users' => $users
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $form = Form::with(['roles', 'users', 'fields'])->findOrFail($id);
        
        $formData = [
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'status' => $form->status,
            'assigned_roles' => $form->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'badge_color' => $role->badge_color ?? '#6b7280'
                ];
            }),
            'assigned_users' => $form->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'school_id' => $user->school_id,
                    'email' => $user->email,
                ];
            }),
            'fields' => $form->fields->map(function ($field) {
                return [
                    'id' => $field->id,
                    'title' => $field->title,
                    'type' => $field->type
                ];
            }),
            'created_at' => $form->created_at->toISOString(),
            'updated_at' => $form->updated_at->toISOString()
        ];
        
        $roles = Role::select('id', 'name', 'badge_color')->get();
        $users = User::select('id', 'first_name', 'middle_name', 'last_name', 'school_id', 'email')->get();

        return Inertia::render('Forms/Edit', [
            'form' => $formData,
            'roles' => $roles,
            'users' => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:active,inactive',
            'assigned_roles' => 'array',
            'assigned_users' => 'array',
            'fields' => 'required|array|min:1',
            'fields.*.title' => 'required|string|max:255',
            'fields.*.type' => 'required|in:Word,Excel,PowerPoint,PDF,JPEG,PNG',
        ]);

        $form = Form::findOrFail($id);
        
        // Update basic form data
        $form->update([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'status' => $validatedData['status'],
        ]);

        // Update form fields - delete old ones and create new ones
        $form->fields()->delete();
        foreach ($validatedData['fields'] as $index => $fieldData) {
            $form->fields()->create([
                'title' => $fieldData['title'],
                'type' => $fieldData['type'],
                'order' => $index + 1,
            ]);
        }

        // Update assigned roles
        if (isset($validatedData['assigned_roles'])) {
            $form->roles()->sync($validatedData['assigned_roles']);
        } else {
            $form->roles()->detach();
        }

        // Update assigned users
        if (isset($validatedData['assigned_users'])) {
            $form->users()->sync($validatedData['assigned_users']);
        } else {
            $form->users()->detach();
        }

        // Load relationships for broadcasting
        $form->load(['roles', 'users', 'fields']);
        
        event(new FormUpdated($form));
        return redirect()->route('forms.show', $id)->with('success', 'Form updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Add deletion logic here
        $form = Form::findOrFail($id);
        $form->delete();
        event(new FormDeleted($form->id));
        return redirect()->route('forms.index')->with('success', 'Form deleted successfully!');
    }

    /**
     * Create notifications and initial submissions for all users assigned to the form
     */
    private function createNotificationsForAssignedUsers(Form $form)
    {
        // Get all users assigned directly to the form
        $directUsers = $form->users;
        
        // Get all users assigned through roles
        $roleUsers = collect();
        foreach ($form->roles as $role) {
            $usersInRole = User::role($role->name)->get();
            $roleUsers = $roleUsers->merge($usersInRole);
        }
        
        // Combine and remove duplicates
        $allAssignedUsers = $directUsers->merge($roleUsers)->unique('id');
        
        // Create notifications and initial submissions for each assigned user
        foreach ($allAssignedUsers as $user) {
            // Create notification
            $notification = Notification::createFormAssignedNotification($user, $form);
            
            // Create initial form submission with "not_yet_responded" status
            $submission = FormSubmission::create([
                'form_id' => $form->id,
                'user_id' => $user->id,
                'status' => 'not_yet_responded',
                'submitted_at' => null,
                'reviewed_at' => null,
            ]);
            
            // Format submission data for broadcasting
            $submissionData = [
                'id' => $submission->id,
                'account_name' => $user->first_name . ' ' . $user->last_name,
                'school_id' => $user->school_id,
                'form_title' => $form->title,
                'status' => $submission->status,
                'submitted_time' => $submission->created_at->toISOString(),
                'form_id' => $form->id
            ];
            
            // Broadcast the submission creation
            event(new SubmissionCreated($submission));
            
            // Broadcast the notification creation with proper frontend format
            // This should match exactly what NotificationController::index() returns
            event(new NotificationCreated([
                'id' => $notification->id, // Use notification ID for uniqueness
                'user_id' => $user->id, // Include user_id for frontend filtering
                'form_id' => $notification->form_id, // Keep form ID separate
                'title' => $notification->form->title,
                'status' => 'pending', // This matches determineFormStatus for not_yet_responded
                'notification_id' => $notification->id,
                'type' => $notification->type,
                'message' => "Form '{$notification->form->title}' is ready to fill",
                'created_at' => $notification->created_at->toISOString(),
                'can_fill' => true, // User can fill this form since it's just assigned
                'submission_status' => 'not_yet_responded',
            ]));
        }
    }
    
    /**
     * Upload a user form with files and auto-complete the submission
     */
    public function uploadUser(Request $request, string $id)
    {
        $form = Form::with(['fields'])->findOrFail($id);
        
        // Validate the request
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'files' => 'required|array',
            'files.*' => 'required|file|max:50000', // 50MB max per file
            'notes' => 'nullable|string|max:1000'
        ]);
        
        $user = User::findOrFail($request->user_id);
        
        // Check if user already has a submission for this form
        $existingSubmission = FormSubmission::where('form_id', $form->id)
            ->where('user_id', $user->id)
            ->first();
        
        if ($existingSubmission && $existingSubmission->status === 'completed') {
            return back()->with('error', 'User already has a completed submission for this form.');
        }
        
        // Create or update submission
        $submission = $existingSubmission ?: FormSubmission::create([
            'form_id' => $form->id,
            'user_id' => $user->id,
            'status' => 'completed', // Auto-complete
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ]);
        
        if ($existingSubmission) {
            $submission->update([
                'status' => 'completed',
                'submitted_at' => now(),
                'reviewed_at' => now(),
            ]);
        }
        
        // Process each uploaded file
        foreach ($request->file('files') as $fieldId => $file) {
            $field = $form->fields()->find($fieldId);
            
            if (!$field) {
                continue; // Skip if field doesn't exist
            }
            
            // Store the file
            $path = $file->store('form_submissions', 'public');
            
            // Create submission response
            \App\Models\SubmissionResponse::create([
                'form_submission_id' => $submission->id,
                'form_field_id' => $field->id,
                'file_path' => $path,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'status' => 'approved', // Auto-approve
                'submitted_at' => now(),
            ]);
        }
        
        // Create review record
        \App\Models\SubmissionReview::create([
            'form_submission_id' => $submission->id,
            'reviewer_id' => auth()->id(),
            'action' => 'approved',
            'notes' => $request->notes ?: 'Auto-approved via direct upload',
            'reviewed_at' => now(),
        ]);
        
        // Create or update notification to completed status
        $notification = Notification::forUser($user->id)
            ->where('form_id', $form->id)
            ->first();
            
        if ($notification) {
            $notification->update([
                'type' => Notification::TYPE_FORM_COMPLETED,
                'title' => "Form completed: {$form->title}",
                'message' => 'Your form submission has been completed via direct upload.',
                'status' => Notification::STATUS_READ,
                'read_at' => now(),
            ]);
        } else {
            // Create completed notification if none exists
            $notification = Notification::create([
                'user_id' => $user->id,
                'form_id' => $form->id,
                'type' => Notification::TYPE_FORM_COMPLETED,
                'title' => "Form completed: {$form->title}",
                'message' => 'Your form submission has been completed via direct upload.',
                'status' => Notification::STATUS_READ,
                'read_at' => now(),
            ]);
        }
        
        // Broadcast events
        event(new \App\Events\SubmissionUpdated($submission));
        event(new \App\Events\NotificationUpdated([
            'id' => $notification->id, // Use notification ID for uniqueness
            'user_id' => $user->id, // Include user_id for frontend filtering
            'form_id' => $form->id, // Keep form ID separate
            'title' => $form->title,
            'status' => 'completed',
            'notification_id' => $notification->id,
            'type' => 'form_completed',
            'message' => '🎉 Form has been completed via direct upload!',
            'created_at' => now()->toISOString(),
            'can_fill' => false,
            'submission_status' => 'completed',
        ]));
        
        return back()->with('success', 'Form uploaded and completed successfully for ' . $user->first_name . ' ' . $user->last_name . '!');
    }
}
