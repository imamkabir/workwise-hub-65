<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referee_id',
        'reward_credits',
        'is_rewarded',
        'rewarded_at',
    ];

    protected function casts(): array
    {
        return [
            'reward_credits' => 'integer',
            'is_rewarded' => 'boolean',
            'rewarded_at' => 'datetime',
        ];
    }

    public $timestamps = ['created_at'];
    const UPDATED_AT = null;

    // Relationships
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    // Helper methods
    public function processReward(): void
    {
        if ($this->is_rewarded) {
            return;
        }

        $this->referrer->addCredits(
            $this->reward_credits,
            'referral_bonus',
            $this->id
        );

        $this->update([
            'is_rewarded' => true,
            'rewarded_at' => now(),
        ]);
    }

    // Scopes
    public function scopeRewarded($query)
    {
        return $query->where('is_rewarded', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_rewarded', false);
    }
}