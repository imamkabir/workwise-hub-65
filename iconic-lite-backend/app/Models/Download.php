<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Download extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'file_id',
        'cost_credits',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'cost_credits' => 'integer',
        ];
    }

    public $timestamps = ['created_at'];
    const UPDATED_AT = null;

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForFile($query, int $fileId)
    {
        return $query->where('file_id', $fileId);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}