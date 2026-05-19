<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FeatureSetting;
use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $setting = FeatureSetting::for('referral');

        $referrals = Referral::with('referee:id,uuid,name,phone,created_at')
            ->where('referrer_id', $user->id)
            ->latest('id')
            ->get();

        $totalEarned = (float) $referrals->whereNotNull('bonus_paid_at')->sum('bonus_amount');
        $pending = $referrals->whereNull('bonus_paid_at')->count();

        return response()->json([
            'data' => [
                'referral_code' => $user->referral_code,
                'bonus_amount' => $setting ? (float) $setting->fee_flat : 0,
                'enabled' => (bool) ($setting?->enabled ?? false),
                'total_earned' => $totalEarned,
                'pending_count' => $pending,
                'paid_count' => $referrals->whereNotNull('bonus_paid_at')->count(),
                'referrals' => $referrals->map(fn (Referral $r) => [
                    'id' => $r->id,
                    'referee' => $r->referee ? [
                        'uuid' => $r->referee->uuid,
                        'name' => $r->referee->name,
                        'phone' => $r->referee->phone,
                        'created_at' => $r->referee->created_at,
                    ] : null,
                    'bonus_amount' => (float) $r->bonus_amount,
                    'bonus_paid_at' => $r->bonus_paid_at,
                    'status' => $r->bonus_paid_at ? 'paid' : 'pending',
                ])->values(),
            ],
        ]);
    }
}
