<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeatureSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function features()
    {
        // Make sure all known features exist (lazy-bootstrap).
        foreach (FeatureSetting::FEATURES as $key => $label) {
            FeatureSetting::firstOrCreate(['key' => $key], [
                'label' => $label,
                'enabled' => true,
                'requires_kyc' => $key === 'withdraw',
            ]);
        }

        return FeatureSetting::query()->orderBy('id')->get()->map(fn ($f) => $this->present($f));
    }

    public function updateFeature(Request $request, string $key)
    {
        $data = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'requires_kyc' => ['sometimes', 'boolean'],
            'disabled_message' => ['sometimes', 'nullable', 'string', 'max:255'],
            'label' => ['sometimes', 'string', 'max:120'],
            'fee_flat' => ['sometimes', 'numeric', 'min:0', 'max:1000000'],
            'fee_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'recurring' => ['sometimes', 'boolean'],
            'bonus_type' => ['sometimes', 'in:flat,percent'],
        ]);

        $feature = FeatureSetting::where('key', $key)->firstOrFail();
        $feature->update($data);

        return $this->present($feature);
    }

    private function present(FeatureSetting $f): array
    {
        return [
            'key' => $f->key,
            'label' => $f->label,
            'enabled' => $f->enabled,
            'requires_kyc' => $f->requires_kyc,
            'disabled_message' => $f->disabled_message,
            'fee_flat' => $f->fee_flat,
            'fee_percent' => $f->fee_percent,
            'recurring' => $f->recurring,
            'bonus_type' => $f->bonus_type,
        ];
    }
}
