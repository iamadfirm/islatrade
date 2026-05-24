<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feature_settings', function (Blueprint $table) {
            // For the referral feature: when true the bonus is paid on every
            // approved deposit of the referee; when false only on the first.
            $table->boolean('recurring')->default(false)->after('fee_percent');
        });
    }

    public function down(): void
    {
        Schema::table('feature_settings', function (Blueprint $table) {
            $table->dropColumn('recurring');
        });
    }
};
