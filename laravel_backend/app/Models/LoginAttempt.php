<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'ip_address',
        'user_agent',
        'success',
        'failure_reason',
        'location_data',
        'attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
            'location_data' => 'array',
            'attempted_at' => 'datetime',
        ];
    }

    public $timestamps = false;

    // Static helper methods
    public static function logAttempt(string $email, bool $success, string $failureReason = null, array $locationData = [])
    {
        return static::create([
            'email' => $email,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'success' => $success,
            'failure_reason' => $failureReason,
            'location_data' => $locationData,
            'attempted_at' => now(),
        ]);
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('success', true);
    }

    public function scopeFailed($query)
    {
        return $query->where('success', false);
    }

    public function scopeForEmail($query, string $email)
    {
        return $query->where('email', $email);
    }

    public function scopeForIp($query, string $ip)
    {
        return $query->where('ip_address', $ip);
    }

    public function scopeRecent($query, int $minutes = 60)
    {
        return $query->where('attempted_at', '>=', now()->subMinutes($minutes));
    }

    public function scopeSuspicious($query)
    {
        return $query->where('success', false)
                    ->where('attempted_at', '>=', now()->subHour());
    }

    // Get failed attempts for IP in last hour
    public static function getFailedAttemptsForIp(string $ip): int
    {
        return static::forIp($ip)->failed()->recent(60)->count();
    }

    // Get failed attempts for email in last hour
    public static function getFailedAttemptsForEmail(string $email): int
    {
        return static::forEmail($email)->failed()->recent(60)->count();
    }

    // Check if IP is suspicious (multiple failed attempts)
    public static function isIpSuspicious(string $ip): bool
    {
        return static::getFailedAttemptsForIp($ip) >= 5;
    }

    // Get location info (you can integrate with GeoIP service)
    public function getLocationInfo(): array
    {
        if (!empty($this->location_data)) {
            return $this->location_data;
        }

        // Placeholder for GeoIP integration
        return [
            'country' => 'Unknown',
            'city' => 'Unknown',
            'timezone' => 'Unknown'
        ];
    }
}