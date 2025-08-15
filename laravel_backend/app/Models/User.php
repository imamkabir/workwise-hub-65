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
}