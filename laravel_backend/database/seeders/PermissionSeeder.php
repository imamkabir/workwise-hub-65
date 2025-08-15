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
            'files.upload',
            'files.manage',
            'files.view_all',
            'files.delete_any',
            
            // User permissions
            'users.view',
            'users.manage_limited',
            'users.manage_full',
            'users.force_logout',
            'users.view_sensitive',
            
            // Credit permissions
            'credits.view',
            'credits.grant',
            'credits.view_transactions',
            
            // Admin permissions
            'admin.create',
            'admin.manage_roles',
            'admin.view_analytics',
            'admin.system_settings',
            
            // System permissions (Bruce Wayne Mode)
            'system.monitoring',
            'system.maintenance',
            'system.backups',
            'system.audit_logs',
            'system.notifications',
            'system.theme_control',
            'system.feature_toggles',
            'system.force_actions',
            
            // Activity permissions
            'activity.view_all',
            'activity.view_critical',
            
            // Notification permissions
            'notifications.create_global',
            'notifications.manage',
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

        $smallAdminRole = Role::create(['name' => 'small_admin']);
        $smallAdminRole->givePermissionTo([
            'files.upload',
            'files.manage',
            'users.view',
            'credits.view',
        ]);

        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo([
            'files.upload',
            'files.manage',
            'files.view_all',
            'users.view',
            'users.manage_limited',
            'users.view_sensitive',
            'credits.view',
            'credits.view_transactions',
            'admin.view_analytics',
            'activity.view_all',
            'notifications.manage',
        ]);

        $superAdminRole = Role::create(['name' => 'super_admin']);
        $superAdminRole->givePermissionTo(Permission::all()); // Bruce Wayne Mode - ALL PERMISSIONS
    }
}