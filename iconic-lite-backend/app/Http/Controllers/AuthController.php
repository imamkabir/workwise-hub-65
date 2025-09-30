<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\Referral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign default role
        $user->assignRole('student');

        // Handle referral if provided
        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                $user->update(['referred_by_id' => $referrer->id]);
                
                // Create referral record
                Referral::create([
                    'referrer_id' => $referrer->id,
                    'referee_id' => $user->id,
                ]);
            }
        }

        // Send email verification
        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->formatted_role,
            ],
            'requiresEmailVerification' => true,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login.' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        RateLimiter::clear($key);

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Revoke existing tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->formatted_role,
                'credits' => $user->credits_balance,
                'avatar' => $user->avatar,
                'email_verified' => !is_null($user->email_verified_at),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->formatted_role,
                'credits' => $user->credits_balance,
                'avatar' => $user->avatar,
                'email_verified' => !is_null($user->email_verified_at),
                'referral_code' => $user->referral_code,
                'can_claim_daily' => $user->canClaimDailyCredits(),
            ],
        ]);
    }

    // Role-specific login portals
    public function studentLogin(LoginRequest $request): JsonResponse
    {
        $response = $this->login($request);
        $data = $response->getData(true);
        
        if ($data['user']['role'] !== 'student') {
            throw ValidationException::withMessages([
                'email' => ['This account is not a student account.'],
            ]);
        }

        return $response;
    }

    public function lecturerLogin(LoginRequest $request): JsonResponse
    {
        $response = $this->login($request);
        $data = $response->getData(true);
        
        if ($data['user']['role'] !== 'lecturer') {
            throw ValidationException::withMessages([
                'email' => ['This account is not a lecturer account.'],
            ]);
        }

        return $response;
    }

    public function adminLogin(LoginRequest $request): JsonResponse
    {
        $response = $this->login($request);
        $data = $response->getData(true);
        
        if (!in_array($data['user']['role'], ['admin', 'super_admin'])) {
            throw ValidationException::withMessages([
                'email' => ['This account does not have admin privileges.'],
            ]);
        }

        return $response;
    }

    public function superAdminLogin(LoginRequest $request): JsonResponse
    {
        $response = $this->login($request);
        $data = $response->getData(true);
        
        if ($data['user']['role'] !== 'super_admin') {
            throw ValidationException::withMessages([
                'email' => ['This account is not a super admin account.'],
            ]);
        }

        return $response;
    }

    // Google OAuth
    public function redirectToGoogle(): JsonResponse
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        
        return response()->json(['redirect_url' => $url]);
    }

    public function handleGoogleCallback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('email', $googleUser->email)->first();
            
            if ($user) {
                // Update Google ID if not set
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(32)), // Random password
                    'avatar' => $googleUser->avatar,
                ]);
                
                $user->assignRole('student');
            }

            $user->update(['last_login_at' => now()]);
            $user->tokens()->delete();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->formatted_role,
                    'credits' => $user->credits_balance,
                    'avatar' => $user->avatar,
                    'email_verified' => true,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'code' => 'oauth_failed',
                    'message' => 'OAuth authentication failed',
                    'details' => $e->getMessage(),
                ],
            ], 400);
        }
    }

    // GitHub OAuth (placeholder)
    public function redirectToGithub(): JsonResponse
    {
        $url = Socialite::driver('github')->stateless()->redirect()->getTargetUrl();
        
        return response()->json(['redirect_url' => $url]);
    }

    public function handleGithubCallback(): JsonResponse
    {
        // Similar implementation to Google OAuth
        return response()->json([
            'message' => 'GitHub OAuth implementation pending',
        ]);
    }
}