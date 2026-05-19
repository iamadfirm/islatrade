<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\WalletTxType;
use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalResource;
use App\Models\FeatureSetting;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class WithdrawController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function info(Request $request)
    {
        $feature = FeatureSetting::for('withdraw');

        return response()->json([
            'min_amount' => 100,
            'currency' => 'PHP',
            'kyc_status' => $request->user()->kyc_status?->toArray(),
            'balance' => $this->wallet->balance($request->user()),
            'fee_flat' => (float) ($feature?->fee_flat ?? 0),
            'fee_percent' => (float) ($feature?->fee_percent ?? 0),
        ]);
    }

    public function index(Request $request)
    {
        return WithdrawalResource::collection($request->user()->withdrawals()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:100'],
            'bank_name' => ['required', 'string', 'max:64'],
            'account_name' => ['required', 'string', 'max:128'],
            'account_number' => ['required', 'string', 'max:64'],
        ]);

        $feature = FeatureSetting::for('withdraw');
        $amount = (float) $data['amount'];
        $fee = $feature?->calcFee($amount) ?? 0.0;
        $net = round($amount - $fee, 2);

        if ($net <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Amount must exceed the withdrawal fee.',
            ]);
        }

        $withdrawal = DB::transaction(function () use ($request, $data, $amount, $fee, $net) {
            if ((float) $this->wallet->balance($request->user()) < $amount) {
                throw ValidationException::withMessages(['amount' => 'Insufficient balance.']);
            }

            $w = $request->user()->withdrawals()->create($data + [
                'status' => 'pending',
                'fee' => $fee,
                'net_amount' => $net,
            ]);

            // Hold full gross amount upfront so it can't be double-spent.
            try {
                $this->wallet->debit(
                    $request->user(),
                    $amount,
                    WalletTxType::Withdrawal,
                    $w,
                    $fee > 0
                        ? sprintf('Withdrawal hold (fee %s)', number_format($fee, 2))
                        : 'Withdrawal request hold'
                );
            } catch (RuntimeException $e) {
                throw ValidationException::withMessages(['amount' => $e->getMessage()]);
            }

            return $w;
        });

        return new WithdrawalResource($withdrawal);
    }

    public function show(Request $request, Withdrawal $withdrawal)
    {
        abort_unless($withdrawal->user_id === $request->user()->id, 404);
        return new WithdrawalResource($withdrawal);
    }
}
