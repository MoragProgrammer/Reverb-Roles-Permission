<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormField extends Model
{
    protected $fillable = [
        'form_id',
        'title',
        'type',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    // Relationships
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SubmissionResponse::class);
    }

    // Helper methods
    public function getAcceptedFileTypes(): string
    {
        return match($this->type) {
            'Word' => '.doc,.docx',
            'Excel' => '.xls,.xlsx',
            'PowerPoint' => '.ppt,.pptx',
            'PDF' => '.pdf',
            'JPEG' => '.jpg,.jpeg',
            'PNG' => '.png',
            default => '*',
        };
    }
}
