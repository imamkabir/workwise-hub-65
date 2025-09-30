<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FileFactory extends Factory
{
    public function definition(): array
    {
        $types = ['pdf', 'docx', 'mp3', 'mp4'];
        $type = fake()->randomElement($types);

        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'type' => $type,
            'tags' => fake()->words(3),
            'category' => fake()->word(),
            'size_bytes' => fake()->numberBetween(1024, 10485760), // 1KB to 10MB
            'storage_path' => 'uploads/' . fake()->uuid() . '.' . $type,
            'credit_cost' => fake()->numberBetween(1, 10),
            'visibility' => fake()->randomElement(['public', 'private']),
            'uploader_id' => User::factory(),
            'download_count' => fake()->numberBetween(0, 100),
            'is_active' => true,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'approved_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'approved_at' => null,
        ]);
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'public',
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'private',
        ]);
    }
}