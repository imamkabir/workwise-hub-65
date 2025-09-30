<?php

namespace App\Policies;

use App\Models\PrivateSession;
use App\Models\User;

class PrivateSessionPolicy
{
    public function view(User $user, PrivateSession $session): bool
    {
        // Participants can view their sessions
        if ($session->lecturer_id === $user->id || $session->student_id === $user->id) {
            return true;
        }

        // Admins can view all sessions
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function confirm(User $user, PrivateSession $session): bool
    {
        // Only the lecturer can confirm
        return $session->lecturer_id === $user->id && $session->status === 'pending';
    }

    public function start(User $user, PrivateSession $session): bool
    {
        // Only the lecturer can start
        return $session->lecturer_id === $user->id && $session->status === 'confirmed';
    }

    public function complete(User $user, PrivateSession $session): bool
    {
        // Only the lecturer can complete
        return $session->lecturer_id === $user->id && $session->status === 'in_progress';
    }

    public function cancel(User $user, PrivateSession $session): bool
    {
        // Both participants can cancel, or admins
        return $session->lecturer_id === $user->id || 
               $session->student_id === $user->id || 
               $user->hasAnyRole(['admin', 'super_admin']);
    }
}