<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function read(User $user, Notification $notification): bool
    {
        // Users can read their own notifications or global notifications
        return $notification->user_id === $user->id || $notification->is_global;
    }

    public function delete(User $user, Notification $notification): bool
    {
        // Users can delete their own notifications
        if ($notification->user_id === $user->id) {
            return true;
        }

        // Admins can delete any notification
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}