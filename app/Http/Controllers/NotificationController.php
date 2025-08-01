<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\NotificationCreated;
use App\Events\NotificationUpdated;
use App\Events\SubmissionCreated;
use App\Events\SubmissionUpdated;
use App\Models\Notification;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\SubmissionResponse;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Get notifications for the current user AND verify they are actually assigned to the forms
        $notifications = Notification::forUser($user->id)
            ->with(['form.users', 'form.roles'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->filter(function ($notification) use ($user) {
                // Ensure the notification has a valid form
                if (!$notification->form) {
                    return false;
                }
                
                $form = $notification->form;
                
                // Check if user is directly assigned to this form
                $isDirectlyAssigned = $form->users->contains('id', $user->id);
                
                // Check if user is assigned through roles
                $isAssignedThroughRoles = false;
                foreach ($form->roles as $role) {
                    if ($user->hasRole($role->name)) {
                        $isAssignedThroughRoles = true;
                        break;
                    }
                }
                
                // Only include notification if user is actually assigned to the form
                return $isDirectlyAssigned || $isAssignedThroughRoles;
            })
            ->map(function ($notification) use ($user) {
                // For submission_pending notifications, handle differently
                if ($notification->type === Notification::TYPE_SUBMISSION_PENDING) {
                    return [
                        'id' => $notification->id, // Use notification ID for uniqueness
                        'form_id' => $notification->form_id, // Keep form ID separate
                        'title' => $notification->form->title,
                        'status' => 'review-pending',
                        'notification_id' => $notification->id,
                        'type' => $notification->type,
                        'message' => $notification->message,
                        'created_at' => $notification->created_at->toISOString(),
                        'can_fill' => false, // Reviewers don't fill forms
                        'submission_status' => null,
                        'data' => $notification->data, // Include submission details
                    ];
                }
                
                // Check if there's a submission for this form
                $submission = FormSubmission::where('form_id', $notification->form_id)
                    ->where('user_id', $user->id)
                    ->first();
                
                // Determine the actual status based on submission
                $actualStatus = $this->determineFormStatus($notification, $submission);
                
                return [
                    'id' => $notification->id, // Use notification ID for uniqueness
                    'form_id' => $notification->form_id, // Keep form ID separate
                    'title' => $notification->form->title,
                    'status' => $actualStatus,
                    'notification_id' => $notification->id,
                    'type' => $notification->type,
                    'message' => $this->getStatusMessage($actualStatus, $notification->form->title),
                    'created_at' => $notification->created_at->toISOString(),
                    'can_fill' => $this->canUserFillForm($notification, $submission),
                    'submission_status' => $submission ? $submission->status : null,
                ];
            });
        
        // Separate forms by status for frontend compatibility
        $assignedForms = $notifications->whereIn('status', ['pending', 'in-process', 'review-pending'])->values()->toArray();
        $rejectedForms = $notifications->where('status', 'rejected')->values()->toArray();
        $completedForms = $notifications->where('status', 'completed')->values()->toArray();

        // Get submissions data for users with proper permissions
        $submissionGroups = [];
        if ($user->can('notifications.Submissions_view')) {
            $submissions = FormSubmission::with(['form', 'user', 'form.roles', 'form.users'])
                ->whereIn('status', ['user_responded', 'rejected_responded'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'account_name' => $submission->user->first_name . ' ' . $submission->user->last_name,
                        'school_id' => $submission->user->school_id,
                        'form_title' => $submission->form->title,
                        'form_id' => $submission->form_id,
                        'status' => $submission->status,
                        'submitted_time' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString(),
                        // Add form grouping information
                        'form_info' => [
                            'id' => $submission->form->id,
                            'title' => $submission->form->title,
                            'description' => $submission->form->description,
                            'assigned_roles' => $submission->form->roles->map(function ($role) {
                                return [
                                    'id' => $role->id,
                                    'name' => $role->name,
                                    'badge_color' => $role->badge_color ?? '#6b7280'
                                ];
                            }),
                            'assigned_users' => $submission->form->users->map(function ($user) {
                                return [
                                    'id' => $user->id,
                                    'name' => $user->first_name . ' ' . $user->last_name,
                                    'school_id' => $user->school_id
                                ];
                            })
                        ]
                    ];
                })
                // Group submissions by form for better organization
                ->groupBy('form_id')
                ->map(function ($formSubmissions, $formId) {
                    $firstSubmission = $formSubmissions->first();
                    return [
                        'form_id' => $formId,
                        'form_title' => $firstSubmission['form_info']['title'],
                        'form_description' => $firstSubmission['form_info']['description'],
                        'assigned_roles' => $firstSubmission['form_info']['assigned_roles'],
                        'assigned_users' => $firstSubmission['form_info']['assigned_users'],
                        'submissions' => $formSubmissions->values()->toArray()
                    ];
                })
                ->values();

            $submissionGroups = $submissions;
        }

        // Mark all unread notifications as read when user visits the index page
        $unreadNotifications = Notification::forUser($user->id)
            ->where('status', 'unread')
            ->get();
            
        if ($unreadNotifications->count() > 0) {
            // Bulk update unread notifications to read
            Notification::forUser($user->id)
                ->where('status', 'unread')
                ->update([
                    'status' => Notification::STATUS_READ,
                    'read_at' => now(),
                ]);
                
            // Broadcast notification update to reset badge count
            foreach ($unreadNotifications as $notification) {
                event(new NotificationUpdated([
                    'id' => $notification->id,
                    'user_id' => $user->id,
                    'status' => 'read',
                    'read_at' => now()->toISOString(),
                ]));
            }
        }

        return Inertia::render('Notification/Index', [
            'assignedForms' => array_merge($assignedForms, $completedForms), // Include completed forms with assigned forms
            'rejectedForms' => $rejectedForms,
            'submissionGroups' => $submissionGroups
        ]);
    }

    /**
     * Show fill-up form
     */
    public function fillUp(string $id)
    {
        $form = Form::with(['fields', 'users', 'roles'])->findOrFail($id);
        
        $user = auth()->user();
        
        // Check if user has permission to fill this form
        $hasNotification = Notification::forUser($user->id)
            ->where('form_id', $id)
            ->whereIn('type', [Notification::TYPE_FORM_ASSIGNED, Notification::TYPE_FORM_REJECTED])
            ->exists();

        // Double-check that user is actually assigned to this form
        $isDirectlyAssigned = $form->users->contains('id', $user->id);
        $isAssignedThroughRoles = false;
        foreach ($form->roles as $role) {
            if ($user->hasRole($role->name)) {
                $isAssignedThroughRoles = true;
                break;
            }
        }
        
        $isActuallyAssigned = $isDirectlyAssigned || $isAssignedThroughRoles;

        if (!$hasNotification || !$isActuallyAssigned) {
            abort(403, 'You are not authorized to fill this form.');
        }
        
        // Check if user already has a submission that prevents re-filling
        $existingSubmission = FormSubmission::where('form_id', $id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['user_responded', 'rejected_responded', 'completed'])
            ->first();
            
        if ($existingSubmission) {
            abort(403, 'You have already submitted this form or it is currently being processed.');
        }
        
        $formData = [
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'fields' => $form->fields->map(function ($field) {
                return [
                    'id' => $field->id,
                    'title' => $field->title,
                    'type' => $field->type
                ];
            })
        ];

        return Inertia::render('Notification/Fill_up', [
            'form' => $formData
        ]);
    }

    /**
     * Show rejected form
     */
    public function rejected(string $id)
    {
        $user = auth()->user();
        
        // Get the form and related rejection data
        $form = Form::with(['fields'])->findOrFail($id);
        
        // Get the user's submission for this form
        $submission = FormSubmission::with(['responses.field', 'reviews.reviewer'])
            ->where('form_id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'rejection_process')
            ->first();
            
        if (!$submission) {
            abort(404, 'No rejected submission found for this form.');
        }
        
        // Get rejected fields with reasons from submission responses
        // Get the latest rejected response for each field
        $rejectedFields = $submission->responses
            ->where('status', 'rejected')
            ->whereNotNull('rejection_reason')
            ->groupBy('form_field_id')
            ->map(function ($fieldResponses) {
                // Get the most recent rejected response for this field
                $latestRejected = $fieldResponses->sortByDesc('updated_at')->first();
                return [
                    'id' => $latestRejected->form_field_id,
                    'title' => $latestRejected->field->title,
                    'reason' => $latestRejected->rejection_reason ?? 'No reason provided',
                    'field_type' => $latestRejected->field->type
                ];
            })
            ->values();
        
        // Get the latest review for additional notes
        $latestReview = $submission->reviews()->latest('reviewed_at')->first();
        
        $formData = [
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'rejectedFields' => $rejectedFields,
            'reviewNotes' => $latestReview ? $latestReview->notes : null,
            'reviewedAt' => $latestReview ? $latestReview->reviewed_at->toISOString() : null,
            'reviewerName' => $latestReview && $latestReview->reviewer ? 
                $latestReview->reviewer->first_name . ' ' . $latestReview->reviewer->last_name : null
        ];

        return Inertia::render('Notification/Rejected', [
            'form' => $formData
        ]);
    }

    /**
     * Show completed form
     */
    public function completed(string $id)
    {
        $user = auth()->user();
        
        // Get the form and user's completed submission
        $form = Form::findOrFail($id);
        
        $submission = FormSubmission::with(['responses.field'])
            ->where('form_id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first();
            
        if (!$submission) {
            abort(404, 'No completed submission found for this form.');
        }
        
        // Mark the related notification as read when user views completed form
        $notification = Notification::forUser($user->id)
            ->where('form_id', $id)
            ->where('status', 'unread')
            ->first();
            
        if ($notification) {
            $notification->update([
                'status' => Notification::STATUS_READ,
                'read_at' => now(),
            ]);
            
            // Broadcast notification update to update badge count
            event(new NotificationUpdated([
                'id' => $notification->id,
                'user_id' => $user->id,
                'status' => 'read',
                'read_at' => now()->toISOString(),
            ]));
        }
        
        $submissionResponses = $submission->responses->map(function ($response) {
            return [
                'id' => $response->id,
                'field_title' => $response->field->title,
                'file_path' => $response->file_path,
                'original_filename' => $response->original_filename
            ];
        });

        $formData = [
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'submission_responses' => $submissionResponses,
            'submitted_at' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString()
        ];

        return Inertia::render('Notification/Form_completed', [
            'form' => $formData
        ]);
    }

    /**
     * Submit form response
     */
    public function submit(Request $request, string $id)
    {
        $user = auth()->user();
        $form = Form::with(['fields'])->findOrFail($id);
        
        // Check if user has permission to submit this form
        $hasNotification = Notification::forUser($user->id)
            ->where('form_id', $id)
            ->whereIn('type', [Notification::TYPE_FORM_ASSIGNED, Notification::TYPE_FORM_REJECTED])
            ->exists();
            
        if (!$hasNotification) {
            abort(403, 'You are not authorized to submit this form.');
        }
        
        // Validate the request
        $request->validate([
            'responses' => 'required|array',
            'responses.*.field_id' => 'required|integer|exists:form_fields,id',
            'responses.*.file' => 'required|file|max:10240', // 10MB max
        ]);
        
        // Check if submission already exists
        $submission = FormSubmission::where('form_id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        $isNewSubmission = !$submission;
        
        if (!$submission) {
            // Create new submission
            $submission = FormSubmission::create([
                'form_id' => $id,
                'user_id' => $user->id,
                'status' => 'user_responded',
                'submitted_at' => now(),
            ]);
        } else {
            // Update existing submission
            $submission->update([
                'status' => $submission->status === 'rejection_process' ? 'rejected_responded' : 'user_responded',
                'submitted_at' => now(),
            ]);
            
            // Update old responses to resubmitted
            $submission->responses()->update(['status' => 'resubmitted']);
        }
        
        // Process file uploads and create responses
        foreach ($request->responses as $responseData) {
            $file = $responseData['file'];
            $fieldId = $responseData['field_id'];
            
            // Store the file
            $filePath = $file->store('form_submissions', 'public');
            
            // Create submission response
            SubmissionResponse::create([
                'form_submission_id' => $submission->id,
                'form_field_id' => $fieldId,
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'status' => 'pending',
                'submitted_at' => now(),
            ]);
        }
        
        // Update notification status
        $notification = Notification::forUser($user->id)
            ->where('form_id', $id)
            ->whereIn('type', [Notification::TYPE_FORM_ASSIGNED, Notification::TYPE_FORM_REJECTED])
            ->first();
            
        if ($notification) {
            $notification->update([
                'type' => Notification::TYPE_FORM_ASSIGNED,
                'title' => "Form assigned: {$form->title}",
                'message' => 'You have been assigned a new form to fill out.',
                'status' => Notification::STATUS_READ,
                'read_at' => now(),
            ]);
        }
        
        // Reload submission with relationships for broadcasting
        $submission->load(['form', 'user']);
        
        // Always broadcast as SubmissionUpdated since the submission status has changed
        // This ensures the frontend gets the updated status in real-time
        event(new SubmissionUpdated($submission));
        
        // If this is a new submission that didn't exist before, also broadcast as created
        // This helps with cases where the submission list needs to be updated
        if ($isNewSubmission) {
            event(new SubmissionCreated($submission));
        }
        
        // Broadcast notification update for submitter
        event(new NotificationUpdated([
            'id' => $notification ? $notification->id : null,
            'user_id' => $user->id, // Include user_id for frontend filtering
            'title' => "Form assigned: {$form->title}",
            'message' => 'You have been assigned a new form to fill out.',
            'type' => 'form_assigned',
            'status' => 'read', // Mark as read since we updated it above
            'updated_at' => now()->toISOString(),
        ]));
        
        // Create notifications for users who can review submissions
        $reviewers = \App\Models\User::permission('notifications.Submissions_view')->get();
        
        foreach ($reviewers as $reviewer) {
            // Don't notify the submitter themselves
            if ($reviewer->id !== $user->id) {
                $reviewNotification = Notification::createSubmissionPendingNotification($reviewer, $form, $user);
                
                // Broadcast new notification for reviewer
                event(new NotificationCreated([
                    'id' => $reviewNotification->id,
                    'user_id' => $reviewer->id,
                    'title' => $reviewNotification->title,
                    'message' => $reviewNotification->message,
                    'type' => $reviewNotification->type,
                    'status' => 'unread',
                    'created_at' => $reviewNotification->created_at->toISOString(),
                ]));
            }
        }
        
        return redirect()->route('notifications.index')->with('success', 'Form submitted successfully! It is now being processed.');
    }

    /**
     * Determine the actual form status based on notification and submission
     */
    private function determineFormStatus($notification, $submission)
    {
        // If no submission exists, use notification type to determine status
        if (!$submission) {
            switch ($notification->type) {
                case Notification::TYPE_FORM_ASSIGNED:
                    return 'pending'; // Form is ready to fill, not yet in process
                case Notification::TYPE_FORM_REJECTED:
                    return 'rejected';
                case Notification::TYPE_FORM_COMPLETED:
                    return 'completed';
                default:
                    return 'pending';
            }
        }
        
        // If submission exists, use submission status
        switch ($submission->status) {
            case 'not_yet_responded':
                return 'pending'; // Form is ready to fill, user hasn't responded yet
            case 'user_responded':
            case 'rejected_responded':
                return 'in-process'; // Form has been submitted and is being processed
            case 'rejection_process':
                return 'rejected';
            case 'completed':
                return 'completed';
            default:
                return 'pending';
        }
    }

    /**
     * Get status message for frontend display
     */
    private function getStatusMessage($status, $formTitle)
    {
        switch ($status) {
            case 'pending':
                return "Form '{$formTitle}' is ready to fill";
            case 'in-process':
                return "Form '{$formTitle}' is in process";
            case 'rejected':
                return "Form '{$formTitle}' has been rejected";
            case 'completed':
                return "Form '{$formTitle}' has been completed";
            default:
                return "Form '{$formTitle}' status unknown";
        }
    }

    /**
     * Determine if user can still fill the form
     */
    private function canUserFillForm($notification, $submission)
    {
        // User can fill if no submission exists and notification is assigned
        if (!$submission && $notification->type === Notification::TYPE_FORM_ASSIGNED) {
            return true;
        }
        
        // User can fill if submission exists but hasn't been responded to yet
        if ($submission && $submission->status === 'not_yet_responded' && $notification->type === Notification::TYPE_FORM_ASSIGNED) {
            return true;
        }
        
        // User can fill if submission is in rejection process (resubmit)
        if ($submission && $submission->status === 'rejection_process') {
            return true;
        }
        
        // Otherwise, user cannot fill
        return false;
    }

}
