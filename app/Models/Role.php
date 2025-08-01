<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = ['name', 'guard_name', 'badge_color'];

    // Form-related relationships
    public function forms() {
        return $this->belongsToMany(Form::class, 'form_role');
    }

    // Helper method to get all users with this role
    public function assignedUsers() {
        return $this->users;
    }
}
