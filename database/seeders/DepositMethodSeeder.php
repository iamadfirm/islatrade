<?php

namespace Database\Seeders;

use App\Models\DepositMethod;
use Illuminate\Database\Seeder;

class DepositMethodSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'bank', 'label' => 'Bank transfer', 'sort' => 1],
            ['key' => 'gcash', 'label' => 'GCash', 'sort' => 2],
            ['key' => 'maya', 'label' => 'Maya', 'sort' => 3],
            ['key' => 'other', 'label' => 'Other', 'sort' => 4],
        ];

        foreach ($defaults as $row) {
            DepositMethod::firstOrCreate(['key' => $row['key']], $row + ['enabled' => true]);
        }
    }
}
