<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('delta'); // Can be positive or negative
            $table->enum('reason', [
                'purchase',
                'admin_grant', 
                'referral_bonus',
                'ad_reward',
                'download_cost',
                'refund',
                'daily_login',
                'session_payment'
            ]);
            $table->string('external_ref')->nullable(); // Payment ID, file ID, etc.
            $table->json('metadata')->nullable();
            $table->timestamp('created_at');

            $table->index(['user_id']);
            $table->index(['reason']);
            $table->index(['created_at']);
            $table->index(['external_ref']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};