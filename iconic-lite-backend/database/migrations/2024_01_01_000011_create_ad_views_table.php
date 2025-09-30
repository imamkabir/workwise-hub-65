<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('network'); // admob, unity_ads, etc.
            $table->string('placement'); // banner, interstitial, rewarded
            $table->integer('reward_credits');
            $table->string('proof_token'); // Verification token from ad network
            $table->boolean('verified')->default(false);
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at');

            $table->index(['user_id']);
            $table->index(['network']);
            $table->index(['verified']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_views');
    }
};