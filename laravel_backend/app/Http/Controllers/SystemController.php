<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SystemSetting;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    // Get public system settings (for frontend theme, etc.)
    public function publicSettings(): JsonResponse
    {
        $settings = SystemSetting::public()->get();
        
        return response()->json([
            'settings' => $settings->pluck('value', 'key'),
            'theme' => SystemSetting::get('default_theme', 'dark'),
            'features' => [
                'signup_enabled' => SystemSetting::getBool('signup_enabled', true),
                'downloads_enabled' => SystemSetting::getBool('downloads_enabled', true),
                'maintenance_mode' => app()->isDownForMaintenance(),
            ],
        ]);
    }

    // Get notifications for authenticated user
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notifications = Notification::forUser($user->id)
            ->when($request->unread_only, function ($query) {
                return $query->unread();
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'notifications' => $notifications->items(),
            'unread_count' => Notification::forUser($user->id)->unread()->count(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    // Mark notification as read
    public function markNotificationRead(Request $request, $notificationId): JsonResponse
    {
        $notification = Notification::where('id', $notificationId)
            ->where(function($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                      ->orWhere('is_global', true);
            })
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    // Mark all notifications as read
    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::forUser($user->id)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    // Update user's online status
    public function updateOnlineStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->updateActivity();

        return response()->json([
            'status' => 'updated',
            'online_status' => $user->online_status,
        ]);
    }

    // Get system health check (lightweight version for regular users)
    public function healthCheck(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'maintenance_mode' => app()->isDownForMaintenance(),
        ]);
    }
}