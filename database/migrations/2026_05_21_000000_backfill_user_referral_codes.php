<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        User::whereNull('referral_code')->withTrashed()->cursor()->each(function (User $user) {
            $user->referral_code = User::generateReferralCode();
            $user->saveQuietly();
        });
    }

    public function down(): void
    {
        // no-op
    }
};
