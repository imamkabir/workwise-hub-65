<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'network',
        'placement',
        'reward_credits',
        'proof_token',
        'verified',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'reward_credits' => 'integer',
            'verified' => 'boolean',
        ];
    }

    public $timestamps = ['created_at'];
    const UPDATED_AT = null;

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function verify(): bool
    {
        if ($this->verified) {
            return false;
        }

        // Here you would implement actual verification with ad network
        // For now, we'll just mark as verified
        $this->update(['verified' => true]);

        // Award credits to user
        $this->user->addCredits(
            $this->reward_credits,
            'ad_reward',
            $this->id
        );

        return true;
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }

    public function scopeUnverified($query)
    {
        return $query->where('verified', false);
    }

    public function scopeByNetwork($query, string $network)
    {
        return $query->where('network', $network);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }
}