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
        'message',
        'data',
        'is_read',
        'is_global',
        'priority',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_read' => 'boolean',
            'is_global' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Static helper methods
    public static function createForUser($userId, string $type, string $title, string $message, array $data = [], string $priority = 'normal')
    {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'priority' => $priority,
        ]);
    }

    public static function createGlobal(string $type, string $title, string $message, array $data = [], string $priority = 'normal')
    {
        return static::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_global' => true,
            'priority' => $priority,
        ]);
    }

    public static function notifyAdmins(string $type, string $title, string $message, array $data = [], string $priority = 'high')
    {
        $admins = User::role(['admin', 'super_admin'])->get();
        
        foreach ($admins as $admin) {
            static::createForUser($admin->id, $type, $title, $message, $data, $priority);
        }
    }

    public static function notifySuperAdmins(string $type, string $title, string $message, array $data = [], string $priority = 'critical')
    {
        $superAdmins = User::role('super_admin')->get();
        
        foreach ($superAdmins as $admin) {
            static::createForUser($admin->id, $type, $title, $message, $data, $priority);
        }
    }

    // Instance methods
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function($q) use ($userId) {
            $q->where('user_id', $userId)->orWhere('is_global', true);
        });
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeCritical($query)
    {
        return $query->where('priority', 'critical');
    }

    public function scopeHigh($query)
    {
        return $query->where('priority', 'high');
    }
}