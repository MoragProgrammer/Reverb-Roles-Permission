<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'form_id',
        'type',
        'status',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    // Constants for notification types
    const TYPE_FORM_ASSIGNED = 'form_assigned';
    const TYPE_FORM_REJECTED = 'form_rejected';
    const TYPE_FORM_COMPLETED = 'form_completed';
    const TYPE_SUBMISSION_PENDING = 'submission_pending';

    // Constants for notification status
    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('status', self::STATUS_UNREAD);
    }

    public function scopeRead($query)
    {
        return $query->where('status', self::STATUS_READ);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Helper methods
    public function isUnread(): bool
    {
        return $this->status === self::STATUS_UNREAD;
    }

    public function isRead(): bool
    {
        return $this->status === self::STATUS_READ;
    }

    public function markAsRead(): void
    {
        $this->update([
            'status' => self::STATUS_READ,
            'read_at' => now(),
        ]);
    }

    public function getStatusForFrontend(): string
    {
        return match($this->type) {
            self::TYPE_FORM_ASSIGNED => 'pending',
            self::TYPE_FORM_REJECTED => 'rejected',
            self::TYPE_FORM_COMPLETED => 'completed',
            default => 'pending',
        };
    }

    // Static helper methods
    public static function createFormAssignedNotification(User $user, Form $form): self
    {
        return self::create([
            'user_id' => $user->id,
            'form_id' => $form->id,
            'type' => self::TYPE_FORM_ASSIGNED,
            'title' => "New form assigned: {$form->title}",
            'message' => "You have been assigned a new form to fill out.",
            'data' => [
                'form_title' => $form->title,
                'form_description' => $form->description,
                'assigned_at' => now()->toISOString(),
            ],
        ]);
    }

    public static function createFormRejectedNotification(User $user, Form $form, array $rejectionReasons): self
    {
        return self::create([
            'user_id' => $user->id,
            'form_id' => $form->id,
            'type' => self::TYPE_FORM_REJECTED,
            'title' => "Form rejected: {$form->title}",
            'message' => "Your form submission has been rejected. Please review and resubmit.",
            'data' => [
                'form_title' => $form->title,
                'rejection_reasons' => $rejectionReasons,
                'rejected_at' => now()->toISOString(),
            ],
        ]);
    }

    public static function createFormCompletedNotification(User $user, Form $form): self
    {
        return self::create([
            'user_id' => $user->id,
            'form_id' => $form->id,
            'type' => self::TYPE_FORM_COMPLETED,
            'title' => "Form completed: {$form->title}",
            'message' => "Your form submission has been approved and completed.",
            'data' => [
                'form_title' => $form->title,
                'completed_at' => now()->toISOString(),
            ],
        ]);
    }

    public static function createSubmissionPendingNotification(User $reviewer, Form $form, User $submitter): self
    {
        return self::create([
            'user_id' => $reviewer->id,
            'form_id' => $form->id,
            'type' => self::TYPE_SUBMISSION_PENDING,
            'title' => "New submission to review: {$form->title}",
            'message' => "A new form submission from {$submitter->first_name} {$submitter->last_name} requires your review.",
            'data' => [
                'form_title' => $form->title,
                'submitter_name' => $submitter->first_name . ' ' . $submitter->last_name,
                'submitter_school_id' => $submitter->school_id,
                'submitted_at' => now()->toISOString(),
            ],
        ]);
    }
}
