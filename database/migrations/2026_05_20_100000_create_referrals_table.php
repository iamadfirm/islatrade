<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 16)->nullable()->unique()->after('phone');
            $table->foreignId('referred_by_user_id')->nullable()->after('referral_code')
                ->constrained('users')->nullOnDelete();
        });

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referee_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('bonus_amount', 18, 2)->default(0);
            $table->timestamp('bonus_paid_at')->nullable();
            $table->timestamps();

            $table->unique('referee_id');
            $table->index(['referrer_id', 'bonus_paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referred_by_user_id');
            $table->dropUnique(['referral_code']);
            $table->dropColumn('referral_code');
        });
    }
};
