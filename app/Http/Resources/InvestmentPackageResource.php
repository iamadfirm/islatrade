<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentPackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'min_amount' => $this->min_amount,
            'max_amount' => $this->max_amount,
            'interest_rate' => $this->interest_rate,
            'frequency' => [
                'value' => $this->frequency->value,
                'label' => $this->frequency->label(),
            ],
            'term_days' => $this->term_days,
            'is_active' => $this->is_active,
        ];
    }
}
