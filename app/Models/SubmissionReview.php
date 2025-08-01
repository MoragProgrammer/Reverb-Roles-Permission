<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionReview extends Model
{
    protected $fillable = [
        'form_submission_id',
        'reviewer_id',
        'action',
        'notes',
        'rejection_reasons',
        'reviewed_at',
    ];

    protected $casts = [
        'rejection_reasons' => 'array',
        'reviewed_at' => 'datetime',
    ];

    // Relationships
    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'form_submission_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    // Helper methods
    public function isApproval(): bool
    {
        return in_array($this->action, ['approved', 're-approved']);
    }

    public function isRejection(): bool
    {
        return in_array($this->action, ['rejected', 're-rejected']);
    }

    public function getActionBadgeClass(): string
    {
        return match($this->action) {
            'approved', 're-approved' => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'rejected', 're-rejected' => 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            'edited' => 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
    }

    public function getActionText(): string
    {
        return match($this->action) {
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            're-approved' => 'Re-approved',
            're-rejected' => 'Re-rejected',
            'edited' => 'Edited',
            default => ucfirst($this->action),
        };
    }
}
