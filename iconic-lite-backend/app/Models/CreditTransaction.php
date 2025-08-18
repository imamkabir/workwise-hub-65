<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'delta',
        'reason',
        'external_ref',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'delta' => 'integer',
            'metadata' => 'array',
        ];
    }

    public $timestamps = ['created_at'];
    const UPDATED_AT = null;

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeEarned($query)
    {
        return $query->where('delta', '>', 0);
    }

    public function scopeSpent($query)
    {
        return $query->where('delta', '<', 0);
    }

    public function scopeByReason($query, string $reason)
    {
        return $query->where('reason', $reason);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function isEarned(): bool
    {
        return $this->delta > 0;
    }

    public function isSpent(): bool
    {
        return $this->delta < 0;
    }

    public function getAbsoluteAmountAttribute(): int
    {
        return abs($this->delta);
    }
}