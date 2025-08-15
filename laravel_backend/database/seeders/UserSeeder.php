<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin (CANNOT BE DELETED)
        $superAdmin = User::create([
            'name' => env('SUPER_ADMIN_NAME', 'Imam Kabir'),
            'email' => env('SUPER_ADMIN_EMAIL', 'imamkabir397@gmail.com'),
            'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', '1234567890')),
            'credits' => 10000,
            'email_verified_at' => now(),
            'is_super_admin' => true,
            'can_be_deleted' => false,
            'last_activity' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // Create Demo Admin
        $admin = User::create([
            'name' => 'Demo Admin',
            'email' => 'admin@iconicportal.com',
            'password' => Hash::make('admin123'),
            'credits' => 500,
            'email_verified_at' => now(),
            'last_activity' => now(),
        ]);
        $admin->assignRole('admin');

        // Create Small Admin
        $smallAdmin = User::create([
            'name' => 'Small Admin',
            'email' => 'smalladmin@iconicportal.com',
            'password' => Hash::make('small123'),
            'credits' => 250,
            'email_verified_at' => now(),
            'last_activity' => now(),
        ]);
        $smallAdmin->assignRole('small_admin');

        // Create Demo User
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'user@example.com',
            'password' => Hash::make('user123'),
            'credits' => 25,
            'email_verified_at' => now(),
            'last_activity' => now(),
        ]);
        $user->assignRole('user');

        // Create Test User for Development
        $testUser = User::create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => Hash::make('test123'),
            'credits' => 100,
            'email_verified_at' => now(),
            'last_activity' => now(),
        ]);
        $testUser->assignRole('user');
    }
}