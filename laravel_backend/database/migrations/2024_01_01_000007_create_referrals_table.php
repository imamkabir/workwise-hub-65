<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade');
            $table->integer('credits_awarded')->default(10);
            $table->timestamp('created_at');

            $table->index(['referrer_id']);
            $table->index(['referred_id']);
            $table->index(['created_at']);
            $table->unique(['referrer_id', 'referred_id']); // Prevent duplicate referrals
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};