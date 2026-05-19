<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\DepositController;
use App\Http\Controllers\Api\V1\WithdrawController;
use App\Http\Controllers\Api\V1\CryptoController;
use App\Http\Controllers\Api\V1\KycController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\Partnership\PackageController;
use App\Http\Controllers\Api\V1\Partnership\InvestmentController;
use App\Http\Controllers\Api\V1\Admin;

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Profile
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'changePassword']);
    Route::post('profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('profile/avatar', [ProfileController::class, 'deleteAvatar']);

    // Crypto market proxy (CoinGecko, server-side cached)
    Route::get('crypto/prices', [CryptoController::class, 'prices']);
    Route::get('crypto/chart/{coin}', [CryptoController::class, 'chart']);

    // Wallet
    Route::get('wallet/balance', [WalletController::class, 'balance']);
    Route::get('wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('wallet/transfer/lookup', [WalletController::class, 'transferLookup'])->middleware('not.frozen');
    Route::post('wallet/transfer', [WalletController::class, 'transfer'])->middleware(['not.frozen', 'feature:transfer']);

    // Deposits
    Route::get('deposits/methods', [DepositController::class, 'methods']);
    Route::get('deposits', [DepositController::class, 'index']);
    Route::post('deposits', [DepositController::class, 'store'])->middleware(['not.frozen', 'feature:deposit']);
    Route::get('deposits/{deposit}', [DepositController::class, 'show']);

    // KYC
    Route::get('kyc', [KycController::class, 'status']);
    Route::post('kyc', [KycController::class, 'submit'])->middleware('not.frozen');

    // Withdrawals (feature gated; requires_kyc flag enforces KYC)
    Route::get('withdrawals/info', [WithdrawController::class, 'info']);
    Route::get('withdrawals', [WithdrawController::class, 'index']);
    Route::get('withdrawals/{withdrawal}', [WithdrawController::class, 'show']);
    Route::middleware(['not.frozen', 'feature:withdraw'])->post('withdrawals', [WithdrawController::class, 'store']);

    // Partnership
    Route::get('partnerships/packages', [PackageController::class, 'index']);
    Route::get('partnerships/packages/{package}', [PackageController::class, 'show']);
    Route::get('partnerships/dashboard', [InvestmentController::class, 'dashboard']);
    Route::get('partnerships/investments', [InvestmentController::class, 'index']);
    Route::post('partnerships/investments', [InvestmentController::class, 'store'])->middleware(['not.frozen', 'feature:partnership']);
    Route::get('partnerships/investments/{investment}', [InvestmentController::class, 'show']);

    // Admin (capability-gated)
    Route::prefix('admin')->group(function () {
        Route::get('dashboard/stats', [Admin\DashboardController::class, 'stats'])->middleware('permission:dashboard.view');
        Route::get('dashboard/activity', [Admin\DashboardController::class, 'recentActivity'])->middleware('permission:dashboard.view');

        Route::middleware('permission:deposits.manage')->group(function () {
            Route::get('deposits', [Admin\DepositController::class, 'index']);
            Route::post('deposits/{deposit}/approve', [Admin\DepositController::class, 'approve']);
            Route::post('deposits/{deposit}/reject', [Admin\DepositController::class, 'reject']);
        });

        Route::middleware('permission:withdrawals.manage')->group(function () {
            Route::get('withdrawals', [Admin\WithdrawController::class, 'index']);
            Route::post('withdrawals/{withdrawal}/approve', [Admin\WithdrawController::class, 'approve']);
            Route::post('withdrawals/{withdrawal}/reject', [Admin\WithdrawController::class, 'reject']);
        });

        Route::middleware('permission:kyc.manage')->group(function () {
            Route::get('kyc', [Admin\KycController::class, 'index']);
            Route::post('kyc/{submission}/approve', [Admin\KycController::class, 'approve']);
            Route::post('kyc/{submission}/reject', [Admin\KycController::class, 'reject']);
        });

        Route::middleware('permission:packages.manage')->group(function () {
            Route::apiResource('packages', Admin\PackageController::class);
        });

        Route::middleware('permission:users.manage')->group(function () {
            Route::get('users', [Admin\UserController::class, 'index']);
            Route::get('users/{user}', [Admin\UserController::class, 'show']);
            Route::get('users/{user}/wallet-transactions', [Admin\UserController::class, 'walletTransactions']);
            Route::post('users/{user}/adjust-balance', [Admin\UserController::class, 'adjustBalance']);
            Route::post('users/{user}/freeze', [Admin\UserController::class, 'freeze']);
            Route::post('users/{user}/unfreeze', [Admin\UserController::class, 'unfreeze']);
            Route::post('users/{user}/reset-password', [Admin\UserController::class, 'resetPassword']);
            Route::post('users/{user}/reset-kyc', [Admin\UserController::class, 'resetKyc']);
            Route::post('users/{user}/toggle-admin', [Admin\UserController::class, 'toggleAdmin']);
            Route::delete('users/{user}', [Admin\UserController::class, 'destroy']);
            Route::post('users/{uuid}/restore', [Admin\UserController::class, 'restore']);
            Route::post('users/{user}/roles', [Admin\UserController::class, 'assignRoles'])
                ->middleware('permission:roles.manage');
        });

        Route::middleware('permission:settings.manage')->group(function () {
            Route::get('settings/features', [Admin\SettingController::class, 'features']);
            Route::put('settings/features/{key}', [Admin\SettingController::class, 'updateFeature']);

            Route::get('deposit-methods', [Admin\DepositMethodController::class, 'index']);
            Route::post('deposit-methods/{depositMethod}', [Admin\DepositMethodController::class, 'update']);
        });

        Route::middleware('permission:roles.manage')->group(function () {
            Route::get('roles', [Admin\RoleController::class, 'index']);
            Route::post('roles', [Admin\RoleController::class, 'store']);
            Route::put('roles/{role}', [Admin\RoleController::class, 'update']);
            Route::delete('roles/{role}', [Admin\RoleController::class, 'destroy']);
            Route::get('roles/capabilities', [Admin\RoleController::class, 'capabilities']);
        });
    });
});
