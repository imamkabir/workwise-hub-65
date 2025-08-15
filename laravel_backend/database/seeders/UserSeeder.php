<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'name' => env('SUPER_ADMIN_NAME', 'Super Admin'),
            'email' => env('SUPER_ADMIN_EMAIL', 'imamkabir397@gmail.com'),
            'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'Imam.imam4321')),
            'credits' => 1000,
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // Create Demo Admin
        $admin = User::create([
            'name' => 'Demo Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'credits' => 500,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create Demo User
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
            'credits' => 25,
            'email_verified_at' => now(),
        ]);
        $user->assignRole('user');
    }
}