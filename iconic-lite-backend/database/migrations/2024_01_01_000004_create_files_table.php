<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['pdf', 'docx', 'doc', 'mp3', 'mp4', 'avi', 'mov', 'png', 'jpg', 'jpeg', 'gif']);
            $table->json('tags')->nullable();
            $table->string('category')->nullable();
            $table->bigInteger('size_bytes');
            $table->string('storage_path');
            $table->string('preview_url')->nullable();
            $table->integer('credit_cost')->default(1);
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->foreignId('uploader_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('approved_at')->nullable();
            $table->integer('download_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type']);
            $table->index(['category']);
            $table->index(['visibility']);
            $table->index(['uploader_id']);
            $table->index(['approved_at']);
            $table->index(['is_active']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};