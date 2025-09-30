<?php

namespace App\Http\Controllers;

use App\Http\Requests\GrantCreditsRequest;
use App\Http\Requests\RedeemCreditsRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $transactions = $user->creditTransactions()
                            ->orderBy('created_at', 'desc')
                            ->paginate(20);

        return response()->json([
            'credits' => $user->credits,
            'transactions' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }

    public function redeem(RedeemCreditsRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file;

        if (!$user->hasEnoughCredits($file->credits_required)) {
            return response()->json([
                'error' => 'Insufficient credits',
                'required' => $file->credits_required,
                'available' => $user->credits,
            ], 402);
        }

        $user->deductCredits($file->credits_required, "Redeemed for: {$file->title}");

        return response()->json([
            'success' => true,
            'credits_remaining' => $user->fresh()->credits,
            'message' => 'Credits redeemed successfully',
        ]);
    }

    public function grant(GrantCreditsRequest $request): JsonResponse
    {
        $targetUser = User::findOrFail($request->user_id);
        
        $targetUser->addCredits($request->amount, $request->reason);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'credits' => $targetUser->fresh()->credits,
            ],
            'transaction' => [
                'amount' => $request->amount,
                'reason' => $request->reason,
                'granted_at' => now(),
            ],
            'message' => 'Credits granted successfully',
        ]);
    }
}