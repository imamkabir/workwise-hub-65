<?php

namespace App\Http\Controllers;

use App\Http\Requests\RedeemReferralRequest;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $referralStats = [
            'total_referrals' => $user->referralsMade()->count(),
            'total_credits_earned' => $user->referralsMade()->sum('credits_awarded'),
            'recent_referrals' => $user->referralsMade()
                                     ->with('referred:id,name,email')
                                     ->orderBy('created_at', 'desc')
                                     ->limit(10)
                                     ->get(),
        ];

        return response()->json($referralStats);
    }

    public function redeem(RedeemReferralRequest $request): JsonResponse
    {
        $referrer = $request->user();
        $referredUser = User::findOrFail($request->referred_user_id);

        // Check if referral already exists
        $existingReferral = Referral::where('referrer_id', $referrer->id)
                                  ->where('referred_id', $referredUser->id)
                                  ->first();

        if ($existingReferral) {
            return response()->json([
                'error' => 'Referral already exists for this user',
            ], 422);
        }

        // Create referral record
        $referral = Referral::create([
            'referrer_id' => $referrer->id,
            'referred_id' => $referredUser->id,
            'credits_awarded' => 10, // Default referral credits
        ]);

        // Award credits to referrer
        $referrer->addCredits(10, "Referral bonus for {$referredUser->name}");

        return response()->json([
            'success' => true,
            'referral' => $referral->load('referred:id,name,email'),
            'credits_earned' => 10,
            'total_credits' => $referrer->fresh()->credits,
            'message' => 'Referral redeemed successfully',
        ]);
    }
}