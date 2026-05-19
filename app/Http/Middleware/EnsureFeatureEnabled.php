<?php

namespace App\Http\Middleware;

use App\Enums\KycStatus;
use App\Models\FeatureSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureEnabled
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $setting = FeatureSetting::for($feature);

        if ($setting && ! $setting->enabled) {
            return response()->json([
                'message' => $setting->disabled_message ?: ($setting->label.' is currently disabled.'),
                'feature' => $feature,
                'feature_disabled' => true,
            ], 403);
        }

        if ($setting && $setting->requires_kyc) {
            $user = $request->user();
            if (! $user || $user->kyc_status !== KycStatus::Approved) {
                return response()->json([
                    'message' => 'KYC verification required for '.$setting->label.'.',
                    'feature' => $feature,
                    'kyc_status' => $user?->kyc_status?->value ?? KycStatus::None->value,
                ], 403);
            }
        }

        return $next($request);
    }
}
