<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\AdController;
use App\Http\Controllers\PrivateSessionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:register');
    
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:login');

    // Role-specific login portals
    Route::post('login/student', [AuthController::class, 'studentLogin'])
        ->middleware('throttle:login');
    
    Route::post('login/lecturer', [AuthController::class, 'lecturerLogin'])
        ->middleware('throttle:login');
    
    Route::post('login/admin', [AuthController::class, 'adminLogin'])
        ->middleware('throttle:login');
    
    Route::post('login/super-admin', [AuthController::class, 'superAdminLogin'])
        ->middleware('throttle:login');

    // OAuth routes
    Route::get('google/redirect', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);
    Route::get('github/redirect', [AuthController::class, 'redirectToGithub']);
    Route::get('github/callback', [AuthController::class, 'handleGithubCallback']);
});

// Payment webhooks (public)
Route::prefix('webhooks')->group(function () {
    Route::post('stripe', [PaymentController::class, 'stripeWebhook']);
    Route::post('remita', [PaymentController::class, 'remitaWebhook']);
});

// Protected routes
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // File routes
    Route::prefix('files')->group(function () {
        Route::get('/', [FileController::class, 'index']);
        Route::post('/', [FileController::class, 'store']);
        Route::get('{file}', [FileController::class, 'show']);
        Route::put('{file}', [FileController::class, 'update']);
        Route::delete('{file}', [FileController::class, 'destroy']);
        Route::post('{file}/download', [FileController::class, 'download'])
            ->middleware('throttle:download');
        Route::post('{file}/approve', [FileController::class, 'approve']);
    });

    // Credit routes
    Route::prefix('credits')->group(function () {
        Route::get('/', [CreditController::class, 'index']);
        Route::post('daily-claim', [CreditController::class, 'dailyClaim']);
    });

    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::post('stripe/checkout', [PaymentController::class, 'stripeCheckout']);
        Route::post('remita/initiate', [PaymentController::class, 'remitaInitiate']);
    });

    // Referral routes
    Route::prefix('referrals')->group(function () {
        Route::get('link', [ReferralController::class, 'getLink']);
        Route::get('stats', [ReferralController::class, 'getStats']);
    });

    // Ad routes
    Route::prefix('ads')->group(function () {
        Route::post('complete', [AdController::class, 'complete']);
        Route::get('stats', [AdController::class, 'getStats']);
    });

    // Private session routes
    Route::prefix('sessions')->group(function () {
        Route::get('/', [PrivateSessionController::class, 'index']);
        Route::post('/', [PrivateSessionController::class, 'store']);
        Route::get('{session}', [PrivateSessionController::class, 'show']);
        Route::post('{session}/confirm', [PrivateSessionController::class, 'confirm']);
        Route::post('{session}/start', [PrivateSessionController::class, 'start']);
        Route::post('{session}/complete', [PrivateSessionController::class, 'complete']);
        Route::post('{session}/cancel', [PrivateSessionController::class, 'cancel']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('{notification}', [NotificationController::class, 'destroy']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin|super_admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('users', [AdminController::class, 'users']);
        Route::post('users', [AdminController::class, 'createUser']);
        Route::put('users/{user}/role', [AdminController::class, 'updateUserRole']);
        Route::post('users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::get('files/pending', [AdminController::class, 'pendingFiles']);
        Route::post('users/{user}/credits/grant', [CreditController::class, 'grantCredits']);
    });
});