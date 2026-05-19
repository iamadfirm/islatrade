<?php

namespace App\Services;

use App\Enums\InvestmentStatus;
use App\Enums\PayoutFrequency;
use App\Enums\WalletTxType;
use App\Models\Investment;
use App\Models\InvestmentPackage;
use App\Models\InvestmentTransaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvestmentService
{
    public function __construct(private WalletService $wallet) {}

    public function enroll(User $user, InvestmentPackage $package, float $amount): Investment
    {
        if (! $package->is_active) {
            throw new RuntimeException('Package is not active.');
        }
        if ($amount < (float) $package->min_amount) {
            throw new RuntimeException("Minimum investment is ₱{$package->min_amount}.");
        }
        if ($package->max_amount !== null && $amount > (float) $package->max_amount) {
            throw new RuntimeException("Maximum investment is ₱{$package->max_amount}.");
        }

        return DB::transaction(function () use ($user, $package, $amount) {
            $now = Carbon::now();
            $matures = $now->copy()->addDays($package->term_days);
            $next = $package->frequency->addInterval($now);
            if ($next->greaterThan($matures)) {
                $next = $matures->copy();
            }

            $investment = Investment::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'principal' => $amount,
                'interest_rate' => $package->interest_rate,
                'frequency' => $package->frequency,
                'term_days' => $package->term_days,
                'started_at' => $now,
                'matures_at' => $matures,
                'next_payout_at' => $next,
                'status' => InvestmentStatus::Active,
            ]);

            $this->wallet->debit(
                $user,
                $amount,
                WalletTxType::InvestmentLock,
                $investment,
                "Investment in {$package->name}"
            );

            return $investment;
        });
    }

    public function processPayouts(?Carbon $asOf = null): int
    {
        $asOf ??= Carbon::now();
        $count = 0;

        Investment::where('status', InvestmentStatus::Active)
            ->whereNotNull('next_payout_at')
            ->where('next_payout_at', '<=', $asOf)
            ->orderBy('id')
            ->chunkById(100, function ($batch) use ($asOf, &$count) {
                foreach ($batch as $investment) {
                    $this->processOne($investment, $asOf);
                    $count++;
                }
            });

        return $count;
    }

    private function processOne(Investment $investment, Carbon $asOf): void
    {
        DB::transaction(function () use ($investment, $asOf) {
            $investment->refresh();
            if ($investment->status !== InvestmentStatus::Active) {
                return;
            }

            $interest = round((float) $investment->principal * ((float) $investment->interest_rate / 100), 2);

            if ($interest > 0) {
                $this->wallet->credit(
                    $investment->user,
                    $interest,
                    WalletTxType::InvestmentPayout,
                    $investment,
                    "Interest payout"
                );

                InvestmentTransaction::create([
                    'investment_id' => $investment->id,
                    'type' => 'interest',
                    'amount' => $interest,
                    'paid_at' => $asOf,
                ]);

                $investment->total_paid_out = (float) $investment->total_paid_out + $interest;
            }

            $next = $investment->frequency->addInterval($investment->next_payout_at);
            if ($next->greaterThanOrEqualTo($investment->matures_at)) {
                $this->wallet->credit(
                    $investment->user,
                    (float) $investment->principal,
                    WalletTxType::InvestmentReturn,
                    $investment,
                    "Principal returned at maturity"
                );
                InvestmentTransaction::create([
                    'investment_id' => $investment->id,
                    'type' => 'return',
                    'amount' => $investment->principal,
                    'paid_at' => $asOf,
                ]);
                $investment->status = InvestmentStatus::Matured;
                $investment->next_payout_at = null;
            } else {
                $investment->next_payout_at = $next;
            }

            $investment->save();
        });
    }
}
