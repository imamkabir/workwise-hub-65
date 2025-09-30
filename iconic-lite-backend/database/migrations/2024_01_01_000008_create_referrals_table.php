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
            $table->foreignId('referee_id')->constrained('users')->onDelete('cascade');
            $table->integer('reward_credits')->default(10);
            $table->boolean('is_rewarded')->default(false);
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamp('created_at');

            $table->index(['referrer_id']);
            $table->index(['referee_id']);
            $table->index(['is_rewarded']);
            $table->index(['created_at']);
            $table->unique(['referrer_id', 'referee_id']); // Prevent duplicate referrals
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};