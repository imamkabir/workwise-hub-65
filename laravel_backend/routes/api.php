<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ReferralController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('signup', [AuthController::class, 'signup'])
        ->middleware('throttle:signup');
    
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:login');
});

// Protected routes
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
    });

    // User routes
    Route::prefix('user')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
    });

    // File routes
    Route::prefix('files')->group(function () {
        Route::get('/', [FileController::class, 'index']);
        Route::post('/', [FileController::class, 'store']);
        Route::get('{file}', [FileController::class, 'show']);
        Route::put('{file}', [FileController::class, 'update']);
        Route::delete('{file}', [FileController::class, 'destroy']);
        Route::get('{file}/download', [FileController::class, 'download']);
    });

    // Credit routes
    Route::prefix('credits')->group(function () {
        Route::get('/', [CreditController::class, 'index']);
        Route::post('redeem', [CreditController::class, 'redeem']);
    });

    // Referral routes
    Route::prefix('referrals')->group(function () {
        Route::get('/', [ReferralController::class, 'index']);
        Route::post('redeem', [ReferralController::class, 'redeem']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin|super_admin')->group(function () {
        Route::get('users', [AdminController::class, 'users']);
        Route::get('analytics', [AdminController::class, 'analytics']);
        
        // Credit management (requires credits.grant permission)
        Route::post('credits/grant', [CreditController::class, 'grant']);
        
        // Super admin only routes
        Route::middleware('role:super_admin')->group(function () {
            Route::post('users/create-admin', [AdminController::class, 'createAdmin']);
            Route::put('users/{user}/role', [AdminController::class, 'updateUserRole']);
        });
    });
});