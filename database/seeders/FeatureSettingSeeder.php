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
            ['key' => 'referral', 'label' => 'Referral bonus', 'enabled' => true, 'requires_kyc' => false, 'fee_flat' => 50, 'disabled_message' => 'Bonus amount is stored in the Flat fee field. Paid to the referrer on the referee\'s first approved deposit.'],
        ];

        foreach ($defaults as $row) {
            FeatureSetting::updateOrCreate(['key' => $row['key']], $row);
        }
    }
}
