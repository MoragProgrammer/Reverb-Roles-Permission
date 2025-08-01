<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    protected $fillable = [
        'title',
        'description',
        'status',
        'account_name',
        'school_id',
        'created_by',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('order');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'form_role');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'form_user');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function getAssignedUsersAttribute()
    {
        // Get direct assigned users
        $directUsers = $this->users;
        
        // Get users from assigned roles
        $roleUsers = collect();
        foreach ($this->roles as $role) {
            $roleUsers = $roleUsers->merge($role->assignedUsers());
        }
        
        // Combine and remove duplicates
        return $directUsers->merge($roleUsers)->unique('id');
    }
}
