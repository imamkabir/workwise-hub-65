<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // File permissions
            'upload-files',
            'approve-files',
            'manage-all-files',
            'delete-any-file',
            
            // User permissions
            'view-users',
            'manage-users',
            'create-users',
            'manage-user-roles',
            
            // Credit permissions
            'grant-credits',
            'view-all-transactions',
            
            // Session permissions
            'view-all-sessions',
            'manage-sessions',
            
            // Admin permissions
            'view-admin-dashboard',
            'manage-system-settings',
            'view-analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $studentRole = Role::create(['name' => 'student']);
        $studentRole->givePermissionTo([
            'upload-files',
        ]);

        $lecturerRole = Role::create(['name' => 'lecturer']);
        $lecturerRole->givePermissionTo([
            'upload-files',
            'manage-sessions',
        ]);

        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo([
            'upload-files',
            'approve-files',
            'view-users',
            'manage-users',
            'grant-credits',
            'view-all-sessions',
            'view-admin-dashboard',
            'view-analytics',
        ]);

        $superAdminRole = Role::create(['name' => 'super_admin']);
        $superAdminRole->givePermissionTo(Permission::all());
    }
}