<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletTransactionResource;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WalletController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function balance(Request $request)
    {
        return response()->json(['balance' => $this->wallet->balance($request->user())]);
    }

    public function transactions(Request $request)
    {
        $tx = $request->user()->walletTransactions()->paginate(20);
        return WalletTransactionResource::collection($tx);
    }

    public function transferLookup(Request $request)
    {
        $data = $request->validate(['phone' => ['required', 'string']]);
        $user = User::where('phone', $data['phone'])->first();
        if (! $user || $user->id === $request->user()->id) {
            return response()->json(['message' => 'Recipient not found.'], 404);
        }
        return response()->json([
            'uuid' => $user->uuid,
            'name' => $user->name,
            'phone' => $user->phone,
        ]);
    }

    public function transfer(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:1'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $to = User::where('phone', $data['phone'])->first();
        if (! $to) {
            throw ValidationException::withMessages(['phone' => 'Recipient not found.']);
        }

        try {
            $transfer = $this->wallet->transfer($request->user(), $to, (float) $data['amount'], $data['note'] ?? null);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return response()->json([
            'uuid' => $transfer->uuid,
            'amount' => $transfer->amount,
            'recipient' => ['name' => $to->name, 'phone' => $to->phone],
            'balance' => $this->wallet->balance($request->user()),
        ]);
    }
}
