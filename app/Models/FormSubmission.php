<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_id',
        'user_id',
        'status',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    // Relationships
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SubmissionResponse::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(SubmissionReview::class)->orderBy('reviewed_at', 'desc');
    }

    public function latestReview(): ?SubmissionReview
    {
        return $this->reviews()->first();
    }

    // Helper methods
    public function getStatusBadgeClass(): string
    {
        return match($this->status) {
            'not_yet_responded' => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
            'user_responded' => 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'rejection_process' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'rejected_responded' => 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            'completed' => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
    }

    public function getStatusText(): string
    {
        return match($this->status) {
            'not_yet_responded' => 'Not Yet Responded',
            'user_responded' => 'User Responded',
            'rejection_process' => 'Rejection Process',
            'rejected_responded' => 'Rejected (Responded)',
            'completed' => 'Completed',
            default => ucfirst(str_replace('_', ' ', $this->status)),
        };
    }
}
