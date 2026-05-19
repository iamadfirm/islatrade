<?php

namespace Database\Seeders;

use App\Models\FeatureSetting;
use Illuminate\Database\Seeder;

class FeatureSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'deposit', 'label' => 'Deposit', 'enabled' => true, 'requires_kyc' => false],
            ['key' => 'withdraw', 'label' => 'Withdraw', 'enabled' => true, 'requires_kyc' => true],
            ['key' => 'transfer', 'label' => 'Transfer', 'enabled' => true, 'requires_kyc' => false],
            ['key' => 'partnership', 'label' => 'Partnership', 'enabled' => true, 'requires_kyc' => false],
        ];

        foreach ($defaults as $row) {
            FeatureSetting::updateOrCreate(['key' => $row['key']], $row);
        }
    }
}
