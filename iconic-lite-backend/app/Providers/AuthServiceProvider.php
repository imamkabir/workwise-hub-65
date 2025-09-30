<?php

namespace App\Providers;

use App\Models\File;
use App\Models\PrivateSession;
use App\Models\Notification;
use App\Policies\FilePolicy;
use App\Policies\PrivateSessionPolicy;
use App\Policies\NotificationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        File::class => FilePolicy::class,
        PrivateSession::class => PrivateSessionPolicy::class,
        Notification::class => NotificationPolicy::class,
    ];

    public function boot(): void
    {
        // Define gates for permissions
        Gate::define('upload-files', function ($user) {
            return $user->hasAnyRole(['student', 'lecturer', 'admin', 'super_admin']);
        });

        Gate::define('approve-files', function ($user) {
            return $user->hasAnyRole(['admin', 'super_admin']);
        });

        Gate::define('view-users', function ($user) {
            return $user->hasAnyRole(['admin', 'super_admin']);
        });

        Gate::define('manage-users', function ($user) {
            return $user->hasAnyRole(['admin', 'super_admin']);
        });

        Gate::define('create-users', function ($user) {
            return $user->hasRole('super_admin');
        });

        Gate::define('manage-user-roles', function ($user) {
            return $user->hasRole('super_admin');
        });

        Gate::define('grant-credits', function ($user) {
            return $user->hasAnyRole(['admin', 'super_admin']);
        });

        Gate::define('view-admin-dashboard', function ($user) {
            return $user->hasAnyRole(['admin', 'super_admin']);
        });

        Gate::define('view-all-sessions', function ($user) {
            return $user->hasAnyRole(['admin', 'super_admin']);
        });
    }
}