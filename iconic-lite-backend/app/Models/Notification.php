<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'data',
        'is_global',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_global' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    // Static helper methods
    public static function createForUser(int $userId, string $type, string $title, string $body, array $data = []): self
    {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }

    public static function createGlobal(string $type, string $title, string $body, array $data = []): self
    {
        return static::create([
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'is_global' => true,
        ]);
    }

    public static function notifyAdmins(string $type, string $title, string $body, array $data = []): void
    {
        $admins = User::role(['admin', 'super_admin'])->get();
        
        foreach ($admins as $admin) {
            static::createForUser($admin->id, $type, $title, $body, $data);
        }
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhere('is_global', true);
        });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeGlobal($query)
    {
        return $query->where('is_global', true);
    }
}