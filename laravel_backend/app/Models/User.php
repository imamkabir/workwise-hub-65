<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'credits',
        'is_super_admin',
        'can_be_deleted',
        'is_online',
        'last_activity',
        'last_ip_address',
        'user_agent',
        'login_history',
        'two_factor_enabled',
        'two_factor_secret',
        'failed_login_attempts',
        'locked_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'credits' => 'integer',
            'is_super_admin' => 'boolean',
            'can_be_deleted' => 'boolean',
            'is_online' => 'boolean',
            'last_activity' => 'datetime',
            'login_history' => 'array',
            'two_factor_enabled' => 'boolean',
            'failed_login_attempts' => 'integer',
            'locked_until' => 'datetime',
        ];
    }

    // Relationships
    public function uploadedFiles()
    {
        return $this->hasMany(File::class, 'uploaded_by');
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class);
    }

    public function referralsMade()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralsReceived()
    {
        return $this->hasMany(Referral::class, 'referred_id');
    }

    // Helper methods
    public function hasEnoughCredits(int $requiredCredits): bool
    {
        return $this->credits >= $requiredCredits;
    }

    public function deductCredits(int $amount, string $reason = null): bool
    {
        if (!$this->hasEnoughCredits($amount)) {
            return false;
        }

        $this->decrement('credits', $amount);
        
        // Record transaction
        $this->creditTransactions()->create([
            'type' => 'spent',
            'amount' => -$amount,
            'reason' => $reason ?? 'Credits spent',
        ]);

        return true;
    }

    public function addCredits(int $amount, string $reason = null): void
    {
        $this->increment('credits', $amount);
        
        // Record transaction
        $this->creditTransactions()->create([
            'type' => 'earned',
            'amount' => $amount,
            'reason' => $reason ?? 'Credits earned',
        ]);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['admin', 'super_admin']);
    }

    public function getFormattedRoleAttribute(): string
    {
        return $this->roles->first()?->name ?? 'user';
    }

    // Bruce Wayne Mode Features

    public function isOnline(): bool
    {
        return $this->is_online && $this->last_activity?->diffInMinutes(now()) <= 5;
    }

    public function markAsOnline(): void
    {
        $this->update([
            'is_online' => true,
            'last_activity' => now(),
        ]);
    }

    public function markAsOffline(): void
    {
        $this->update(['is_online' => false]);
    }

    public function updateActivity(string $ipAddress = null, string $userAgent = null): void
    {
        $this->update([
            'last_activity' => now(),
            'last_ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
        ]);
    }

    public function logLoginAttempt(bool $success, string $reason = null): void
    {
        $history = $this->login_history ?? [];
        $history[] = [
            'success' => $success,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
            'reason' => $reason,
        ];

        // Keep only last 20 attempts
        $history = array_slice($history, -20);

        $this->update(['login_history' => $history]);
    }

    public function incrementFailedAttempts(): void
    {
        $attempts = $this->failed_login_attempts + 1;
        $update = ['failed_login_attempts' => $attempts];

        // Lock account after 5 failed attempts for 30 minutes
        if ($attempts >= 5) {
            $update['locked_until'] = now()->addMinutes(30);
        }

        $this->update($update);
    }

    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ]);
    }

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    public function canBeDeleted(): bool
    {
        return $this->can_be_deleted && !$this->is_super_admin;
    }

    public function forceLogout(): void
    {
        // Revoke all tokens
        $this->tokens()->delete();
        
        // Mark as offline
        $this->markAsOffline();
        
        // Log the action
        activity()
            ->causedBy(auth()->user())
            ->performedOn($this)
            ->log('Force logout executed');
    }

    public function getOnlineStatusAttribute(): string
    {
        if (!$this->is_online) return 'offline';
        
        $minutes = $this->last_activity?->diffInMinutes(now()) ?? 999;
        
        if ($minutes <= 1) return 'online';
        if ($minutes <= 5) return 'idle';
        return 'away';
    }

    public function getLocationAttribute(): ?string
    {
        if (!$this->last_ip_address) return null;
        
        // You can integrate with GeoIP service here
        return 'Unknown Location';
    }

    // Activity Logs relationship
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    // Notifications relationship
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Check if user is a specific role type
    public function isSmallAdmin(): bool
    {
        return $this->hasRole('small_admin');
    }

    public function canManageUsers(): bool
    {
        return $this->hasAnyRole(['admin', 'super_admin']);
    }

    public function canGrantCredits(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function canCreateAdmins(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function canAccessSystemSettings(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function canViewSensitiveData(): bool
    {
        return $this->hasAnyRole(['admin', 'super_admin']);
    }
}