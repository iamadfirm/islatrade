<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\Status;
use App\Enums\WalletTxType;
use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function index(Request $request)
    {
        $q = Withdrawal::with('user')->latest();
        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        return WithdrawalResource::collection($q->paginate(20));
    }

    public function approve(Request $request, Withdrawal $withdrawal)
    {
        abort_unless($withdrawal->status === Status::Pending, 422, 'Already processed.');

        $data = $request->validate(['admin_note' => ['nullable', 'string', 'max:255']]);

        DB::transaction(function () use ($withdrawal, $request, $data) {
            // Debit at approval time so balance reflects approved disbursement.
            $this->wallet->debit(
                $withdrawal->user,
                (float) $withdrawal->amount,
                WalletTxType::Withdrawal,
                $withdrawal,
                "Withdrawal to {$withdrawal->bank_name}"
            );
            $withdrawal->update([
                'status' => Status::Approved,
                'admin_note' => $data['admin_note'] ?? null,
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
        });

        return new WithdrawalResource($withdrawal->fresh('user'));
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        abort_unless($withdrawal->status === Status::Pending, 422, 'Already processed.');
        $data = $request->validate(['admin_note' => ['required', 'string', 'max:255']]);
        $withdrawal->update([
            'status' => Status::Rejected,
            'admin_note' => $data['admin_note'],
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);
        return new WithdrawalResource($withdrawal->fresh('user'));
    }
}
