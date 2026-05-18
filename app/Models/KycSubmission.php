<?php

namespace App\Models;

use App\Enums\Status;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycSubmission extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'id_type', 'id_number', 'id_front_path', 'id_back_path',
        'selfie_path', 'status', 'admin_note', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'status' => Status::class,
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
