<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['phone' => '09000000000'],
            [
                'name' => 'Admin',
                'email' => 'admin@hecate33.local',
                'password' => Hash::make('password'),
            ]
        );
        $admin->syncRoles(['admin']);
    }
}
