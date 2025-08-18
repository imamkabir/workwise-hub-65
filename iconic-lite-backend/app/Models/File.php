<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'tags',
        'category',
        'size_bytes',
        'storage_path',
        'preview_url',
        'credit_cost',
        'visibility',
        'uploader_id',
        'approved_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'size_bytes' => 'integer',
            'credit_cost' => 'integer',
            'download_count' => 'integer',
            'approved_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    // Helper methods
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size_bytes;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    public function getDownloadUrlAttribute(): string
    {
        return Storage::url($this->storage_path);
    }

    public function generateSignedDownloadUrl(int $expiresInMinutes = 60): string
    {
        return Storage::temporaryUrl($this->storage_path, now()->addMinutes($expiresInMinutes));
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    public function isApproved(): bool
    {
        return !is_null($this->approved_at);
    }

    public function approve(): void
    {
        $this->update(['approved_at' => now()]);
    }

    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }

    public function isPrivate(): bool
    {
        return $this->visibility === 'private';
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->whereNotNull('approved_at');
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopePrivate($query)
    {
        return $query->where('visibility', 'private');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }

    // Boot method for cleanup
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($file) {
            // Delete physical file when model is deleted
            if (Storage::exists($file->storage_path)) {
                Storage::delete($file->storage_path);
            }
        });
    }
}