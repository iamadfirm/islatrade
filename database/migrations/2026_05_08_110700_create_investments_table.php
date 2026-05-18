<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('investment_packages')->cascadeOnDelete();
            $table->decimal('principal', 18, 2);
            $table->decimal('interest_rate', 8, 4);
            $table->string('frequency', 16);
            $table->unsignedInteger('term_days');
            $table->decimal('total_paid_out', 18, 2)->default(0);
            $table->timestamp('started_at');
            $table->timestamp('matures_at');
            $table->timestamp('next_payout_at')->nullable();
            $table->string('status', 16)->default('active');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'next_payout_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
