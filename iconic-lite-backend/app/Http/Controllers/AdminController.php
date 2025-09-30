<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use App\Models\File;
use App\Models\Download;
use App\Models\Payment;
use App\Models\CreditTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $this->authorize('view-admin-dashboard');

        $stats = [
            'users' => [
                'total' => User::count(),
                'students' => User::role('student')->count(),
                'lecturers' => User::role('lecturer')->count(),
                'admins' => User::role(['admin', 'super_admin'])->count(),
                'recent_signups' => User::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'files' => [
                'total' => File::count(),
                'pending_approval' => File::whereNull('approved_at')->count(),
                'total_downloads' => Download::count(),
                'recent_uploads' => File::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'credits' => [
                'total_in_circulation' => User::sum('credits_balance'),
                'total_earned' => CreditTransaction::earned()->sum('delta'),
                'total_spent' => abs(CreditTransaction::spent()->sum('delta')),
                'recent_transactions' => CreditTransaction::recent(7)->count(),
            ],
            'payments' => [
                'total_revenue' => Payment::succeeded()->sum('amount_ngn'),
                'pending_payments' => Payment::pending()->count(),
                'recent_payments' => Payment::where('created_at', '>=', now()->subWeek())->count(),
            ],
        ];

        return response()->json($stats);
    }

    public function users(Request $request): JsonResponse
    {
        $this->authorize('view-users');

        $query = User::with('roles');

        // Search
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

        // Filter by status
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 15));

        $usersData = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->formatted_role,
                'credits' => $user->credits_balance,
                'is_active' => $user->is_active,
                'email_verified' => !is_null($user->email_verified_at),
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
                'stats' => [
                    'total_downloads' => $user->downloads()->count(),
                    'total_uploads' => $user->uploadedFiles()->count(),
                    'referrals_made' => $user->referralsMade()->count(),
                ],
            ];
        });

        return response()->json([
            'data' => $usersData,
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function createUser(CreateUserRequest $request): JsonResponse
    {
        $this->authorize('create-users');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'credits_balance' => $request->credits ?? 25,
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->formatted_role,
                'credits' => $user->credits_balance,
            ],
            'message' => 'User created successfully',
        ], 201);
    }

    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $this->authorize('manage-user-roles');

        $request->validate([
            'role' => 'required|string|in:student,lecturer,admin',
        ]);

        // Prevent changing super_admin role
        if ($user->isSuperAdmin()) {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Cannot modify super admin role',
                ],
            ], 403);
        }

        $user->syncRoles([$request->role]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->fresh()->formatted_role,
            ],
            'message' => 'User role updated successfully',
        ]);
    }

    public function toggleUserStatus(User $user): JsonResponse
    {
        $this->authorize('manage-users');

        // Prevent deactivating super admin
        if ($user->isSuperAdmin()) {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Cannot deactivate super admin',
                ],
            ], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'is_active' => $user->is_active,
            ],
            'message' => $user->is_active ? 'User activated' : 'User deactivated',
        ]);
    }

    public function pendingFiles(): JsonResponse
    {
        $this->authorize('approve-files');

        $files = File::whereNull('approved_at')
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $files->items(),
            'meta' => [
                'current_page' => $files->currentPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
                'last_page' => $files->lastPage(),
            ],
        ]);
    }
}