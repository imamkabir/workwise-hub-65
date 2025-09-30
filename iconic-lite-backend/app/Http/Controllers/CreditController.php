<?php

namespace App\Http\Controllers;

use App\Models\CreditTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class CreditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $transactions = $user->creditTransactions()
            ->when($request->reason, function ($query, $reason) {
                return $query->byReason($reason);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'balance' => $user->credits_balance,
            'transactions' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }

    public function dailyClaim(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Rate limiting
        $key = 'daily-claim.' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 1)) {
            return response()->json([
                'error' => [
                    'code' => 'already_claimed',
                    'message' => 'Daily credits already claimed',
                ],
            ], 429);
        }

        if (!$user->canClaimDailyCredits()) {
            return response()->json([
                'error' => [
                    'code' => 'not_eligible',
                    'message' => 'Daily credits not yet available',
                    'details' => [
                        'next_claim_at' => $user->last_daily_claim?->addDay(),
                    ],
                ],
            ], 400);
        }

        $claimed = $user->claimDailyCredits();
        
        if (!$claimed) {
            return response()->json([
                'error' => [
                    'code' => 'claim_failed',
                    'message' => 'Failed to claim daily credits',
                ],
            ], 400);
        }

        RateLimiter::hit($key, 86400); // 24 hours

        $amount = config('app.daily_login_credits', 1);

        return response()->json([
            'added' => $amount,
            'balance' => $user->fresh()->credits_balance,
            'message' => 'Daily credits claimed successfully',
        ]);
    }

    public function grantCredits(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|integer|min:1|max:10000',
            'reason' => 'nullable|string|max:255',
        ]);

        $this->authorize('grant-credits');

        $targetUser = User::findOrFail($request->user_id);
        $reason = $request->reason ?? 'Admin grant';

        $targetUser->addCredits($request->amount, 'admin_grant', $reason);

        // Notify user
        Notification::createForUser(
            $targetUser->id,
            'credits_granted',
            'Credits Granted',
            "You have been granted {$request->amount} credits by an administrator.",
            ['amount' => $request->amount]
        );

        return response()->json([
            'balance' => $targetUser->fresh()->credits_balance,
            'message' => 'Credits granted successfully',
        ]);
    }
}