<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FeatureSetting extends Model
{
    protected $fillable = ['key', 'label', 'enabled', 'requires_kyc', 'disabled_message', 'fee_flat', 'fee_percent'];

    protected $casts = [
        'enabled' => 'boolean',
        'requires_kyc' => 'boolean',
        'fee_flat' => 'decimal:2',
        'fee_percent' => 'decimal:4',
    ];

    public function calcFee(float $amount): float
    {
        $flat = (float) $this->fee_flat;
        $pct = (float) $this->fee_percent;
        $fee = $flat + ($amount * $pct / 100);
        return round(max(0, $fee), 2);
    }

    public const CACHE_KEY = 'feature_settings.all';

    public const FEATURES = [
        'deposit' => 'Deposit',
        'withdraw' => 'Withdraw',
        'transfer' => 'Transfer',
        'partnership' => 'Partnership',
        'referral' => 'Referral bonus',
    ];

    public static function all_cached(): \Illuminate\Support\Collection
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return self::query()->get()->keyBy('key');
        });
    }

    public static function for(string $key): ?self
    {
        return self::all_cached()->get($key);
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    protected static function booted(): void
    {
        static::saved(fn () => self::flushCache());
        static::deleted(fn () => self::flushCache());
    }
}
