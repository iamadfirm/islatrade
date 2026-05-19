<?php

namespace App\Support;

class AdminCapabilities
{
    /**
     * All admin-side capabilities. Key = permission name, value = display label.
     */
    public const ALL = [
        'dashboard.view' => 'View admin dashboard',
        'deposits.manage' => 'Manage deposits',
        'withdrawals.manage' => 'Manage withdrawals',
        'kyc.manage' => 'Manage KYC submissions',
        'users.manage' => 'Manage users',
        'packages.manage' => 'Manage investment packages',
        'settings.manage' => 'Manage feature settings & fees',
        'roles.manage' => 'Manage roles & access',
    ];

    public static function names(): array
    {
        return array_keys(self::ALL);
    }
}
