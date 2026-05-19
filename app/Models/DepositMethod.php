<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class DepositMethod extends Model
{
    protected $fillable = [
        'key', 'label', 'enabled', 'instructions', 'account_name', 'account_number',
        'image_path', 'sort',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'sort' => 'integer',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::url($this->image_path) : null;
    }
}
