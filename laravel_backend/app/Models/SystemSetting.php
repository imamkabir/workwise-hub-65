<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    // Static helper methods
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    public static function set(string $key, $value, string $type = 'string', string $description = null, bool $isPublic = false)
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) || is_object($value) ? json_encode($value) : $value,
                'type' => $type,
                'description' => $description,
                'is_public' => $isPublic,
            ]
        );

        // Log the change
        ActivityLog::logActivity('system_setting_changed', $setting, null, [
            'key' => $key,
            'new_value' => $value,
        ]);

        return $setting;
    }

    public static function getBool(string $key, bool $default = false): bool
    {
        return (bool) static::get($key, $default);
    }

    public static function getInt(string $key, int $default = 0): int
    {
        return (int) static::get($key, $default);
    }

    public static function getArray(string $key, array $default = []): array
    {
        $value = static::get($key, $default);
        return is_array($value) ? $value : $default;
    }

    private static function castValue($value, string $type)
    {
        return match($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }

    // Scope for public settings (can be accessed by frontend)
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
}