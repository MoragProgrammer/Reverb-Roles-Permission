<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FormSubmission;
use App\Events\SubmissionCreated;
use App\Events\SubmissionUpdated;
use App\Events\SubmissionDeleted;
use App\Events\NotificationUpdated;

class SubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $submissions = FormSubmission::with(['form', 'user', 'form.roles', 'form.users'])
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

        return Inertia::render('Submissions/Index', [
            'submissionGroups' => $submissions
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $submission = FormSubmission::with(['form', 'user', 'responses.field', 'reviews.reviewer'])
            ->findOrFail($id);

        $submissionData = [
            'id' => $submission->id,
            'account_name' => $submission->user->first_name . ' ' . $submission->user->last_name,
            'school_id' => $submission->user->school_id,
            'form_id' => $submission->form_id,
            'form_title' => $submission->form->title,
            'form_description' => $submission->form->description,
            'status' => $submission->status,
            'submitted_time' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString(),
            'responses' => $submission->responses
                ->filter(function ($response) {
                    // Only show approved responses for completed submissions
                    return $response->status === 'approved';
                })
                ->groupBy('form_field_id')
                ->map(function ($fieldResponses) {
                    // Get the most recent approved response for each field
                    $latestResponse = $fieldResponses->sortByDesc('created_at')->first();
                    return [
                        'id' => $latestResponse->id,
                        'field_id' => $latestResponse->form_field_id,
                        'field_title' => $latestResponse->field->title,
                        'field_type' => $latestResponse->field->type,
                        'file_path' => $latestResponse->file_path,
                        'original_filename' => $latestResponse->original_filename,
                        'submitted_at' => $latestResponse->submitted_at->toISOString(),
                        'status' => $latestResponse->status
                    ];
                })
                ->values(),
            'review_history' => $submission->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'reviewer_name' => $review->reviewer->first_name . ' ' . $review->reviewer->last_name,
                    'action' => $review->action,
                    'notes' => $review->notes,
                    'reviewed_at' => $review->reviewed_at->toISOString()
                ];
            }),
            'created_at' => $submission->created_at->toISOString(),
            'updated_at' => $submission->updated_at->toISOString()
        ];

        return Inertia::render('Submissions/Show', [
            'submission' => $submissionData
        ]);
    }

    /**
     * Show completed form
     */
    public function completed(string $id)
    {
        $submission = FormSubmission::with(['form', 'user', 'responses.field', 'reviews.reviewer'])
            ->where('status', 'completed')
            ->findOrFail($id);

        $submissionData = [
            'id' => $submission->id,
            'form_id' => $submission->form_id,
            'form_title' => $submission->form->title,
            'account_name' => $submission->user->first_name . ' ' . $submission->user->last_name,
            'school_id' => $submission->user->school_id,
            'status' => $submission->status,
            'submitted_time' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString(),
            'responses' => $submission->responses
                ->filter(function ($response) {
                    // Only show approved responses or the latest response for each field if no approved exists
                    return $response->status === 'approved';
                })
                ->groupBy('form_field_id')
                ->map(function ($fieldResponses) {
                    // Get the most recent approved response for each field
                    $latestResponse = $fieldResponses->sortByDesc('created_at')->first();
                    return [
                        'id' => $latestResponse->id,
                        'field_title' => $latestResponse->field->title,
                        'file_path' => $latestResponse->file_path,
                        'original_filename' => $latestResponse->original_filename,
                        'status' => $latestResponse->status
                    ];
                })
                ->values(),
            'review_history' => $submission->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'reviewer_name' => $review->reviewer->first_name . ' ' . $review->reviewer->last_name,
                    'action' => $review->action,
                    'notes' => $review->notes,
                    'reviewed_at' => $review->reviewed_at->toISOString()
                ];
            })
        ];

        return Inertia::render('Forms/Completed_Form', [
            'submission' => $submissionData
        ]);
    }

    /**
     * Show review form
     */
    public function review(string $id)
    {
        $submission = FormSubmission::with(['form', 'user', 'responses.field'])
            ->where('status', 'user_responded')
            ->findOrFail($id);

        $submissionData = [
            'id' => $submission->id,
            'account_name' => $submission->user->first_name . ' ' . $submission->user->last_name,
            'school_id' => $submission->user->school_id,
            'form_title' => $submission->form->title,
            'form_description' => $submission->form->description,
            'status' => $submission->status,
            'submitted_time' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString(),
            'responses' => $submission->responses->map(function ($response) {
                return [
                    'id' => $response->id,
                    'field_id' => $response->form_field_id,
                    'field_title' => $response->field->title,
                    'field_type' => $response->field->type,
                    'file_path' => $response->file_path,
                    'original_filename' => $response->original_filename,
                    'submitted_at' => $response->submitted_at->toISOString()
                ];
            })
        ];

        return Inertia::render('Submissions/Review', [
            'submission' => $submissionData
        ]);
    }

    /**
     * Store review decision
     */
    public function storeReview(Request $request, string $id)
    {
        // Validate the request
        $request->validate([
            'decision' => 'required|in:approve,reject',
            'rejection_reasons' => 'array',
            'rejection_reasons.*' => 'string',
            'notes' => 'nullable|string',
        ]);
        
        // Add review logic here
        $submission = FormSubmission::with(['form', 'user'])->findOrFail($id);
        $submission->update([
            'status' => $request->decision === 'approve' ? 'completed' : 'rejection_process',
            'reviewed_at' => now(),
        ]);
        
        // Create review record
        $review = \App\Models\SubmissionReview::create([
            'form_submission_id' => $submission->id,
            'reviewer_id' => auth()->id(),
            'action' => $request->decision === 'approve' ? 'approved' : 'rejected',
            'notes' => $request->notes,
            'rejection_reasons' => $request->rejection_reasons ?? [],
            'reviewed_at' => now(),
        ]);
        
        event(new SubmissionUpdated($submission));
        
        // Clean up reviewer notifications - mark 'submission_pending' notifications as read
        $reviewerNotifications = \App\Models\Notification::where('form_id', $submission->form_id)
            ->where('type', \App\Models\Notification::TYPE_SUBMISSION_PENDING)
            ->where('status', \App\Models\Notification::STATUS_UNREAD)
            ->get();
            
        foreach ($reviewerNotifications as $reviewerNotification) {
            $reviewerNotification->update([
                'status' => \App\Models\Notification::STATUS_READ,
                'read_at' => now(),
            ]);
            
            // Broadcast notification update to remove from reviewer's pending list
            event(new \App\Events\NotificationUpdated([
                'id' => $reviewerNotification->id,
                'user_id' => $reviewerNotification->user_id,
                'form_id' => $reviewerNotification->form_id,
                'title' => $reviewerNotification->title,
                'message' => $reviewerNotification->message,
                'type' => $reviewerNotification->type,
                'status' => 'read', // Mark as read to remove from pending notifications
                'notification_id' => $reviewerNotification->id,
                'can_fill' => false,
                'submission_status' => null,
                'updated_at' => $reviewerNotification->updated_at->toISOString(),
            ]));
        }
        
        // Handle rejection - save rejection reasons to responses and create notification
        if ($request->decision !== 'approve') {
            // Update submission responses with rejection reasons
            if ($request->rejection_reasons) {
                foreach ($request->rejection_reasons as $fieldId => $reason) {
                    if (!empty($reason)) {
                        \App\Models\SubmissionResponse::where('form_submission_id', $submission->id)
                            ->where('form_field_id', $fieldId)
                            ->update([
                                'status' => 'rejected',
                                'rejection_reason' => $reason,
                            ]);
                    }
                }
            }
            
            // Find or create rejection notification
            $notification = \App\Models\Notification::forUser($submission->user_id)
                ->where('form_id', $submission->form_id)
                ->where('type', \App\Models\Notification::TYPE_FORM_ASSIGNED)
                ->first();
                
            if ($notification) {
                // Update existing notification to rejection type
                $notification->update([
                    'type' => \App\Models\Notification::TYPE_FORM_REJECTED,
                    'title' => "Form rejected: {$submission->form->title}",
                    'message' => 'Your form submission has been rejected. Please review and resubmit.',
                    'status' => \App\Models\Notification::STATUS_UNREAD,
                    'read_at' => null,
                ]);
            } else {
                // Create new rejection notification if none exists
                $notification = \App\Models\Notification::createFormRejectedNotification(
                    $submission->user, 
                    $submission->form, 
                    $request->rejection_reasons ?? []
                );
            }
            
            // Broadcast notification update with proper notification data
            event(new NotificationUpdated([
                'id' => $notification->id,
                'user_id' => $notification->user_id,
                'form_id' => $notification->form_id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'status' => $notification->status,
                'notification_id' => $notification->id,
                'can_fill' => true, // User can resubmit after rejection
                'submission_status' => 'rejection_process',
                'updated_at' => $notification->updated_at->toISOString(),
            ]));
        } else {
            // Handle approval - update all responses to approved
            \App\Models\SubmissionResponse::where('form_submission_id', $submission->id)
                ->update(['status' => 'approved']);
            
            // Handle approval - update notification to completed
            $notification = \App\Models\Notification::forUser($submission->user_id)
                ->where('form_id', $submission->form_id)
                ->first();
                
            if ($notification) {
                $notification->update([
                    'type' => \App\Models\Notification::TYPE_FORM_COMPLETED,
                    'title' => "Form completed: {$submission->form->title}",
                    'message' => '🎉 Your form submission has been approved and completed!',
                    'status' => \App\Models\Notification::STATUS_UNREAD, // Keep as unread so user sees it
                    'read_at' => null,
                ]);
                
                // Broadcast completion notification
                event(new NotificationUpdated([
                    'id' => $notification->id,
                    'user_id' => $notification->user_id,
                    'form_id' => $notification->form_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'status' => 'completed', // Frontend status
                    'notification_id' => $notification->id,
                    'can_fill' => false,
                    'submission_status' => 'completed',
                    'updated_at' => $notification->updated_at->toISOString(),
                ]));
            } else {
                // Create new completion notification if none exists
                $notification = \App\Models\Notification::createFormCompletedNotification(
                    $submission->user,
                    $submission->form
                );
                
                // Update the message to be more celebratory
                $notification->update(['message' => '🎉 Your form submission has been approved and completed!']);
                
                // Broadcast new completion notification
                event(new \App\Events\NotificationCreated([
                    'id' => $notification->id,
                    'user_id' => $notification->user_id,
                    'form_id' => $notification->form_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'status' => 'completed', // Frontend status
                    'notification_id' => $notification->id,
                    'can_fill' => false,
                    'submission_status' => 'completed',
                    'created_at' => $notification->created_at->toISOString(),
                ]));
            }
        }
        
        return redirect()->route('submissions.index')->with('success', 'Review submitted successfully!');
    }

    /**
     * Show re-review form
     */
    public function reReview(string $id)
    {
        $submission = FormSubmission::with(['form', 'user', 'responses.field', 'reviews'])
            ->where('status', 'rejected_responded')
            ->findOrFail($id);

        // Get original submission date
        $originalSubmissionDate = $submission->created_at;
        
        // Get resubmission date (latest response update)
        $resubmissionDate = $submission->responses->max('updated_at') ?? $submission->updated_at;
        
        // Get rejected fields from responses that have rejection reasons
        // Include both 'rejected' (original rejection) and 'resubmitted' (preserved history) statuses
        $rejectedResponses = $submission->responses
            ->whereIn('status', ['rejected', 'resubmitted'])
            ->groupBy('form_field_id');
        
        $rejectedFields = $rejectedResponses->map(function ($fieldResponses, $fieldId) {
            // Get the rejected response (contains rejection reason)
            $rejectedResponse = $fieldResponses->where('status', 'rejected')->first();
            // Get the latest pending response (new submission)
            $newResponse = $fieldResponses->where('status', 'pending')->sortByDesc('created_at')->first();
            
            if (!$rejectedResponse) {
                return null; // Skip if no rejected response found
            }
            
            return [
                'field_id' => $fieldId,
                'field_title' => $rejectedResponse->field->title,
                'original_reason' => $rejectedResponse->rejection_reason,
                'resubmitted_file_path' => $newResponse ? $newResponse->file_path : null,
                'resubmitted_filename' => $newResponse ? $newResponse->original_filename : null,
                'resubmitted_at' => $newResponse ? $newResponse->created_at->toISOString() : null
            ];
        })->filter(); // Remove null values
        
        // Also get any pending responses that might be new submissions for previously rejected fields
        $pendingResponses = $submission->responses->where('status', 'pending');
        
        // Merge with rejected fields if they don't already exist
        foreach ($pendingResponses as $pendingResponse) {
            $fieldId = $pendingResponse->form_field_id;
            
            // Check if we already have this field in rejected fields
            $existingField = $rejectedFields->where('field_id', $fieldId)->first();
            
            if (!$existingField) {
                // This is a new response for a field that wasn't rejected before
                // Check if there's a resubmitted response with rejection reason
                $resubmittedResponse = $submission->responses
                    ->where('form_field_id', $fieldId)
                    ->where('status', 'resubmitted')
                    ->first();
                
                if ($resubmittedResponse && $resubmittedResponse->rejection_reason) {
                    $rejectedFields->push([
                        'field_id' => $fieldId,
                        'field_title' => $pendingResponse->field->title,
                        'original_reason' => $resubmittedResponse->rejection_reason,
                        'resubmitted_file_path' => $pendingResponse->file_path,
                        'resubmitted_filename' => $pendingResponse->original_filename,
                        'resubmitted_at' => $pendingResponse->created_at->toISOString()
                    ]);
                }
            }
        }

        $submissionData = [
            'id' => $submission->id,
            'account_name' => $submission->user->first_name . ' ' . $submission->user->last_name,
            'school_id' => $submission->user->school_id,
            'form_title' => $submission->form->title,
            'form_description' => $submission->form->description,
            'status' => $submission->status,
            'submitted_time' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString(),
            'original_submission_date' => $originalSubmissionDate->toISOString(),
            'resubmission_date' => $resubmissionDate->toISOString(),
            'rejected_fields' => $rejectedFields->values()
        ];

        return Inertia::render('Submissions/Re-review', [
            'submission' => $submissionData
        ]);
    }

    /**
     * Store re-review decision
     */
    public function storeReReview(Request $request, string $id)
    {
        // Validate the request
        $request->validate([
            'decision' => 'required|in:approve,reject',
            'rejection_reasons' => 'array',
            'rejection_reasons.*' => 'string',
            'notes' => 'nullable|string',
        ]);
        
        // Add re-review logic here
        $submission = FormSubmission::with(['form', 'user'])->findOrFail($id);
        $submission->update([
            'status' => $request->decision === 'approve' ? 'completed' : 'rejection_process', // Set back to rejection_process for resubmission
            'reviewed_at' => now(),
        ]);
        
        // Create review record
        $review = \App\Models\SubmissionReview::create([
            'form_submission_id' => $submission->id,
            'reviewer_id' => auth()->id(),
            'action' => $request->decision === 'approve' ? 're-approved' : 're-rejected',
            'notes' => $request->notes,
            'rejection_reasons' => $request->rejection_reasons ?? [],
            'reviewed_at' => now(),
        ]);
        
        event(new SubmissionUpdated($submission));
        
        // Clean up reviewer notifications - mark 'submission_pending' notifications as read
        $reviewerNotifications = \App\Models\Notification::where('form_id', $submission->form_id)
            ->where('type', \App\Models\Notification::TYPE_SUBMISSION_PENDING)
            ->where('status', \App\Models\Notification::STATUS_UNREAD)
            ->get();
            
        foreach ($reviewerNotifications as $reviewerNotification) {
            $reviewerNotification->update([
                'status' => \App\Models\Notification::STATUS_READ,
                'read_at' => now(),
            ]);
            
            // Broadcast notification update to remove from reviewer's pending list
            event(new \App\Events\NotificationUpdated([
                'id' => $reviewerNotification->id,
                'user_id' => $reviewerNotification->user_id,
                'form_id' => $reviewerNotification->form_id,
                'title' => $reviewerNotification->title,
                'message' => $reviewerNotification->message,
                'type' => $reviewerNotification->type,
                'status' => 'read', // Mark as read to remove from pending notifications
                'notification_id' => $reviewerNotification->id,
                'can_fill' => false,
                'submission_status' => null,
                'updated_at' => $reviewerNotification->updated_at->toISOString(),
            ]));
        }
        
        // Handle rejection - update responses with new rejection reasons and notification
        if ($request->decision !== 'approve') {
            // Update submission responses with new rejection reasons
            if ($request->rejection_reasons) {
                foreach ($request->rejection_reasons as $fieldId => $reason) {
                    if (!empty($reason)) {
                        // Update the most recent response for this field
                        $latestResponse = \App\Models\SubmissionResponse::where('form_submission_id', $submission->id)
                            ->where('form_field_id', $fieldId)
                            ->orderBy('created_at', 'desc')
                            ->first();
                            
                        if ($latestResponse) {
                            $latestResponse->update([
                                'status' => 'rejected',
                                'rejection_reason' => $reason,
                            ]);
                        }
                    }
                }
            }
            
            // Find existing notification
            $notification = \App\Models\Notification::forUser($submission->user_id)
                ->where('form_id', $submission->form_id)
                ->first();
                
            if ($notification) {
                // Update notification to rejection type again
                $notification->update([
                    'type' => \App\Models\Notification::TYPE_FORM_REJECTED,
                    'title' => "Form rejected again: {$submission->form->title}",
                    'message' => 'Your resubmitted form has been rejected again. Please review and resubmit.',
                    'status' => \App\Models\Notification::STATUS_UNREAD,
                    'read_at' => null,
                ]);
                
                // Broadcast rejection notification
                event(new NotificationUpdated([
                    'id' => $notification->id,
                    'user_id' => $notification->user_id,
                    'form_id' => $notification->form_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'status' => $notification->status,
                    'notification_id' => $notification->id,
                    'can_fill' => true, // User can resubmit after rejection
                    'submission_status' => 'rejection_process',
                    'updated_at' => $notification->updated_at->toISOString(),
                ]));
            }
        } else {
            // Handle approval - update all responses to approved
            \App\Models\SubmissionResponse::where('form_submission_id', $submission->id)
                ->update(['status' => 'approved']);
            
            // Handle approval - update notification to completed
            $notification = \App\Models\Notification::forUser($submission->user_id)
                ->where('form_id', $submission->form_id)
                ->first();
                
            if ($notification) {
                $notification->update([
                    'type' => \App\Models\Notification::TYPE_FORM_COMPLETED,
                    'title' => "Form completed: {$submission->form->title}",
                    'message' => '🎉 Your resubmitted form has been approved and completed!',
                    'status' => \App\Models\Notification::STATUS_UNREAD, // Keep as unread so user sees it
                    'read_at' => null,
                ]);
                
                // Broadcast completion notification
                event(new NotificationUpdated([
                    'id' => $notification->id,
                    'user_id' => $notification->user_id,
                    'form_id' => $notification->form_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'status' => 'completed', // Frontend status
                    'notification_id' => $notification->id,
                    'can_fill' => false,
                    'submission_status' => 'completed',
                    'updated_at' => $notification->updated_at->toISOString(),
                ]));
            } else {
                // Create new completion notification if none exists
                $notification = \App\Models\Notification::createFormCompletedNotification(
                    $submission->user,
                    $submission->form
                );
                
                // Update the message to be more celebratory
                $notification->update(['message' => '🎉 Your resubmitted form has been approved and completed!']);
                
                // Broadcast new completion notification
                event(new \App\Events\NotificationCreated([
                    'id' => $notification->id,
                    'user_id' => $notification->user_id,
                    'form_id' => $notification->form_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'status' => 'completed', // Frontend status  
                    'notification_id' => $notification->id,
                    'can_fill' => false,
                    'submission_status' => 'completed',
                    'created_at' => $notification->created_at->toISOString(),
                ]));
            }
        }
        
        return redirect()->route('submissions.index')->with('success', 'Re-review submitted successfully!');
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $submission = FormSubmission::with(['form.fields', 'user', 'responses.field', 'reviews.reviewer'])
            ->where('status', 'completed')
            ->findOrFail($id);

        // Build submission data with all necessary relationships
        $submissionData = [
            'id' => $submission->id,
            'account_name' => $submission->user->first_name . ' ' . $submission->user->last_name,
            'school_id' => $submission->user->school_id,
            'status' => $submission->status,
            'submitted_at' => $submission->submitted_at?->toISOString() ?? $submission->created_at->toISOString(),
            'user' => [
                'id' => $submission->user->id,
                'first_name' => $submission->user->first_name,
                'middle_name' => $submission->user->middle_name,
                'last_name' => $submission->user->last_name,
                'school_id' => $submission->user->school_id,
                'email' => $submission->user->email,
            ],
            'form_id' => $submission->form_id,
            'form' => [
                'id' => $submission->form->id,
                'title' => $submission->form->title,
                'description' => $submission->form->description,
                'fields' => $submission->form->fields->map(function ($field) {
                    return [
                        'id' => $field->id,
                        'title' => $field->title,
                        'type' => $field->type,
                    ];
                }),
            ],
            'responses' => $submission->responses
                ->filter(function ($response) {
                    return $response->status === 'approved';
                })
                ->groupBy('form_field_id')
                ->map(function ($fieldResponses) {
                    $latestResponse = $fieldResponses->sortByDesc('created_at')->first();
                    return [
                        'id' => $latestResponse->id,
                        'field_id' => $latestResponse->form_field_id,
                        'field_title' => $latestResponse->field->title,
                        'original_filename' => $latestResponse->original_filename,
                        'file_path' => $latestResponse->file_path,
                        'status' => $latestResponse->status,
                    ];
                })
                ->values(),
            'review_history' => $submission->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'reviewer' => $review->reviewer->first_name . ' ' . $review->reviewer->last_name,
                    'action' => $review->action,
                    'notes' => $review->notes,
                    'created_at' => $review->reviewed_at->toISOString(),
                ];
            }),
        ];

        return Inertia::render('Forms/Completed_Edit', [
            'submission' => $submissionData
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'responses' => 'required|array',
            'responses.*.id' => 'required|integer',
            'responses.*.response' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240', // 10MB max per file
        ]);

        $submission = FormSubmission::with(['form', 'user', 'responses'])
            ->where('status', 'completed')
            ->findOrFail($id);

        // Handle file uploads if any
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $responseId => $uploadedFile) {
                // Find the existing response record
                $existingResponse = $submission->responses()->findOrFail($responseId);
                
                // Store the new file
                $fileName = uniqid() . '.' . $uploadedFile->getClientOriginalExtension();
                $filePath = $uploadedFile->storeAs('form_submissions', $fileName, 'public');
                
                // Update the response with new file information
                $existingResponse->update([
                    'file_path' => $filePath,
                    'original_filename' => $uploadedFile->getClientOriginalName(),
                    'mime_type' => $uploadedFile->getMimeType(),
                    'file_size' => $uploadedFile->getSize(),
                ]);
            }
        }

        // Create a review record for the edit
        \App\Models\SubmissionReview::create([
            'form_submission_id' => $submission->id,
            'reviewer_id' => auth()->id(),
            'action' => 'edited',
            'notes' => 'Submission responses were edited and approved',
            'reviewed_at' => now(),
        ]);

        event(new SubmissionUpdated($submission));

        return redirect()->route('forms.show', $submission->form_id)
            ->with('success', 'Submission updated successfully!');
    }

    /**
     * Download all files for a submission
     */
    public function downloadAll(string $id)
    {
        $submission = FormSubmission::with(['responses'])->findOrFail($id);
        
        // Check if user has permission to download files
        if (!auth()->user()->can('forms.completion_viewer')) {
            abort(403, 'Unauthorized to download files.');
        }
        
        // Get all file responses
        $fileResponses = $submission->responses->where('file_path', '!=', null);
        
        if ($fileResponses->isEmpty()) {
            return back()->with('error', 'No files found for this submission.');
        }
        
        // If only one file, download it directly
        if ($fileResponses->count() === 1) {
            $response = $fileResponses->first();
            
            // Try both possible paths: public disk and regular storage
            $publicPath = storage_path('app/public/' . $response->file_path);
            $privatePath = storage_path('app/' . $response->file_path);
            
            $filePath = file_exists($publicPath) ? $publicPath : $privatePath;
            
            if (!file_exists($filePath)) {
                return back()->with('error', 'File not found.');
            }
            
            return response()->download($filePath, $response->original_filename);
        }
        
        // Create a ZIP file for multiple files
        $zip = new \ZipArchive();
        $zipFileName = 'submission_' . $id . '_files.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);
        
        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }
        
        if ($zip->open($zipPath, \ZipArchive::CREATE) === TRUE) {
            foreach ($fileResponses as $response) {
                // Try both possible paths: public disk and regular storage
                $publicPath = storage_path('app/public/' . $response->file_path);
                $privatePath = storage_path('app/' . $response->file_path);
                
                $filePath = file_exists($publicPath) ? $publicPath : $privatePath;
                
                if (file_exists($filePath)) {
                    $zip->addFile($filePath, $response->original_filename);
                }
            }
            $zip->close();
            
            return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
        }
        
        return back()->with('error', 'Failed to create ZIP file.');
    }
    
    /**
     * Download a specific file
     */
    public function downloadFile(string $id, string $responseId)
    {
        $submission = FormSubmission::findOrFail($id);
        $response = $submission->responses()->findOrFail($responseId);
        
        // Check if user has permission to download files
        if (!auth()->user()->can('forms.completion_viewer')) {
            abort(403, 'Unauthorized to download files.');
        }
        
        if (!$response->file_path) {
            return back()->with('error', 'No file found for this response.');
        }
        
        // Try both possible paths: public disk and regular storage
        $publicPath = storage_path('app/public/' . $response->file_path);
        $privatePath = storage_path('app/' . $response->file_path);
        
        $filePath = file_exists($publicPath) ? $publicPath : $privatePath;
        
        if (!file_exists($filePath)) {
            return back()->with('error', 'File not found.');
        }
        
        return response()->download($filePath, $response->original_filename);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $submission = FormSubmission::with(['responses'])->findOrFail($id);
        $formId = $submission->form_id;
        
        // Delete associated files from storage
        foreach ($submission->responses as $response) {
            if ($response->file_path) {
                $publicPath = storage_path('app/public/' . $response->file_path);
                $privatePath = storage_path('app/' . $response->file_path);
                
                if (file_exists($publicPath)) {
                    unlink($publicPath);
                }
                if (file_exists($privatePath)) {
                    unlink($privatePath);
                }
            }
        }
        
        $submission->delete();
        event(new SubmissionDeleted($submission->id));
        
        return redirect()->route('forms.show', $formId)->with('success', 'Submission deleted successfully!');
    }
}
