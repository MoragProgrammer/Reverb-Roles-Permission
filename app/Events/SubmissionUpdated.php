<?php

namespace App\Events;

use App\Models\FormSubmission;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubmissionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $submission;

    public function __construct(FormSubmission $submission)
    {
        $this->submission = $submission;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('submissions'),
        ];
    }

    public function broadcastWith(): array
    {
        // Load the relationships
        $this->submission->load(['user', 'form']);
        
        return [
            'submission' => [
                'id' => $this->submission->id,
                'account_name' => $this->submission->user->first_name . ' ' . $this->submission->user->last_name,
                'school_id' => $this->submission->user->school_id,
                'form_title' => $this->submission->form->title,
                'status' => $this->submission->status,
                'submitted_time' => $this->submission->submitted_at?->toISOString() ?? $this->submission->created_at->toISOString(),
                'form_id' => $this->submission->form_id
            ]
        ];
    }
}
