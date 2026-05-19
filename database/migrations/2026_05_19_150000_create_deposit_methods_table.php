<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deposit_methods', function (Blueprint $table) {
            $table->id();
            $table->string('key', 32)->unique();
            $table->string('label', 64);
            $table->boolean('enabled')->default(true);
            $table->text('instructions')->nullable();
            $table->string('account_name', 128)->nullable();
            $table->string('account_number', 64)->nullable();
            $table->string('image_path', 255)->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_methods');
    }
};
