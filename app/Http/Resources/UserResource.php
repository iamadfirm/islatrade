<?php

namespace App\Http\Resources;

use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'kyc_status' => $this->kyc_status?->toArray(),
            'wallet_balance' => app(WalletService::class)->balance($this->resource),
            'roles' => $this->getRoleNames(),
            'is_admin' => $this->hasRole('admin'),
            'created_at' => $this->created_at,
        ];
    }
}
