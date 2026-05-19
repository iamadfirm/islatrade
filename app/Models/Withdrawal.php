<?php

namespace App\Models;

use App\Enums\Status;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Withdrawal extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid', 'user_id', 'amount', 'fee', 'net_amount', 'bank_name', 'account_name', 'account_number',
        'status', 'admin_note', 'processed_by', 'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'status' => Status::class,
        'processed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
