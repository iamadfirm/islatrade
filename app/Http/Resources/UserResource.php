<?php

namespace App\Http\Resources;

use App\Models\FeatureSetting;
use App\Services\WalletService;
use App\Support\AdminCapabilities;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $permissions = $this->getAllPermissions()->pluck('name')->values();
        $isStaff = $permissions->intersect(AdminCapabilities::names())->isNotEmpty();

        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'referral_code' => $this->referral_code,
            'avatar_url' => $this->avatar_path ? Storage::url($this->avatar_path) : null,
            'kyc_status' => $this->kyc_status?->toArray(),
            'wallet_balance' => app(WalletService::class)->balance($this->resource),
            'roles' => $this->getRoleNames(),
            'permissions' => $permissions,
            'is_admin' => $this->hasRole('admin'),
            'is_staff' => $isStaff,
            'is_frozen' => $this->frozen_at !== null,
            'frozen_at' => $this->frozen_at,
            'frozen_reason' => $this->frozen_reason,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'features' => FeatureSetting::all_cached()->map(fn ($f) => [
                'key' => $f->key,
                'label' => $f->label,
                'enabled' => $f->enabled,
                'requires_kyc' => $f->requires_kyc,
                'disabled_message' => $f->disabled_message,
            ])->values(),
        ];
    }
}
