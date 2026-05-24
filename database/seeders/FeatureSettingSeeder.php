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
            ['key' => 'referral', 'label' => 'Referral bonus', 'enabled' => true, 'requires_kyc' => false, 'fee_flat' => 0, 'fee_percent' => 5, 'recurring' => false, 'bonus_type' => 'percent', 'disabled_message' => 'Bonus is either a flat ₱ amount or a percent of the referee\'s deposit (pick one). One-time pays the first approved deposit; recurring pays every approved deposit.'],
        ];

        foreach ($defaults as $row) {
            FeatureSetting::updateOrCreate(['key' => $row['key']], $row);
        }
    }
}
