<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('investment_packages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('min_amount', 18, 2);
            $table->decimal('max_amount', 18, 2)->nullable();
            $table->decimal('interest_rate', 8, 4); // % per period
            $table->string('frequency', 16); // daily/weekly/monthly
            $table->unsignedInteger('term_days');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investment_packages');
    }
};
