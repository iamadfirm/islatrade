<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feature_settings', function (Blueprint $table) {
            $table->decimal('fee_flat', 18, 2)->default(0)->after('requires_kyc');
            $table->decimal('fee_percent', 8, 4)->default(0)->after('fee_flat');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->decimal('fee', 18, 2)->default(0)->after('amount');
            $table->decimal('net_amount', 18, 2)->default(0)->after('fee');
        });
    }

    public function down(): void
    {
        Schema::table('feature_settings', function (Blueprint $table) {
            $table->dropColumn(['fee_flat', 'fee_percent']);
        });
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn(['fee', 'net_amount']);
        });
    }
};
