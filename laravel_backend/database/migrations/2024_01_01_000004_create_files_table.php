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
            $table->json('tags')->nullable();
            $table->string('type'); // MIME type
            $table->string('path'); // Storage path
            $table->bigInteger('size'); // File size in bytes
            $table->integer('credits_required')->default(1);
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['type']);
            $table->index(['credits_required']);
            $table->index(['uploaded_by']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};