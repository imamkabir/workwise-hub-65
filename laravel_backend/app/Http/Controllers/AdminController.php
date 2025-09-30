<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateAdminRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\CreditTransaction;
use App\Models\Download;
use App\Models\File;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $query = User::with('roles');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->role($request->role);
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 15));

        $usersData = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->formatted_role,
                'credits' => $user->credits,
                'created_at' => $user->created_at,
                'total_downloads' => $user->downloads()->count(),
                'total_uploads' => $user->uploadedFiles()->count(),
            ];
        });

        return response()->json([
            'users' => $usersData,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function createAdmin(CreateAdminRequest $request): JsonResponse
    {
        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'credits' => 100, // Admins start with more credits
        ]);

        $admin->assignRole('admin');

        return response()->json([
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->formatted_role,
                'credits' => $admin->credits,
            ],
            'message' => 'Admin created successfully',
        ], 201);
    }

    public function updateUserRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        // Prevent changing super_admin role
        if ($user->isSuperAdmin()) {
            return response()->json([
                'error' => 'Cannot modify super admin role',
            ], 403);
        }

        $user->syncRoles([$request->role]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->fresh()->formatted_role,
                'credits' => $user->credits,
            ],
            'message' => 'User role updated successfully',
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $analytics = [
            'users' => [
                'total' => User::count(),
                'admins' => User::role('admin')->count(),
                'regular_users' => User::role('user')->count(),
                'recent_signups' => User::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'files' => [
                'total' => File::count(),
                'total_size' => File::sum('size'),
                'recent_uploads' => File::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'downloads' => [
                'total' => Download::count(),
                'this_week' => Download::where('created_at', '>=', now()->subWeek())->count(),
                'this_month' => Download::where('created_at', '>=', now()->subMonth())->count(),
            ],
            'credits' => [
                'total_earned' => CreditTransaction::earned()->sum('amount'),
                'total_spent' => abs(CreditTransaction::spent()->sum('amount')),
                'total_granted' => CreditTransaction::where('type', 'granted')->sum('amount'),
                'current_balance' => User::sum('credits'),
            ],
        ];

        return response()->json($analytics);
    }
}