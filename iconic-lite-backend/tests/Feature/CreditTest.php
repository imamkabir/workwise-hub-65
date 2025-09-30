<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\CreditTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_user_can_claim_daily_credits(): void
    {
        $user = User::factory()->create(['credits_balance' => 50]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/credits/daily-claim');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'added',
                    'balance',
                    'message',
                ]);

        $this->assertEquals(51, $user->fresh()->credits_balance);
        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id,
            'reason' => 'daily_login',
            'delta' => 1,
        ]);
    }

    public function test_daily_credits_cannot_be_claimed_twice(): void
    {
        $user = User::factory()->create([
            'credits_balance' => 50,
            'last_daily_claim' => now(),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/credits/daily-claim');

        $response->assertStatus(400)
                ->assertJsonPath('error.code', 'not_eligible');
    }

    public function test_admin_can_grant_credits(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $adminToken = $admin->createToken('admin-token')->plainTextToken;

        $user = User::factory()->create(['credits_balance' => 25]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $adminToken,
        ])->postJson("/api/admin/users/{$user->id}/credits/grant", [
            'amount' => 100,
            'reason' => 'Test grant',
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'balance',
                    'message',
                ]);

        $this->assertEquals(125, $user->fresh()->credits_balance);
    }

    public function test_credit_transactions_are_recorded(): void
    {
        $user = User::factory()->create();
        
        $user->addCredits(50, 'purchase', 'test-ref');
        $user->deductCredits(10, 'download_cost', 'file-123');

        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id,
            'delta' => 50,
            'reason' => 'purchase',
        ]);

        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id,
            'delta' => -10,
            'reason' => 'download_cost',
        ]);
    }
}