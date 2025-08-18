<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('provider', ['remita', 'stripe']);
            $table->integer('amount_ngn'); // Amount in Nigerian Naira (kobo)
            $table->enum('status', ['pending', 'succeeded', 'failed', 'cancelled'])->default('pending');
            $table->string('currency', 3)->default('NGN');
            $table->string('provider_ref')->nullable(); // Remita RRR or Stripe payment intent ID
            $table->json('metadata')->nullable();
            $table->integer('credits_amount'); // Credits to be awarded
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id']);
            $table->index(['provider']);
            $table->index(['status']);
            $table->index(['provider_ref']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};