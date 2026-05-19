<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('investment_packages', function (Blueprint $table) {
            $table->boolean('return_capital')->default(true)->after('is_active');
        });

        Schema::table('investments', function (Blueprint $table) {
            $table->boolean('return_capital')->default(true)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('investment_packages', function (Blueprint $table) {
            $table->dropColumn('return_capital');
        });

        Schema::table('investments', function (Blueprint $table) {
            $table->dropColumn('return_capital');
        });
    }
};
