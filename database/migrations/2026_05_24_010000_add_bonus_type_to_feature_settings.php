<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feature_settings', function (Blueprint $table) {
            // Referral bonus mode: 'percent' uses fee_percent (% of the referee
            // deposit), 'flat' uses fee_flat (fixed ₱). Only one is applied so
            // the admin sets a single number instead of combining both.
            $table->string('bonus_type', 16)->default('percent')->after('recurring');
        });
    }

    public function down(): void
    {
        Schema::table('feature_settings', function (Blueprint $table) {
            $table->dropColumn('bonus_type');
        });
    }
};
