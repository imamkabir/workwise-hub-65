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
            'files.upload',
            'files.manage',
            'users.view',
            'users.manage_limited',
            'credits.view',
            'credits.grant',
            'admin.create',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $userRole = Role::create(['name' => 'user']);
        $userRole->givePermissionTo([
            'files.upload',
            'credits.view',
        ]);

        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo([
            'files.upload',
            'files.manage',
            'users.view',
            'users.manage_limited',
            'credits.view',
        ]);

        $superAdminRole = Role::create(['name' => 'super_admin']);
        $superAdminRole->givePermissionTo(Permission::all());
    }
}