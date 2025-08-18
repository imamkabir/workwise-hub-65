<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function getLink(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->referral_code) {
            $user->generateReferralCode();
        }

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => $user->getReferralLink(),
            'stats' => [
                'total_referrals' => $user->referralsMade()->count(),
                'successful_referrals' => $user->referralsMade()->rewarded()->count(),
                'total_credits_earned' => $user->referralsMade()->rewarded()->sum('reward_credits'),
            ],
        ]);
    }

    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $referrals = $user->referralsMade()
            ->with('referee:id,name,email,created_at')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'referrals' => $referrals->items(),
            'stats' => [
                'total_referrals' => $user->referralsMade()->count(),
                'successful_referrals' => $user->referralsMade()->rewarded()->count(),
                'pending_referrals' => $user->referralsMade()->pending()->count(),
                'total_credits_earned' => $user->referralsMade()->rewarded()->sum('reward_credits'),
            ],
            'meta' => [
                'current_page' => $referrals->currentPage(),
                'per_page' => $referrals->perPage(),
                'total' => $referrals->total(),
                'last_page' => $referrals->lastPage(),
            ],
        ]);
    }

    public function processReferralReward(User $referee): void
    {
        // This is called when a referred user makes their first purchase
        $referral = Referral::where('referee_id', $referee->id)
            ->where('is_rewarded', false)
            ->first();

        if ($referral) {
            $referral->processReward();

            // Notify referrer
            Notification::createForUser(
                $referral->referrer_id,
                'referral_reward',
                'Referral Reward Earned',
                "You earned {$referral->reward_credits} credits for referring {$referee->name}!",
                ['referee_name' => $referee->name, 'credits' => $referral->reward_credits]
            );
        }
    }
}