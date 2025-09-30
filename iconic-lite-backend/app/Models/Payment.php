<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'amount_ngn',
        'status',
        'currency',
        'provider_ref',
        'metadata',
        'credits_amount',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_ngn' => 'integer',
            'credits_amount' => 'integer',
            'metadata' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function getFormattedAmountAttribute(): string
    {
        return '₦' . number_format($this->amount_ngn / 100, 2);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function markAsSucceeded(): void
    {
        $this->update([
            'status' => 'succeeded',
            'completed_at' => now(),
        ]);

        // Award credits to user
        $this->user->addCredits(
            $this->credits_amount,
            'purchase',
            $this->id
        );
    }

    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
        ]);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }
}