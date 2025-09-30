<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LoginAttempt;
use App\Models\Notification;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\File;
use App\Models\Download;
use App\Models\CreditTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;

class SuperAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:super_admin']);
    }

    // Bruce Wayne Feature 1: Real-time Activity Feed
    public function activityFeed(Request $request): JsonResponse
    {
        $activities = ActivityLog::with('user')
            ->when($request->filter_critical, function ($query) {
                return $query->critical();
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'activities' => $activities->items(),
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'total' => $activities->total(),
                'per_page' => $activities->perPage(),
                'last_page' => $activities->lastPage(),
            ],
        ]);
    }

    // Bruce Wayne Feature 2: Real-time User Status Monitor
    public function onlineUsers(): JsonResponse
    {
        $users = User::with('roles')
            ->where('is_online', true)
            ->orWhere('last_activity', '>=', now()->subMinutes(5))
            ->get();

        return response()->json([
            'online_users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->formatted_role,
                    'status' => $user->online_status,
                    'last_activity' => $user->last_activity,
                    'last_ip' => $user->last_ip_address,
                    'location' => $user->location,
                ];
            }),
            'total_online' => $users->count(),
        ]);
    }

    // Bruce Wayne Feature 3: Force Logout Any User
    public function forceLogout(Request $request, User $user): JsonResponse
    {
        if ($user->is_super_admin && $user->id !== auth()->id()) {
            return response()->json(['error' => 'Cannot force logout super admin'], 403);
        }

        $user->forceLogout();
        
        // Create notification for the user
        Notification::createForUser(
            $user->id,
            'security_alert',
            'Account Security Alert',
            'Your session was terminated by an administrator for security reasons.',
            ['forced_by' => auth()->user()->name],
            'high'
        );

        ActivityLog::logActivity('force_logout', $user, null, [
            'target_user' => $user->email,
            'reason' => $request->reason ?? 'Administrative action',
        ]);

        return response()->json(['message' => 'User logged out successfully']);
    }

    // Bruce Wayne Feature 4: System Settings Management
    public function getSystemSettings(): JsonResponse
    {
        $settings = SystemSetting::all()->groupBy('type');
        
        return response()->json(['settings' => $settings]);
    }

    public function updateSystemSetting(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
            'type' => 'required|in:string,integer,boolean,json',
            'description' => 'nullable|string',
        ]);

        SystemSetting::set(
            $request->key,
            $request->value,
            $request->type,
            $request->description,
            $request->is_public ?? false
        );

        return response()->json(['message' => 'Setting updated successfully']);
    }

    // Bruce Wayne Feature 5: System Monitoring
    public function systemStatus(): JsonResponse
    {
        $diskUsage = disk_total_space(storage_path()) - disk_free_space(storage_path());
        $diskTotal = disk_total_space(storage_path());
        
        return response()->json([
            'system' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => now()->toISOString(),
                'uptime' => $this->getServerUptime(),
            ],
            'database' => [
                'users_count' => User::count(),
                'files_count' => File::count(),
                'total_downloads' => Download::count(),
                'database_size' => $this->getDatabaseSize(),
            ],
            'storage' => [
                'used' => $diskUsage,
                'total' => $diskTotal,
                'percentage' => round(($diskUsage / $diskTotal) * 100, 2),
                'files_storage' => $this->getFilesStorageSize(),
            ],
            'cache' => [
                'status' => 'active', // You can implement cache status check
            ],
        ]);
    }

    // Bruce Wayne Feature 6: Audit Logs
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = ActivityLog::with('user')
            ->when($request->user_id, function ($query, $userId) {
                return $query->where('user_id', $userId);
            })
            ->when($request->action, function ($query, $action) {
                return $query->where('action', 'like', "%{$action}%");
            })
            ->when($request->date_from, function ($query, $date) {
                return $query->where('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                return $query->where('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 25));

        return response()->json([
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    // Bruce Wayne Feature 7: Failed Login Attempts
    public function failedLogins(Request $request): JsonResponse
    {
        $attempts = LoginAttempt::failed()
            ->when($request->recent_only, function ($query) {
                return $query->recent(60);
            })
            ->orderBy('attempted_at', 'desc')
            ->paginate($request->get('per_page', 25));

        return response()->json([
            'failed_attempts' => $attempts->items(),
            'pagination' => [
                'current_page' => $attempts->currentPage(),
                'total' => $attempts->total(),
                'per_page' => $attempts->perPage(),
                'last_page' => $attempts->lastPage(),
            ],
            'suspicious_ips' => $this->getSuspiciousIPs(),
        ]);
    }

    // Bruce Wayne Feature 8: Global Notifications
    public function createGlobalNotification(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string',
            'priority' => 'in:low,normal,high,critical',
        ]);

        $notification = Notification::createGlobal(
            $request->type,
            $request->title,
            $request->message,
            $request->data ?? [],
            $request->priority ?? 'normal'
        );

        ActivityLog::logActivity('global_notification_created', $notification);

        return response()->json([
            'notification' => $notification,
            'message' => 'Global notification sent successfully',
        ]);
    }

    // Bruce Wayne Feature 9: Maintenance Mode Control
    public function toggleMaintenanceMode(Request $request): JsonResponse
    {
        $isDown = app()->isDownForMaintenance();
        
        if ($isDown) {
            Artisan::call('up');
            $status = 'disabled';
        } else {
            Artisan::call('down', [
                '--secret' => 'super-admin-access',
                '--render' => 'errors.503',
            ]);
            $status = 'enabled';
        }

        ActivityLog::logActivity('maintenance_mode_toggled', null, null, [
            'status' => $status,
            'reason' => $request->reason ?? 'Administrative action',
        ]);

        return response()->json([
            'maintenance_mode' => $status,
            'message' => "Maintenance mode {$status} successfully",
        ]);
    }

    // Bruce Wayne Feature 10: Backup Management
    public function createBackup(): JsonResponse
    {
        try {
            $filename = 'backup_' . now()->format('Y_m_d_H_i_s') . '.sql';
            $path = storage_path("app/backups/{$filename}");
            
            // Create backups directory if it doesn't exist
            if (!file_exists(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }

            // Simple database backup (you might want to use a package like spatie/laravel-backup)
            $command = sprintf(
                'mysqldump -u%s -p%s %s > %s',
                config('database.connections.mysql.username'),
                config('database.connections.mysql.password'),
                config('database.connections.mysql.database'),
                $path
            );

            exec($command);

            ActivityLog::logActivity('backup_created', null, null, [
                'filename' => $filename,
                'size' => filesize($path),
            ]);

            return response()->json([
                'filename' => $filename,
                'size' => filesize($path),
                'message' => 'Backup created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Backup failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Bruce Wayne Feature 11: Feature Toggles
    public function getFeatureToggles(): JsonResponse
    {
        return response()->json([
            'features' => [
                'signup_enabled' => SystemSetting::getBool('signup_enabled', true),
                'downloads_enabled' => SystemSetting::getBool('downloads_enabled', true),
                'ad_watching_enabled' => SystemSetting::getBool('ad_watching_enabled', true),
                'payments_enabled' => SystemSetting::getBool('payments_enabled', true),
                'referrals_enabled' => SystemSetting::getBool('referrals_enabled', true),
                'two_factor_required' => SystemSetting::getBool('two_factor_required', false),
            ],
        ]);
    }

    public function toggleFeature(Request $request): JsonResponse
    {
        $request->validate([
            'feature' => 'required|string',
            'enabled' => 'required|boolean',
        ]);

        SystemSetting::set($request->feature, $request->enabled, 'boolean');

        ActivityLog::logActivity('feature_toggled', null, null, [
            'feature' => $request->feature,
            'enabled' => $request->enabled,
        ]);

        return response()->json([
            'feature' => $request->feature,
            'enabled' => $request->enabled,
            'message' => 'Feature toggle updated successfully',
        ]);
    }

    // Helper methods
    private function getServerUptime(): string
    {
        if (function_exists('shell_exec')) {
            return shell_exec('uptime -p') ?: 'Unknown';
        }
        return 'Unknown';
    }

    private function getDatabaseSize(): int
    {
        try {
            $result = DB::select("
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb 
                FROM information_schema.tables 
                WHERE table_schema = ?
            ", [config('database.connections.mysql.database')]);

            return (int) ($result[0]->size_mb ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getFilesStorageSize(): int
    {
        $path = storage_path('app/uploads');
        if (!is_dir($path)) return 0;

        $size = 0;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path)) as $file) {
            $size += $file->getSize();
        }

        return $size;
    }

    private function getSuspiciousIPs(): array
    {
        return LoginAttempt::select('ip_address', DB::raw('COUNT(*) as failed_count'))
            ->failed()
            ->recent(1440) // Last 24 hours
            ->groupBy('ip_address')
            ->having('failed_count', '>=', 5)
            ->orderBy('failed_count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }
}