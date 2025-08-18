<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrivateSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecturer_id',
        'student_id',
        'topic',
        'description',
        'scheduled_at',
        'status',
        'price_credits',
        'credits_deducted',
        'started_at',
        'ended_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'price_credits' => 'integer',
            'credits_deducted' => 'boolean',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    // Relationships
    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Helper methods
    public function confirm(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        // Check if student has enough credits
        if (!$this->student->hasEnoughCredits($this->price_credits)) {
            return false;
        }

        // Deduct credits from student
        $this->student->deductCredits(
            $this->price_credits,
            'session_payment',
            $this->id
        );

        $this->update([
            'status' => 'confirmed',
            'credits_deducted' => true,
        ]);

        return true;
    }

    public function start(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(string $notes = null): void
    {
        $this->update([
            'status' => 'completed',
            'ended_at' => now(),
            'notes' => $notes,
        ]);
    }

    public function cancel(): void
    {
        // Refund credits if already deducted
        if ($this->credits_deducted) {
            $this->student->addCredits(
                $this->price_credits,
                'refund',
                $this->id
            );
        }

        $this->update([
            'status' => 'cancelled',
        ]);
    }

    public function getDurationAttribute(): ?int
    {
        if (!$this->started_at || !$this->ended_at) {
            return null;
        }

        return $this->started_at->diffInMinutes($this->ended_at);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForLecturer($query, int $lecturerId)
    {
        return $query->where('lecturer_id', $lecturerId);
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }
}