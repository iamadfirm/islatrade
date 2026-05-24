<?php

namespace App\Console\Commands;

use App\Enums\Status;
use App\Enums\WalletTxType;
use App\Models\Deposit;
use App\Models\FeatureSetting;
use App\Models\Referral;
use App\Services\WalletService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillReferralBonuses extends Command
{
    protected $signature = 'referrals:backfill {--dry-run : List what would be paid without crediting wallets}';
    protected $description = 'Pay any pending referral bonuses whose referee already has an approved deposit.';

    public function handle(WalletService $wallet): int
    {
        $setting = FeatureSetting::for('referral');
        if (! $setting || ! $setting->enabled) {
            $this->error('Referral feature is disabled. Enable it in admin settings first.');
            return self::FAILURE;
        }
        $rate = $setting->bonus_type === 'flat' ? (float) $setting->fee_flat : (float) $setting->fee_percent;
        if ($rate <= 0) {
            $this->error('Referral bonus is 0. Set a flat or percent bonus in admin settings first.');
            return self::FAILURE;
        }

        $dry = (bool) $this->option('dry-run');
        $paid = 0;
        $skipped = 0;

        // Catch-up only pays referrals that have never been paid, using the
        // referee's first approved deposit. Recurring payouts for later deposits
        // accrue going forward via the admin approval flow.
        $pending = Referral::with('referrer', 'referee')->whereNull('bonus_paid_at')->get();
        $mode = $setting->bonus_type === 'flat' ? "₱{$setting->fee_flat} flat" : "{$setting->fee_percent}% of deposit";
        $this->info("Found {$pending->count()} pending referral(s). Bonus: {$mode}.");

        foreach ($pending as $referral) {
            if (! $referral->referrer || ! $referral->referee) {
                $skipped++;
                continue;
            }

            $firstApprovedDeposit = Deposit::where('user_id', $referral->referee_id)
                ->where('status', Status::Approved)
                ->orderBy('id')
                ->first();

            if (! $firstApprovedDeposit) {
                $skipped++;
                continue;
            }

            $bonus = $setting->referralBonus((float) $firstApprovedDeposit->amount);
            if ($bonus <= 0) {
                $skipped++;
                continue;
            }

            $line = "Referral #{$referral->id}: referrer={$referral->referrer->phone} referee={$referral->referee->phone} -> +{$bonus}";

            if ($dry) {
                $this->line("[DRY] {$line}");
                $paid++;
                continue;
            }

            DB::transaction(function () use ($wallet, $referral, $firstApprovedDeposit, $bonus) {
                $wallet->credit(
                    $referral->referrer,
                    $bonus,
                    WalletTxType::ReferralBonus,
                    $referral,
                    "Referral bonus from {$referral->referee->phone}"
                );
                $referral->update([
                    'bonus_amount' => $bonus,
                    'bonus_paid_at' => now(),
                ]);
            });

            $this->line("PAID {$line}");
            $paid++;
        }

        $this->info(($dry ? '[DRY RUN] ' : '') . "Paid: {$paid}, Skipped (no approved deposit / missing user): {$skipped}");
        return self::SUCCESS;
    }
}
