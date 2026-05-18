<?php

namespace Database\Seeders;

use App\Models\InvestmentPackage;
use Illuminate\Database\Seeder;

class InvestmentPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            ['name' => 'Starter', 'min_amount' => 500, 'max_amount' => 4999, 'interest_rate' => 1.5, 'frequency' => 'daily', 'term_days' => 30],
            ['name' => 'Bronze', 'min_amount' => 5000, 'max_amount' => 19999, 'interest_rate' => 2.0, 'frequency' => 'daily', 'term_days' => 60],
            ['name' => 'Silver', 'min_amount' => 20000, 'max_amount' => 99999, 'interest_rate' => 2.5, 'frequency' => 'daily', 'term_days' => 90],
            ['name' => 'Gold', 'min_amount' => 100000, 'max_amount' => null, 'interest_rate' => 3.0, 'frequency' => 'daily', 'term_days' => 120],
        ];
        foreach ($packages as $p) {
            InvestmentPackage::firstOrCreate(['name' => $p['name']], $p + ['is_active' => true]);
        }
    }
}
