<?php

namespace Database\Seeders;

use App\Support\AdminCapabilities;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Seed capability permissions
        foreach (AdminCapabilities::names() as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Core roles
        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Admin has all capabilities
        $admin->syncPermissions(AdminCapabilities::names());

        // User has none by default
        $user->syncPermissions([]);
    }
}
