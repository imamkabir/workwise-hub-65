<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('private_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('topic');
            $table->text('description')->nullable();
            $table->timestamp('scheduled_at');
            $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->integer('price_credits');
            $table->boolean('credits_deducted')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['lecturer_id']);
            $table->index(['student_id']);
            $table->index(['status']);
            $table->index(['scheduled_at']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('private_sessions');
    }
};