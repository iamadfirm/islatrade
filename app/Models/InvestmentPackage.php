<?php

namespace App\Models;

use App\Enums\PayoutFrequency;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvestmentPackage extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid', 'name', 'description', 'min_amount', 'max_amount',
        'interest_rate', 'frequency', 'term_days', 'is_active',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'interest_rate' => 'decimal:4',
        'is_active' => 'boolean',
        'frequency' => PayoutFrequency::class,
    ];
}
