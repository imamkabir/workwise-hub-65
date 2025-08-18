<?php

namespace Database\Seeders;

use App\Models\File;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class FileSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('admin')->first();
        $lecturer = User::role('lecturer')->first();

        if (!$admin || !$lecturer) {
            return;
        }

        // Create sample files
        $sampleFiles = [
            [
                'title' => 'Mathematics Past Questions 2023',
                'description' => 'Complete collection of mathematics past questions with detailed solutions',
                'type' => 'pdf',
                'tags' => ['mathematics', 'past-questions', '2023', 'solutions'],
                'category' => 'Mathematics',
                'credit_cost' => 5,
                'uploader_id' => $admin->id,
                'approved_at' => now(),
            ],
            [
                'title' => 'Physics Video Lecture - Quantum Mechanics',
                'description' => 'Comprehensive video lecture on quantum mechanics fundamentals',
                'type' => 'mp4',
                'tags' => ['physics', 'quantum-mechanics', 'video-lecture'],
                'category' => 'Physics',
                'credit_cost' => 8,
                'uploader_id' => $lecturer->id,
                'approved_at' => now(),
            ],
            [
                'title' => 'Chemistry Lab Manual',
                'description' => 'Complete laboratory manual for organic chemistry experiments',
                'type' => 'docx',
                'tags' => ['chemistry', 'lab-manual', 'organic'],
                'category' => 'Chemistry',
                'credit_cost' => 3,
                'uploader_id' => $admin->id,
                'approved_at' => now(),
            ],
            [
                'title' => 'English Literature Audio Book',
                'description' => 'Audio narration of classic English literature works',
                'type' => 'mp3',
                'tags' => ['english', 'literature', 'audiobook'],
                'category' => 'English',
                'credit_cost' => 6,
                'uploader_id' => $lecturer->id,
                'approved_at' => now(),
            ],
        ];

        foreach ($sampleFiles as $fileData) {
            // Create a dummy file path (in production, these would be real files)
            $filename = \Illuminate\Support\Str::slug($fileData['title']) . '.' . $fileData['type'];
            $path = 'uploads/' . $filename;
            
            // Create empty file for demo
            Storage::disk('public')->put($path, 'Sample file content for ' . $fileData['title']);
            
            File::create(array_merge($fileData, [
                'storage_path' => $path,
                'size_bytes' => 1024 * 1024, // 1MB dummy size
            ]));
        }
    }
}