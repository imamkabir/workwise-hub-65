<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\File;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');
    }

    public function test_authenticated_user_can_upload_file(): void
    {
        $user = User::factory()->create();
        $user->assignRole('lecturer');
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/files', [
            'file' => $file,
            'title' => 'Test PDF',
            'description' => 'Test description',
            'tags' => ['test', 'pdf'],
            'category' => 'Test Category',
            'credit_cost' => 5,
            'visibility' => 'public',
        ]);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'file' => ['id', 'title', 'type'],
                    'message',
                ]);

        $this->assertDatabaseHas('files', [
            'title' => 'Test PDF',
            'uploader_id' => $user->id,
        ]);
    }

    public function test_user_can_download_file_with_sufficient_credits(): void
    {
        $user = User::factory()->create(['credits_balance' => 100]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = File::factory()->create([
            'credit_cost' => 5,
            'approved_at' => now(),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/files/{$file->id}/download");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'downloadUrl',
                    'credits_remaining',
                ]);

        $this->assertEquals(95, $user->fresh()->credits_balance);
        $this->assertDatabaseHas('downloads', [
            'user_id' => $user->id,
            'file_id' => $file->id,
            'cost_credits' => 5,
        ]);
    }

    public function test_user_cannot_download_file_with_insufficient_credits(): void
    {
        $user = User::factory()->create(['credits_balance' => 2]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = File::factory()->create([
            'credit_cost' => 5,
            'approved_at' => now(),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/files/{$file->id}/download");

        $response->assertStatus(402)
                ->assertJsonPath('error.code', 'insufficient_credits');
    }

    public function test_unapproved_files_cannot_be_downloaded(): void
    {
        $user = User::factory()->create(['credits_balance' => 100]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = File::factory()->create([
            'credit_cost' => 5,
            'approved_at' => null, // Not approved
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/files/{$file->id}/download");

        $response->assertStatus(403)
                ->assertJsonPath('error.code', 'file_not_approved');
    }

    public function test_admin_can_approve_files(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $token = $admin->createToken('admin-token')->plainTextToken;

        $file = File::factory()->create(['approved_at' => null]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/files/{$file->id}/approve");

        $response->assertStatus(200);
        $this->assertNotNull($file->fresh()->approved_at);
    }
}