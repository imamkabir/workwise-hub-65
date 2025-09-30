<?php

namespace App\Policies;

use App\Models\File;
use App\Models\User;

class FilePolicy
{
    public function view(User $user, File $file): bool
    {
        // Public files can be viewed by anyone
        if ($file->isPublic()) {
            return true;
        }

        // Private files can only be viewed by uploader or admins
        return $file->uploader_id === $user->id || $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function update(User $user, File $file): bool
    {
        // File uploader can update their own files
        if ($file->uploader_id === $user->id) {
            return true;
        }

        // Admins can update any file
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function delete(User $user, File $file): bool
    {
        // File uploader can delete their own files
        if ($file->uploader_id === $user->id) {
            return true;
        }

        // Admins can delete any file
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function approve(User $user, File $file): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function download(User $user, File $file): bool
    {
        // Must be approved for download
        if (!$file->isApproved()) {
            return false;
        }

        // Public files can be downloaded by anyone
        if ($file->isPublic()) {
            return true;
        }

        // Private files can only be downloaded by uploader or admins
        return $file->uploader_id === $user->id || $user->hasAnyRole(['admin', 'super_admin']);
    }
}