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
            'name' => env('SUPER_ADMIN_NAME', 'Imam Kabir'),
            'email' => env('SUPER_ADMIN_EMAIL', 'imamkabir397@gmail.com'),
            'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'Imam.imam4321')),
            'credits_balance' => 10000,
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // Create Staff Admin
        $admin = User::create([
            'name' => 'Staff Admin',
            'email' => 'admin@iconiclite.com',
            'password' => Hash::make('admin123'),
            'credits_balance' => 1000,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create Demo Lecturer
        $lecturer = User::create([
            'name' => 'Dr. John Lecturer',
            'email' => 'lecturer@iconiclite.com',
            'password' => Hash::make('lecturer123'),
            'credits_balance' => 500,
            'email_verified_at' => now(),
        ]);
        $lecturer->assignRole('lecturer');

        // Create Demo Student
        $student = User::create([
            'name' => 'Demo Student',
            'email' => 'student@iconiclite.com',
            'password' => Hash::make('student123'),
            'credits_balance' => 25,
            'email_verified_at' => now(),
        ]);
        $student->assignRole('student');
    }
}