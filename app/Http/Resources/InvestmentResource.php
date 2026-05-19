<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'principal' => $this->principal,
            'interest_rate' => $this->interest_rate,
            'frequency' => [
                'value' => $this->frequency->value,
                'label' => $this->frequency->label(),
            ],
            'term_days' => $this->term_days,
            'total_paid_out' => $this->total_paid_out,
            'started_at' => $this->started_at,
            'matures_at' => $this->matures_at,
            'next_payout_at' => $this->next_payout_at,
            'status' => $this->status->toArray(),
            'return_capital' => (bool) $this->return_capital,
            'created_at' => $this->created_at,
            'package' => $this->whenLoaded('package', fn () => new InvestmentPackageResource($this->package)),
            'user' => $this->whenLoaded('user', fn () => [
                'uuid' => $this->user->uuid,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
                'email' => $this->user->email,
                'avatar_url' => $this->user->avatar_path
                    ? \Illuminate\Support\Facades\Storage::url($this->user->avatar_path)
                    : null,
                'kyc_status' => $this->user->kyc_status?->value,
                'wallet_balance' => $this->user->wallet_balance,
                'frozen' => $this->user->isFrozen(),
                'created_at' => $this->user->created_at,
            ]),
            'transactions' => $this->whenLoaded('transactions', fn () => $this->transactions->map(fn ($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'paid_at' => $t->paid_at,
            ])),
        ];
    }
}
