<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

//added role check-----------------
use Spatie\Permission\Traits\HasRoles;
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
}
