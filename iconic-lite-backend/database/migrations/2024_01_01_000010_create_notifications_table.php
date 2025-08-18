<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('type'); // file_upload, credit_earned, session_request, etc.
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable(); // Additional data
            $table->boolean('is_global')->default(false); // System-wide notifications
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id']);
            $table->index(['type']);
            $table->index(['is_global']);
            $table->index(['read_at']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};