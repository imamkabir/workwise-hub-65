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
        'credits_spent',
    ];

    protected function casts(): array
    {
        return [
            'credits_spent' => 'integer',
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
}