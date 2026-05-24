<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\Status;
use App\Enums\WalletTxType;
use App\Http\Controllers\Controller;
use App\Http\Resources\DepositResource;
use App\Models\Deposit;
use App\Models\FeatureSetting;
use App\Models\Referral;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DepositController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function index(Request $request)
    {
        $q = Deposit::with('user')->latest();
        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        return DepositResource::collection($q->paginate(20));
    }

    public function approve(Request $request, Deposit $deposit)
    {
        abort_unless($deposit->status === Status::Pending, 422, 'Already processed.');

        $data = $request->validate(['admin_note' => ['nullable', 'string', 'max:255']]);

        DB::transaction(function () use ($deposit, $request, $data) {
            $deposit->update([
                'status' => Status::Approved,
                'admin_note' => $data['admin_note'] ?? null,
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
            $this->wallet->credit(
                $deposit->user,
                (float) $deposit->amount,
                WalletTxType::Deposit,
                $deposit,
                "Deposit approved"
            );

            $this->payReferralBonusIfEligible($deposit);
        });

        return new DepositResource($deposit->fresh('user'));
    }

    private function payReferralBonusIfEligible(Deposit $deposit): void
    {
        $setting = FeatureSetting::for('referral');
        if (! $setting || ! $setting->enabled) {
            return;
        }

        $referral = Referral::where('referee_id', $deposit->user_id)->first();
        if (! $referral || ! $referral->referrer) {
            return;
        }

        // One-time programs pay only the first approved deposit. Each deposit
        // can be approved exactly once, so this also guards against double pay.
        if (! $setting->recurring && $referral->bonus_paid_at) {
            return;
        }

        $bonus = $setting->referralBonus((float) $deposit->amount);
        if ($bonus <= 0) {
            return;
        }

        $this->wallet->credit(
            $referral->referrer,
            $bonus,
            WalletTxType::ReferralBonus,
            $referral,
            "Referral bonus from {$deposit->user->phone}"
        );

        // bonus_amount accumulates the lifetime total earned from this referee.
        $referral->update([
            'bonus_amount' => (float) $referral->bonus_amount + $bonus,
            'bonus_paid_at' => now(),
        ]);
    }

    public function reject(Request $request, Deposit $deposit)
    {
        abort_unless($deposit->status === Status::Pending, 422, 'Already processed.');
        $data = $request->validate(['admin_note' => ['required', 'string', 'max:255']]);
        $deposit->update([
            'status' => Status::Rejected,
            'admin_note' => $data['admin_note'],
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);
        return new DepositResource($deposit->fresh('user'));
    }
}
