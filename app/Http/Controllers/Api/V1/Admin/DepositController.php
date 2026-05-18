<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\Status;
use App\Enums\WalletTxType;
use App\Http\Controllers\Controller;
use App\Http\Resources\DepositResource;
use App\Models\Deposit;
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
        });

        return new DepositResource($deposit->fresh('user'));
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
