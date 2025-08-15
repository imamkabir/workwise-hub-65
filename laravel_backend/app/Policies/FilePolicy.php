<?php

namespace App\Policies;

use App\Models\File;
use App\Models\User;

class FilePolicy
{
    public function update(User $user, File $file): bool
    {
        // File uploader can always update their own files
        if ($file->uploaded_by === $user->id) {
            return true;
        }

        // Users with files.manage permission can update any file
        return $user->can('files.manage');
    }

    public function delete(User $user, File $file): bool
    {
        // File uploader can always delete their own files
        if ($file->uploaded_by === $user->id) {
            return true;
        }

        // Users with files.manage permission can delete any file
        return $user->can('files.manage');
    }
}