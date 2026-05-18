<?php

namespace App\Services;

use App\Enums\WalletTxType;
use App\Models\Transfer;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class WalletService
{
    public function balance(User $user): string
    {
        $last = WalletTransaction::where('user_id', $user->id)
            ->orderByDesc('id')->lockForUpdate()->value('balance_after');
        return number_format((float) ($last ?? 0), 2, '.', '');
    }

    public function credit(User $user, float $amount, WalletTxType $type, ?Model $reference = null, ?string $description = null, ?array $meta = null): WalletTransaction
    {
        return $this->record($user, $amount, $type, $reference, $description, $meta, isDebit: false);
    }

    public function debit(User $user, float $amount, WalletTxType $type, ?Model $reference = null, ?string $description = null, ?array $meta = null): WalletTransaction
    {
        return $this->record($user, $amount, $type, $reference, $description, $meta, isDebit: true);
    }

    private function record(User $user, float $amount, WalletTxType $type, ?Model $reference, ?string $description, ?array $meta, bool $isDebit): WalletTransaction
    {
        if ($amount <= 0) {
            throw new RuntimeException('Amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $type, $reference, $description, $meta, $isDebit) {
            $before = (float) $this->balance($user);
            $after = $isDebit ? $before - $amount : $before + $amount;

            if ($after < 0) {
                throw new RuntimeException('Insufficient balance.');
            }

            return WalletTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $amount,
                'balance_before' => $before,
                'balance_after' => $after,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'description' => $description,
                'meta' => $meta,
            ]);
        });
    }

    public function transfer(User $from, User $to, float $amount, ?string $note = null): Transfer
    {
        if ($from->id === $to->id) {
            throw new RuntimeException('Cannot transfer to yourself.');
        }
        if ($amount <= 0) {
            throw new RuntimeException('Amount must be positive.');
        }

        return DB::transaction(function () use ($from, $to, $amount, $note) {
            $transfer = Transfer::create([
                'from_user_id' => $from->id,
                'to_user_id' => $to->id,
                'amount' => $amount,
                'note' => $note,
            ]);

            $this->debit($from, $amount, WalletTxType::TransferOut, $transfer, "Transfer to {$to->phone}");
            $this->credit($to, $amount, WalletTxType::TransferIn, $transfer, "Transfer from {$from->phone}");

            return $transfer;
        });
    }
}
