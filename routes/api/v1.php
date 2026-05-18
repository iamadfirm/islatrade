<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\DepositController;
use App\Http\Controllers\Api\V1\WithdrawController;
use App\Http\Controllers\Api\V1\KycController;
use App\Http\Controllers\Api\V1\Partnership\PackageController;
use App\Http\Controllers\Api\V1\Partnership\InvestmentController;
use App\Http\Controllers\Api\V1\Admin;

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Wallet
    Route::get('wallet/balance', [WalletController::class, 'balance']);
    Route::get('wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('wallet/transfer/lookup', [WalletController::class, 'transferLookup']);
    Route::post('wallet/transfer', [WalletController::class, 'transfer']);

    // Deposits
    Route::get('deposits', [DepositController::class, 'index']);
    Route::post('deposits', [DepositController::class, 'store']);
    Route::get('deposits/{deposit}', [DepositController::class, 'show']);

    // KYC
    Route::get('kyc', [KycController::class, 'status']);
    Route::post('kyc', [KycController::class, 'submit']);

    // Withdrawals (KYC gated for store)
    Route::get('withdrawals/info', [WithdrawController::class, 'info']);
    Route::get('withdrawals', [WithdrawController::class, 'index']);
    Route::get('withdrawals/{withdrawal}', [WithdrawController::class, 'show']);
    Route::middleware('kyc.approved')->post('withdrawals', [WithdrawController::class, 'store']);

    // Partnership
    Route::get('partnerships/packages', [PackageController::class, 'index']);
    Route::get('partnerships/packages/{package}', [PackageController::class, 'show']);
    Route::get('partnerships/dashboard', [InvestmentController::class, 'dashboard']);
    Route::get('partnerships/investments', [InvestmentController::class, 'index']);
    Route::post('partnerships/investments', [InvestmentController::class, 'store']);
    Route::get('partnerships/investments/{investment}', [InvestmentController::class, 'show']);

    // Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('deposits', [Admin\DepositController::class, 'index']);
        Route::post('deposits/{deposit}/approve', [Admin\DepositController::class, 'approve']);
        Route::post('deposits/{deposit}/reject', [Admin\DepositController::class, 'reject']);

        Route::get('withdrawals', [Admin\WithdrawController::class, 'index']);
        Route::post('withdrawals/{withdrawal}/approve', [Admin\WithdrawController::class, 'approve']);
        Route::post('withdrawals/{withdrawal}/reject', [Admin\WithdrawController::class, 'reject']);

        Route::get('kyc', [Admin\KycController::class, 'index']);
        Route::post('kyc/{submission}/approve', [Admin\KycController::class, 'approve']);
        Route::post('kyc/{submission}/reject', [Admin\KycController::class, 'reject']);

        Route::apiResource('packages', Admin\PackageController::class);

        Route::get('users', [Admin\UserController::class, 'index']);
        Route::get('users/{user}', [Admin\UserController::class, 'show']);
        Route::post('users/{user}/adjust-balance', [Admin\UserController::class, 'adjustBalance']);
    });
});
