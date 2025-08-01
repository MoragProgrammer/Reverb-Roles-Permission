<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;
//added role check-----------------
//---------------------------------

class User extends Authenticatable {
    /** @use HasFactory<\Database\Factories\UserFactory> */

    //Insert " HasRoles " -----------------------
    use HasFactory, Notifiable, HasRoles;
    //-------------------------------------------

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'school_id',
        'gender',
        'status',
        'profile_picture',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function posts() {
        return $this->hasMany(Post::class);
    }

    // Form-related relationships
    public function createdForms() {
        return $this->hasMany(Form::class, 'created_by');
    }

    public function assignedForms() {
        return $this->belongsToMany(Form::class, 'form_user');
    }

    public function submissions() {
        return $this->hasMany(FormSubmission::class);
    }

    public function reviews() {
        return $this->hasMany(SubmissionReview::class, 'reviewer_id');
    }

    // Helper method to get forms assigned through roles
    public function getFormsFromRoles() {
        $forms = collect();
        foreach ($this->roles as $role) {
            $forms = $forms->merge($role->forms);
        }
        return $forms->unique('id');
    }

    // Get all forms assigned to this user (direct + through roles)
    public function getAllAssignedForms() {
        return $this->assignedForms->merge($this->getFormsFromRoles())->unique('id');
    }

    // Notifications relationship
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    public function unreadNotifications(): HasMany
    {
        return $this->notifications()->unread();
    }
}
