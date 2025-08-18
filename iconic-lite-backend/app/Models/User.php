<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Cashier\Billable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, Billable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'credits_balance',
        'referral_code',
        'referred_by_id',
        'last_login_at',
        'google_id',
        'github_id',
        'is_active',
        'last_daily_claim',
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
            'last_login_at' => 'datetime',
            'last_daily_claim' => 'datetime',
            'credits_balance' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function uploadedFiles()
    {
        return $this->hasMany(File::class, 'uploader_id');
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
        return $this->hasMany(Referral::class, 'referee_id');
    }

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function adViews()
    {
        return $this->hasMany(AdView::class);
    }

    public function lectureSessionsAsLecturer()
    {
        return $this->hasMany(PrivateSession::class, 'lecturer_id');
    }

    public function lectureSessionsAsStudent()
    {
        return $this->hasMany(PrivateSession::class, 'student_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Helper methods
    public function hasEnoughCredits(int $amount): bool
    {
        return $this->credits_balance >= $amount;
    }

    public function addCredits(int $amount, string $reason, string $externalRef = null): void
    {
        $this->increment('credits_balance', $amount);
        
        $this->creditTransactions()->create([
            'delta' => $amount,
            'reason' => $reason,
            'external_ref' => $externalRef,
        ]);
    }

    public function deductCredits(int $amount, string $reason, string $externalRef = null): bool
    {
        if (!$this->hasEnoughCredits($amount)) {
            return false;
        }

        $this->decrement('credits_balance', $amount);
        
        $this->creditTransactions()->create([
            'delta' => -$amount,
            'reason' => $reason,
            'external_ref' => $externalRef,
        ]);

        return true;
    }

    public function canClaimDailyCredits(): bool
    {
        if (!$this->last_daily_claim) {
            return true;
        }

        return $this->last_daily_claim->diffInHours(now()) >= 24;
    }

    public function claimDailyCredits(): bool
    {
        if (!$this->canClaimDailyCredits()) {
            return false;
        }

        $amount = config('app.daily_login_credits', 1);
        $this->addCredits($amount, 'daily_login');
        $this->update(['last_daily_claim' => now()]);

        return true;
    }

    public function generateReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (self::where('referral_code', $code)->exists());

        $this->update(['referral_code' => $code]);
        return $code;
    }

    public function getReferralLink(): string
    {
        if (!$this->referral_code) {
            $this->generateReferralCode();
        }

        return config('app.frontend_url') . '/register?ref=' . $this->referral_code;
    }

    public function getFormattedRoleAttribute(): string
    {
        return $this->roles->first()?->name ?? 'student';
    }

    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    public function isLecturer(): bool
    {
        return $this->hasRole('lecturer');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    // Boot method to generate referral code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (!$user->referral_code) {
                do {
                    $code = strtoupper(Str::random(8));
                } while (self::where('referral_code', $code)->exists());
                
                $user->referral_code = $code;
            }
        });
    }
}