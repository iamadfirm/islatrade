<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->unique();
            $table->string('phone', 32)->after('email')->nullable()->unique();
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->string('kyc_status', 16)->default('none')->after('phone_verified_at');
            $table->timestamp('kyc_submitted_at')->nullable()->after('kyc_status');
            $table->string('email')->nullable()->change();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropUnique(['phone']);
            $table->dropColumn(['uuid', 'phone', 'phone_verified_at', 'kyc_status', 'kyc_submitted_at']);
            $table->dropSoftDeletes();
        });
    }
};
