<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
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
    public function scopeEarned($query)
    {
        return $query->where('type', 'earned');
    }

    public function scopeSpent($query)
    {
        return $query->where('type', 'spent');
    }

    public function scopeGranted($query)
    {
        return $query->where('type', 'granted');
    }
}