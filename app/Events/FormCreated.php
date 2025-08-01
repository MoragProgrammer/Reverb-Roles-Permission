<?php

namespace App\Events;

use App\Models\Form;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FormCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $form;

    public function __construct(Form $form)
    {
        // Format the form data for broadcasting
        $this->form = [
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'status' => $form->status,
            'assigned_roles' => $form->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'badge_color' => $role->badge_color ?? '#6b7280'
                ];
            }),
            'assigned_users' => $form->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'school_id' => $user->school_id,
                    'email' => $user->email,
                ];
            }),
            'fields' => $form->fields->map(function ($field) {
                return [
                    'id' => $field->id,
                    'title' => $field->title,
                    'type' => $field->type
                ];
            }),
            'created_at' => $form->created_at->toISOString(),
            'updated_at' => $form->updated_at->toISOString()
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('forms'),
        ];
    }
}
