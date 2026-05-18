<?php

namespace App\Models;

use App\Enums\KycStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'kyc_submitted_at' => 'datetime',
            'kyc_status' => KycStatus::class,
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->latest('id');
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class)->latest('id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class)->latest('id');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class)->latest('id');
    }

    public function kycSubmissions(): HasMany
    {
        return $this->hasMany(KycSubmission::class)->latest('id');
    }

    public function getWalletBalanceAttribute(): string
    {
        $last = $this->walletTransactions()->orderByDesc('id')->value('balance_after');
        return number_format((float) ($last ?? 0), 2, '.', '');
    }
}
