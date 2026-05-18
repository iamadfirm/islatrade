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
            'frequency' => $this->frequency->value,
            'term_days' => $this->term_days,
            'total_paid_out' => $this->total_paid_out,
            'started_at' => $this->started_at,
            'matures_at' => $this->matures_at,
            'next_payout_at' => $this->next_payout_at,
            'status' => $this->status->toArray(),
            'package' => $this->whenLoaded('package', fn () => new InvestmentPackageResource($this->package)),
        ];
    }
}
