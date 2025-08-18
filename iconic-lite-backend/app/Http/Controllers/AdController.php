<?php

namespace App\Http\Controllers;

use App\Models\AdView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AdController extends Controller
{
    public function complete(Request $request): JsonResponse
    {
        $request->validate([
            'network' => 'required|string|in:admob,unity_ads,facebook_ads',
            'placement' => 'required|string|in:banner,interstitial,rewarded',
            'proof_token' => 'required|string',
        ]);

        $user = $request->user();

        // Rate limiting - max 10 ads per hour per user
        $key = 'ad-complete.' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json([
                'error' => [
                    'code' => 'rate_limit_exceeded',
                    'message' => 'Too many ad completions. Please try again later.',
                ],
            ], 429);
        }

        // Verify proof token (implement actual verification with ad network)
        $isValid = $this->verifyAdProofToken(
            $request->network,
            $request->proof_token,
            $user->id
        );

        if (!$isValid) {
            return response()->json([
                'error' => [
                    'code' => 'invalid_proof',
                    'message' => 'Invalid ad completion proof',
                ],
            ], 400);
        }

        $rewardCredits = config('app.ad_reward_credits', 2);

        // Create ad view record
        $adView = AdView::create([
            'user_id' => $user->id,
            'network' => $request->network,
            'placement' => $request->placement,
            'reward_credits' => $rewardCredits,
            'proof_token' => $request->proof_token,
            'verified' => true,
            'ip_address' => $request->ip(),
        ]);

        // Award credits
        $user->addCredits($rewardCredits, 'ad_reward', $adView->id);

        RateLimiter::hit($key, 3600); // 1 hour window

        return response()->json([
            'credits_earned' => $rewardCredits,
            'balance' => $user->fresh()->credits_balance,
            'message' => 'Ad completion verified and credits awarded',
        ]);
    }

    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $stats = [
            'total_ads_watched' => $user->adViews()->verified()->count(),
            'total_credits_earned' => $user->adViews()->verified()->sum('reward_credits'),
            'today_ads_watched' => $user->adViews()->verified()->today()->count(),
            'available_networks' => ['admob', 'unity_ads', 'facebook_ads'],
            'reward_per_ad' => config('app.ad_reward_credits', 2),
        ];

        return response()->json($stats);
    }

    private function verifyAdProofToken(string $network, string $proofToken, int $userId): bool
    {
        // Implement actual verification with ad networks
        // For now, return true for demo purposes
        
        switch ($network) {
            case 'admob':
                return $this->verifyAdMobToken($proofToken, $userId);
            case 'unity_ads':
                return $this->verifyUnityAdsToken($proofToken, $userId);
            case 'facebook_ads':
                return $this->verifyFacebookAdsToken($proofToken, $userId);
            default:
                return false;
        }
    }

    private function verifyAdMobToken(string $token, int $userId): bool
    {
        // Implement AdMob verification
        // This would involve calling Google AdMob API to verify the reward
        return true; // Placeholder
    }

    private function verifyUnityAdsToken(string $token, int $userId): bool
    {
        // Implement Unity Ads verification
        return true; // Placeholder
    }

    private function verifyFacebookAdsToken(string $token, int $userId): bool
    {
        // Implement Facebook Audience Network verification
        return true; // Placeholder
    }
}