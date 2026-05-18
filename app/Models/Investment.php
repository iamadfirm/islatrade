<?php

namespace App\Models;

use App\Enums\InvestmentStatus;
use App\Enums\PayoutFrequency;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Investment extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid', 'user_id', 'package_id', 'principal', 'interest_rate', 'frequency',
        'term_days', 'total_paid_out', 'started_at', 'matures_at', 'next_payout_at', 'status',
    ];

    protected $casts = [
        'principal' => 'decimal:2',
        'interest_rate' => 'decimal:4',
        'total_paid_out' => 'decimal:2',
        'started_at' => 'datetime',
        'matures_at' => 'datetime',
        'next_payout_at' => 'datetime',
        'status' => InvestmentStatus::class,
        'frequency' => PayoutFrequency::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(InvestmentPackage::class, 'package_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InvestmentTransaction::class);
    }
}
