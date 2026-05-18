<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WithdrawController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function info(Request $request)
    {
        return response()->json([
            'min_amount' => 100,
            'currency' => 'PHP',
            'kyc_status' => $request->user()->kyc_status?->toArray(),
            'balance' => $this->wallet->balance($request->user()),
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

        if ((float) $this->wallet->balance($request->user()) < (float) $data['amount']) {
            throw ValidationException::withMessages(['amount' => 'Insufficient balance.']);
        }

        $withdrawal = $request->user()->withdrawals()->create($data + ['status' => 'pending']);

        return new WithdrawalResource($withdrawal);
    }

    public function show(Request $request, Withdrawal $withdrawal)
    {
        abort_unless($withdrawal->user_id === $request->user()->id, 404);
        return new WithdrawalResource($withdrawal);
    }
}
