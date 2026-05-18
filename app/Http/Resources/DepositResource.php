<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DepositResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'amount' => $this->amount,
            'method' => $this->method,
            'reference_number' => $this->reference_number,
            'proof_url' => $this->proof_path ? Storage::url($this->proof_path) : null,
            'status' => $this->status->toArray(),
            'admin_note' => $this->admin_note,
            'processed_at' => $this->processed_at,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn () => [
                'uuid' => $this->user->uuid,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
            ]),
        ];
    }
}
