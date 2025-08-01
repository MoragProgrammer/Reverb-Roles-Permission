<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct($notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'notification' => [
                'id' => $this->notification['id'] ?? null,
                'user_id' => $this->notification['user_id'] ?? null,
                'form_id' => $this->notification['form_id'] ?? null,
                'title' => $this->notification['title'] ?? null,
                'message' => $this->notification['message'] ?? null,
                'type' => $this->notification['type'] ?? null,
                'status' => $this->notification['status'] ?? 'unread',
                'notification_id' => $this->notification['notification_id'] ?? null,
                'can_fill' => $this->notification['can_fill'] ?? false,
                'submission_status' => $this->notification['submission_status'] ?? null,
                'created_at' => $this->notification['created_at'] ?? now()->toISOString(),
            ]
        ];
    }
}
