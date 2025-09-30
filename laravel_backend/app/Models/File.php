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
        'tags',
        'type',
        'path',
        'size',
        'credits_required',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'size' => 'integer',
            'credits_required' => 'integer',
        ];
    }

    // Relationships
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    // Helper methods
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        
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

    public function getDownloadCountAttribute(): int
    {
        return $this->downloads()->count();
    }

    public function getTotalCreditsEarnedAttribute(): int
    {
        return $this->downloads()->sum('credits_spent');
    }

    public function generateDownloadUrl(): string
    {
        return Storage::temporaryUrl($this->path, now()->addMinutes(30));
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($file) {
            // Delete physical file when model is deleted
            if (Storage::exists($file->path)) {
                Storage::delete($file->path);
            }
        });
    }
}