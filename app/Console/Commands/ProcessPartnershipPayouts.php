<?php

namespace App\Console\Commands;

use App\Services\InvestmentService;
use Illuminate\Console\Command;

class ProcessPartnershipPayouts extends Command
{
    protected $signature = 'partnership:process-payouts';
    protected $description = 'Pay due investment interest and return matured principal.';

    public function handle(InvestmentService $service): int
    {
        $count = $service->processPayouts();
        $this->info("Processed {$count} investment(s).");
        return self::SUCCESS;
    }
}
